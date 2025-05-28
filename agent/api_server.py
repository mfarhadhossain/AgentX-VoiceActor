from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import tempfile
import os
import json
import re
from typing import Optional, Dict, List, Any
from pydantic import BaseModel

# Import components from our existing agent_team.py
from agno.agent import Agent
from agno.knowledge.pdf import PDFKnowledgeBase, PDFReader
from agno.vectordb.qdrant import Qdrant
from agno.tools.duckduckgo import DuckDuckGoTools
from agno.tools.reasoning import ReasoningTools
from agno.models.openai import OpenAIChat
from agno.embedder.openai import OpenAIEmbedder
from agno.document.chunking.document import DocumentChunking

app = FastAPI()

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

COLLECTION_NAME = "legal_documents"

class AnalysisResponse(BaseModel):
    risk_score: float
    risk_summary: List[str]
    clauses: List[Dict[str, str]]
    recommendations: List[str]
    complexity_score: float
    legal_risk: float
    compliance: float


def extract_risk_score(text: str) -> float:
    """Extract risk score from agent response"""
    if not isinstance(text, str):
        return 7.2

    # Look for patterns like "risk score: 7.5" or "7.5/10" or "7 / 10"
    patterns = [
        r"risk\s*score[:\s]*\*?\*?(\d+\.?\d*)\s*[/]\s*10",  # Risk Score: 7/10 or **7 / 10**
        r"(\d+\.?\d*)\s*[/]\s*10",  # Any 7/10 pattern
        r"risk\s*score[:\s]*\*?\*?(\d+\.?\d*)",  # Risk score: 7
        r"score[:\s]*\*?\*?(\d+\.?\d*)",  # Score: 7
    ]

    for pattern in patterns:
        matches = re.findall(pattern, text.lower())
        if matches:
            # Take the first valid score found
            for match in matches:
                try:
                    score = float(match)
                    if 0 <= score <= 10:
                        return score
                except:
                    continue

    # Default if no score found
    return 7.2

def clean_markdown(text: str) -> str:
    """Remove markdown formatting from text"""
    # Remove bold markdown
    text = re.sub(r'\*\*([^*]+)\*\*', r'\1', text)
    text = re.sub(r'__([^_]+)__', r'\1', text)

    # Remove headers
    text = re.sub(r'^#+\s+', '', text, flags=re.MULTILINE)

    # Remove blockquotes
    text = re.sub(r'^>\s*', '', text, flags=re.MULTILINE)

    # Remove horizontal rules
    text = re.sub(r'^---+$', '', text, flags=re.MULTILINE)

    return text.strip()

def extract_clauses_from_markdown(text: str) -> List[Dict[str, str]]:
    """Extract clauses from markdown formatted text"""
    clauses = []

    # Pattern to find clause sections with quotes
    # Looks for patterns like: ### Title\n> "Quoted content"
    patterns = [
        # Pattern 1: Title followed by quoted content
        r'(?:###?\s*)?([^>\n]+?)\s*(?:Clause|Section|Article)?[:\s]*\n+>\s*["\']?([^"\'\n]+[^"\'\n]*?)["\']?(?=\n|$)',
        # Pattern 2: Bold title with quoted content
        r'\*\*([^*]+)\*\*[:\s]*\n+>\s*["\']?([^"\'\n]+[^"\'\n]*?)["\']?(?=\n|$)',
        # Pattern 3: Numbered items with quotes
        r'(\d+\.\s*[^>\n]+?)[:\s]*\n+>\s*["\']?([^"\'\n]+[^"\'\n]*?)["\']?(?=\n|$)',
    ]

    for pattern in patterns:
        matches = re.findall(pattern, text, re.MULTILINE | re.DOTALL)
        for match in matches:
            if len(match) >= 2:
                title = clean_markdown(match[0].strip())
                content = clean_markdown(match[1].strip())

                # Skip if title is too short or generic
                if len(title) > 3 and not title.lower().startswith(('**', 's**', 'clause')):
                    clauses.append({
                        "title": title,
                        "content": content,
                        "highlight": ""  # You can extract key phrases here if needed
                    })

    # If no clauses found with quotes, try to extract any clause-like sections
    if not clauses:
        # Fallback pattern for any section that mentions clauses
        fallback_pattern = r'(?:Clause|Section|Article|Provision)[:\s]*([^\n]+)'
        matches = re.findall(fallback_pattern, text, re.IGNORECASE)
        for match in matches[:3]:
            clauses.append({
                "title": "Contract Provision",
                "content": clean_markdown(match.strip()),
                "highlight": ""
            })

    return clauses[:4]  # Limit to 4 clauses

def extract_clean_list_items(text: str) -> List[str]:
    """Extract and clean list items from markdown text"""
    items = []

    # Split by common list separators
    lines = text.split('\n')

    for line in lines:
        line = line.strip()
        # Check if it's a list item
        if re.match(r'^[-•*]\s+', line) or re.match(r'^\d+\.\s+', line):
            # Remove list markers
            cleaned = re.sub(r'^[-•*]\s+', '', line)
            cleaned = re.sub(r'^\d+\.\s+', '', cleaned)
            cleaned = clean_markdown(cleaned)

            # Only add substantial items
            if len(cleaned) > 20 and not cleaned.lower().startswith(('risk', 'recommendation', 'finding')):
                items.append(cleaned)

    return items

def parse_agent_response(response) -> Dict[str, Any]:
    """Parse the agent response to extract structured data"""
    # Safely extract content
    content = ""

    if hasattr(response, 'content') and response.content:
        content = str(response.content)
    elif hasattr(response, 'messages') and response.messages:
        for message in response.messages:
            if hasattr(message, 'role') and message.role == 'assistant':
                if hasattr(message, 'content') and message.content:
                    content += str(message.content) + "\n"
    else:
        content = str(response)

    print(f"Content length: {len(content)} chars")

    # Extract risk score with improved parsing
    risk_score = extract_risk_score(content)
    print(f"Extracted risk score: {risk_score}")

    # Extract risk summary - look for actual risk findings
    risk_summary = []

    # Try to find risk findings section
    risk_section_pattern = r'(?:Key Risk Findings|Risk Findings|Risks?)[:\s]*\n(.*?)(?=\n#+|\n\n#+|$)'
    risk_match = re.search(risk_section_pattern, content, re.IGNORECASE | re.DOTALL)

    if risk_match:
        risk_text = risk_match.group(1)
        risk_items = extract_clean_list_items(risk_text)
        risk_summary = risk_items[:3]

    # Fallback: look for any risk-related content
    if not risk_summary:
        risk_sentences = re.findall(
            r'([^.!?\n]*(?:risk|concern|issue|problem|liability)[^.!?\n]*[.!?])',
            content,
            re.IGNORECASE
        )
        risk_summary = [clean_markdown(s.strip()) for s in risk_sentences if len(s.strip()) > 30][:3]

    # Extract clauses with better parsing
    clauses = extract_clauses_from_markdown(content)

    # Extract recommendations
    recommendations = []

    # Try to find recommendations section
    rec_section_pattern = r'(?:Recommendations?|Negotiation Tips?|Suggestions?)[:\s]*\n(.*?)(?=\n#+|\n\n#+|$)'
    rec_match = re.search(rec_section_pattern, content, re.IGNORECASE | re.DOTALL)

    if rec_match:
        rec_text = rec_match.group(1)
        recommendations = extract_clean_list_items(rec_text)[:4]

    # Fallback: look for recommendation-like sentences
    if not recommendations:
        rec_sentences = re.findall(
            r'([^.!?\n]*(?:recommend|suggest|should|consider|negotiate)[^.!?\n]*[.!?])',
            content,
            re.IGNORECASE
        )
        recommendations = [clean_markdown(s.strip()) for s in rec_sentences if len(s.strip()) > 30][:4]

    # Calculate scores based on risk score
    complexity_score = min(risk_score * 0.8 + len(clauses), 9.0)
    legal_risk = risk_score * 1.1 if risk_score > 5 else risk_score * 0.9
    compliance = 10 - risk_score

    # Ensure we have meaningful content
    if not risk_summary:
        risk_summary = [
            "Contract analysis indicates moderate to high risk levels",
            "Several clauses require careful review and negotiation",
            "Legal consultation recommended before signing"
        ]

    if not clauses:
        clauses = [{
            "title": "Contract Review Required",
            "content": "Full contract analysis has been completed. Specific clause details require further review.",
            "highlight": ""
        }]

    if not recommendations:
        recommendations = [
            "Negotiate more favorable terms for key provisions",
            "Seek clarification on ambiguous language",
            "Consider adding protective clauses",
            "Review with legal counsel before finalizing"
        ]

    result = {
        "risk_score": round(risk_score, 1),
        "risk_summary": risk_summary,
        "clauses": clauses,
        "recommendations": recommendations,
        "complexity_score": round(complexity_score, 1),
        "legal_risk": round(legal_risk, 1),
        "compliance": round(compliance, 1)
    }

    print(f"Final parsed result: risk_score={result['risk_score']}, "
          f"clauses={len(result['clauses'])}, recommendations={len(result['recommendations'])}")

    return result

def create_legal_team(knowledge_base):
    """Create the legal agent team"""
    legal_researcher = Agent(
        name="Legal Researcher",
        role="Legal research specialist",
        model=OpenAIChat(id="gpt-4.1"),
        tools=[DuckDuckGoTools()],
        knowledge=knowledge_base,
        search_knowledge=True,
        instructions=[
            "IMPORTANT: Always search the knowledge base for specific document content before responding",
            "Find and cite relevant legal cases and precedents",
            "Provide detailed research summaries with sources",
            "Reference specific sections from the uploaded document by searching the knowledge base",
            "Quote actual text from the document when identifying issues"
        ],
        show_tool_calls=True,
        markdown=True
    )

    contract_analyst = Agent(
        name="Contract Analyst",
        role="Contract analysis specialist",
        model=OpenAIChat(id="gpt-4.1"),
        knowledge=knowledge_base,
        search_knowledge=True,
        instructions=[
            "Review contracts thoroughly",
            "Identify key terms and potential issues",
            "Reference specific clauses from the document",
            "Provide risk scores on a scale of 0-10" # need to verify this, if its needed or not
        ],
        markdown=True
    )

    legal_strategist = Agent(
        name="Legal Strategist",
        role="Legal strategy specialist",
        model=OpenAIChat(id="gpt-4.1"),
        knowledge=knowledge_base,
        search_knowledge=True,
        instructions=[
            "Develop comprehensive legal strategies",
            "Provide actionable recommendations",
            "Consider both risks and opportunities",
            "Suggest negotiation tactics"
        ],
        markdown=True
    )

    legal_team = Agent(
        name="Legal Team Lead",
        role="Legal team coordinator",
        model=OpenAIChat(id="gpt-4.1"),
        tools=(ReasoningTools(
            think=True,
            analyze=True,
            add_instructions=True,
            add_few_shot=True,
        ),),
        team=[legal_researcher, contract_analyst, legal_strategist],
        knowledge=knowledge_base,
        search_knowledge=True,
        add_history_to_messages=True,
        num_history_runs=3,
        instructions=[
            "CRITICAL: You MUST search the knowledge base to analyze the uploaded document content",
            "Coordinate analysis between team members on the specific uploaded contract",
            "Provide comprehensive responses with clear structure",
            "Ensure all recommendations are properly sourced",
            "Reference specific parts of the uploaded document",
            "Always search the knowledge base before delegating tasks",
            "Structure your response with clear sections: Risk Findings, Key Clauses, Recommendations",
            "Do NOT provide generic contract advice - analyze the SPECIFIC uploaded document"
        ],
        show_tool_calls=True,
        markdown=True
    )

    return legal_team

@app.post("/api/analyze", response_model=AnalysisResponse)
async def analyze_contract(
    file: UploadFile = File(...),
    openai_api_key: str = Form(...),
    qdrant_api_key: str = Form(...),
    qdrant_url: str = Form(...),
    analysis_type: str = Form(...),
    custom_query: Optional[str] = Form(None)
):
    """Analyze uploaded contract using the legal agent team"""

    print(f"Received analysis request: {analysis_type}")
    print(f"File: {file.filename}, Size: {file.size}")

    # Validate inputs
    if not all([openai_api_key, qdrant_api_key, qdrant_url]):
        raise HTTPException(status_code=400, detail="Missing required API credentials")

    # Set environment variable
    os.environ['OPENAI_API_KEY'] = openai_api_key

    # Initialize Qdrant
    try:
        vector_db = Qdrant(
            collection=COLLECTION_NAME,
            url=qdrant_url,
            api_key=qdrant_api_key,
            embedder=OpenAIEmbedder(
                id="text-embedding-3-small",
                api_key=openai_api_key
            )
        )
        print("Successfully connected to Qdrant")
    except Exception as e:
        print(f"Qdrant connection error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to connect to Qdrant: {str(e)}")

    # Save uploaded file
    temp_file_path = None
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as temp_file:
            content = await file.read()
            temp_file.write(content)
            temp_file_path = temp_file.name
            print(f"Saved file to: {temp_file_path}")
    except Exception as e:
        print(f"File save error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to save uploaded file: {str(e)}")

    try:
        # Create knowledge base
        print("Creating knowledge base...")
        knowledge_base = PDFKnowledgeBase(
            path=temp_file_path,
            vector_db=vector_db,
            reader=PDFReader(),
            chunking_strategy=DocumentChunking(
                chunk_size=1000,
                overlap=200
            )
        )

        # Load documents
        print("Loading documents into knowledge base...")
        knowledge_base.load(recreate=True, upsert=True)
        print("Documents loaded successfully")

        # Create legal team
        print("Creating legal team...")
        legal_team = create_legal_team(knowledge_base)

        # Prepare query based on analysis type
        analysis_configs = {
                    "Contract Review": {
                        "query": """IMPORTANT: Search the knowledge base to analyze the uploaded contract document.

                        Review this contract and identify key terms, obligations, and potential issues.
                        Provide:
                        1. An overall risk score (0-10) based on the specific contract terms
                        2. Key risk findings from the document (list at least 3 specific issues with quotes)
                        3. Important clauses that need attention (quote the actual text)
                        4. Specific recommendations for negotiation based on the contract content

                        You MUST search the knowledge base and quote specific sections from the uploaded document.""",
                        "agents": ["Contract Analyst"],
                        "description": "Detailed contract analysis focusing on terms and obligations"
                    },
                    "Legal Research": {
                        "query": """IMPORTANT: Search the knowledge base to analyze the uploaded legal document.

                        Research relevant cases and precedents related to this document.
                        Provide:
                        1. A legal risk score (0-10) based on the document content
                        2. Relevant legal precedents and cases related to the document's terms
                        3. Key legal issues identified in the specific document (with quotes)
                        4. Recommendations based on legal research of the document

                        You MUST search the knowledge base and reference the actual document content.""",
                        "agents": ["Legal Researcher"],
                        "description": "Research on relevant legal cases and precedents"
                    },
                    "Risk Assessment": {
                        "query": """IMPORTANT: Search the knowledge base to analyze risks in the uploaded document.

                        Analyze potential legal risks and liabilities in this document.
                        Provide:
                        1. An overall risk score (0-10) based on actual contract terms
                        2. Major risk factors found in the document (list at least 3 with quotes)
                        3. Clauses that pose the highest risk (quote the actual text)
                        4. Risk mitigation strategies for the specific issues found

                        You MUST search the knowledge base and analyze the actual uploaded document.""",
                        "agents": ["Contract Analyst", "Legal Strategist"],
                        "description": "Combined risk analysis and strategic assessment"
                    },
                    "Compliance Check": {
                        "query": """IMPORTANT: Search the knowledge base to check compliance in the uploaded document.

                        Check this document for regulatory compliance issues.
                        Provide:
                        1. A compliance score (0-10, where 10 is fully compliant)
                        2. Regulatory concerns identified in the document (with specific quotes)
                        3. Non-compliant clauses found (quote the actual text)
                        4. Steps to ensure compliance based on the document's content

                        You MUST search the knowledge base and analyze the actual uploaded document.""",
                        "agents": ["Legal Researcher", "Contract Analyst", "Legal Strategist"],
                        "description": "Comprehensive compliance analysis"
                    },
                    "Custom Query": {
                        "query": custom_query or "Analyze this document comprehensively",
                        "agents": ["Legal Researcher", "Contract Analyst", "Legal Strategist"],
                        "description": "Custom analysis using all available agents"
                    }
        }

        config = analysis_configs.get(analysis_type, analysis_configs["Custom Query"])

        query = f"""
        CRITICAL: You have access to a knowledge base containing the uploaded document.
        You MUST search the knowledge base to retrieve and analyze the actual document content.

        Primary Analysis Task: {config['query']}
        Focus Areas: {', '.join(config['agents'])}

        Remember:
        - Search the knowledge base FIRST to retrieve document content
        - Quote specific text from the document
        - Base ALL analysis on the actual uploaded document, not generic contract knowledge
        - If you cannot find the document in the knowledge base, explicitly state this
        """

        print(f"Running analysis with query type: {analysis_type}")
        # Run analysis
        response = legal_team.run(query)
        print(f"Analysis complete. Response type: {type(response)}")

        # Parse response
        analysis_result = parse_agent_response(response)
        print(f"Parsed result: risk_score={analysis_result['risk_score']}")

        # Ensure we have valid data
        if not analysis_result["risk_summary"]:
            analysis_result["risk_summary"] = ["Document analysis completed", "Review recommended", "Multiple considerations identified"]

        if not analysis_result["clauses"]:
            analysis_result["clauses"] = [{
                "title": "Document Review",
                "content": "Full document review completed. Specific clause analysis available upon request.",
                "highlight": ""
            }]

        if not analysis_result["recommendations"]:
            analysis_result["recommendations"] = ["Seek legal counsel for detailed review", "Consider negotiating key terms", "Ensure all parties understand obligations"]

        return AnalysisResponse(**analysis_result)

    except Exception as e:
        print(f"Analysis error: {type(e).__name__}: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")
    finally:
        # Clean up
        if temp_file_path and os.path.exists(temp_file_path):
            try:
                os.unlink(temp_file_path)
                print(f"Cleaned up temp file: {temp_file_path}")
            except:
                pass

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "Legal Document Analyzer API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8501)
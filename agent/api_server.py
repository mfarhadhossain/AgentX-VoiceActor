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

# Hardcoded Qdrant configuration - update these values for your setup
QDRANT_CONFIG = {
    "url": "https://fd0f2387-645d-4d44-bb59-02909affd364.us-west-1-0.aws.cloud.qdrant.io",  # Update this
    "api_key": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2Nlc3MiOiJtIn0.G6ZK06QnWMBzKXfDr0quLl_bdL7yXK1z0azfrnIpgXU",  # Update this
    "collection_name": "legal_documents"
}

class AnalysisResponse(BaseModel):
    analysis: str  # The main analysis markdown
    key_points: str  # The key points markdown
    recommendations: str  # The recommendations markdown
    # Optional: Keep some parsed data for the frontend UI
    risk_score: float


def extract_risk_score(text: str) -> float:
    """Extract risk score from agent response"""
    if not isinstance(text, str):
        return -1.0

    # Look for patterns like "risk score: 7.5" or "7.5/10" or "7 / 10"
    patterns = [
        # Risk Score: 7/10 or **7 / 10**
        r"risk\s*score[:\s]*\*?\*?(\d+\.?\d*)\s*[/]\s*10",
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
    return -1.0


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
    # For debugging - print first 1000 chars to see what we're getting
    print(f"Content preview: {content[:1000]}...")

    # Extract risk score with improved parsing
    risk_score = extract_risk_score(content)
    print(f"Extracted risk score: {risk_score}")

    # Extract risk summary - look for actual risk findings
    risk_summary = []

    # Try to find risk findings section
    risk_section_pattern = r'(?:Key Risk Findings|Risk Findings|Risks?)[:\s]*\n(.*?)(?=\n#+|\n\n#+|$)'
    risk_match = re.search(risk_section_pattern, content,
                           re.IGNORECASE | re.DOTALL)

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
        risk_summary = [clean_markdown(
            s.strip()) for s in risk_sentences if len(s.strip()) > 30][:3]

    # Extract clauses with better parsing
    clauses = extract_clauses_from_markdown(content)

    # Extract recommendations
    recommendations = []

    # Try to find recommendations section
    rec_section_pattern = r'(?:Recommendations?|Negotiation Tips?|Suggestions?)[:\s]*\n(.*?)(?=\n#+|\n\n#+|$)'
    rec_match = re.search(rec_section_pattern, content,
                          re.IGNORECASE | re.DOTALL)

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
        recommendations = [clean_markdown(
            s.strip()) for s in rec_sentences if len(s.strip()) > 30][:4]

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
            "Find and cite relevant legal cases and precedents",
            "Provide detailed research summaries with sources",
            "Reference specific sections from the uploaded document",
            "Always search the knowledge base for relevant information"
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
            "Reference specific clauses from the document"
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
            "Consider both risks and opportunities"
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
            "Coordinate analysis between team members",
            "Provide comprehensive responses",
            "Ensure all recommendations are properly sourced",
            "Reference specific parts of the uploaded document",
            "Always search the knowledge base before delegating tasks"
        ],
        show_tool_calls=True,
        markdown=True
    )

    return legal_team


@app.post("/api/analyze", response_model=AnalysisResponse)
async def analyze_contract(
    file: UploadFile = File(...),
    openai_api_key: str = Form(...),
    analysis_type: str = Form(...),
    custom_query: Optional[str] = Form(None)
):
    """Analyze uploaded contract using the legal agent team"""

    print(f"Received analysis request: {analysis_type}")
    print(f"File: {file.filename}, Size: {file.size}")

    # Validate inputs
    if not all([openai_api_key]):
        raise HTTPException(
            status_code=400, detail="Missing required API credentials")

    # Set environment variable
    os.environ['OPENAI_API_KEY'] = openai_api_key

    # Initialize Qdrant
    try:
        vector_db = Qdrant(
            collection=QDRANT_CONFIG["collection_name"],
            url=QDRANT_CONFIG["url"],
            api_key=QDRANT_CONFIG["api_key"],
            embedder=OpenAIEmbedder(
                id="text-embedding-3-small",
                api_key=openai_api_key
            )
        )
        print("Successfully connected to Qdrant")
    except Exception as e:
        print(f"Qdrant connection error: {str(e)}")
        raise HTTPException(
            status_code=500, detail=f"Failed to connect to Qdrant: {str(e)}")

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
                "query": "Review this contract and identify key terms, obligations, and potential issues.",
                "agents": ["Contract Analyst"],
                "description": "Detailed contract analysis focusing on terms and obligations"
            },
            "Legal Research": {
                "query": "Research relevant cases and precedents related to this document.",
                "agents": ["Legal Researcher"],
                "description": "Research on relevant legal cases and precedents"
            },
            "Risk Assessment": {
                "query": "Analyze potential legal risks and liabilities in this document.",
                "agents": ["Contract Analyst", "Legal Strategist"],
                "description": "Combined risk analysis and strategic assessment"
            },
            "Compliance Check": {
                "query": "Check this document for regulatory compliance issues.",
                "agents": ["Legal Researcher", "Contract Analyst", "Legal Strategist"],
                "description": "Comprehensive compliance analysis"
            },
            "Custom Query": {
                "query": None,
                "agents": ["Legal Researcher", "Contract Analyst", "Legal Strategist"],
                "description": "Custom analysis using all available agents"
            }
        }

        config = analysis_configs.get(analysis_type, analysis_configs["Custom Query"])

        # Build query exactly like agent_team.py
        if analysis_type != "Custom Query":
            combined_query = f"""
            Using the uploaded document as reference:

            Primary Analysis Task: {config['query']}
            Focus Areas: {', '.join(config['agents'])}

            Please search the knowledge base and provide specific references from the document.
            """
        else:
            combined_query = f"""
            Using the uploaded document as reference:

            {custom_query}

            Please search the knowledge base and provide specific references from the document.
            Focus Areas: {', '.join(config['agents'])}
            """

        print(f"Running analysis with query type: {analysis_type}")
        # Run analysis
        response = legal_team.run(combined_query)


        # Extract the main analysis content
        analysis_content = ""
        if response.content:
            analysis_content = response.content
        else:
            for message in response.messages:
                if message.role == 'assistant' and message.content:
                    analysis_content = message.content
                    break
        
        print("Main analysis complete")
        
        # Second call: Key Points
        print("Extracting key points...")
        key_points_query = f"""Based on this previous analysis:    
        {analysis_content}
        
        Please summarize the key points in bullet points.
        Focus on insights from: {', '.join(config['agents'])}"""
        
        key_points_response = legal_team.run(key_points_query)

        key_points_content = ""
        if key_points_response.content:
            key_points_content = key_points_response.content
        else:
            for message in key_points_response.messages:
                if message.role == 'assistant' and message.content:
                    key_points_content = message.content
                    break
        
        # Third call: Recommendations
        print("Generating recommendations...")
        recommendations_query = f"""Based on this previous analysis:
        {analysis_content}
        
        What are your key recommendations based on the analysis, the best course of action?
        Provide specific recommendations from: {', '.join(config['agents'])}"""
        
        recommendations_response = legal_team.run(recommendations_query)
        
        recommendations_content = ""
        if recommendations_response.content:
            recommendations_content = recommendations_response.content
        else:
            for message in recommendations_response.messages:
                if message.role == 'assistant' and message.content:
                    recommendations_content = message.content
                    break

        # Now parse all three responses together
        print("Parsing combined responses...")
        
        # Extract risk score from the analysis (simple extraction)
        risk_score = extract_risk_score(analysis_content)
        
        return AnalysisResponse(
            analysis=analysis_content,
            key_points=key_points_content,
            recommendations=recommendations_content,
            risk_score=risk_score
        )

    except Exception as e:
        print(f"Analysis error: {type(e).__name__}: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=500, detail=f"Analysis failed: {str(e)}")
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

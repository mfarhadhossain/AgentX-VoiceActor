A multi-agent system for analyzing legal documents using local AI models through Ollama and Qdrant vector database.

## Features

- Local AI processing with no data sent to external APIs
- Multi-agent team with specialized roles:
  - Compliance Checker / Legal Researcher
  - Contract Analyst
  - Negotiation Strategist
  - Team Coordinator
- Analysis options:
  - Contract Review
  - Risk Assessment
  - Compliance Check
  - Custom Query

## Requirements

- Python 3.8+
- Ollama (for local AI models)
- Qdrant (for vector database)
- Required Python packages (see `requirements.txt`)

## Setup Instructions

### 1. Install Dependencies

```
pip install -r requirements.txt
```



### 2. Set Up Ollama

```
# Install Ollama following instructions at: https://ollama.com/download

# Pull required models

ollama pull qwen2.5:7b # For the LLM agents

ollama pull openhermes # For embeddings
```



### 3. Start Qdrant Server

```
# Using Docker https://qdrant.tech/documentation/quickstart/ 

docker pull qdrant/qdrant

docker run -p 6333:6333 -p 6334:6334 \
    -v "$(pwd)/qdrant_storage:/qdrant/storage:z" \
    qdrant/qdrant
```



### 4. Run the Application

```
streamlit run local_agent_team.py
```



## Usage

1. Upload a legal document (PDF)
2. Choose an analysis type
3. Enter any specific queries (optional)
4. Click "Analyze" to process the document
5. View results in the Analysis, Key Points, and Recommendations tabs

## Troubleshooting

- **Model not found error**: Make sure you've pulled the correct models with Ollama
- **Connection error**: Verify that Qdrant server is running
- **Embedding error**: Ensure you're using an embedding model that supports this feature
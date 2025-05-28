# AgentX-VoiceActor

A comprehensive legal document analysis platform combining a multi-agent AI backend with an intuitive Next.js frontend

## 🎯 Project Overview

This system consists of two main components:
- **Agent Backend**: Multi-agent system for analyzing legal documents using local AI models
- **Client Frontend**: Next.js web application for contract upload, risk visualization, and negotiation tips

## 🏗️ Architecture

```
AgentX-VoiceActor/
├── agent/          # Python backend with AI agents
├── client/         # Next.js frontend
└── README.md       # This file
```

## ✨ Key Features

### Backend (Agent)
- **Local AI Processing**: No data sent to external APIs
- **Multi-Agent Team**: Specialized roles including Compliance Checker, Contract Analyst, Negotiation Strategist, and Team Coordinator
- **Multiple Analysis Types**: Contract Review, Risk Assessment, Compliance Check, Custom Query
- **Vector Database**: Powered by Qdrant for efficient document search

### Frontend (Client)
- **Drag-and-Drop Upload**: Easy PDF contract uploads
- **Risk Scoring**: Overall and Voice-Use AI Risk scores
- **Interactive Highlights**: Clickable clause explanations
- **Negotiation Guidance**: AI-powered suggestions and talking points

## 🚀 Quick Start

### Prerequisites

- **Python 3.8+**
- **Node.js 16+**
- **Docker** (for Qdrant)
- **Git**

### 1. Clone the Repository

```bash
git clone https://github.com/TanusreeSharma/AgentX-VoiceActor.git
cd AgentX-VoiceActor
```

### 2. Backend Setup (Agent)

Choose between local AI processing or external API usage:

#### Option A: Local AI Processing (Recommended for Privacy)

```bash
# Navigate to agent directory
cd agent

# Install Python dependencies
pip install -r requirements.txt

# Install and setup Ollama
# Visit https://ollama.com/download for installation instructions

# Pull required AI models
ollama pull qwen2.5:7b      # For LLM agents
ollama pull openhermes      # For embeddings

# Start Qdrant vector database
docker pull qdrant/qdrant
docker run -p 6333:6333 -p 6334:6334 \
    -v "$(pwd)/qdrant_storage:/qdrant/storage:z" \
    qdrant/qdrant

# Start the backend server
streamlit run local_agent_team.py
```

The backend will be available at `http://localhost:8501`

#### Option B: External APIs (Faster but requires API keys)

```bash
# Navigate to agent directory
cd agent

# Install Python dependencies
pip install -r requirements.txt

# Start the API server
python3 run api_server.py
```

**Note**: For external APIs, ensure you have configured your API keys in the environment or configuration files.

### 3. Frontend Setup (Client)

```bash
# Open a new terminal and navigate to client directory
cd client

# Install Node.js dependencies
npm install

# Create environment configuration
cp .env.example .env.local
# Edit .env.local with your configuration

# Start the development server
npm run dev
```

The frontend will be available at `http://localhost:3000`

## ⚙️ Configuration

### Backend Configuration

#### For Local AI Processing:
- Ollama models: `qwen2.5:7b` and `openhermes`
- Qdrant vector database running on port 6333

#### For External APIs:
- Configure API keys in your environment or configuration files
- No local models or vector database required

### Frontend Configuration
Create `.env.local` in the client directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:8501
OPENAI_API_KEY=your_openai_key_here
CLAUDE_API_KEY=your_claude_key_here
```

## 📖 Usage

1. **Start Both Services**: Ensure both backend (port 8501) and frontend (port 3000) are running
2. **Upload Contract**: Use the frontend to drag-and-drop your PDF contract
3. **Select Analysis Type**: Choose from Contract Review, Risk Assessment, or Compliance Check
4. **Review Results**:
    - View risk scores and highlighted clauses in the frontend
    - Access detailed agent analysis in the backend interface
5. **Get Negotiation Tips**: Use AI-powered suggestions for contract improvements

## 🛠️ Development

### Project Structure

```
AgentX-VoiceActor/
├── agent/
│   ├── local_agent_team.py    # Main Streamlit application
│   ├── requirements.txt       # Python dependencies
│   └── ...                   # Agent implementation files
├── client/
│   ├── pages/                # Next.js route handlers
│   ├── app/                  # App Router components
│   ├── components/           # Reusable UI components
│   ├── public/               # Static assets
│   ├── styles/               # Tailwind configuration
│   └── package.json          # Node.js dependencies
└── README.md
```

### Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request to the `develop` branch

## 🔧 Troubleshooting

### Backend Issues
#### Local AI Setup:
- **Model not found error**: Ensure you've pulled the correct models with `ollama pull`
- **Connection error**: Verify Qdrant server is running on port 6333
- **Embedding error**: Check that you're using compatible embedding models

#### External API Setup:
- **API connection failed**: Verify your API keys are correctly configured
- **Rate limiting**: Check if you've exceeded your API quota
- **Authentication error**: Ensure API keys are valid and have proper permissions

### Frontend Issues
- **API connection failed**: Verify backend is running on port 8501
- **Environment variables**: Ensure `.env.local` is properly configured
- **PDF rendering issues**: Check PDF.js compatibility with your document format

### Common Solutions
- Restart both services if experiencing connection issues
- Check that all required ports (3000, 6333, 8501) are available
- Verify Docker is running for Qdrant database

## 📋 Requirements

### Backend Requirements
- Python 3.8+
- Ollama with qwen2.5:7b and openhermes models
- Qdrant vector database
- Required Python packages (see agent/requirements.txt)

### Frontend Requirements
- Node.js 16+
- npm or yarn
- Modern web browser with PDF.js support

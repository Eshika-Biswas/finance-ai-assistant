# Finance AI Assistant 💳🤖

> An AI-powered multimodal assistant that analyzes financial documents — receipts, invoices, credit card statements, and expense reports — and explains charges using vision AI, document extraction, and RAG-based retrieval.

**Live Demo:** [https://finance-ai-assistant-ten.vercel.app](https://finance-ai-assistant-ten.vercel.app)  
**Backend API:** [https://finance-ai-assistant-j3bi.onrender.com](https://finance-ai-assistant-j3bi.onrender.com)  
**API Docs:** [https://finance-ai-assistant-j3bi.onrender.com/docs](https://finance-ai-assistant-j3bi.onrender.com/docs)

---

## 1. Overview

### Project Purpose
Finance AI Assistant helps users understand unfamiliar or confusing charges on their financial documents. Upload a screenshot or PDF of a receipt, invoice, or credit card statement, ask a question, and receive a clear, grounded explanation powered by AI.

### Problem Solved
Finance and operations teams often encounter mysterious charges — AWS fees, SaaS renewals, vendor invoices — without clear context. This tool extracts structured fields from the document, uses vision AI to understand the layout, retrieves supporting billing policies, and generates a plain-language explanation.

### Target Users
- Individual consumers reviewing personal expenses
- Finance teams reconciling vendor invoices
- Operations teams auditing SaaS subscriptions
- Accountants reviewing client documents

### Business Value
- Reduces time spent manually researching unknown charges
- Surfaces billing policy context automatically (prior invoices, subscription terms)
- Provides a transparent audit trail of extracted fields and retrieved context
- Easily extensible to support company-specific billing policies

### High-Level Architecture
```
User uploads PDF/Image + asks question
         │
         ▼
   React Frontend (Vercel)
         │
         ▼
   FastAPI Backend (Render)
    ├── Document Parser (pypdf)
    ├── Field Extractor (Groq LLM)
    ├── Vision Analyzer (Groq Vision LLM)
    ├── Vector Store (TF-IDF / JSON)
    └── RAG Pipeline (LangChain + Groq)
         │
         ▼
   AI Answer returned to user
```

---

## 2. Key Features

### Core Capabilities
- **Document Upload** — supports JPG, PNG, and PDF files via drag-and-drop
- **Field Extraction** — automatically extracts vendor name, billing date, subtotal, tax, total, and line items
- **Vision Analysis** — uses a multimodal LLM to understand document layout and identify specific charges
- **RAG Retrieval** — retrieves relevant billing policies and prior context to ground the AI's answer
- **Plain-Language Answers** — returns concise, human-readable explanations of any charge

### Unique Functionality
- Works on both scanned image documents and text-based PDFs
- Seeded billing knowledge base (AWS, Stripe, Adobe, Google Cloud, SaaS policies) included out of the box
- Every analyzed document is ingested into the local vector store, enriching future answers
- Zero external embedding dependencies — uses local TF-IDF similarity search for retrieval

### Major Integrations
- **Groq** — free, fast LLM inference for vision and text reasoning
- **LangChain** — orchestration of the RAG pipeline and prompt management
- **LangSmith** — tracing and observability for all LLM calls
- **Render** — backend deployment (FastAPI)
- **Vercel** — frontend deployment (React)

---

## 3. Technology Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 18 + TypeScript | UI framework |
| react-dropzone | File upload with drag-and-drop |
| react-markdown | Render AI responses as formatted markdown |
| axios | HTTP client for API calls |
| Create React App | Build tooling |

### Backend
| Technology | Purpose |
|---|---|
| Python 3.11 | Runtime |
| FastAPI | REST API framework |
| uvicorn | ASGI server |
| pypdf | PDF text extraction |
| Pillow | Image processing |
| scikit-learn | TF-IDF vectorization for local similarity search |

### Database / Storage
| Technology | Purpose |
|---|---|
| JSON file store | Persistent document and policy storage (no credentials needed) |
| Local filesystem | Uploaded document storage |

> No external database credentials required. The vector store uses a simple JSON file at `data/vector_store/documents.json`.

### Infrastructure & DevOps
| Technology | Purpose |
|---|---|
| Render (free tier) | Backend hosting |
| Vercel (free tier) | Frontend hosting |
| GitHub | Source control and CI/CD trigger |
| Docker (optional) | Local containerized development |

### AI / ML Stack
| Technology | Purpose |
|---|---|
| Groq (`llama-3.3-70b-versatile`) | Text reasoning, field extraction, RAG answer generation |
| Groq (`meta-llama/llama-4-scout-17b-16e-instruct`) | Vision analysis of image documents |
| LangChain | RAG pipeline orchestration |
| LangSmith | LLM call tracing and monitoring |
| scikit-learn TF-IDF | Local document similarity retrieval |

---

## 4. Setup & Installation

### Prerequisites
- Python 3.11+
- Node.js 18+
- Git

### Environment Variables
Create a `.env` file in the project root (copy from `.env.example`):

```env
GROQ_API_KEY=your_groq_api_key_here
LANGCHAIN_API_KEY=your_langsmith_api_key_here
LANGCHAIN_TRACING_V2=true
LANGCHAIN_PROJECT=finance-ai-assistant
CHROMA_PERSIST_DIR=./data/vector_store
UPLOAD_DIR=./data/uploads
```

**Where to get free API keys:**
- Groq: [https://console.groq.com/keys](https://console.groq.com/keys)
- LangSmith: [https://smith.langchain.com/settings](https://smith.langchain.com/settings)

> Never commit your `.env` file. It is listed in `.gitignore` by default.

### Local Setup

**1. Clone the repository**
```bash
git clone https://github.com/Eshika-Biswas/finance-ai-assistant.git
cd finance-ai-assistant
```

**2. Set up the backend**
```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\Activate.ps1

# Mac/Linux
source venv/bin/activate

pip install -r requirements.txt
```

**3. Set up the frontend**
```bash
cd ../frontend
npm install
```

### Database Setup
No database setup required. The vector store is initialized automatically on first run and seeded with built-in billing policies. Uploaded documents are stored in `data/uploads/` and indexed in `data/vector_store/documents.json`.

### Run Instructions

**Start the backend** (from project root, with venv active):
```bash
# Windows
backend\venv\Scripts\Activate.ps1
python -m uvicorn backend.main:app --reload --port 8000

# Mac/Linux
source backend/venv/bin/activate
python -m uvicorn backend.main:app --reload --port 8000
```

**Start the frontend** (in a separate terminal):
```bash
cd frontend
npm start
```

- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend API: [http://localhost:8000](http://localhost:8000)
- API Docs: [http://localhost:8000/docs](http://localhost:8000/docs)

### Docker Setup (Optional)
```bash
# Build and run both services
docker-compose -f docker/docker-compose.yml up --build
```

---

## 5. Project Structure

```
finance-ai-assistant/
├── backend/
│   ├── api/                    # (reserved for future route modules)
│   ├── core/
│   │   ├── rag_pipeline.py     # LangChain RAG orchestration
│   │   └── vision_chain.py     # Groq vision + text LLM wrappers
│   ├── extraction/
│   │   └── document_parser.py  # PDF/image parsing + field extraction
│   ├── retrieval/
│   │   └── vector_store.py     # TF-IDF local vector store
│   ├── evaluation/             # Ragas evaluation scripts
│   ├── main.py                 # FastAPI application entry point
│   ├── requirements.txt        # Python dependencies
│   └── runtime.txt             # Python version pin for Render
├── frontend/
│   └── src/
│       └── App.tsx             # Main React UI component
├── data/
│   ├── uploads/                # User-uploaded documents (gitignored)
│   ├── vector_store/           # TF-IDF document JSON store (gitignored)
│   └── sample_docs/            # Sample financial documents for testing
├── docker/
│   ├── Dockerfile
│   └── docker-compose.yml
├── .env.example                # Template for environment variables
├── .gitignore
├── render.yaml                 # Render deployment blueprint
└── README.md
```

### Key Directories
| Directory | Purpose |
|---|---|
| `backend/core/` | AI pipeline logic (vision, RAG, LLM calls) |
| `backend/extraction/` | Document parsing and field extraction |
| `backend/retrieval/` | Vector store and similarity search |
| `frontend/src/` | React UI components |
| `data/vector_store/` | Persisted document knowledge base |
| `data/uploads/` | Temporary storage for uploaded files |

### Application Entry Points
| Entry Point | Purpose |
|---|---|
| `backend/main.py` | FastAPI app, all routes, startup event |
| `frontend/src/App.tsx` | Root React component, entire UI |

---

## 6. Developer Guide

### System Workflow

```
1. User drops a PDF or image into the upload zone
2. User types a question (e.g. "Why was this $49.99 charged?")
3. Frontend POSTs the file + question to /analyze
4. Backend:
   a. Extracts text from the document (pypdf for PDF, base64 for images)
   b. Uses Groq LLM to extract structured fields (vendor, total, line items, etc.)
   c. Uses Groq Vision LLM to analyze the document layout and identify the charge
   d. Ingests the document text into the local TF-IDF vector store
   e. Retrieves the top 4 most relevant billing policy snippets
   f. Builds a RAG prompt combining: vision analysis + extracted fields + retrieved context + user question
   g. Generates a 3-5 sentence grounded answer via Groq
5. Response returned: answer + extracted fields + context used + raw document text
6. Frontend renders the answer with supporting details
```

### Authentication / Data Flow
- No user authentication is implemented (suitable for demo and internal tools)
- All API calls are unauthenticated
- API keys are stored server-side only; the frontend never sees them
- CORS is currently open (`allow_origins=["*"]`) — restrict this for production

### Development Workflow
1. Make changes locally
2. Test locally with uvicorn (backend) and npm start (frontend)
3. Commit and push to `main` on GitHub
4. Render auto-redeploys the backend on push
5. Vercel auto-redeploys the frontend on push

### Adding New Features

**Add a new AI action (e.g. "Detect fraud indicators"):**
1. Add a new prompt template in `backend/core/rag_pipeline.py`
2. Expose a new endpoint in `backend/main.py`
3. Add a button in `frontend/src/App.tsx` that calls the new endpoint

**Add new billing policies to the knowledge base:**
1. Open `backend/retrieval/vector_store.py`
2. Add a new entry to the `policies` list inside `seed_billing_policies()`
3. Delete `data/vector_store/documents.json` so it re-seeds on next startup

**Add support for a new file type:**
1. Update `backend/extraction/document_parser.py` to handle the new extension
2. Update `backend/core/vision_chain.py` to route it correctly
3. Update the `accept` prop in the dropzone in `frontend/src/App.tsx`

### Contribution Process
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Make your changes and test locally
4. Commit with a clear message: `git commit -m "add: describe what you added"`
5. Push to your fork and open a pull request against `main`

---

## 7. Support & Reference

### Common Commands

```bash
# Activate backend virtual environment (Windows)
backend\venv\Scripts\Activate.ps1

# Activate backend virtual environment (Mac/Linux)
source backend/venv/bin/activate

# Start backend server
python -m uvicorn backend.main:app --reload --port 8000

# Start frontend
cd frontend && npm start

# Install backend dependencies
cd backend && pip install -r requirements.txt

# Install frontend dependencies
cd frontend && npm install

# Build frontend for production
cd frontend && npm run build

# Check git status
git status

# Push to GitHub
git add . && git commit -m "your message" && git push origin main
```

### Important URLs
| URL | Purpose |
|---|---|
| [http://localhost:3000](http://localhost:3000) | Local frontend |
| [http://localhost:8000](http://localhost:8000) | Local backend |
| [http://localhost:8000/docs](http://localhost:8000/docs) | Local API docs (Swagger UI) |
| [http://localhost:8000/health](http://localhost:8000/health) | Backend health check |
| [https://finance-ai-assistant-ten.vercel.app](https://finance-ai-assistant-ten.vercel.app) | Live frontend |
| [https://finance-ai-assistant-j3bi.onrender.com](https://finance-ai-assistant-j3bi.onrender.com) | Live backend |
| [https://finance-ai-assistant-j3bi.onrender.com/docs](https://finance-ai-assistant-j3bi.onrender.com/docs) | Live API docs |
| [https://console.groq.com/keys](https://console.groq.com/keys) | Groq API keys |
| [https://smith.langchain.com](https://smith.langchain.com) | LangSmith tracing dashboard |

### Troubleshooting

| Problem | Cause | Fix |
|---|---|---|
| `uvicorn: command not found` | Running from wrong folder or venv not active | Run from project root with `python -m uvicorn backend.main:app` |
| `No module named 'backend'` | Running uvicorn from inside the backend folder | `cd` to project root first, then run uvicorn |
| `Model decommissioned` error | Groq deprecated an old model | Update the model name in `vision_chain.py` — check [console.groq.com](https://console.groq.com) for current models |
| `NameResolutionError` for HuggingFace | Old HuggingFace inference endpoint is deprecated | Already fixed — project uses local TF-IDF, no HuggingFace needed |
| `std::bad_alloc` on PDF parse | Docling ran out of memory | Already fixed — project uses lightweight pypdf instead |
| Backend sleeps on Render | Render free tier spins down after 15 min inactivity | First request after sleep takes 30-50 seconds; upgrade to paid tier to avoid this |
| CORS error in browser | Backend not allowing frontend domain | Check `allow_origins` in `main.py` — set to `["*"]` for development |
| `.env` not loading | Wrong path or file not saved | Ensure `.env` is in project root and `load_dotenv()` is called in `main.py` |

### FAQs

**Q: Does this work with handwritten receipts?**  
A: Image documents go through the Groq vision model, which handles printed text well. Handwritten text recognition depends on legibility and the model's capability.

**Q: Is my uploaded document stored permanently?**  
A: Uploaded files are saved to `data/uploads/` on the server. The extracted text is added to the vector store. On Render's free tier, both reset on redeploy unless a paid persistent disk is attached.

**Q: Can I add my company's own billing policies?**  
A: Yes — add entries to the `policies` list in `backend/retrieval/vector_store.py` and delete `data/vector_store/documents.json` to force re-seeding.

**Q: How do I change the AI model?**  
A: Update the `model` parameter in `build_vision_llm()` and `build_rag_llm()` inside `backend/core/vision_chain.py` and `backend/core/rag_pipeline.py`. Check [console.groq.com](https://console.groq.com/docs/models) for available models.

**Q: Why TF-IDF instead of a vector database like ChromaDB?**  
A: ChromaDB with sentence-transformers requires PyTorch (500MB+), which exceeds Render's free tier 512MB RAM limit. TF-IDF is lightweight, requires no GPU, no internet, and no external API — and works well for this use case.

### Maintainers & Support Channels
- **Author:** Eshika Biswas
- **GitHub:** [https://github.com/Eshika-Biswas/finance-ai-assistant](https://github.com/Eshika-Biswas/finance-ai-assistant)
- **Issues:** Open a GitHub Issue for bugs or feature requests
- **LangSmith Project:** `finance-ai-assistant` (for LLM call traces and debugging)

---

*Built with FastAPI, React, LangChain, and Groq. Deployed on Render + Vercel.*

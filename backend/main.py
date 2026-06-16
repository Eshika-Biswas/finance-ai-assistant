import os
import shutil
from pathlib import Path
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv

load_dotenv(dotenv_path=Path(__file__).parent.parent / ".env")

from backend.extraction.document_parser import FinancialDocumentParser, FinancialFieldExtractor
from backend.core.vision_chain import analyze_document_image, build_vision_llm
from backend.core.rag_pipeline import run_rag_pipeline
from backend.retrieval.vector_store import ingest_document, seed_billing_policies

app = FastAPI(title="Finance AI Assistant")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = Path(os.getenv("UPLOAD_DIR", "./data/uploads"))
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

parser = FinancialDocumentParser()


@app.on_event("startup")
async def startup():
    seed_billing_policies()
    print("Finance AI Assistant started successfully.")


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/analyze")
async def analyze_document(
    file: UploadFile = File(...),
    question: str = Form(...)
):
    file_path = UPLOAD_DIR / file.filename
    with open(file_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    try:
        parsed = parser.parse(str(file_path))

        llm = build_vision_llm()
        field_extractor = FinancialFieldExtractor(llm)
        fields = field_extractor.extract_fields(parsed["markdown"])

        vision_analysis = analyze_document_image(str(file_path), question)

        ingest_document(parsed["raw_text"], {
            "filename": file.filename,
            "vendor": fields.get("vendor_name", "unknown"),
            "type": fields.get("document_type", "unknown")
        })

        result = run_rag_pipeline(
            user_question=question,
            document_analysis=vision_analysis,
            extracted_fields=fields
        )

        return JSONResponse({
            "answer": result["answer"],
            "extracted_fields": fields,
            "vision_analysis": vision_analysis,
            "context_used": result["context_used"],
            "document_markdown": parsed["markdown"][:2000]
        })

    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)
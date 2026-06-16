from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from backend.retrieval.vector_store import retrieve_context


def build_rag_llm():
    return ChatGroq(
        model="llama-3.3-70b-versatile",
        temperature=0.2,
        max_tokens=1500
    )


RAG_PROMPT = ChatPromptTemplate.from_template("""
You are a financial assistant helping explain charges on invoices,
receipts, and credit card statements.

DOCUMENT CONTENT (extracted by AI vision):
{document_analysis}

EXTRACTED FIELDS:
{extracted_fields}

SUPPORTING CONTEXT (from prior invoices and billing policies):
{context}

USER QUESTION:
{question}

Instructions:
- Answer the user question about the charge in clear simple language
- Reference specific amounts, vendor names, and dates from the document
- Use the supporting context to explain WHY this charge was made
- If the charge looks unusual, say so clearly
- Keep your answer to 3 to 5 sentences maximum

Answer:
""")


def run_rag_pipeline(
    user_question: str,
    document_analysis: str,
    extracted_fields: dict
) -> dict:
    context_docs = retrieve_context(user_question)
    context_text = "\n\n---\n\n".join(context_docs)

    llm = build_rag_llm()
    chain = RAG_PROMPT | llm | StrOutputParser()

    answer = chain.invoke({
        "document_analysis": document_analysis,
        "extracted_fields": str(extracted_fields),
        "context": context_text,
        "question": user_question
    })

    return {
        "answer": answer,
        "context_used": context_docs,
        "model": "llama-3.3-70b-versatile"
    }
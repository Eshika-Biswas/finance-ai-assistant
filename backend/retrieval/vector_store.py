import os
from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
from dotenv import load_dotenv

load_dotenv()

CHROMA_DIR = os.getenv("CHROMA_PERSIST_DIR", "./data/vector_store")


def get_embeddings():
    return HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2"
    )


def get_vector_store():
    embeddings = get_embeddings()
    return Chroma(
        persist_directory=CHROMA_DIR,
        embedding_function=embeddings,
        collection_name="financial_docs"
    )


def ingest_document(text: str, metadata: dict):
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=50
    )
    chunks = splitter.split_text(text)
    if not chunks:
        return 0
    store = get_vector_store()
    store.add_texts(texts=chunks, metadatas=[metadata] * len(chunks))
    return len(chunks)


def retrieve_context(query: str, k: int = 4) -> list:
    store = get_vector_store()
    docs = store.similarity_search(query, k=k)
    return [doc.page_content for doc in docs]


def seed_billing_policies():
    policies = [
        {
            "text": "AWS charges for EC2 instances are billed hourly. Data transfer out costs $0.09 per GB. S3 storage costs $0.023 per GB per month.",
            "metadata": {"source": "aws_billing_policy", "type": "policy"}
        },
        {
            "text": "Stripe payment processing fees are 2.9% plus 30 cents per successful card charge. International cards add 1.5%. Monthly invoices are generated on the 1st of each month.",
            "metadata": {"source": "stripe_billing_policy", "type": "policy"}
        },
        {
            "text": "SaaS subscription renewals auto-renew 30 days before expiration. Annual plans are billed in full at renewal date. Cancellations must be submitted 7 days before renewal.",
            "metadata": {"source": "saas_billing_policy", "type": "policy"}
        },
        {
            "text": "Adobe Creative Cloud subscription costs $54.99 per month or $599.88 per year. Billed on the same date each month. Auto-renews unless cancelled.",
            "metadata": {"source": "adobe_billing_policy", "type": "policy"}
        },
        {
            "text": "Google Cloud Platform charges are billed monthly. Compute Engine VMs are charged per second with a 1 minute minimum. Sustained use discounts apply automatically.",
            "metadata": {"source": "gcp_billing_policy", "type": "policy"}
        }
    ]

    for item in policies:
        ingest_document(item["text"], item["metadata"])

    print(f"Seeded {len(policies)} billing policy documents into vector store.")
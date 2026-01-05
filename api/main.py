"""FastAPI sentiment analysis API."""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from src import load_model, predict_finetuned, predict_pretrained


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load model on startup."""
    load_model()
    yield


app = FastAPI(
    title="Sentiment Analysis API",
    description="Analyze sentiment of product reviews",
    version="0.1.0",
    lifespan=lifespan,
)

# CORS for Next.js frontend and Streamlit
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Next.js frontend
        "http://web:3000",  # Docker service name
        "http://localhost:8501",  # Streamlit default port
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ReviewRequest(BaseModel):
    """Request model for sentiment analysis."""

    text: str


class SentimentResponse(BaseModel):
    """Response model for sentiment analysis."""

    label: str
    confidence: float


@app.get("/health")
def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}


@app.post("/predict", response_model=SentimentResponse)
def predict_sentiment(request: ReviewRequest):
    """Predict sentiment for a product review (uses fine-tuned model by default)."""
    result = predict_finetuned(request.text)
    return SentimentResponse(**result)


@app.post("/predict/finetuned", response_model=SentimentResponse)
def predict_finetuned_endpoint(request: ReviewRequest):
    """Predict sentiment using fine-tuned model."""
    result = predict_finetuned(request.text)
    return SentimentResponse(**result)


@app.post("/predict/pretrained", response_model=SentimentResponse)
def predict_pretrained_endpoint(request: ReviewRequest):
    """Predict sentiment using pretrained model (before fine-tuning)."""
    result = predict_pretrained(request.text)
    return SentimentResponse(**result)


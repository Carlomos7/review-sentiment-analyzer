"""FastAPI sentiment analysis API."""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from src import load_model, predict


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

# CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://web:3000",  # Docker service name
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
    """Predict sentiment for a product review."""
    result = predict(request.text)
    return SentimentResponse(**result)

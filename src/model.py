"""Model loading and inference for sentiment analysis."""
import os

import tensorflow as tf
from transformers import RobertaTokenizerFast

from .config import config

tokenizer: RobertaTokenizerFast | None = None
model: tf.keras.Model | None = None


def load_model() -> None:
    """Load tokenizer and fine-tuned model into memory."""
    global tokenizer, model
    
    tokenizer = RobertaTokenizerFast.from_pretrained(config.model_name)
    
    if not os.path.exists(config.model_path):
        raise FileNotFoundError(f"Model not found at {config.model_path}")
    
    model = tf.keras.models.load_model(config.model_path)


def predict(text: str) -> dict:
    """
    Predict sentiment for a single text input.
    
    Args:
        text: Input text to classify.
    
    Returns:
        Dict with 'label' and 'confidence' keys.
    """
    if tokenizer is None or model is None:
        raise RuntimeError("Model not loaded. Call load_model() first.")
    
    inputs = tokenizer(
        text,
        max_length=config.max_len,
        padding="max_length",
        truncation=True,
        return_tensors="tf",
    )
    
    logits = model(inputs).logits
    probs = tf.nn.softmax(logits, axis=-1).numpy()[0]
    pred_idx = probs.argmax()
    
    return {
        "label": config.labels[pred_idx],
        "confidence": float(probs[pred_idx]),
    }
"""Model loading and inference for sentiment analysis."""
import tensorflow as tf
from transformers import RobertaTokenizerFast, TFRobertaForSequenceClassification
from pathlib import Path

from .config import config

tokenizer: RobertaTokenizerFast | None = None
model: TFRobertaForSequenceClassification | None = None
pretrained_model: TFRobertaForSequenceClassification | None = None


def load_model() -> None:
    """Load tokenizer and fine-tuned model into memory."""
    global tokenizer, model
    
    tokenizer = RobertaTokenizerFast.from_pretrained(config.model_name)
    model = TFRobertaForSequenceClassification.from_pretrained(config.finetuned_model_path)


def load_pretrained_model() -> None:
    """Load pretrained model (before fine-tuning) into memory."""
    global tokenizer, pretrained_model
    
    if tokenizer is None:
        tokenizer = RobertaTokenizerFast.from_pretrained(config.model_name)
    
    # Check if pretrained model exists locally, otherwise use base model
    # Try multiple possible paths (for Docker and local development)
    possible_paths = [
        Path(config.pretrained_model_path),  # From config
        Path("../models/pretrained_model"),  # If running from api/ directory
        Path(config.finetuned_model_path).parent / "pretrained_model",  # Relative to finetuned_model
    ]
    
    pretrained_path = None
    for path in possible_paths:
        if path.exists() and (path / "config.json").exists():
            pretrained_path = path
            break
    
    if pretrained_path:
        pretrained_model = TFRobertaForSequenceClassification.from_pretrained(
            str(pretrained_path)
        )
    else:
        # Fallback to base model from HuggingFace
        pretrained_model = TFRobertaForSequenceClassification.from_pretrained(
            config.model_name,
            num_labels=len(config.labels)
        )


def predict_finetuned(text: str) -> dict:
    """
    Predict sentiment for a single text input using fine-tuned model.
    
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


def predict_pretrained(text: str) -> dict:
    """
    Predict sentiment for a single text input using pretrained model.
    
    Args:
        text: Input text to classify.
    
    Returns:
        Dict with 'label' and 'confidence' keys.
    """
    global pretrained_model
    
    if tokenizer is None:
        raise RuntimeError("Tokenizer not loaded. Call load_model() first.")
    
    if pretrained_model is None:
        load_pretrained_model()
    
    inputs = tokenizer(
        text,
        max_length=config.max_len,
        padding="max_length",
        truncation=True,
        return_tensors="tf",
    )
    
    logits = pretrained_model(inputs).logits
    probs = tf.nn.softmax(logits, axis=-1).numpy()[0]
    pred_idx = probs.argmax()
    
    return {
        "label": config.labels[pred_idx],
        "confidence": float(probs[pred_idx]),
    }
"""Sentiment analysis for product reviews"""
from .config import config
from .model import load_model, predict_finetuned, predict_pretrained

__all__ = ["load_model", "predict_finetuned", "predict_pretrained", "config"]

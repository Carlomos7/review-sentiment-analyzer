"""Sentiment analysis for product reviews"""
from .config import config
from .model import load_model, predict

__all__ = ["load_model", "predict", "config"]

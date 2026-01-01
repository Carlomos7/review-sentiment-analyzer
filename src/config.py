"""Configuration for the sentiment analyzer"""
from dataclasses import dataclass


@dataclass(frozen=True)
class Config:
    """Configuration for the sentiment analyzer"""
    model_name: str = "cardiffnlp/twitter-roberta-base-sentiment-latest"
    model_path: str = "models/final_model"
    max_len: int = 128
    labels: tuple = ("negative", "neutral", "positive")


config = Config()

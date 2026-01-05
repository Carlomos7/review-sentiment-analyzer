"""Configuration for the sentiment analyzer"""
from dataclasses import dataclass


@dataclass(frozen=True)
class Config:
    """Configuration for the sentiment analyzer"""
    model_name: str = "cardiffnlp/twitter-roberta-base-sentiment-latest"
    finetuned_model_path: str = "models/final_model"
    pretrained_model_path: str = "models/pretrained_model"
    max_len: int = 128
    labels: tuple = ("negative", "neutral", "positive")


config = Config()

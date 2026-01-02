import tensorflow as tf
from transformers import RobertaTokenizerFast, TFRobertaForSequenceClassification
from src.config import config


class ModelComparison:
    def __init__(self):
        self.tokenizer = None
        self.pretrained_model = None
        self.finetuned_model = None
    
    def load_models(self):
        self.tokenizer = RobertaTokenizerFast.from_pretrained(config.model_name)
        self.pretrained_model = TFRobertaForSequenceClassification.from_pretrained("models/pretrained_model")
        self.finetuned_model = TFRobertaForSequenceClassification.from_pretrained("models/final_model")
    
    def predict_with_model(self, text: str, model) -> dict:
        inputs = self.tokenizer(
            text, max_length=config.max_len, padding="max_length",
            truncation=True, return_tensors="tf",
        )
        logits = model(inputs).logits
        probs = tf.nn.softmax(logits, axis=-1).numpy()[0]
        pred_idx = probs.argmax()
        return {"label": config.labels[pred_idx], "confidence": float(probs[pred_idx])}
    
    def compare(self, text: str) -> dict:
        return {
            "pretrained": self.predict_with_model(text, self.pretrained_model),
            "finetuned": self.predict_with_model(text, self.finetuned_model)
        }


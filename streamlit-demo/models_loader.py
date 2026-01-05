"""Model comparison using API endpoints."""
from typing import Optional
from app.api_client import predict_pretrained, predict_finetuned


class ModelComparison:
    def __init__(self, api_url: Optional[str] = None):
        """
        Initialize model comparison client.
        
        Args:
            api_url: Optional API URL override. Defaults to environment variable or localhost.
        """
        self.api_url = api_url

    def load_models(self):
        """No-op: Models are loaded on the API side."""

    def predict_with_model(self, text: str, model_type: str = "finetuned") -> dict:
        """
        Predict sentiment using specified model type via API.
        
        Args:
            text: Input text to classify.
            model_type: Either "pretrained" or "finetuned".
        
        Returns:
            Dict with 'label' and 'confidence' keys.
        """
        if model_type == "pretrained":
            return predict_pretrained(text, self.api_url)
        else:
            return predict_finetuned(text, self.api_url)

    def compare(self, text: str) -> dict:
        """
        Compare predictions from pretrained and fine-tuned models.
        
        Args:
            text: Input text to classify.
        
        Returns:
            Dict with 'pretrained' and 'finetuned' keys, each containing prediction results.
        """
        return {
            "pretrained": self.predict_with_model(text, "pretrained"),
            "finetuned": self.predict_with_model(text, "finetuned"),
        }

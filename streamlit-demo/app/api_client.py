"""API client for sentiment analysis predictions."""
import os
import requests
from typing import Optional


def get_api_url() -> str:
    """Get API URL from environment variable or default to localhost."""
    return os.getenv("API_URL", "http://localhost:8000")


def predict_sentiment(text: str, api_url: Optional[str] = None) -> dict:
    """
    Predict sentiment using the API.
    
    Args:
        text: Input text to classify.
        api_url: Optional API URL override.
    
    Returns:
        Dict with 'label' and 'confidence' keys.
    
    Raises:
        requests.RequestException: If API request fails.
    """
    if api_url is None:
        api_url = get_api_url()
    
    response = requests.post(
        f"{api_url}/predict",
        json={"text": text},
        timeout=30
    )
    response.raise_for_status()
    return response.json()


def predict_pretrained(text: str, api_url: Optional[str] = None) -> dict:
    """
    Predict sentiment using pretrained model (before fine-tuning).
    
    Args:
        text: Input text to classify.
        api_url: Optional API URL override.
    
    Returns:
        Dict with 'label' and 'confidence' keys.
    
    Raises:
        requests.RequestException: If API request fails.
    """
    if api_url is None:
        api_url = get_api_url()
    
    # Try the pretrained endpoint, fallback to main predict if not available
    try:
        response = requests.post(
            f"{api_url}/predict/pretrained",
            json={"text": text},
            timeout=30
        )
        response.raise_for_status()
        return response.json()
    except requests.RequestException:
        # Fallback to main predict endpoint if pretrained endpoint doesn't exist
        return predict_sentiment(text, api_url)


def predict_finetuned(text: str, api_url: Optional[str] = None) -> dict:
    """
    Predict sentiment using fine-tuned model.
    
    Args:
        text: Input text to classify.
        api_url: Optional API URL override.
    
    Returns:
        Dict with 'label' and 'confidence' keys.
    
    Raises:
        requests.RequestException: If API request fails.
    """
    if api_url is None:
        api_url = get_api_url()
    
    # Try the finetuned endpoint, fallback to main predict if not available
    try:
        response = requests.post(
            f"{api_url}/predict/finetuned",
            json={"text": text},
            timeout=30
        )
        response.raise_for_status()
        return response.json()
    except requests.RequestException:
        # Fallback to main predict endpoint if finetuned endpoint doesn't exist
        return predict_sentiment(text, api_url)


def health_check(api_url: Optional[str] = None) -> bool:
    """
    Check if API is healthy.
    
    Args:
        api_url: Optional API URL override.
    
    Returns:
        True if API is healthy, False otherwise.
    """
    if api_url is None:
        api_url = get_api_url()
    
    try:
        response = requests.get(f"{api_url}/health", timeout=5)
        return response.status_code == 200
    except requests.RequestException:
        return False


"""API client for sentiment analysis predictions."""
import os
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
from typing import Optional

# Create a session with retry strategy
_session = None


def get_session():
    """Get or create a requests session with retry strategy."""
    global _session
    if _session is None:
        _session = requests.Session()
        retry_strategy = Retry(
            total=3,
            backoff_factor=0.3,
            status_forcelist=[429, 500, 502, 503, 504],
        )
        adapter = HTTPAdapter(max_retries=retry_strategy)
        _session.mount("http://", adapter)
        _session.mount("https://", adapter)
    return _session


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
    
    session = get_session()
    response = session.post(
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
        session = get_session()
        response = session.post(
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
        session = get_session()
        response = session.post(
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
        session = get_session()
        response = session.get(f"{api_url}/health", timeout=5)
        return response.status_code == 200
    except requests.RequestException:
        return False


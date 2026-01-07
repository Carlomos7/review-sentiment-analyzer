import os
import streamlit as st
from models_loader import ModelComparison
from app.api_client import health_check, get_api_url
from tabs import render_analyze, render_batch_csv, render_analytics, render_compare

# Validate API_URL environment variable
API_URL = os.getenv("API_URL", "http://localhost:8000")
if not API_URL.startswith(("http://", "https://")):
    st.error(f"⚠️ Invalid API_URL format: {API_URL}")

if "history" not in st.session_state:
    st.session_state.history = []
if "pending_result" not in st.session_state:
    st.session_state.pending_result = None
if "csv_results" not in st.session_state:
    st.session_state.csv_results = []
if "csv_validated" not in st.session_state:
    st.session_state.csv_validated = []


@st.cache_resource
def init_comparison(api_url: str):
    comp = ModelComparison(api_url=api_url)
    comp.load_models()
    return comp


# Sidebar for API configuration
st.sidebar.title("⚙️ Configuration")
api_url = st.sidebar.text_input("API URL", value=get_api_url(), help="URL of the sentiment analysis API")

# Store API URL in session state for tabs to access
st.session_state.api_url = api_url

# Check API health
if st.sidebar.button("Check API Health"):
    with st.sidebar.spinner("Checking..."):
        is_healthy = health_check(api_url)
        if is_healthy:
            st.sidebar.success("✅ API is healthy")
        else:
            st.sidebar.error("❌ API is not responding")
            st.sidebar.info(f"Current API URL: {api_url}")
            st.sidebar.info("Make sure the API is running at the specified URL.")

# Initialize comparison with error handling
try:
    comparison = init_comparison(api_url)
except Exception as e:
    st.error(f"⚠️ Failed to initialize model comparison: {str(e)}")
    st.info("Please check your API connection and try again.")
    comparison = None

st.title("Review Sentiment Analyzer")

tab1, tab2, tab3, tab4 = st.tabs(["📝 Analyze", "📄 Batch CSV", "📊 Analytics", "⚖️ Compare Models"])

with tab1:
    render_analyze()

with tab2:
    render_batch_csv()

with tab3:
    render_analytics()

with tab4:
    if comparison:
        render_compare(comparison)
    else:
        st.error("Model comparison is not available. Please check API connection.")
        st.info("Make sure the API is running and accessible. Check the API URL in the sidebar.")

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

import streamlit as st
from models_loader import ModelComparison
from app.api_client import health_check, get_api_url
from tabs import render_analyze, render_batch_csv, render_analytics, render_compare

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
    if health_check(api_url):
        st.sidebar.success("✅ API is healthy")
    else:
        st.sidebar.error("❌ API is not responding")
        st.sidebar.info("Make sure the API is running at the specified URL.")

comparison = init_comparison(api_url)

st.title("Review Sentiment Analyzer")

tab1, tab2, tab3, tab4 = st.tabs(["📝 Analyze", "📄 Batch CSV", "📊 Analytics", "⚖️ Compare Models"])

with tab1:
    render_analyze()

with tab2:
    render_batch_csv()

with tab3:
    render_analytics()

with tab4:
    render_compare(comparison)

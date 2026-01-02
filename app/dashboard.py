import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

import streamlit as st
from src.model import load_model
from app.models_loader import ModelComparison
from app.tabs import render_analyze, render_batch_csv, render_analytics, render_compare

if "history" not in st.session_state:
    st.session_state.history = []
if "pending_result" not in st.session_state:
    st.session_state.pending_result = None
if "csv_results" not in st.session_state:
    st.session_state.csv_results = []
if "csv_validated" not in st.session_state:
    st.session_state.csv_validated = []


@st.cache_resource
def init_model():
    load_model()


@st.cache_resource
def init_comparison():
    comp = ModelComparison()
    comp.load_models()
    return comp


init_model()
comparison = init_comparison()

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

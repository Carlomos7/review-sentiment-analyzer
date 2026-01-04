from datetime import datetime
import streamlit as st
from src.model import predict

EMOJI_MAP = {"negative": "🔴", "neutral": "🟡", "positive": "🟢"}


def render():
    st.markdown("Enter a review below to analyze its sentiment.")
    
    review = st.text_area("Review text:", height=150, placeholder="Type your review here...")
    
    col_analyze, col_up, col_down = st.columns([2, 1, 1])
    
    with col_analyze:
        analyze_clicked = st.button("Analyze", type="primary", use_container_width=True)
    with col_up:
        thumbs_up = st.button("👍 Correct", use_container_width=True, disabled=not st.session_state.pending_result)
    with col_down:
        thumbs_down = st.button("👎 Wrong", use_container_width=True, disabled=not st.session_state.pending_result)
    
    if analyze_clicked:
        if review.strip():
            with st.spinner("Analyzing..."):
                result = predict(review)
            
            st.session_state.pending_result = {
                "text": review[:80] + "..." if len(review) > 80 else review,
                "full_text": review,
                "sentiment": result["label"],
                "confidence": result["confidence"],
                "timestamp": datetime.now()
            }
            st.rerun()
        else:
            st.warning("Please enter a review to analyze.")
    
    if thumbs_up and st.session_state.pending_result:
        st.session_state.pending_result["validated"] = True
        st.session_state.history.insert(0, st.session_state.pending_result)
        st.session_state.pending_result = None
        st.rerun()
    
    if thumbs_down and st.session_state.pending_result:
        st.session_state.pending_result["validated"] = False
        st.session_state.history.insert(0, st.session_state.pending_result)
        st.session_state.pending_result = None
        st.rerun()
    
    if st.session_state.pending_result:
        result = st.session_state.pending_result
        sentiment = result["sentiment"]
        confidence = result["confidence"]
        emoji = EMOJI_MAP.get(sentiment, "")
        
        st.markdown("---")
        col1, col2 = st.columns(2)
        with col1:
            st.metric("Sentiment", f"{emoji} {sentiment.capitalize()}")
        with col2:
            st.metric("Confidence", f"{confidence:.1%}")
    
    if st.session_state.history:
        st.markdown("---")
        st.subheader("Recent Analyses")
        for item in st.session_state.history[:10]:
            emoji = EMOJI_MAP.get(item["sentiment"], "")
            validation = ""
            if "validated" in item:
                validation = " ✓" if item["validated"] else " ✗"
            with st.container():
                st.markdown(f"**{emoji} {item['sentiment'].capitalize()}**{validation} ({item['confidence']:.1%})")
                st.caption(item["text"])
        
        if st.button("Clear History"):
            st.session_state.history = []
            st.rerun()


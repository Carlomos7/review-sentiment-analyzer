from datetime import datetime
import streamlit as st
import pandas as pd
from app.api_client import predict_sentiment, get_api_url

EMOJI_MAP = {"negative": "🔴", "neutral": "🟡", "positive": "🟢"}


def render():
    st.markdown("Upload a CSV file with a `review` column to batch process reviews.")
    
    uploaded_file = st.file_uploader("Choose a CSV file", type="csv")
    
    if uploaded_file is not None:
        df = pd.read_csv(uploaded_file)
        
        if "review" not in df.columns:
            st.error("CSV must have a 'review' column")
        else:
            if st.button("Process All Reviews", type="primary"):
                st.session_state.csv_results = []
                st.session_state.csv_validated = []
                progress = st.progress(0)
                status_text = st.empty()
                
                # Get API URL from session state if available, otherwise use default
                api_url = st.session_state.get("api_url", get_api_url())
                
                try:
                    for i, row in df.iterrows():
                        review_text = str(row["review"])
                        status_text.text(f"Processing review {i+1}/{len(df)}...")
                        result = predict_sentiment(review_text, api_url)
                        st.session_state.csv_results.append({
                            "idx": i,
                            "text": review_text[:80] + "..." if len(review_text) > 80 else review_text,
                            "full_text": review_text,
                            "sentiment": result["label"],
                            "confidence": result["confidence"],
                        })
                        progress.progress((i + 1) / len(df))
                    
                    status_text.empty()
                    st.rerun()
                except Exception as e:
                    status_text.empty()
                    st.error(f"Error processing reviews: {str(e)}")
                    st.info("Make sure the API is running and accessible.")
    
    if st.session_state.csv_results or st.session_state.csv_validated:
        st.markdown("---")
        
        total = len(st.session_state.csv_results) + len(st.session_state.csv_validated)
        remaining = len(st.session_state.csv_results)
        st.markdown(f"**Remaining: {remaining} / {total}**")
        
        for item in st.session_state.csv_results:
            idx = item["idx"]
            emoji = EMOJI_MAP.get(item["sentiment"], "")
            
            with st.container():
                col_info, col_up, col_down = st.columns([4, 1, 1])
                
                with col_info:
                    st.markdown(f"**{emoji} {item['sentiment'].capitalize()}** ({item['confidence']:.1%})")
                    st.caption(item["text"])
                
                with col_up:
                    if st.button("👍", key=f"csv_up_{idx}", width='stretch'):
                        item["validated"] = True
                        item["timestamp"] = datetime.now()
                        st.session_state.csv_validated.append(item.copy())
                        st.session_state.history.insert(0, item.copy())
                        st.session_state.csv_results.remove(item)
                        st.rerun()
                
                with col_down:
                    if st.button("👎", key=f"csv_down_{idx}", width='stretch'):
                        item["validated"] = False
                        item["timestamp"] = datetime.now()
                        st.session_state.csv_validated.append(item.copy())
                        st.session_state.history.insert(0, item.copy())
                        st.session_state.csv_results.remove(item)
                        st.rerun()
                
                st.markdown("---")
        
        if not st.session_state.csv_results and st.session_state.csv_validated:
            st.success("All reviews validated!")
        
        if st.session_state.csv_validated:
            df_export = pd.DataFrame([{
                "review": r["full_text"],
                "sentiment": r["sentiment"],
                "confidence": r["confidence"],
                "validated": r["validated"]
            } for r in st.session_state.csv_validated])
            
            csv_data = df_export.to_csv(index=False)
            st.download_button(
                f"Download Validated Results ({len(st.session_state.csv_validated)})",
                csv_data,
                "validated_reviews.csv",
                "text/csv",
                width='stretch'
            )
        
        if st.button("Clear Batch Results"):
            st.session_state.csv_results = []
            st.session_state.csv_validated = []
            st.rerun()


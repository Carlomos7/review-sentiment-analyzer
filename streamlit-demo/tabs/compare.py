import streamlit as st
import pandas as pd
import plotly.express as px
from datetime import datetime

EMOJI_MAP = {"negative": "🔴", "neutral": "🟡", "positive": "🟢"}
COLOR_MAP = {"negative": "#ef4444", "neutral": "#eab308", "positive": "#22c55e"}

SAMPLE_REVIEWS = [
    {"text": "Absolutely loved this product! Best purchase I've ever made.", "expected": "positive"},
    {"text": "Terrible experience. The item broke after one day. Never buying again.", "expected": "negative"},
    {"text": "It's okay, nothing special. Does what it's supposed to do.", "expected": "neutral"},
    {"text": "Amazing quality and fast shipping! Highly recommend to everyone!", "expected": "positive"},
    {"text": "Complete waste of money. Customer service was rude and unhelpful.", "expected": "negative"},
    {"text": "The product arrived on time. It works fine.", "expected": "neutral"},
    {"text": "This exceeded all my expectations! Will definitely buy again!", "expected": "positive"},
    {"text": "Disappointed. The description was misleading and quality is poor.", "expected": "negative"},
    {"text": "Average product. Not bad but not great either.", "expected": "neutral"},
    {"text": "Worst purchase ever. Completely defective and no refund offered.", "expected": "negative"},
]


def _get_cache_key(api_url: str) -> str:
    """Generate cache key based on API URL."""
    return f"compare_results_{api_url}"


def _run_comparison(comparison, api_url: str) -> list:
    """Run comparison on all sample reviews with progress tracking."""
    results = []
    progress_bar = st.progress(0)
    status_text = st.empty()
    
    total = len(SAMPLE_REVIEWS)
    for i, review in enumerate(SAMPLE_REVIEWS):
        status_text.text(f"Processing review {i+1}/{total}...")
        try:
            result = comparison.compare(review["text"])
            results.append({
                "text": review["text"],
                "expected": review["expected"],
                "pretrained": result["pretrained"],
                "finetuned": result["finetuned"]
            })
        except Exception as e:
            st.error(f"Error processing review {i+1}: {str(e)}")
            # Continue with other reviews even if one fails
            results.append({
                "text": review["text"],
                "expected": review["expected"],
                "pretrained": {"label": "error", "confidence": 0.0},
                "finetuned": {"label": "error", "confidence": 0.0}
            })
        
        progress_bar.progress((i + 1) / total)
    
    progress_bar.empty()
    status_text.empty()
    return results


def render(comparison):
    st.markdown("Compare predictions from the **pretrained** model and the **fine-tuned** model.")
    st.info("💡 Make sure the API is running and has `/predict/pretrained` and `/predict/finetuned` endpoints enabled.")
    
    # Get API URL from session state for cache key
    api_url = st.session_state.get("api_url", "http://localhost:8000")
    cache_key = _get_cache_key(api_url)
    
    # Initialize session state for cached results
    if cache_key not in st.session_state:
        st.session_state[cache_key] = None
    
    # Control section with run button
    col1, col2 = st.columns([3, 1])
    with col1:
        st.markdown("### Run Comparison")
        st.caption("Click the button below to compare models on sample reviews. Results are cached until you refresh.")
    with col2:
        run_comparison = st.button("🔄 Run Comparison", type="primary", use_container_width=True)
    
    # Run comparison if button clicked or if no cached results
    if run_comparison or st.session_state[cache_key] is None:
        if run_comparison:
            st.session_state[cache_key] = None  # Clear cache to force refresh
        
        try:
            with st.spinner("Running model comparison..."):
                results = _run_comparison(comparison, api_url)
                # Store results with timestamp
                st.session_state[cache_key] = {
                    "results": results,
                    "timestamp": datetime.now(),
                    "api_url": api_url
                }
        except Exception as e:
            st.error(f"Error comparing models: {str(e)}")
            st.info("Make sure the API is running and accessible. Check the API URL in the sidebar.")
            return
    
    # Get cached results
    cached_data = st.session_state[cache_key]
    if cached_data is None:
        return
    
    results = cached_data["results"]
    
    # Show cache info and refresh option
    col_info, col_refresh = st.columns([3, 1])
    with col_info:
        if cached_data.get("timestamp"):
            timestamp = cached_data["timestamp"].strftime("%Y-%m-%d %H:%M:%S")
            st.caption(f"📊 Results cached from {timestamp}")
    with col_refresh:
        if st.button("🔄 Refresh", use_container_width=True):
            st.session_state[cache_key] = None
            st.rerun()
    
    # Filter out error results for display
    valid_results = [r for r in results if r["pretrained"]["label"] != "error"]
    if not valid_results:
        st.error("No valid results to display. Please check API connection and try again.")
        return
    
    st.subheader("📊 Comparison Results")
    
    for i, r in enumerate(results):
        with st.container():
            st.markdown(f"**Review {i+1}:** {r['text']}")
            col1, col2, col3 = st.columns([1, 1, 1])
            
            with col1:
                expected = r["expected"]
                st.markdown(f"**Expected:** {EMOJI_MAP[expected]} {expected.capitalize()}")
            
            with col2:
                pre = r["pretrained"]
                match_pre = "✓" if pre["label"] == r["expected"] else "✗"
                st.markdown(f"**Pretrained:** {EMOJI_MAP[pre['label']]} {pre['label'].capitalize()} ({pre['confidence']:.1%}) {match_pre}")
            
            with col3:
                fine = r["finetuned"]
                match_fine = "✓" if fine["label"] == r["expected"] else "✗"
                st.markdown(f"**Fine-tuned:** {EMOJI_MAP[fine['label']]} {fine['label'].capitalize()} ({fine['confidence']:.1%}) {match_fine}")
            
            st.markdown("---")
    
    # Calculate statistics
    pretrained_correct = sum(1 for r in valid_results if r["pretrained"]["label"] == r["expected"])
    finetuned_correct = sum(1 for r in valid_results if r["finetuned"]["label"] == r["expected"])
    pretrained_avg_conf = sum(r["pretrained"]["confidence"] for r in valid_results) / len(valid_results)
    finetuned_avg_conf = sum(r["finetuned"]["confidence"] for r in valid_results) / len(valid_results)
    pretrained_accuracy = pretrained_correct / len(valid_results)
    finetuned_accuracy = finetuned_correct / len(valid_results)
    
    # Summary Statistics with Visualizations
    st.subheader("📈 Summary Statistics")
    
    col1, col2 = st.columns(2)
    
    with col1:
        st.markdown("### Pretrained Model")
        st.metric("Accuracy", f"{pretrained_correct}/{len(valid_results)} ({pretrained_accuracy:.0%})")
        st.metric("Avg Confidence", f"{pretrained_avg_conf:.1%}")
    
    with col2:
        st.markdown("### Fine-tuned Model")
        delta_acc = finetuned_correct - pretrained_correct
        delta_conf = (finetuned_avg_conf - pretrained_avg_conf) * 100
        st.metric("Accuracy", f"{finetuned_correct}/{len(valid_results)} ({finetuned_accuracy:.0%})", 
                  delta=f"{delta_acc:+d}" if delta_acc != 0 else None)
        st.metric("Avg Confidence", f"{finetuned_avg_conf:.1%}",
                  delta=f"{delta_conf:+.1f}%" if abs(delta_conf) > 0.1 else None)
    
    # Visualizations
    st.markdown("---")
    st.subheader("📊 Visualizations")
    
    col_chart1, col_chart2 = st.columns(2)
    
    with col_chart1:
        st.markdown("#### Accuracy Comparison")
        df_acc = pd.DataFrame({
            "Model": ["Pretrained", "Fine-tuned"],
            "Accuracy": [pretrained_accuracy, finetuned_accuracy]
        })
        fig_acc = px.bar(df_acc, x="Model", y="Accuracy", 
                        color="Model", 
                        color_discrete_map={"Pretrained": "#6366f1", "Fine-tuned": "#22c55e"},
                        text=[f"{pretrained_accuracy:.0%}", f"{finetuned_accuracy:.0%}"])
        fig_acc.update_layout(
            yaxis_tickformat=".0%",
            yaxis_range=[0, 1],
            showlegend=False,
            margin=dict(t=10, b=0, l=0, r=0)
        )
        fig_acc.update_traces(texttemplate="%{text}", textposition="outside")
        st.plotly_chart(fig_acc, use_container_width=True)
    
    with col_chart2:
        st.markdown("#### Average Confidence")
        df_conf = pd.DataFrame({
            "Model": ["Pretrained", "Fine-tuned"],
            "Confidence": [pretrained_avg_conf, finetuned_avg_conf]
        })
        fig_conf = px.bar(df_conf, x="Model", y="Confidence",
                         color="Model",
                         color_discrete_map={"Pretrained": "#6366f1", "Fine-tuned": "#22c55e"},
                         text=[f"{pretrained_avg_conf:.1%}", f"{finetuned_avg_conf:.1%}"])
        fig_conf.update_layout(
            yaxis_tickformat=".0%",
            yaxis_range=[0, 1],
            showlegend=False,
            margin=dict(t=10, b=0, l=0, r=0)
        )
        fig_conf.update_traces(texttemplate="%{text}", textposition="outside")
        st.plotly_chart(fig_conf, use_container_width=True)
    
    # Confidence distribution comparison
    st.markdown("#### Confidence Distribution by Model")
    df_conf_dist = pd.DataFrame({
        "Confidence": [r["pretrained"]["confidence"] for r in valid_results] + 
                     [r["finetuned"]["confidence"] for r in valid_results],
        "Model": ["Pretrained"] * len(valid_results) + ["Fine-tuned"] * len(valid_results)
    })
    fig_dist = px.histogram(df_conf_dist, x="Confidence", color="Model", 
                           nbins=20, barmode="overlay", opacity=0.7,
                           color_discrete_map={"Pretrained": "#6366f1", "Fine-tuned": "#22c55e"},
                           labels={"Confidence": "Confidence Score", "count": "Number of Reviews"})
    fig_dist.update_layout(
        xaxis_tickformat=".0%",
        margin=dict(t=10, b=0, l=0, r=0)
    )
    st.plotly_chart(fig_dist, use_container_width=True)
    
    # Confusion matrix-style visualization
    st.markdown("#### Prediction Agreement Matrix")
    agreement_data = []
    for r in valid_results:
        pre_label = r["pretrained"]["label"]
        fine_label = r["finetuned"]["label"]
        agreement_data.append({
            "Pretrained": pre_label.capitalize(),
            "Fine-tuned": fine_label.capitalize(),
            "Count": 1
        })
    
    df_agree = pd.DataFrame(agreement_data)
    if not df_agree.empty:
        df_agree = df_agree.groupby(["Pretrained", "Fine-tuned"]).size().reset_index(name="Count")
        fig_heatmap = px.density_heatmap(
            df_agree, x="Pretrained", y="Fine-tuned", z="Count",
            color_continuous_scale="Blues",
            labels={"Count": "Number of Reviews"}
        )
        fig_heatmap.update_layout(margin=dict(t=10, b=0, l=0, r=0))
        st.plotly_chart(fig_heatmap, use_container_width=True)
    
    st.markdown("---")
    st.subheader("📋 Detailed Results")
    
    # Export button
    col_exp1, col_exp2 = st.columns([3, 1])
    with col_exp2:
        df_export = pd.DataFrame([{
            "Review": r["text"],
            "Expected": r["expected"],
            "Pretrained_Label": r["pretrained"]["label"],
            "Pretrained_Confidence": r["pretrained"]["confidence"],
            "Finetuned_Label": r["finetuned"]["label"],
            "Finetuned_Confidence": r["finetuned"]["confidence"],
            "Pretrained_Correct": r["pretrained"]["label"] == r["expected"],
            "Finetuned_Correct": r["finetuned"]["label"] == r["expected"],
        } for r in valid_results])
        
        csv = df_export.to_csv(index=False)
        st.download_button(
            label="📥 Export CSV",
            data=csv,
            file_name=f"model_comparison_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv",
            mime="text/csv",
            use_container_width=True
        )
    
    # Detailed table with better formatting
    df_comp = pd.DataFrame([{
        "Review": r["text"][:60] + "..." if len(r["text"]) > 60 else r["text"],
        "Expected": f"{EMOJI_MAP[r['expected']]} {r['expected'].capitalize()}",
        "Pretrained": f"{EMOJI_MAP[r['pretrained']['label']]} {r['pretrained']['label'].capitalize()} ({r['pretrained']['confidence']:.0%})",
        "Fine-tuned": f"{EMOJI_MAP[r['finetuned']['label']]} {r['finetuned']['label'].capitalize()} ({r['finetuned']['confidence']:.0%})",
        "Pre ✓": "✓" if r["pretrained"]["label"] == r["expected"] else "✗",
        "Fine ✓": "✓" if r["finetuned"]["label"] == r["expected"] else "✗",
    } for r in valid_results])
    
    # Add expandable sections for each review
    for i, r in enumerate(valid_results):
        with st.expander(f"Review {i+1}: {r['text'][:50]}..."):
            col1, col2, col3 = st.columns(3)
            
            with col1:
                expected = r["expected"]
                st.markdown(f"**Expected:** {EMOJI_MAP[expected]} {expected.capitalize()} ✓")
            
            with col2:
                pre = r["pretrained"]
                match_pre = "✓" if pre["label"] == r["expected"] else "✗"
                st.markdown(f"**Pretrained:** {EMOJI_MAP[pre['label']]} {pre['label'].capitalize()}")
                st.metric("Confidence", f"{pre['confidence']:.1%}", delta=match_pre)
            
            with col3:
                fine = r["finetuned"]
                match_fine = "✓" if fine["label"] == r["expected"] else "✗"
                st.markdown(f"**Fine-tuned:** {EMOJI_MAP[fine['label']]} {fine['label'].capitalize()}")
                st.metric("Confidence", f"{fine['confidence']:.1%}", delta=match_fine)
            
            st.caption(f"Full text: {r['text']}")
    
    # Compact table view
    st.markdown("#### Compact Table View")
    st.dataframe(df_comp, use_container_width=True, hide_index=True)
    
    st.markdown("---")
    st.subheader("🔬 Test Custom Review")
    
    if "custom_compare_result" not in st.session_state:
        st.session_state.custom_compare_result = None
    
    custom_review = st.text_area("Enter a custom review to compare:", height=100, key="compare_custom")
    if st.button("Compare", type="primary", key="compare_btn"):
        if custom_review.strip():
            try:
                st.session_state.custom_compare_result = comparison.compare(custom_review)
            except Exception as e:
                st.error(f"Error comparing review: {str(e)}")
                st.info("Make sure the API is running and accessible.")
        else:
            st.warning("Please enter a review.")
    
    if st.session_state.custom_compare_result:
        col1, col2 = st.columns(2)
        with col1:
            pre = st.session_state.custom_compare_result["pretrained"]
            st.markdown(f"**Pretrained:** {EMOJI_MAP[pre['label']]} {pre['label'].capitalize()}")
            st.metric("Confidence", f"{pre['confidence']:.1%}")
        with col2:
            fine = st.session_state.custom_compare_result["finetuned"]
            st.markdown(f"**Fine-tuned:** {EMOJI_MAP[fine['label']]} {fine['label'].capitalize()}")
            st.metric("Confidence", f"{fine['confidence']:.1%}")


import streamlit as st
import pandas as pd

EMOJI_MAP = {"negative": "🔴", "neutral": "🟡", "positive": "🟢"}

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


def render(comparison):
    st.markdown("Compare predictions from the **pretrained** model and the **fine-tuned** model.")
    st.info("💡 Make sure the API is running and has `/predict/pretrained` and `/predict/finetuned` endpoints enabled.")
    
    results = []
    try:
        for review in SAMPLE_REVIEWS:
            result = comparison.compare(review["text"])
            results.append({
                "text": review["text"],
                "expected": review["expected"],
                "pretrained": result["pretrained"],
                "finetuned": result["finetuned"]
            })
    except Exception as e:
        st.error(f"Error comparing models: {str(e)}")
        st.info("Make sure the API is running and accessible. Check the API URL in the sidebar.")
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
    
    st.subheader("📈 Summary Statistics")
    
    pretrained_correct = sum(1 for r in results if r["pretrained"]["label"] == r["expected"])
    finetuned_correct = sum(1 for r in results if r["finetuned"]["label"] == r["expected"])
    pretrained_avg_conf = sum(r["pretrained"]["confidence"] for r in results) / len(results)
    finetuned_avg_conf = sum(r["finetuned"]["confidence"] for r in results) / len(results)
    
    col1, col2 = st.columns(2)
    
    with col1:
        st.markdown("### Pretrained Model")
        st.metric("Accuracy", f"{pretrained_correct}/{len(results)} ({pretrained_correct/len(results)*100:.0f}%)")
        st.metric("Avg Confidence", f"{pretrained_avg_conf:.1%}")
    
    with col2:
        st.markdown("### Fine-tuned Model")
        delta_acc = finetuned_correct - pretrained_correct
        delta_conf = (finetuned_avg_conf - pretrained_avg_conf) * 100
        st.metric("Accuracy", f"{finetuned_correct}/{len(results)} ({finetuned_correct/len(results)*100:.0f}%)", 
                  delta=f"{delta_acc:+d}" if delta_acc != 0 else None)
        st.metric("Avg Confidence", f"{finetuned_avg_conf:.1%}",
                  delta=f"{delta_conf:+.1f}%" if abs(delta_conf) > 0.1 else None)
    
    st.markdown("---")
    st.subheader("📋 Detailed Table")
    df_comp = pd.DataFrame([{
        "Review": r["text"][:60] + "..." if len(r["text"]) > 60 else r["text"],
        "Expected": r["expected"].capitalize(),
        "Pretrained": f"{r['pretrained']['label'].capitalize()} ({r['pretrained']['confidence']:.0%})",
        "Fine-tuned": f"{r['finetuned']['label'].capitalize()} ({r['finetuned']['confidence']:.0%})",
        "Pre ✓": "✓" if r["pretrained"]["label"] == r["expected"] else "✗",
        "Fine ✓": "✓" if r["finetuned"]["label"] == r["expected"] else "✗",
    } for r in results])
    st.dataframe(df_comp, width='stretch', hide_index=True)
    
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


from collections import Counter
import streamlit as st
import pandas as pd
import plotly.express as px

EMOJI_MAP = {"negative": "🔴", "neutral": "🟡", "positive": "🟢"}
COLOR_MAP = {"Negative": "#ef4444", "Neutral": "#eab308", "Positive": "#22c55e"}


def render():
    if not st.session_state.history:
        st.info("No analyses yet. Analyze some reviews to see analytics.")
        return
    
    history = st.session_state.history
    validated = [h for h in history if "validated" in h]
    correct = [h for h in validated if h["validated"]]
    incorrect = [h for h in validated if not h["validated"]]
    
    st.subheader("📋 Summary")
    col1, col2, col3, col4 = st.columns(4)
    with col1:
        st.metric("Total Analyses", len(history))
    with col2:
        avg_conf = sum(h["confidence"] for h in history) / len(history)
        st.metric("Avg Confidence", f"{avg_conf:.1%}")
    with col3:
        counts = Counter(h["sentiment"] for h in history)
        most_common = counts.most_common(1)[0][0] if counts else "N/A"
        st.metric("Most Common", most_common.capitalize())
    with col4:
        if validated:
            accuracy = len(correct) / len(validated) * 100
            st.metric("HITL Accuracy", f"{accuracy:.0f}%")
        else:
            st.metric("HITL Accuracy", "N/A")
    
    st.markdown("---")
    st.subheader("🧑‍🔬 Human-in-the-Loop Validation")
    
    if validated:
        col_hitl1, col_hitl2 = st.columns(2)
        
        with col_hitl1:
            hitl_data = pd.DataFrame({
                "Feedback": ["Correct 👍", "Wrong 👎"],
                "Count": [len(correct), len(incorrect)]
            })
            fig_hitl = px.pie(
                hitl_data, values="Count", names="Feedback", color="Feedback",
                color_discrete_map={"Correct 👍": "#22c55e", "Wrong 👎": "#ef4444"}
            )
            fig_hitl.update_layout(margin=dict(t=0, b=0, l=0, r=0))
            st.plotly_chart(fig_hitl, width='stretch')
        
        with col_hitl2:
            st.markdown("**Model Accuracy by Category**")
            for sentiment in ["positive", "neutral", "negative"]:
                cat_validated = [h for h in validated if h["sentiment"] == sentiment]
                emoji = EMOJI_MAP[sentiment]
                if cat_validated:
                    cat_correct = len([h for h in cat_validated if h["validated"]])
                    cat_acc = cat_correct / len(cat_validated) * 100
                    st.progress(cat_acc / 100, text=f"{emoji} {sentiment.capitalize()}: {cat_acc:.0f}% ({cat_correct}/{len(cat_validated)})")
                else:
                    st.progress(0.0, text=f"{emoji} {sentiment.capitalize()}: No data")
    else:
        st.info("No validated predictions yet. Use 👍/👎 buttons to provide feedback.")
    
    st.markdown("---")
    col_pie, col_bar = st.columns(2)
    
    with col_pie:
        st.subheader("Sentiment Distribution")
        sentiment_counts = Counter(h["sentiment"] for h in history)
        df_pie = pd.DataFrame({
            "Sentiment": [s.capitalize() for s in sentiment_counts.keys()],
            "Count": list(sentiment_counts.values())
        })
        fig_pie = px.pie(df_pie, values="Count", names="Sentiment", color="Sentiment", color_discrete_map=COLOR_MAP)
        fig_pie.update_layout(margin=dict(t=0, b=0, l=0, r=0))
        st.plotly_chart(fig_pie, width='stretch')
    
    with col_bar:
        st.subheader("Confidence by Sentiment")
        df_conf = pd.DataFrame(history)
        avg_by_sentiment = df_conf.groupby("sentiment")["confidence"].mean().reset_index()
        avg_by_sentiment["sentiment"] = avg_by_sentiment["sentiment"].str.capitalize()
        fig_bar = px.bar(avg_by_sentiment, x="sentiment", y="confidence", color="sentiment", color_discrete_map=COLOR_MAP)
        fig_bar.update_layout(margin=dict(t=0, b=0, l=0, r=0), showlegend=False, yaxis_tickformat=".0%")
        st.plotly_chart(fig_bar, width='stretch')
    
    st.markdown("---")
    st.subheader("Sentiment Over Time")
    
    df_time = pd.DataFrame(history)
    df_time["timestamp"] = pd.to_datetime(df_time["timestamp"])
    df_time = df_time.sort_values("timestamp")
    df_time["sentiment_score"] = df_time["sentiment"].map({"negative": 0, "neutral": 1, "positive": 2})
    
    fig_line = px.line(df_time, x="timestamp", y="sentiment_score", markers=True, color_discrete_sequence=["#6366f1"])
    fig_line.update_layout(
        yaxis=dict(tickmode="array", tickvals=[0, 1, 2], ticktext=["Negative", "Neutral", "Positive"]),
        xaxis_title="Time", yaxis_title="Sentiment", margin=dict(t=10, b=0, l=0, r=0)
    )
    st.plotly_chart(fig_line, width='stretch')
    
    st.markdown("---")
    st.subheader("Analysis Log")
    df_table = pd.DataFrame([{
        "Time": h["timestamp"].strftime("%H:%M:%S"),
        "Sentiment": h["sentiment"].capitalize(),
        "Confidence": f"{h['confidence']:.1%}",
        "Feedback": "👍" if h.get("validated") == True else ("👎" if h.get("validated") == False else "—"),
        "Review": h["text"]
    } for h in history])
    st.dataframe(df_table, width='stretch', hide_index=True)


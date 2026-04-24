import streamlit as st
import requests

st.title("BFHL Analyzer")

data = st.text_input("Enter nodes (comma separated)")

if st.button("Submit"):
    arr = [x.strip() for x in data.split(",")]

    res = requests.post(
        "https://your-backend-url/bfhl",
        json={"data": arr}
    )

    st.json(res.json())

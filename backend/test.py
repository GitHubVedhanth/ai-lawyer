import google.generativeai as genai

genai.configure(api_key="AIzaSyBL6qxhLsec0HOjnHyxaVjbvXclTD_vrvE")

for m in genai.list_models():
    print(m.name)

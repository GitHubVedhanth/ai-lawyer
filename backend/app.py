# ==============================================================================
# Lex Veritas - Backend Server (Flask) - v2.1 (Stable & Secure)
# ==============================================================================
# This backend manages case sessions using TinyDB for storage
# and interacts with the Gemini AI (1.5 Flash - latest).
# ==============================================================================

import os
import uuid
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import google.generativeai as genai
from tinydb import TinyDB, Query

# --- Load environment variables ---
load_dotenv()

# --- Flask App Setup ---
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# --- Gemini AI Configuration ---
try:
    api_key ="AIzaSyBL6qxhLsec0HOjnHyxaVjbvXclTD_vrvE"
    if not api_key:
        raise ValueError("GEMINI_API_KEY not found in .env file.")

    genai.configure(api_key=api_key)
    # ✅ Correct model name
    model = genai.GenerativeModel('gemini-2.5-flash')
    print("✅ Gemini AI Model configured successfully.")

except Exception as e:
    print(f"❌ Error configuring Gemini AI: {e}")
    model = None

# --- Database Setup (TinyDB for stable storage) ---
db = TinyDB('sessions.json')
Session = Query()
print(f"📁 Database loaded. Contains {len(db)} sessions.")


# --- Helper Functions ---
def build_case_summary(documents: dict):
    """Builds a string summary of all case documents."""
    s = "--- CASE FILE DOCUMENTS ---\n\n"
    for name, text in documents.items():
        s += f"--- DOCUMENT: {name} ---\n{text}\n--- END DOCUMENT ---\n\n"
    return s


def get_ai_response(session_data, user_text):
    """Calls the Gemini model with full context and returns the response."""
    if not model:
        return "Error: AI model is not configured. Please check your API key."

    # Define AI persona based on user role
    role_lower = session_data['role'].lower()
    if 'defense' in role_lower or 'defence' in role_lower:
        ai_persona = (
            "You are the Learned Prosecutor, a sharp and experienced advocate for the State. "
            "Your goal is to win the case with evidence and logic."
        )
    else:
        ai_persona = (
            "You are the Learned Defence Counsel, a skilled lawyer defending the accused. "
            "Your goal is to create reasonable doubt and defend your client under Indian law."
        )

    # Judge verdict command
    if user_text.strip().lower() == '/judge':
        instruction = (
            "You are now the Judge. Render a concise verdict based ONLY on the provided case file "
            "and the complete debate history. Explain your reasoning based on Indian law and state "
            "which side presented the more compelling case."
        )
        prompt = f"""
        **CONTEXT:** A legal debate is underway.
        **CASE FILE:**\n{session_data['case_summary']}
        **FULL DEBATE HISTORY:**\n{session_data['chat_history']}
        **INSTRUCTION:**\n{instruction}
        """
    else:
        instruction = (
            f"{ai_persona} Your arguments must be grounded in the Indian legal framework. "
            "Analyze the user's argument, find its weaknesses, and formulate a strong, concise counter-argument."
        )
        prompt = f"""
        **CONTEXT:** A legal debate is underway. The user's role is "{session_data['role']}".
        **CASE FILE:**\n{session_data['case_summary']}
        **DEBATE HISTORY:**\n{session_data['chat_history']}
        **USER'S LATEST ARGUMENT:**\n"{user_text}"
        **YOUR INSTRUCTION:**\n{instruction}
        """

    try:
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        print(f"❌ Error during Gemini API call: {e}")
        return f"An error occurred while contacting the AI: {e}"


# --- API Endpoints ---
@app.route('/start_case', methods=['POST'])
def start_case():
    """Initializes a new case session."""
    payload = request.json
    session_id = str(uuid.uuid4())

    case_summary = build_case_summary(payload.get('documents', {}))

    session_data = {
        'session_id': session_id,
        'role': payload.get('role', 'Defense Counsel'),
        'objective': payload.get('objective', ''),
        'case_summary': case_summary,
        'chat_history': "The debate has started.",
        'rounds': []
    }

    db.insert(session_data)

    return jsonify({
        'session_id': session_id,
        'message': 'Case started successfully.',
        'case_summary_preview': case_summary[:400] + "..."
    })


@app.route('/message', methods=['POST'])
def message():
    """Handles a user's argument and gets the AI's response."""
    payload = request.json
    session_id = payload.get('session_id')
    user_text = payload.get('text')

    session_list = db.search(Session.session_id == session_id)
    if not session_list:
        return jsonify({'error': 'Session ID not found. Please start a new case.'}), 404

    sess = session_list[0]
    ai_reply = get_ai_response(sess, user_text)

    # Update chat history and rounds
    sess['rounds'].append({'user': user_text, 'ai': ai_reply})
    sess['chat_history'] += f"\n\nUser ({sess['role']}): {user_text}\nAI (Opposing Counsel): {ai_reply}"

    db.update(sess, Session.session_id == session_id)

    return jsonify({'ai_reply': ai_reply})


# --- Run Server ---
if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True, use_reloader=False)

import os
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": ["http://localhost:5173", "http://127.0.0.1:5173"]}})

# Credentials
GOOGLE_API_KEY = os.getenv("VITE_GEMINI_API_KEY") 
SUPABASE_URL = os.getenv("VITE_SUPABASE_URL")
SUPABASE_KEY = os.getenv("VITE_SUPABASE_ANON_KEY")

# Clients
if GOOGLE_API_KEY:
    genai.configure(api_key=GOOGLE_API_KEY)
    model = genai.GenerativeModel('gemini-1.5-flash')
else:
    model = None

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def get_hospital_context():
    """Fetch live hospital and availability data for the AI context."""
    try:
        res_h = supabase.table('hospitals').select('id, name, address, beds_avail, icu_avail').execute()
        res_a = supabase.table('hospital_availability').select('*').execute()
        
        hospitals = res_h.data or []
        availability = res_a.data or []
        
        context = "Current Hospital Status in the network:\n"
        for h in hospitals:
            avail = next((a for a in availability if a['hospital_id'] == h['id']), {})
            context += f"- {h['name']}: {h['address']}. Available Beds: {h['beds_avail']}, ICU: {h['icu_avail']}. "
            context += f"Oxygen Units: {avail.get('oxygen_cylinders', 'Unknown')}, Blood O+: {avail.get('blood_o_pos', 'Unknown')}\n"
        return context
    except Exception as e:
        print("Context Fetch Error:", e)
        return "Hospital network data currently unavailable."

@app.route('/api/insights', methods=['POST'])
def get_insights():
    if not model:
        return jsonify({"error": "Gemini API key not configured"}), 500
        
    try:
        data = request.get_json()
        user_query = data.get('query', 'Provide a health summary.')
        vitals = data.get('vitals', {"bpm": 72, "temp": 98.6})
        
        hospital_context = get_hospital_context()
        
        prompt = f"""
        You are 'LifeSync Carebot', an advanced healthcare triage AI. 
        Your goal is to analyze patient vitals and provide actionable advice based on current hospital availability.
        
        PATIENT VITALS: {json.dumps(vitals)}
        {hospital_context}
        
        USER QUERY: {user_query}

        INSTRUCTIONS:
        1. Evaluate if the vitals are stable.
        2. If emergency response is needed, identify the BEST hospital from the context based on available beds/ICU.
        3. Be professional, concise, and empathetic.
        4. ALWAYS mention the specific hospital name and its current availability if suggesting a visit.
        """
        
        response = model.generate_content(prompt)
        
        return jsonify({
            "insight": response.text,
            "recommendation": "Always consult a human doctor for medical emergencies.",
            "timestamp": "AI Analysis v2.1 (Gemini 1.5 Flash)"
        }), 200
        
    except Exception as e:
        print("Insight Error:", str(e))
        return jsonify({"error": f"Failed to process insights: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)

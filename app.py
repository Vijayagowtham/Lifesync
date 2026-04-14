from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
# Apply CORS to allow requests from the frontend
CORS(app)

@app.route('/api/insights', methods=['POST'])
def get_insights():
    try:
        data = request.get_json()
        # Mock logic to generate insights based on input (e.g. vitals or environment)
        # In production, this would call the Gemini API
        location = data.get('location', 'Unknown')
        vitals = data.get('vitals', {})
        bpm = vitals.get('bpm', 72)
        
        insight = "System normal. All vitals are within stable parameters."
        if bpm > 100:
            insight = "Elevated heart rate detected. Please avoid strenuous activity and monitor for further changes."
        elif bpm < 60:
            insight = "Bradycardia tendency noted. Ensure you are well-rested and hydrated."
            
        return jsonify({
            "insight": insight,
            "recommendation": "Maintain regular checkups and monitor your dashboard for updates.",
            "timestamp": "Real-time AI Analysis"
        }), 200
    except Exception as e:
        print("Insight Error:", e)
        return jsonify({"error": "Failed to process insights"}), 500

if __name__ == '__main__':
    # Ensure app runs on the correct host and port
    app.run(host='127.0.0.1', port=5000, debug=True)

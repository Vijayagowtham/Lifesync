from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
# Apply CORS to allow requests from the frontend
CORS(app)

@app.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        if not data or 'email' not in data or 'password' not in data:
            return jsonify({"error": "Missing email or password"}), 400
        
        # Dummy authentication logic
        email = data.get('email')
        return jsonify({
            "success": True,
            "message": "Login successful",
            "user": {
                "email": email,
                "role": "user"
            }
        }), 200
    except Exception as e:
        print("Login Error:", e)
        return jsonify({"error": "Internal Server Error"}), 500

if __name__ == '__main__':
    # Ensure app runs on the correct host and port
    app.run(host='127.0.0.1', port=5000, debug=True)

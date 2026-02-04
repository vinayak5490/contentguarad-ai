from flask import Flask, request, jsonify
from flask_cors import CORS 
from services.gemini_service import analyze_blog_content

app = Flask(__name__)
CORS(app)

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status" : "OK"}), 200

@app.route("/analyze", methods=["POST"])
def analyze():
    data = request.get_json()

    if not data or "content" not in data:
        return jsonify({"error": "Content field is required"}), 400
    
    content = data["content"].strip()

    if len(content) < 50:
        return jsonify({"error" : "content too short for analysus"}), 400
    
    try:
        report = analyze_blog_content(content)
        return jsonify({"report" : report}), 200
    except Exception as e :
        return jsonify({"error": str(e)}), 500
    
if __name__ == "__main__":
    app.run(debug=True)
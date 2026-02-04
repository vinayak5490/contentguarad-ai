import google.generativeai as genai
from config import GEMINI_API_KEY
import re
import json

genai.configure(api_key=GEMINI_API_KEY)

try:
    model = genai.GenerativeModel("gemini-1.5-flash")
except Exception:
    model = None


def sanitize_output(text: str) -> str:
    """
    Hard safety layer to prevent content leakage.
    """
    if "Blog Content:" in text:
        text = text.split("Blog Content:")[0].strip()
    return text


def _calculate_risk_score(content: str, issues: list, plagiarism_level: str) -> int:
    """
    Calculate risk score out of 100 based on content analysis.
    Higher score = higher risk.
    """
    score = 20  # baseline
    
    # Add points for issues found
    score += len(issues) * 15
    
    # Add points for plagiarism risk
    if plagiarism_level == "High":
        score += 30
    elif plagiarism_level == "Medium":
        score += 15
    
    # Check for suspicious keywords
    lower = content.lower()
    if any(k in lower for k in ["guarantee", "risk-free", "cure"]):
        score += 20
    if any(k in lower for k in ["medical", "treatment", "doctor"]):
        score += 10
    if any(k in lower for k in ["financial", "invest", "profit", "money"]):
        score += 15
    
    # Cap at 100
    return min(score, 100)


def _local_fallback_analysis(content: str) -> dict:
    """
    Local heuristic-based compliance report.
    MUST NEVER include original blog content.
    Returns a structured dict with risk_score.
    """

    words = re.findall(r"\w+", content)
    word_count = len(words)
    lower = content.lower()

    # Tone detection
    tone = "Neutral"
    if any(w in lower for w in ["amazing", "incredible", "guarantee"]):
        tone = "Promotional"
    elif any(w in lower for w in ["urgent", "critical", "immediately"]):
        tone = "Alarmist"

    # Compliance checks
    issues = []
    if any(k in lower for k in ["guarantee", "risk-free", "cure"]):
        issues.append("Overstated or misleading claims")
    if any(k in lower for k in ["medical advice", "cure", "treatment"]):
        issues.append("Potential medical claims without disclaimer")
    if any(k in lower for k in ["financial", "invest", "profit"]):
        issues.append("Potential financial advice without disclaimer")

    plagiarism_level = "Low" if word_count < 300 else "Medium"
    
    risk_score = _calculate_risk_score(content, issues, plagiarism_level)
    
    # Risk level based on score
    if risk_score >= 70:
        risk_level = "HIGH"
    elif risk_score >= 40:
        risk_level = "MEDIUM"
    else:
        risk_level = "LOW"

    recommendations = (
        ["Maintain current informational tone"]
        if not issues
        else [
            "Avoid absolute or guaranteed claims",
            "Add appropriate disclaimers where needed"
        ]
    )

    return {
        "risk_level": risk_level,
        "risk_score": risk_score,
        "tone": tone,
        "issues": issues if issues else ["No major issues detected"],
        "plagiarism_risk": plagiarism_level,
        "recommendations": recommendations
    }


def analyze_blog_content(content: str) -> dict:
    """
    Analyze blog content and return a structured report dict with risk_score.
    """
    prompt = f"""
You are a compliance auditing engine that returns ONLY a JSON response.

Analyze the content and return a valid JSON object with exactly this structure:
{{
  "risk_level": "LOW" or "MEDIUM" or "HIGH",
  "risk_score": <number 0-100>,
  "tone": "<single word or short phrase>",
  "issues": [<list of strings, or empty list>],
  "plagiarism_risk": "Low" or "Medium" or "High",
  "recommendations": [<list of strings>]
}}

Return ONLY valid JSON, no markdown, no explanations.

Content to analyze:
\"\"\"{content}\"\"\"
"""

    if model is not None:
        try:
            response = model.generate_content(prompt)
            text = sanitize_output(response.text.strip())
            return json.loads(text)
        except Exception:
            return _local_fallback_analysis(content)
    else:
        return _local_fallback_analysis(content)

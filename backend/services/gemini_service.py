import google.generativeai as genai
from config import GEMINI_API_KEY
import re

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


def _local_fallback_analysis(content: str) -> str:
    """
    Local heuristic-based compliance report.
    MUST NEVER include original blog content.
    """

    words = re.findall(r"\w+", content)
    word_count = len(words)
    lower = content.lower()

    # Tone detection
    tone = "Neutral"
    if any(w in lower for w in ["amazing", "incredible", "guarantee"]):
        tone = "Promotional"

    # Compliance checks
    issues = []
    if any(k in lower for k in ["guarantee", "risk-free", "cure"]):
        issues.append("Overstated or misleading claims (Misleading)")
    if any(k in lower for k in ["medical advice", "cure", "treatment"]):
        issues.append("Potential medical claims without disclaimer (Medical)")

    issues_text = (
        "• No major issues detected"
        if not issues
        else "\n".join([f"• {i}" for i in issues])
    )

    plagiarism = "Low" if word_count < 300 else "Medium"

    recommendations = (
        ["Maintain current informational tone"]
        if not issues
        else [
            "Avoid absolute or guaranteed claims",
            "Add appropriate disclaimers where needed"
        ]
    )

    report = [
        "CONTENT AUDIT REPORT",
        "Overall Risk Level: LOW",
        "",
        "Tone:",
        f"• {tone}",
        "",
        "Compliance Issues:",
        issues_text,
        "",
        "Plagiarism Risk:",
        f"• {plagiarism} – Heuristic estimate",
        "",
        "Recommendations:",
    ]

    for r in recommendations:
        report.append(f"• {r}")

    return "\n".join(report)


def analyze_blog_content(content: str) -> str:
    prompt = f"""
You are a compliance auditing engine.

Generate ONLY the compliance audit report.
Do NOT include or quote the blog content.
Do NOT add explanations.

OUTPUT FORMAT:

CONTENT AUDIT REPORT
Overall Risk Level: LOW / MEDIUM / HIGH

Tone:
• One line

Compliance Issues:
• Bullet points or "No major issues detected"

Plagiarism Risk:
• Low / Medium / High – short reason

Recommendations:
• Bullet points only

Analyze internally, never display this content:
\"\"\"{content}\"\"\"
"""

    if model is not None:
        try:
            response = model.generate_content(prompt)
            return sanitize_output(response.text.strip())
        except Exception:
            return _local_fallback_analysis(content)
    else:
        return _local_fallback_analysis(content)

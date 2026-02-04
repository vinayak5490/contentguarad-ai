from services.gemini_service import analyze_blog_content

content = (
    "This is a test blog content that is intentionally long enough to pass the backend length "
    "check and trigger the AI service. It should be over fifty characters."
)

print(analyze_blog_content(content))

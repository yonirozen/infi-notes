import os
import re

LECTURES_DIR = "lectures"

def clean_dark_mode(html):
    original = html

    # 1. הסרת כפתור ה-Dark Mode
    html = re.sub(r'<button[^>]*id="darkModeToggle".*?</button>', '', html, flags=re.DOTALL)

    # 2. הסרת בלוק CSS של המחלקה .dark-mode-toggle (גם אם יש בלוקים נוספים אחריה)
    html = re.sub(
        r'\.dark-mode-toggle\s*\{[^{}]*\}(?:\s*\.[^{}]+\s*\{[^{}]*\})*',
        '', html, flags=re.DOTALL
    )

    # 3. הסרת קטעי JavaScript שמכילים darkModeToggle או data-theme
    html = re.sub(
        r'<script[^>]*>.*?(darkModeToggle|data-theme).*?</script>',
        '', html, flags=re.DOTALL
    )

    return html if html != original else None

# עובר על כל הקבצים בתיקייה
for filename in os.listdir(LECTURES_DIR):
    if filename.endswith(".html"):
        path = os.path.join(LECTURES_DIR, filename)
        with open(path, "r", encoding="utf-8") as f:
            content = f.read()

        updated = clean_dark_mode(content)

        if updated:
            with open(path, "w", encoding="utf-8") as f:
                f.write(updated)
            print(f"✅ עודכן: {filename}")
        else:
            print(f"➖ אין שינוי: {filename}")
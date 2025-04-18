import os
import re

LECTURES_DIR = "lectures"

for filename in os.listdir(LECTURES_DIR):
    if filename.endswith(".html"):
        path = os.path.join(LECTURES_DIR, filename)
        with open(path, "r", encoding="utf-8") as f:
            content = f.read()

        original = content

        # מחיקת הכפתור עצמו (שמתחיל ב-<button id="darkModeToggle"...)
        content = re.sub(r'<button id="darkModeToggle".*?</button>', '', content, flags=re.DOTALL)

        # מחיקת קוד ה-JavaScript שמטפל ב-dark mode (הקוד שאתה שלחת זה בלוק גדול שמתחיל ב: "// --- 4. Dark Mode ---")
        content = re.sub(r'// --- 4\. Dark Mode ---.*?(?=// --- 5\.|</script>)', '', content, flags=re.DOTALL)

        if content != original:
            with open(path, "w", encoding="utf-8") as f:
                f.write(content)
            print(f"עודכן: {filename}")
        else:
            print(f"לא נעשה שינוי: {filename}")
import os

LECTURES_DIR = "lectures"
BUTTON_HTML = """
<!-- כפתור חזרה לדף הראשי -->
<a href="../index.html" style="
  position: fixed;
  top: 20px;
  right: 20px;
  background-color: #0a5a8d;
  color: white;
  padding: 10px 16px;
  border-radius: 30px;
  text-decoration: none;
  font-size: 14px;
  z-index: 999;
  box-shadow: 0 2px 6px rgba(0,0,0,0.2);
">
  🏠 חזרה למסך הראשי
</a>
"""

for filename in os.listdir(LECTURES_DIR):
    if filename.endswith(".html"):
        path = os.path.join(LECTURES_DIR, filename)
        with open(path, "r", encoding="utf-8") as f:
            content = f.read()
        
        if "חזרה למסך הראשי" in content:
            print(f"{filename} כבר מכיל את הכפתור – מדלג.")
            continue

        if "</body>" in content:
            updated = content.replace("</body>", BUTTON_HTML + "\n</body>")
            with open(path, "w", encoding="utf-8") as f:
                f.write(updated)
            print(f"✅ עודכן: {filename}")
        else:
            print(f"⚠️ לא נמצא </body> ב- {filename}, מדלג.")
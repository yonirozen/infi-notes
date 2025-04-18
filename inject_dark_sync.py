import os
import re

LECTURES_DIR = "lectures"
DARK_SYNC_SCRIPT = """
<script>
  try {
    const parentTheme = window.parent?.document.documentElement.getAttribute('data-theme');
    if (parentTheme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  } catch (e) {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }
</script>
"""

for filename in os.listdir(LECTURES_DIR):
    if filename.endswith(".html"):
        path = os.path.join(LECTURES_DIR, filename)
        with open(path, "r", encoding="utf-8") as f:
            content = f.read()

        if DARK_SYNC_SCRIPT.strip() in content:
            print(f"⏭️ כבר קיים: {filename}")
            continue

        # מוסיף את הסקריפט לפני </body>
        updated = re.sub(r'</body>', DARK_SYNC_SCRIPT + '\n</body>', content, flags=re.IGNORECASE)

        if updated != content:
            with open(path, "w", encoding="utf-8") as f:
                f.write(updated)
            print(f"✅ עודכן: {filename}")
        else:
            print(f"⚠️ לא נמצאה תגית </body> ב- {filename}")
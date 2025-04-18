import os
import re

LECTURES_DIR = "lectures"

# כפתור חדש + קוד הסנכרון
DARK_MODE_BLOCK = """
<!-- כפתור מצב לילה חדש -->
<button onclick="toggleDark()" id="toggleDarkBtn"
  style="position: fixed; top: 20px; left: 20px; z-index: 9999;
         background: #0a5a8d; color: white; border: none;
         padding: 10px 16px; border-radius: 30px;
         font-weight: bold; cursor: pointer;">
  🌓 מצב לילה
</button>

<script>
  function applyTheme(mode) {
    document.documentElement.setAttribute('data-theme', mode);
    localStorage.setItem('theme', mode);
  }

  function toggleDark() {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
  }

  try {
    const parentTheme = window.parent?.document.documentElement.getAttribute('data-theme');
    if (parentTheme === 'dark') {
      applyTheme('dark');
    }
  } catch (e) {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark') {
      applyTheme('dark');
    }
  }
</script>
"""

# הסרת הכפתור הישן
old_button_regex = re.compile(r'<button[^>]*id="darkModeToggle".*?</button>', re.DOTALL)

# הסרת קוד JS ישן (בדרך כלל עם data-theme או toggleDark)
old_script_regex = re.compile(r'<script[^>]*>.*?(darkModeToggle|data-theme).*?</script>', re.DOTALL)

for filename in os.listdir(LECTURES_DIR):
    if filename.endswith(".html"):
        path = os.path.join(LECTURES_DIR, filename)
        with open(path, "r", encoding="utf-8") as f:
            content = f.read()

        original = content

        # הסרה של כפתור וקוד ישן
        content = old_button_regex.sub('', content)
        content = old_script_regex.sub('', content)

        # הוספת הכפתור החדש אם הוא לא כבר שם
        if "toggleDark()" not in content:
            content = re.sub(r'</body>', DARK_MODE_BLOCK + '\n</body>', content, flags=re.IGNORECASE)

        if content != original:
            with open(path, "w", encoding="utf-8") as f:
                f.write(content)
            print(f"✅ עודכן: {filename}")
        else:
            print(f"⏭️ אין צורך בעדכון: {filename}")
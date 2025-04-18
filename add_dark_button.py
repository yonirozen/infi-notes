import os
import re

LECTURES_DIR = "lectures"
BUTTON_HTML = """
<button onclick="toggleDark()" id="toggleDarkBtn"
  style="position: fixed; top: 20px; left: 20px; z-index: 9999;
         background: #0a5a8d; color: white; border: none;
         padding: 10px 16px; border-radius: 30px;
         font-weight: bold; cursor: pointer;">
  🌓 מצב לילה
</button>
"""

SCRIPT = """
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

  // Synced with parent or localStorage
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

for filename in os.listdir(LECTURES_DIR):
    if filename.endswith(".html"):
        path = os.path.join(LECTURES_DIR, filename)
        with open(path, "r", encoding="utf-8") as f:
            content = f.read()

        changed = False

        if "toggleDark()" not in content:
            content = re.sub(r'</body>', BUTTON_HTML + '\n' + SCRIPT + '\n</body>', content, flags=re.IGNORECASE)
            changed = True

        if changed:
            with open(path, "w", encoding="utf-8") as f:
                f.write(content)
            print(f"✅ נוסף כפתור מצב לילה: {filename}")
        else:
            print(f"⏭️ כבר קיים: {filename}")
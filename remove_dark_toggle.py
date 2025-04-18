import os
import re

LECTURES_DIR = "lectures"

# Regex to match the Dark Mode button
button_pattern = re.compile(
    r'<button id="darkModeToggle".*?</button>', 
    re.DOTALL
)

# Regex to match the JS code block for Dark Mode
js_pattern = re.compile(
    r'// --- 4\. Dark Mode ---.*?(?=// --- 5\.|</script>)', 
    re.DOTALL
)

# Optional: remove the dark-mode-toggle CSS block
css_pattern = re.compile(
    r'/\* --- Dark Mode Toggle Button --- \*/.*?\.dark-mode-toggle.*?\}', 
    re.DOTALL
)

for filename in os.listdir(LECTURES_DIR):
    if filename.endswith(".html"):
        path = os.path.join(LECTURES_DIR, filename)
        with open(path, "r", encoding="utf-8") as file:
            content = file.read()

        original = content

        # Remove button, JS block, and optional CSS
        content = button_pattern.sub('', content)
        content = js_pattern.sub('', content)
        content = css_pattern.sub('', content)

        if content != original:
            with open(path, "w", encoding="utf-8") as file:
                file.write(content)
            print(f"✅ עודכן: {filename}")
        else:
            print(f"➖ אין שינוי: {filename}")
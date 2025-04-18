import os
import re

DIRECTORY = 'lectures'
RENDER_SCRIPT = '''
<script>
document.addEventListener("DOMContentLoaded", function() {
    if (typeof renderMathInElement === 'function') {
        renderMathInElement(document.body, {
            delimiters: [
                {left: "$$", right: "$$", display: true},
                {left: "\\\\[", right: "\\\\]", display: true},
                {left: "\\\\(", right: "\\\\)", display: false},
                {left: "$", right: "$", display: false}
            ],
            throwOnError: false
        });
    } else {
        console.error("KaTeX renderMathInElement function not found.");
    }
});
</script>
'''

def patch_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    if 'renderMathInElement' in content:
        print(f'✓ {filepath} כבר כולל renderMathInElement – מדלג')
        return

    # הזרקה לפני </body> או בסוף הקובץ אם אין
    if '</body>' in content:
        content = content.replace('</body>', f'{RENDER_SCRIPT}\n</body>')
    else:
        content += '\n' + RENDER_SCRIPT

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

    print(f'⚙️ עודכן: {filepath}')

def main():
    for filename in os.listdir(DIRECTORY):
        if re.match(r'lecture\d+\.html$', filename):
            filepath = os.path.join(DIRECTORY, filename)
            patch_file(filepath)

if __name__ == '__main__':
    main()
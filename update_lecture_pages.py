#!/usr/bin/env python3
"""
Script to update all lecture HTML files with back buttons and breadcrumb navigation.
This makes the lecture pages consistent with the new multi-course structure.
"""

import os
import re
from bs4 import BeautifulSoup
import glob

# Define the new elements to add
BACK_BUTTON_CSS = """
/* Back Button */
.back-nav {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 1002;
    display: flex;
    align-items: center;
    background-color: var(--card-bg);
    color: var(--primary-color);
    border: 1px solid var(--border-color);
    border-radius: 25px;
    padding: 8px 15px;
    font-size: 0.9rem;
    box-shadow: var(--card-shadow);
    transition: all var(--transition-speed) ease;
    text-decoration: none;
}

.back-nav:hover {
    transform: translateX(-5px);
    box-shadow: var(--card-hover-shadow);
    color: var(--accent-color);
}

.back-nav i {
    margin-left: 8px;
}

/* Breadcrumb */
.breadcrumb {
    position: absolute;
    top: 10px;
    left: 20px;
    color: var(--header-text);
    font-size: 0.85rem;
    z-index: 100;
    display: flex;
    align-items: center;
    opacity: 0.8;
}

.breadcrumb a {
    color: var(--header-text);
    text-decoration: none;
    transition: color 0.2s ease;
}

.breadcrumb a:hover {
    color: var(--accent-color);
    text-decoration: underline;
}

.breadcrumb .separator {
    margin: 0 5px;
}

/* Adjust existing header padding */
header {
    padding-top: 50px;
}
"""

BACK_BUTTON_HTML = """
<a href="../index.html" class="back-nav">
    <i class="fas fa-chevron-right"></i>
    חזרה לסיכומי אינפי 2
</a>
"""

BREADCRUMB_HTML = """
<div class="breadcrumb">
    <a href="../courses.html">סיכומי קורסים</a>
    <span class="separator">/</span>
    <a href="../index.html">אינפי 2</a>
    <span class="separator">/</span>
    <span>{lecture_title}</span>
</div>
"""

def update_lecture_file(file_path):
    """Update a single lecture HTML file with new navigation elements."""
    print(f"Processing: {file_path}")
    
    # Read the HTML file
    with open(file_path, 'r', encoding='utf-8') as file:
        content = file.read()
    
    # Parse the HTML
    soup = BeautifulSoup(content, 'html.parser')
    
    # Get the lecture number from filename or title
    lecture_number_match = re.search(r'lecture(\d+)', file_path)
    lecture_number = lecture_number_match.group(1) if lecture_number_match else '?'
    
    # Find the title tag to get a better lecture title
    title_tag = soup.find('title')
    if title_tag:
        lecture_title = f"שיעור {lecture_number}"
    else:
        lecture_title = f"שיעור {lecture_number}"
    
    # Check if CSS for back button already exists
    style_tag = soup.find('style')
    if style_tag and '.back-nav' not in style_tag.text:
        # Add new CSS to the style tag
        style_tag.append(BACK_BUTTON_CSS)
    
    # Check if back button already exists
    back_nav = soup.select('.back-nav')
    if not back_nav:
        # Find the body tag
        body_tag = soup.find('body')
        if body_tag:
            # Create the back button element
            back_button_soup = BeautifulSoup(BACK_BUTTON_HTML, 'html.parser')
            
            # Insert as the first element in the body
            body_tag.insert(0, back_button_soup)
    
    # Ensure the dark mode toggle exists
    dark_mode_toggle = soup.find(id='darkModeToggle')
    if not dark_mode_toggle:
        # Find where to insert the toggle (after the back button)
        back_nav = soup.select('.back-nav')
        if back_nav:
            toggle_html = """
            <!-- Dark Mode Toggle Button -->
            <button id="darkModeToggle" class="dark-mode-toggle" aria-label="Toggle dark mode" aria-pressed="false">
                <i class="fas fa-sun"></i>
                <i class="fas fa-moon"></i>
            </button>
            """
            toggle_soup = BeautifulSoup(toggle_html, 'html.parser')
            back_nav[0].insert_after(toggle_soup)
    
    # Find the header tag
    header_tag = soup.find('header')
    if header_tag:
        # Check if breadcrumb already exists
        breadcrumb = header_tag.select('.breadcrumb')
        if not breadcrumb:
            # Create breadcrumb with the lecture title
            breadcrumb_html = BREADCRUMB_HTML.format(lecture_title=lecture_title)
            breadcrumb_soup = BeautifulSoup(breadcrumb_html, 'html.parser')
            
            # Insert as the first element in the header
            header_tag.insert(0, breadcrumb_soup)
    
    # Write the updated HTML back to the file
    with open(file_path, 'w', encoding='utf-8') as file:
        file.write(str(soup))
    
    print(f"Updated: {file_path}")

def main():
    """Update all lecture HTML files in the lectures directory."""
    # Get all lecture HTML files
    lecture_files = glob.glob('lectures/lecture*.html')
    
    if not lecture_files:
        print("No lecture files found!")
        return
    
    print(f"Found {len(lecture_files)} lecture files to update.")
    
    # Update each file
    for file_path in lecture_files:
        update_lecture_file(file_path)
    
    print("All lecture files have been updated!")

if __name__ == "__main__":
    main() 
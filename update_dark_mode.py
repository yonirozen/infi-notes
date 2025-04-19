#!/usr/bin/env python3
"""
Script to update all lecture HTML files to use the central dark-mode.js script.
This ensures consistent dark mode behavior across the entire site.
"""

import os
import re
from bs4 import BeautifulSoup
import glob

def update_lecture_file(file_path):
    """Update a single lecture HTML file to use the central dark-mode.js script."""
    print(f"Processing: {file_path}")
    
    # Read the HTML file
    with open(file_path, 'r', encoding='utf-8') as file:
        content = file.read()
    
    # Parse the HTML
    soup = BeautifulSoup(content, 'html.parser')
    
    # Check if the dark-mode.js script is already included
    dark_mode_script = False
    for script_tag in soup.find_all('script'):
        if script_tag.get('src') and 'dark-mode.js' in script_tag['src']:
            dark_mode_script = True
            break
    
    # If not found, add it
    if not dark_mode_script:
        # Find the end of body tag
        body_tag = soup.find('body')
        if body_tag:
            # Remove any inline dark mode toggle scripts
            for script_tag in soup.find_all('script'):
                if script_tag.string and any(term in script_tag.string for term in ['darkModeToggle', 'dark-mode', 'data-theme']):
                    script_tag.extract()
            
            # Create the script tag
            script_tag = soup.new_tag('script')
            script_tag['src'] = '../js/dark-mode.js'
            
            # Add it to the end of the body
            body_tag.append(script_tag)
    
    # Write the updated HTML back to the file
    with open(file_path, 'w', encoding='utf-8') as file:
        file.write(str(soup))
    
    print(f"Updated: {file_path}")

def main():
    """Update all lecture HTML files to use the central dark-mode.js script."""
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
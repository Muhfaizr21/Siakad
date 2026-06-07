import os
import re

directory = r"c:\Users\ROG STRIX\Siakad\frontend\src\pages\Kencana"

for root, dirs, files in os.walk(directory):
    for file in files:
        if file.endswith(".jsx"):
            path = os.path.join(root, file)
            with open(path, "r", encoding="utf-8") as f:
                content = f.read()

            def replace_classes(match):
                classes = match.group(1) + "max-w-7xl" + match.group(2)
                classes = re.sub(r'\b(p|px|py|pt|pb|pl|pr)-\d+\b\s*', '', classes)
                classes = re.sub(r'\b(md|lg|sm):(p|px|py|pt|pb|pl|pr)-\d+\b\s*', '', classes)
                # also remove min-h-screen if any
                classes = re.sub(r'\bmin-h-screen\b\s*', '', classes)
                return f'className="{classes.strip()}"'

            new_content = re.sub(r'className="([^"]*)max-w-7xl([^"]*)"', replace_classes, content)
            
            # Additional cleanup for Dashboard.jsx
            def replace_classes_dash(match):
                classes = match.group(1) + match.group(2)
                classes = re.sub(r'\b(p|px|py|pt|pb|pl|pr)-\d+\b\s*', '', classes)
                classes = re.sub(r'\b(md|lg|sm):(p|px|py|pt|pb|pl|pr)-\d+\b\s*', '', classes)
                classes = re.sub(r'\bmin-h-screen\b\s*', '', classes)
                return f'className="{classes.strip()}"'
                
            new_content = re.sub(r'className="([^"]*)px-4 py-6 md:px-6 lg:px-8([^"]*)"', replace_classes_dash, new_content)

            if new_content != content:
                with open(path, "w", encoding="utf-8", newline="\n") as f:
                    f.write(new_content)
                print(f"Updated {file}")

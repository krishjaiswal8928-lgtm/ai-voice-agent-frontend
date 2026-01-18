"""Delete duplicate broken lines 737-750 from orchestrator.py"""

# Read the file
with open(r"c:\voice-agent-theme-update-app\app\agent\orchestrator.py", "r", encoding="utf-8") as f:
    lines = f.readlines()

# Delete lines 737-750 (0-indexed: 736-749)
new_lines = lines[:736] + lines[750:]

# Write back
with open(r"c:\voice-agent-theme-update-app\app\agent\orchestrator.py", "w", encoding="utf-8") as f:
    f.writelines(new_lines)

print(f"Successfully deleted lines 737-750")
print(f"Original lines: {len(lines)}")
print(f"New lines: {len(new_lines)}")

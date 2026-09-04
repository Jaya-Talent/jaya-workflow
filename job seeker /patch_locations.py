import re

with open("src/lib/applicants/constants.ts", "r") as f:
    content = f.read()

# Filter out continents and generic "Worldwide" since the user specifically wants just countries and remote
to_remove = ["Worldwide", "North America", "Europe", "Asia", "Africa", "South America", "Oceania"]

pattern = r'(export const LOCATION_SUGGESTIONS\s*=\s*)\[(.*?)\];'
match = re.search(pattern, content, flags=re.DOTALL)
if match:
    array_content = match.group(2)
    # Rebuild without to_remove
    elements = [e.strip().strip('"').strip("'") for e in array_content.split(',') if e.strip()]
    filtered = [e for e in elements if e not in to_remove]
    formatted = "[\n  " + ",\n  ".join([f'"{x}"' for x in filtered]) + ",\n]"
    content = re.sub(pattern, r'\g<1>' + formatted + ';', content, flags=re.DOTALL)

with open("src/lib/applicants/constants.ts", "w") as f:
    f.write(content)


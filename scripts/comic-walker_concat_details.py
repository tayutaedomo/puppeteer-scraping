import glob
import json

file_paths = glob.glob("tmp/comic-walker_detail_*")

details = []

for file_path in file_paths:
  with open(file_path, 'r') as file:
      details.append(json.load(file))

with open('tmp/comic-walker_details.json', 'w') as f:
    json.dump(details, f, indent=2, ensure_ascii=False)

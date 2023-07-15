import glob
import json

file_paths = glob.glob("tmp/coronaex_detail_*")

details = []

for file_path in file_paths:
  with open(file_path, 'r') as file:
      details.append(json.load(file))

with open('tmp/coronaex_comic_details.json', 'w') as f:
    json.dump(details, f, indent=2, ensure_ascii=False)

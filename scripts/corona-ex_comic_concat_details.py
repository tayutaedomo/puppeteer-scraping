import glob
import json

file_paths = glob.glob("tmp/corona-ex_detail_*")

details = []

for file_path in file_paths:
  with open(file_path, 'r') as file:
      details.append(json.load(file))

with open('tmp/corona-ex_comic_details.json', 'w') as f:
    json.dump(details, f, indent=2, ensure_ascii=False)

import glob
import json

file_paths = glob.glob("tmp/kakuyomu_bookmark_*.json")

bookmarks = {}

for file_path in file_paths:
  with open(file_path, 'r') as file:
      bookmark_type = file_path.split('/')[-1].replace('kakuyomu_bookmark_', '').replace('.json', '')
      print(bookmark_type, file_path)
      bookmarks[bookmark_type] = json.load(file)

with open('tmp/kakuyomu_bookmarks.json', 'w') as f:
    json.dump(bookmarks, f, indent=2, ensure_ascii=False)

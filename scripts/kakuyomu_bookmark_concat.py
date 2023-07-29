import glob
import json
from collections import defaultdict

file_paths = glob.glob("tmp/kakuyomu_bookmark_*.json")

bookmarks_by_type = {}

for file_path in file_paths:
  with open(file_path, 'r') as file:
      bookmark_type = file_path.split('/')[-1].replace('kakuyomu_bookmark_', '').replace('.json', '')
      print(bookmark_type, file_path)
      bookmarks_by_type[bookmark_type] = json.load(file)

with open('tmp/kakuyomu_bookmarks_type.json', 'w') as f:
    json.dump(bookmarks_by_type, f, indent=2, ensure_ascii=False)
    print("Created kakuyomu_bookmarks_type.json")

# ノベル毎にブックマークの種類をまとめてファイル出力する
bookmarks_by_id = defaultdict(list)

for bookmark_type, urls in bookmarks_by_type.items():
  for url in urls:
    bookmarks_by_id[url].append(bookmark_type)

with open('tmp/kakuyomu_bookmarks_id.json', 'w') as f:
    json.dump(bookmarks_by_id, f, indent=2, ensure_ascii=False)
    print("Created kakuyomu_bookmarks_id.json")

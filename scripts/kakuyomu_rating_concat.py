import glob
import json

# タグ情報を後で使用するために id 毎のブックマークファイルを読み込む
bookmarks_by_id = {}

with open('tmp/kakuyomu_bookmarks_id.json', 'r') as file:
    bookmarks_by_id = json.load(file)

# 連結するファイルを読み込む
ratings = []
file_paths = glob.glob("tmp/kakuyomu_rating_*.json")

for file_path in file_paths:
  with open(file_path, 'r') as file:
      rating = json.load(file)
      url = "https://kakuyomu.jp/works/" + rating['novelId']
      rating['tags'] = bookmarks_by_id[url] or []
      ratings.append(rating)

with open('tmp/kakuyomu_ratings.json', 'w') as f:
    json.dump(ratings, f, indent=2, ensure_ascii=False)
    print("Created kakuyomu_ratings.json")

import csv
import json


def json_to_csv(input_file, output_file):
  with open(input_file, 'r', encoding='utf-8') as json_file:
    data = json.load(json_file)

  populate_category(data)
  populate_plus_rating(data)

  with open(output_file, 'w', newline='', encoding='utf-8') as csv_file:
    writer = csv.writer(csv_file, delimiter='\t')
    writer.writerow(['novelId', 'tags', 'rating', 'title'])

    for item in data:
      novel_id = item.get('novelId', '')
      category = item.get('category', '')
      rating = str(item.get('plusRating', ''))
      title = item.get('title', '')

      writer.writerow([novel_id, category, rating, title])


def populate_category(data):
    for item in data:
        tags = item.get('tags', [])
        item['category'] = get_category(tags)

    return data


def populate_plus_rating(data):
    for item in data:
        rating = item.get('rating', 0)
        if 'plus_onw' in item['tags']:
          rating += 1
        elif 'plus_two' in item['tags']:
          rating += 2
        item['plusRating'] = rating


def get_category(tags):
    valid_tags = {'in_progress', 'completed', 'stopped', 'stocked'}
    for tag in tags:
        if tag in valid_tags:
            return tag

    return ''


if __name__ == "__main__":
  input_json_file = "tmp/kakuyomu_ratings.json"
  output_csv_file = "tmp/kakuyomu_ratings.tsv"

  json_to_csv(input_json_file, output_csv_file)

import os
import requests
from bs4 import BeautifulSoup


css_dir = 'static/css'
fonts_dir = 'static/fonts/line'
os.makedirs(css_dir, exist_ok=True)
os.makedirs(fonts_dir, exist_ok=True)

css_url = 'https://unicons.iconscout.com/release/v4.0.0/css/line.css'

css_response = requests.get(css_url)
css_content = css_response.text


with open(os.path.join(css_dir, 'line.css'), 'w') as file:
    file.write(css_content)

font_urls = set()
for line in css_content.splitlines():
    if 'url(' in line:
        start = line.find('url(') + 4
        end = line.find(')', start)
        font_url = line[start:end].strip('\'"')
        if font_url.startswith('../fonts/line/'):
            font_urls.add(font_url.replace('../fonts/line/', ''))

base_url = 'https://unicons.iconscout.com/release/v4.0.0/fonts/line/'
for font_name in font_urls:
    full_url = base_url + font_name
    response = requests.get(full_url)
    if response.status_code == 200:
        with open(os.path.join(fonts_dir, font_name), 'wb') as file:
            file.write(response.content)
        print(f'Successfully downloaded: {font_name}')
    else:
        print(f'Failed to download: {font_name}')

css_content = css_content.replace('../fonts/line/', '../fonts/line/')

with open(os.path.join(css_dir, 'line.css'), 'w') as file:
    file.write(css_content)
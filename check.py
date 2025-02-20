import os

fonts_dir = 'static/fonts/line'
expected_files = [
    'unicons-0.eot', 'unicons-0.woff2', 'unicons-0.woff', 'unicons-0.ttf', 'unicons-0.svg',
    'unicons-1.eot', 'unicons-1.woff2', 'unicons-1.woff', 'unicons-1.ttf', 'unicons-1.svg',
]

for file in expected_files:
    if not os.path.exists(os.path.join(fonts_dir, file)):
        print(f'File not found: {file}')
    else:
        print(f'File exists: {file}')
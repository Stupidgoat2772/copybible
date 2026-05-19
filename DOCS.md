# CopyBible — Docs

## Run Locally

Open `index.html` in a browser. That's it.

For local dev with hot reload:
```bash
python3 -m http.server 8080
# open http://localhost:8080
```

Note: `file://` works but clipboard API requires HTTPS or localhost in some browsers. Use the python server if copy doesn't work from file://.

## Deploy

Drop the folder contents on any static host. No build step required.

## Data

`kjv.json` contains the full KJV Bible as nested JSON. Structure: `book → chapter → verse → text`.

Public domain. No license restrictions.

## License

CopyBible code is released under the ISC License. The KJV text data is public domain.

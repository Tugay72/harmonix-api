export const APP_PY_CODE = `import datetime
import json
import random
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
# Enable CORS for public accessibility
CORS(app)

def load_songs():
    try:
        with open('songs.json', 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        return []

@app.route('/api/today', methods=['GET'])
def get_today_song():
    songs = load_songs()
    if not songs:
        return jsonify({"error": "No songs available in songs.json", "success": False}), 404
        
    # Get today's proleptic Gregorian ordinal to use as seed
    today = datetime.date.today()
    seed = today.toordinal()
    
    # Set the random seed
    random.seed(seed)
    # Pick the song consistently for the entire day
    todays_song = random.choice(songs)
    
    return jsonify({
        "success": True,
        "date": today.isoformat(),
        "ordinal_seed": seed,
        "song": {
            "title": todays_song.get("title"),
            "artist": todays_song.get("artist"),
            "spotify_url": todays_song.get("spotify_url"),
            "embed_id": todays_song.get("embed_id"),
            "genre": todays_song.get("genre", "Unknown"),
            "release_year": todays_song.get("release_year", "Unknown")
        }
    })

@app.route('/api/song/<date_str>', methods=['GET'])
def get_song_by_date(date_str):
    songs = load_songs()
    if not songs:
        return jsonify({"error": "No songs available in songs.json", "success": False}), 404
        
    try:
        # Parse date from string formatted as YYYY-MM-DD
        dt = datetime.datetime.strptime(date_str, "%Y-%m-%d").date()
    except ValueError:
        return jsonify({
            "error": "Invalid date format. Please use YYYY-MM-DD format (e.g., 2026-05-23).",
            "success": False
        }), 400
        
    # Seed utilizing date ordinal
    seed = dt.toordinal()
    random.seed(seed)
    chosen_song = random.choice(songs)
    
    return jsonify({
        "success": True,
        "date": dt.isoformat(),
        "ordinal_seed": seed,
        "song": {
            "title": chosen_song.get("title"),
            "artist": chosen_song.get("artist"),
            "spotify_url": chosen_song.get("spotify_url"),
            "embed_id": chosen_song.get("embed_id"),
            "genre": chosen_song.get("genre", "Unknown"),
            "release_year": chosen_song.get("release_year", "Unknown")
        }
    })

if __name__ == '__main__':
    # Run server locally on port 5000
    app.run(host='0.0.0.0', port=5000, debug=True)
`;

export const SONGS_JSON_CODE = `[
  {
    "id": 1,
    "title": "Starboy",
    "artist": "The Weeknd ft. Daft Punk",
    "spotify_url": "https://open.spotify.com/track/76hxER747m07gA09bZ7v9G",
    "embed_id": "76hxER747m07gA09bZ7v9G",
    "genre": "Synth-pop / R&B",
    "release_year": 2016
  },
  {
    "id": 2,
    "title": "As It Was",
    "artist": "Harry Styles",
    "spotify_url": "https://open.spotify.com/track/4D7t7X2ZmvV7R7D6nKrx0W",
    "embed_id": "4D7t7X2ZmvV7R7D6nKrx0W",
    "genre": "Indie Pop",
    "release_year": 2022
  },
  {
    "id": 3,
    "title": "Selfless",
    "artist": "The Strokes",
    "spotify_url": "https://open.spotify.com/track/2t0or7Cu6iPLgwwYj9S8Yg",
    "embed_id": "2t0or7Cu6iPLgwwYj9S8Yg",
    "genre": "Indie Rock",
    "release_year": 2020
  },
  {
    "id": 4,
    "title": "Bohemian Rhapsody",
    "artist": "Queen",
    "spotify_url": "https://open.spotify.com/track/7tFiy0g03e66Y6qv66u30Y",
    "embed_id": "7tFiy0g03e66Y6qv66u30Y",
    "genre": "Classic Rock",
    "release_year": 1975
  },
  {
    "id": 5,
    "title": "Blinding Lights",
    "artist": "The Weeknd",
    "spotify_url": "https://open.spotify.com/track/0VjIjW4GlUZAMY0STZ2ztr",
    "embed_id": "0VjIjW4GlUZAMY0STZ2ztr",
    "genre": "Synthwave",
    "release_year": 2019
  },
  {
    "id": 6,
    "title": "Dreams",
    "artist": "Fleetwood Mac",
    "spotify_url": "https://open.spotify.com/track/08mG3Y1vljmH6v5ZXCgJiX",
    "embed_id": "08mG3Y1vljmH6v5ZXCgJiX",
    "genre": "Classic Pop / Rock",
    "release_year": 1977
  },
  {
    "id": 7,
    "title": "Hotel California",
    "artist": "Eagles",
    "spotify_url": "https://open.spotify.com/track/40rmUnu7XG0Z6mpx674uIU",
    "embed_id": "40rmUnu7XG0Z6mpx674uIU",
    "genre": "Rock / Folk Rock",
    "release_year": 1976
  },
  {
    "id": 8,
    "title": "Fly Me To The Moon",
    "artist": "Frank Sinatra",
    "spotify_url": "https://open.spotify.com/track/2TmvUfV1u3m3m86R7D5g1b",
    "embed_id": "2TmvUfV1u3m3m86R7D5g1b",
    "genre": "Jazz / Vocal Jazz",
    "release_year": 1964
  }
]`;

export const README_MD_CODE = `# 🎵 Harmonix API

An elegant, open-source Flask API that serving a deterministic, rotating "Song of the Day". It guarantees that **everyone globally sees the exact same song throughout the day**, changing precisely at midnight!

---

## 🚀 Key Features

- **Deterministic Shuffling**: Calculates a unique integer seed based on \`datetime.date.today().toordinal()\` to lock in the day's song selector.
- **RESTful Endpoints**: Seamless retrieval via simple JSON interfaces for today \`/api/today\` or any custom date \`/api/song/YYYY-MM-DD\`.
- **Cross-Origin Enabled (CORS)**: Integrate this API immediately into your web dashboards, widgets, or smart displays.
- **Vercel Serverless Ready**: Configured for lightweight, instant deployments to the Edge.

---

## 📂 Project Structure

\`\`\`text
harmonix-api/
├── .gitignore
├── README.md
├── LICENSE
├── app.py
├── songs.json
├── requirements.txt
└── vercel.json
\`\`\`

---

## 🛠️ Local Development Setup

To kickstart this Flask microservice on your machine:

### 1. Clone & Navigate
\`\`\`bash
git clone https://github.com/Tugay72/harmonix-api.git
cd harmonix-api
\`\`\`

### 2. Configure Virtual Environment
\`\`\`bash
python -m venv venv
# On macOS/Linux:
source venv/bin/activate
# On Windows:
venv\\Scripts\\activate
\`\`\`

### 3. Install Dependencies
\`\`\`bash
pip install -r requirements.txt
\`\`\`

### 4. Launch Development Host
\`\`\`bash
python app.py
\`\`\`
Your API endpoint will spark online at \`http://localhost:5000\`. Check it out in your browser or run:
\`\`\`bash
curl http://localhost:5000/api/today
\`\`\`

---

## 🛰️ API Endpoint Documentation

### 1. Keep Alive or Today's Choice
* **Route:** \`GET /api/today\`
* **Response Payload:**
\`\`\`json
{
  "success": true,
  "date": "2026-05-23",
  "ordinal_seed": 739765,
  "song": {
    "title": "Selfless",
    "artist": "The Strokes",
    "spotify_url": "https://open.spotify.com/track/2t0or7Cu6iPLgwwYj9S8Yg",
    "embed_id": "2t0or7Cu6iPLgwwYj9S8Yg",
    "genre": "Indie Rock",
    "release_year": 2020
  }
}
\`\`\`

### 2. Query Specific Date
* **Route:** \`GET /api/song/<YYYY-MM-DD>\`
* **Response Payload:** (querying \`2026-12-25\`)
\`\`\`json
{
  "success": true,
  "date": "2026-12-25",
  "ordinal_seed": 739981,
  "song": {
    "title": "As It Was",
    "artist": "Harry Styles",
    "spotify_url": "https://open.spotify.com/track/4D7t7X2ZmvV7R7D6nKrx0W",
    "embed_id": "4D7t7X2ZmvV7R7D6nKrx0W",
    "genre": "Indie Pop",
    "release_year": 2022
  }
}
\`\`\`

---

## ⚡ Deployment to Vercel

This API is pre-configured to build seamlessly as a Python serverless function on Vercel. 

### Option A: The Easy Route (Vercel CLI)
1. Run CLI setup:
   \`\`\`bash
   npm i -g vercel
   vercel login
   \`\`\`
2. Deploy the directory:
   \`\`\`bash
   vercel
   \`\`\`
3. Push to production:
   \`\`\`bash
   vercel --prod
   \`\`\`

### Option B: Seamless Git Synchronization
1. Push this repository layout to a clean GitHub repository.
2. Log in to your [Vercel Dashboard](https://vercel.com).
3. Click **Add New Project**, link your GitHub account, and import your repository.
4. Vercel automatically detects the Python microservice architecture based on \`vercel.json\` and provisions the API instantly.

---

## 🤝 How to Contribute Songs

We welcome song additions to improve our global rotation dataset!

1. Open a **Pull Request** or **Issue** on GitHub.
2. Edit \`songs.json\` to add your song element using this exact schema:
   \`\`\`json
   {
     "id": 9,
     "title": "Song Title",
     "artist": "Artist Name",
     "spotify_url": "https://open.spotify.com/track/<spotify_track_id>",
     "embed_id": "<spotify_track_id>",
     "genre": "Electronic",
     "release_year": 2025
   }
   \`\`\`
3. Ensure no duplicate entries exist, and that track URL link IDs match the embed IDs carefully!

---

## ⚖️ License

Distributed under the MIT License. See \`LICENSE\` for details.
`;

export const MIT_LICENSE_CODE = `MIT License

Copyright (c) ${new Date().getFullYear()} Harmonix API Open Source Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
`;

export const REQUIREMENTS_TXT_CODE = `Flask==3.0.3
Flask-CORS==4.0.1
`;

export const VERCEL_JSON_CODE = `{
  "version": 2,
  "builds": [
    {
      "src": "app.py",
      "use": "@vercel/python"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "app.py"
    }
  ]
}
`;

export const GITIGNORE_CODE = `# Python virtual environments
venv/
.venv/
env/
__pycache__/
*.pyc

# IDEs or local files
.vscode/
.idea/
.DS_Store
`;

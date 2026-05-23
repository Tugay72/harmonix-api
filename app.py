import datetime
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

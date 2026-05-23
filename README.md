# 🎵 Harmonix API

An elegant, open-source Flask API that serving a deterministic, rotating "Song of the Day". It guarantees that **everyone globally sees the exact same song throughout the day**, changing precisely at midnight!

---

## 🚀 Key Features

- **Deterministic Shuffling**: Calculates a unique integer seed based on `datetime.date.today().toordinal()` to lock in the day's song selector.
- **RESTful Endpoints**: Seamless retrieval via simple JSON interfaces for today `/api/today` or any custom date `/api/song/YYYY-MM-DD`.
- **Cross-Origin Enabled (CORS)**: Integrate this API immediately into your web dashboards, widgets, or smart displays.
- **Vercel Serverless Ready**: Configured for lightweight, instant deployments to the Edge.

---

## 📂 Project Structure

```text
music-of-the-day-api/
├── .gitignore
├── README.md
├── LICENSE
├── app.py
├── songs.json
├── requirements.txt
└── vercel.json
```

---

## 🛠️ Local Development Setup

To kickstart this Flask microservice on your machine:

### 1. Clone & Navigate
```bash
git clone https://github.com/Tugay72/harmonix-api.git
cd harmonix-api
```

### 2. Configure Virtual Environment
```bash
python -m venv venv
# On macOS/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Launch Development Host
```bash
python app.py
```
Your API endpoint will spark online at `http://localhost:5000`. Check it out in your browser or run:
```bash
curl http://localhost:5000/api/today
```

---

## 🛰️ API Endpoint Documentation

### 1. Keep Alive or Today's Choice
* **Route:** `GET /api/today`
* **Response Payload:**
```json
{
  "success": true,
  "date": "2026-05-23",
  "ordinal_seed": 739765,
  "song": {
    "title": "In Da Club",
    "artist": "50 Cent",
    "genre": "Hip Hop",
    "release_year": 2003
  }
}
```

### 2. Query Specific Date
* **Route:** `GET /api/song/<YYYY-MM-DD>`
* **Response Payload:** (querying `2026-12-25`)
```json
{
  "success": true,
  "date": "2026-12-25",
  "ordinal_seed": 739981,
  "song": {
    "title": "As It Was",
    "artist": "Harry Styles",
    "genre": "Indie Pop",
    "release_year": 2022
  }
}
```

---

## ⚡ Deployment to Vercel

This API is pre-configured to build seamlessly as a Python serverless function on Vercel. 

### Option A: The Easy Route (Vercel CLI)
1. Run CLI setup:
   ```bash
   npm i -g vercel
   vercel login
   ```
2. Deploy the directory:
   ```bash
   vercel
   ```
3. Push to production:
   ```bash
   vercel --prod
   ```

### Option B: Seamless Git Synchronization
1. Push this repository layout to a clean GitHub repository.
2. Log in to your [Vercel Dashboard](https://vercel.com).
3. Click **Add New Project**, link your GitHub account, and import your repository.
4. Vercel automatically detects the Python microservice architecture based on `vercel.json` and provisions the API instantly.

---

## 🤝 How to Contribute Songs

We welcome song additions to improve our global rotation dataset!

1. Open a **Pull Request** or **Issue** on GitHub.
2. Edit `songs.json` to add your song element using this exact schema:
   ```json
   {
     "id": 101,
     "title": "Song Title",
     "artist": "Artist Name",
     "genre": "Pop Rock",
     "release_year": 2026
   }
   ```
3. Ensure the id increments sequentially, no duplicates exist, and no external token strings or link keys are included!

---

## ⚖️ License

Distributed under the MIT License. See `LICENSE` for details.

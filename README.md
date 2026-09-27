# 🌱 AgriSense AI — Advanced Crop Recommendation Dashboard

AgriSense AI is an advanced frontend prototype for agricultural decision support.

It extends a basic crop recommendation interface with:

- Soil type
- N/P/K nutrients
- Soil pH
- Temperature
- Humidity
- Rainfall
- Season selection
- Crop suitability scoring
- Ranked recommendations
- Confidence indicator
- Field-health indicators
- Rule-based risk monitoring
- Explainable recommendation factors
- Interactive Chart.js analytics
- Climate presets
- Dark mode
- Report export
- Responsive UI

## ⚠️ Important

This version uses a **transparent rule-based scoring engine**. It is not a trained machine-learning model and should not be represented as one.

For a production/AIML version, the scoring engine can later be replaced by a trained model using a real agricultural dataset.

## Tech Stack

- HTML5
- CSS3
- Tailwind CSS CDN
- JavaScript ES6+
- Chart.js
- Lucide Icons
- Google Fonts

## Folder Structure

```text
AgriRecommend-Advanced/
├── index.html
├── css/
│   └── style.css
├── js/
│   └── app.js
└── README.md
```

## Run Locally

Simply open `index.html` in a browser.

An internet connection is recommended because Tailwind CSS, Chart.js, Lucide and Google Fonts are loaded from CDNs.

## GitHub Pages

1. Create a GitHub repository.
2. Upload the project files.
3. Go to **Settings → Pages**.
4. Select **Deploy from a branch**.
5. Select `main` and `/root`.
6. Save.

## Future AIML Upgrade

Possible next version:

```text
Frontend
   ↓
Flask / FastAPI
   ↓
ML Prediction API
   ↓
Trained Crop Recommendation Model
   ↓
Database
   ↓
Weather API + Soil Data
```

Possible ML models:

- Random Forest
- XGBoost
- Gradient Boosting
- Neural Network

A real model should be trained and evaluated using a documented dataset before being used for actual agricultural recommendations.

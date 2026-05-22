# Islamic Dua REST API

A lightweight, beginner-friendly, and mobile-app optimized REST API project built with **Node.js, Express.js, and CORS support**. This API serves authentic, daily-lifecycle Islamic Duas in multiple languages (English, Arabic, and Bangla) with pristine UTF-8 character encoding support.

---

## 📂 Project Folder Structure

This project has been crafted to maintain a clean separation of concerns:

```text
islamic-dua-api/
├── data/
│   └── duas.json       # Pure database containing the 15+ authentic sample duas
├── routes/
│   └── duaRoutes.js    # Modular Express router carrying endpoint logic
├── public/             # Static public assets
├── src/                # Sandbox frontend development folder
├── README.md           # Documentation and blueprints
├── package.json        # NPM Manifest with dependencies and script recipes
├── server.js           # Lightweight standalone Node.js production server
└── server.ts           # Integrated Developer UI & Sandbox master runner
```

---

## 🛠️ Installation & Getting Started

Follow these fast steps to clone, configure, and run this project on any computer in local development:

### 1. Install Project Dependencies
Run this standard command in your terminal to download and install required packages:
```bash
npm install
```

### 2. Start Standalone Microservice Mode (No Frontend, Raw API Only)
To run the server in standard production-ready JavaScript mode under port `3000`:
```bash
npm run start:standalone
```

To run a hot-reloading development server that watches your file modifications using `nodemon`:
```bash
npm run dev:standalone
```

### 3. Start Integrated Full-Stack Sandbox UI Mode (With Dashboard)
To run the integrated Vite Developer Portal which serves a stellar visual playground at `http://localhost:3000` alongside of your REST API:
```bash
npm run dev
```

---

## 🛰️ Available REST API Endpoints

The API is structured to map standard REST patterns. All responses are returned with JSON format and suitable HTTP response status codes.

### 1. API Health Check
*   **Path:** `/health`
*   **Method:** `GET`
*   **Description:** Fetch Node server online state, environment, and current UTC server time.
*   **Sample Response:**
```json
{
  "success": true,
  "status": "healthy",
  "timestamp": "2026-05-22T19:14:40.000Z"
}
```

### 2. Fetch All Duas
*   **Path:** `/api/duas`
*   **Method:** `GET`
*   **Description:** Retrieve all 15+ duas inside the database with proper Bangla & English translations.
*   **Sample Response:**
```json
{
  "success": true,
  "count": 15,
  "data": [
    {
      "id": 1,
      "category": "Sleep",
      "title_bn": "ঘুমানোর আগের দোয়া",
      "title_en": "Dua Before Sleeping",
      "arabic": "اَللَّهُمَّ بِاسْمِكَ أَمُوتُ وَأَحْيَا",
      "pronunciation_bn": "আল্লাহুম্মা বিসমিকা আমূতু ওয়া আহইয়া।",
      "meaning_bn": "হে আল্লাহ! আপনার নামেই আমি মৃত্যুবরণ করি (ঘুমাই) এবং আপনার নামেই জীবিত (জাগ্রত) হই।",
      "reference": "Sahih al-Bukhari: 6324"
    }
  ]
}
```

### 3. Fetch Single Dua by ID
*   **Path:** `/api/duas/:id`
*   **Method:** `GET`
*   **Description:** Fetch details of a specific dua using its unique numeric reference ID.
*   **Sample:** `/api/duas/5`
*   **Sample Response:**
```json
{
  "success": true,
  "data": {
    "id": 5,
    "category": "Food & Drink",
    "title_bn": "খাবার শুরু করার দোয়া",
    "title_en": "Dua Before Eating",
    "arabic": "بِسْمِ اللهِ الرَّحْمَنِ الرَّحِيمِ",
    "pronunciation_bn": "বিসমিল্লাহির রহমানির রহিম।",
    "meaning_bn": "পরম করুণাময় অসীম দয়ালু আল্লাহর নামে শুরু করছি।",
    "reference": "Abu Dawud: 3767, Tirmidhi: 1858"
  }
}
```

### 4. Fetch Duas By Category name
*   **Path:** `/api/category/:name`
*   **Method:** `GET`
*   **Description:** Case-insensitive lookup of all duas matching a category (e.g., `Sleep`, `Travel`, `Mosque`, `Daily Lifecycle`, etc.). Supports fuzzy fallback checks.
*   **Sample:** `/api/category/Mosque`

### 5. Fetch Random Dua
*   **Path:** `/api/random`
*   **Method:** `GET`
*   **Description:** Fetches an arbitrary single random dua instantly. Perfect for "Dua of the day" features in mobile apps!

### 6. Full-Text Search Support
*   **Path:** `/api/search?q=query_term`
*   **Method:** `GET`
*   **Description:** Conducts deep case-insensitive search matching Arabic characters, Bangla terms, categories, titles, meanings, or references.
*   **Sample:** `/api/search?q=ঘুম`  *(will return Sleeping/Waking up duas)*

---

## 📡 Client-Side Code Snippets

### Using standard Browser Fetch API
```javascript
fetch("http://localhost:3000/api/random")
  .then(response => response.json())
  .then(result => {
    if (result.success) {
      console.log("Random Dua Arabic text:", result.data.arabic);
    }
  })
  .catch(error => console.error("Communication failure:", error));
```

### Using standard Axios Library (Node / Mobile App)
```javascript
import axios from 'axios';

axios.get("http://localhost:3000/api/search?q=মসজিদ")
  .then(response => {
    console.log("Found matches count:", response.data.count);
  })
  .catch(error => console.error("HTTP error:", error));
```

---

## ⚡ Multi-Cloud Free Deployments Guide

Because this REST API uses high performance open-source packages with no stateful heavy database requirements (the payload rests safely inside `/data/duas.json`), you can deploy this on top of completely free-tier servers in under 60 seconds!

### 💻 Deploying on Render (Free Web Service)
1. Register for a free account at [Render.com](https://render.com).
2. Connect your **GitHub** account and select the repository holding this project.
3. Configure your service credentials with these:
   - **Environment/Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm run start:standalone`
4. Deploy! Your API is now live on a global sub-domain.

### 🚀 Deploying on Railway (Instant Deploy)
1. Go to [Railway.app](https://railway.app), login, and spin up a new project.
2. Choose "Deploy from GitHub repo".
3. Railway automatically parses the `package.json` package commands and boots the standalone Express applet immediately.

### ☁️ Deploying on Vercel Serverless Lambdas
To provision this project continuously as light-weight, blazing fast serverless functions inside Vercel, simply create a `vercel.json` file inside the root repository:
```json
{
  "version": 2,
  "rewrites": [
    { "source": "/(.*)", "destination": "/server.js" }
  ]
}
```
Vercel will intercept your express application and run it as high-performance cloud edge functions.

---

## 📚 Features Overview
*   **Bengali & Arabic Integration:** Fully tested under standards-compliant UTF-8 encodings to prevent spelling corruptions.
*   **Flexible Out-of-the-box CORS:** Enabled for all browser domains (via `cors` middleware) which means your web app playground or React Native/Flutter iOS and Android builds can query files easily.
*   **Pre-populated database:** Included 15+ daily duas directly inside `duas.json`.

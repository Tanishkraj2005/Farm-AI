# 🌾 FarmAI: AI-Based Farmer Query Support and Advisory System

> **Built by [Tanishkraj](https://github.com/Tanishkraj2005)**

Your all-in-one digital companion for modern agriculture. FarmAI empowers farmers with real-time data, AI-driven insights, and actionable advisory to optimize crop yields, manage risks, and increase profits.

---

## 🌟 Key Features

- **🤖 AI-Powered Chatbot:** Multilingual advisory system leveraging Google's Gemini AI to answer farmer queries interactively.
- **📈 Real-time Mandi Prices:** Live market rates for various crops gathered directly from the Gov. of India Agmarknet API (data.gov.in).
- **🌦️ Advanced Weather Widget:** Real-time weather forecasting to help in planning agricultural activities.
- **📅 Crop Calendar & Simulator:** Step-by-step guidance on crop cycles and interactive crop yield/growth simulations.
- **🦠 Disease Detection (Visuals + AI):** Helps farmers identify potential diseases from crop symptoms and provides immediate remedial solutions.
- **📰 AgriNews Feed:** Keeps farmers informed with the latest agricultural news and policies directly from Indian news RSS feeds.
- **💧 Soil Analysis & Waste-to-Income:** Innovative tools guiding farmers on improving soil health and monetizing farm waste.
- **🛡️ Crop Insurance Portal:** Quick access to essential agricultural insurance resources.
- **👤 Farmer Profile & Auth:** Secure login and profile management utilizing Firebase Authentication and Cloud Firestore.
- **📑 Automated Reports:** PDF generation using `jsPDF` for downloading actionable reports.

---

## 💻 Technology Stack

**Frontend:**
- **React.js (v18)** powered by **Vite**
- **Tailwind CSS** for responsive UI
- **React Router DOM** for SPA navigation

**Backend:**
- **Node.js** & **Express.js**
- **Axios** & **RSS-Parser** for API integration

**Database & Auth:**
- **Firebase Authentication** (Email/Password + Google)
- **Firebase Firestore** (NoSQL user profile storage)

**External APIs:**
- **Google Gemini API** — Core AI Engine
- **Govt of India (Data.gov.in) API** — Live Mandi prices
- **OpenWeather API** — Real-time weather
- **Chart.js / React-Chartjs-2** — Data visualization

---

## 📂 Project Structure

```text
├── backend/                  # Node.js + Express proxy server
│   ├── server.js             # Main backend API (prices, news)
│   ├── package.json
│   └── .env.example
│
├── frontend/                 # React + Vite application
│   ├── src/
│   │   ├── components/       # UI components (Chatbot, MandiPrices, etc.)
│   │   ├── pages/            # Pages (Dashboard, Landing, Login)
│   │   ├── context/          # React Context (Auth, Profile, ApiKey)
│   │   ├── firebase.js       # Firebase configuration
│   │   └── App.jsx
│   ├── package.json
│   └── .env.example
```

---

## 🚀 Local Setup

### Prerequisites
- Node.js v16+
- Firebase Account
- Google Gemini API Key
- Data.gov.in API Key

### 1. Clone the Repository
```bash
git clone https://github.com/Tanishkraj2005/Farm-AI.git
cd Farm-AI
```

### 2. Frontend Setup
```bash
cd frontend
npm install
```
Create `frontend/.env`:
```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
VITE_API_URL=http://localhost:3001
```

### 3. Backend Setup
```bash
cd ../backend
npm install
```
Create `backend/.env`:
```env
DATA_GOV_API_KEY=your_gov_api_key_here
PORT=3001
```

### 4. Run the App

**Terminal 1 (Backend):**
```bash
cd backend && npm start
```
*(Runs on http://localhost:3001)*

**Terminal 2 (Frontend):**
```bash
cd frontend && npm run dev
```
*(Runs on http://localhost:5173)*

---

## 🌐 Deployment

| Service | Platform |
|---|---|
| Frontend | [Vercel](https://vercel.com) — Root Dir: `frontend` |
| Backend | [Render](https://render.com) — Root Dir: `backend`, Start: `node server.js` |

---

## 🛠️ Performance Notes
- **Backend proxy** keeps Government API keys secure and handles CORS.
- **In-memory caching** for Mandi prices (10 min) and News (30 min) to avoid API rate limits.
- **Vite build** ensures minimal bundle size for fast loading.

---

## 📄 License
This project is licensed under the MIT License.

© 2025 Tanishkraj — FarmAI Platforms. Empowering Agriculture.

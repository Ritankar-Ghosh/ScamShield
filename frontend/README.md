# 🛡️ ScamShield

**ScamShield** is a web-based suspicious message and URL detection system designed to identify potential scams, phishing attempts, social engineering attacks, credential theft, OTP scams, and malicious links.

The application combines **rule-based cybersecurity analysis** with **AI-powered analysis** to provide users with a risk score, verdict, detected indicators, and detailed explanations.

## 🚀 Live Demo

[![Live Demo](https://img.shields.io/badge/Live%20Demo-ScamShield-blue?style=for-the-badge)](https://scam-shield-two-zeta.vercel.app/)

---

## 🚀 Features

* 🔍 Suspicious message detection
* 🔗 URL extraction and analysis
* 🛡️ Phishing and scam detection
* 🤖 AI-powered analysis using Google Gemini
* 📊 Risk score from 0–100
* ⚠️ Risk classification:

  * Low Risk
  * Suspicious
  * High Risk
* 🔐 Detection of credential and OTP-related requests
* 💳 Banking and payment scam detection
* 🎁 Prize/reward scam detection
* 🚨 Urgency and account-pressure detection
* 📜 Analysis history
* 🗑️ Delete individual history records
* 🧹 Delete all history
* 📱 Responsive user interface

---

## 🧰 Tech Stack

### Frontend

* Next.js
* React
* JavaScript
* Tailwind CSS

### Backend

* Python
* FastAPI
* PyMongo
* Google Gemini API

### Database

* MongoDB Atlas

---

## 📁 Project Structure

```text
ScamShield/
│
├── frontend/
│   ├── app/
│   │   ├── page.js
│   │   ├── layout.js
│   │   └── globals.css
│   │
│   ├── public/
│   ├── package.json
│   ├── next.config.js
│   └── .gitignore
│
├── backend/
│   ├── main.py
│   ├── requirements.txt
│   ├── .env
│   └── .gitignore
│
└── README.md
```

---

## ⚙️ Running the Project Locally

### 1. Clone the repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd ScamShield
```

---

# Frontend Setup

Open a terminal inside the `frontend` directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The frontend will normally be available at:

```text
http://localhost:3000
```

---

# Backend Setup

Open another terminal:

```bash
cd backend
```

Create a virtual environment:

```bash
python -m venv venv
```

Activate it on Windows:

```bash
venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Create a `.env` file inside the backend directory.

Example:

```env
GEMINI_API_KEY=your_gemini_api_key
MONGODB_URI=your_mongodb_connection_string
MONGODB_DATABASE=scamshield
GEMINI_MODEL=your_gemini_model
ALLOWED_ORIGINS=http://localhost:3000
```

Start FastAPI:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 9000
```

The backend API will be available at:

```text
http://localhost:9000
```

API documentation:

```text
http://localhost:9000/docs
```

---

## 🔐 Environment Variables

**Never commit your `.env` files to GitHub.**

The following values should remain private:

```text
GEMINI_API_KEY
MONGODB_URI
```

The repository `.gitignore` files exclude environment files and Python virtual environments.

---

## 🔌 API Endpoints

### Analyze Message

```http
POST /analyze
```

Analyzes a suspicious message and returns its risk assessment.

---

### Get History

```http
GET /history
```

Returns stored analysis history.

Supports pagination:

```http
GET /history?page=1&limit=20
```

---

### Get Single History Item

```http
GET /history/{analysis_id}
```

Returns the complete analysis for a specific history record.

---

### Delete Single History Item

```http
DELETE /history/{analysis_id}
```

Deletes one analysis from MongoDB.

---

### Delete All History

```http
DELETE /history
```

Deletes all stored analysis records.

---

### Health Check

```http
GET /health
```

Checks the availability of the backend, MongoDB, and Gemini configuration.

---

## 🧠 Detection System

ScamShield uses two complementary analysis methods.

### Rule-Based Analysis

The backend checks for signals such as:

* Urgency
* Prize/reward claims
* Banking/payment language
* Credential requests
* OTP requests
* Suspicious actions
* Account threats
* Impersonation
* Suspicious URLs
* IP-based URLs
* URL shorteners
* Punycode domains
* Suspicious URL parameters

The detected signals contribute to a final risk score between **0 and 100**.

### AI Analysis

Google Gemini provides an additional analysis containing:

* Verdict
* Confidence
* Explanation
* Indicators

The application is designed so that rule-based analysis remains available if Gemini is temporarily unavailable.

---

## 📊 Risk Classification

| Risk Score | Verdict    |
| ---------- | ---------- |
| 0–39       | Low Risk   |
| 40–69      | Suspicious |
| 70–100     | High Risk  |

---

## 🗄️ Database

ScamShield uses MongoDB to store analysis history.

Each analysis may contain:

* Original message
* Risk score
* Verdict
* Suspicious keywords
* Detected URLs
* URL analysis
* Detection reasons
* Gemini analysis
* Creation timestamp

---

## 🔒 Security Considerations

ScamShield treats submitted messages as **untrusted data**.

URLs are analyzed as strings and are **not automatically visited or fetched** by the backend.

The application also implements:

* Input length limits
* URL count limits
* Basic rate limiting
* MongoDB error handling
* Gemini response validation
* Environment-variable based secret management

---

## 🛣️ Future Improvements

Potential future improvements include:

* User authentication
* Per-user analysis history
* Advanced phishing-domain intelligence
* VirusTotal integration
* More sophisticated NLP classification
* Browser extension
* Email/SMS integration
* Improved URL reputation analysis
* Production monitoring
* Automated testing
* Docker deployment

---

## 👨‍💻 Development

This project was developed as a cybersecurity-focused web application for detecting suspicious messages and URLs.

---

## 📄 License

This project is intended for educational and demonstration purposes.

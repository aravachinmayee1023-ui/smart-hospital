# 🏥 Smart Hospital Bed & Medical Resource Platform

A smart healthcare resource management platform designed to help hospitals monitor and manage **bed availability, ICU capacity, medical resources, emergency status, and healthcare facilities** from a centralized dashboard.

The platform provides a structured way to view hospital and clinic information, track bed occupancy, manage resources, and locate healthcare facilities using **interactive maps and GeoJSON-based location data**.

## 🚀 Features

* 🏥 Hospital & clinic management
* 🛏️ Real-time-style bed availability and occupancy tracking
* 🩺 ICU, general bed & ventilator resource management
* 🚨 Emergency and hospital status monitoring
* 📍 Interactive hospital/clinic location mapping
* 🌐 GeoJSON-based geographic data
* 🔎 Facility search and filtering
* 📊 Bed occupancy and resource dashboards
* 📝 Bed allocation and release management
* 📋 Audit logs for bed operations
* 🔌 RESTful backend APIs
* 💾 SQLite database
* ⚡ Responsive React dashboard

## 🛠️ Technology Stack

### Frontend

* React
* TypeScript
* Vite
* HTML5
* CSS3

### Backend

* Python
* Flask
* Flask-SQLAlchemy
* Flask-CORS
* SQLite
* GeoJSON

### Development

* REST APIs
* SQLAlchemy ORM
* Pytest
* Git & GitHub

## 🏗️ Project Structure

```text
smart-hospital-main/
│
├── backend/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── schemas/
│   ├── seeds/
│   ├── app.py
│   └── requirements.txt
│
├── src/
│   ├── components/
│   ├── services/
│   ├── data/
│   ├── App.tsx
│   ├── main.tsx
│   └── types.ts
│
├── hospital-backend/
├── package.json
├── vite.config.ts
├── tsconfig.json
└── README.md
```

## 🔌 Main API Features

| Method | Endpoint                                | Purpose                      |
| ------ | --------------------------------------- | ---------------------------- |
| GET    | `/api/v1/facilities`                    | Search and filter facilities |
| POST   | `/api/v1/facilities`                    | Add a hospital or clinic     |
| GET    | `/api/v1/facilities/<id>`               | View facility details        |
| PUT    | `/api/v1/facilities/<id>`               | Update facility information  |
| DELETE | `/api/v1/facilities/<id>`               | Deactivate a facility        |
| GET    | `/api/v1/facilities/<id>/beds`          | View bed information         |
| POST   | `/api/v1/facilities/<id>/beds/allocate` | Allocate a bed               |
| POST   | `/api/v1/facilities/<id>/beds/release`  | Release a bed                |
| GET    | `/api/v1/geojson/facilities`            | Get facility GeoJSON data    |
| GET    | `/api/v1/geojson/nearby`                | Find nearby facilities       |
| GET    | `/api/v1/emergency/summary`             | View emergency summary       |

## ⚙️ Getting Started

### 1. Clone the repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd smart-hospital-main
```

### 2. Start the backend

```bash
cd backend

python -m venv venv
```

#### Windows

```bash
venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Run the Flask server:

```bash
python app.py
```

The backend runs on:

```text
http://127.0.0.1:5000
```

### 3. Start the frontend

Open a new terminal:

```bash
npm install
npm run dev
```

Then open the local URL shown by Vite in your browser.

## 🎯 Purpose

The project aims to provide a centralized platform for understanding hospital resource availability during normal operations and emergency situations. Instead of relying on separate records or manually checking different facilities, healthcare administrators can use the platform to view resource information through a unified dashboard.

## 🔮 Future Enhancements

* 👨‍⚕️ Doctor availability and specialization management
* 👩‍⚕️ Staff availability monitoring
* 🤖 AI-based resource demand prediction
* 📈 Historical resource analytics
* 🔔 Low-resource and emergency alerts
* 📱 Mobile application
* 🔐 Role-based authentication
* ☁️ Cloud database integration
* 🚑 Emergency facility recommendations

## 👩‍💻 Project

**Smart Hospital Bed & Medical Resource Platform**

Developed as a healthcare technology project using modern web development, backend APIs, database management, and geographic data visualization.

---

⭐ If you find this project useful, consider giving the repository a star!


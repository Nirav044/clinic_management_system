# 🖥️ MediCore Backend Service

The backend of MediCore is a high-performance RESTful API built with **Node.js** and **Express.js**. It manages medical records, appointment scheduling, and patient history with a focus on data integrity and security.

## 🚀 Key Responsibilities
- **API Management**: Seamless routing and data handling for patient and consultation modules.
- **Data Persistence**: Highly available MongoDB implementation for reliable storage.
- **Authentication Gateway**: Integration with Firebase and JWT for secure role-based access.

## 📂 Backend Architecture
```text
├── models/         # Mongoose schemas for Patients, Appointments, Users
├── routes/         # Express endpoint definitions (e.g., /api/patients)
├── middleware/     # Auth checks, logging, and error handling
├── config/         # Database and third-party service connections
└── server.js       # Main application entry point
```

## 🛠️ API Documentation (Sneak Peek)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/patients` | Retrieve all registered patients |
| `POST` | `/api/appointments` | Register a new patient visit |
| `PATCH` | `/api/prescriptions` | Update a consultation medical chart |

## 🛠️ Setup & Execution
1. Navigate to the backend directory: `cd backend`
2. Install server dependencies: `npm install`
3. Configure `.env` with `MONGODB_URI` and `PORT`.
4. Run in development: `npm start` or `node server.js`

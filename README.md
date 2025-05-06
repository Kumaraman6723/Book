

---

# 📚 Study Material Upload and View App

A full-stack mobile application built with **React Native (Expo)** and **Node.js + MongoDB** that enables teachers to upload PDF study materials and students to view them. This app provides a simple digital solution for sharing academic resources.

## 🚀 Features

### 👩‍🏫 Teacher Functionality

* Upload PDF books as study material
* View all uploaded materials

### 👨‍🎓 Student Functionality

* Browse and view available PDF books
* Smooth in-app PDF viewer

## 🛠 Tech Stack

| Layer        | Technology           |
| ------------ | -------------------- |
| Frontend     | React Native Cli     |
| Backend      | Node.js + Express    |
| Database     | MongoDB (Mongoose)   |
| File Uploads | Multer (PDF support) |
| API Testing  | Postman (optional)   |

## 📁 Project Structure

```bash
.
├── backend/
│   ├── uploads/            # Stored PDFs
│   ├── models/Book.js      # Mongoose schema
│   ├── routes/bookRoutes.js# API routes
│   ├── db.js               # MongoDB connection
│   └── server.js           # Express app
└── frontend/
    ├── App.js              # Entry point
    ├── screens/
    │   ├── UploadScreen.js
    │   └── ViewBooks.js
    └── components/         # Reusable components
```

## ⚙️ Getting Started

### 📦 Backend Setup

1. Navigate to the backend directory:

   ```bash
   cd backend
   ```
2. Install dependencies:

   ```bash
   npm install
   ```
3. Set up your `.env` file:

   ```env
   MONGO_URI=your_mongodb_connection_string
   PORT=5000
   ```
4. Start the server:

   ```bash
   node server.js
   ```

### 📱 Frontend Setup (Expo)

1. Navigate to the frontend directory:

   ```bash
   cd frontend
   ```
2. Install dependencies:

   ```bash
   npm install
   ```
3. Start the Expo app:

   ```bash
   npx expo start
   ```

## 🔗 API Endpoints (Sample)

* `POST /api/books/upload` — Upload a new PDF
* `GET /api/books` — Fetch all uploaded books

## 📌 TODOs

* Add authentication (JWT)
* Add file size/type validation
* Integrate cloud storage (e.g., Cloudinary or AWS S3)

## 🧑‍💻 Author

* [Aman Kumar](https://github.com/Kumaraman6723)

---


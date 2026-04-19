import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';

import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import attendanceRoutes from './routes/attendance.js';
import employeeRoutes from './routes/employees.js';

// Charger les variables d'environnement
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// --- Middlewares ---
app.use(cors());
app.use(bodyParser.json());

// --- Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/employees', employeeRoutes);

// --- Route de test ---
app.get('/', (req, res) => {
  res.status(200).json({
    message: "Serveur Orion Attendance démarré et connecté à MongoDB."
  });
});

// --- Connexion MongoDB + Lancement serveur ---
mongoose.connect(MONGO_URI)
.then(() => {
    console.log(`💾 MongoDB connecté : ${MONGO_URI}`);
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`🚀 Serveur démarré sur 0.0.0.0:${PORT}`);
    });
})
.catch(err => {
    console.error("❌ ERREUR DE CONNEXION MONGO DB :", err.message);
    process.exit(1);
});

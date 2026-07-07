import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import rateLimit from 'express-rate-limit';

import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import attendanceRoutes from './routes/attendance.js';
import employeeRoutes from './routes/employees.js';
import leaveRoutes from './routes/leaves.js';

// Charger les variables d'environnement
dotenv.config();

const app = express();
app.set('trust proxy', 1); // Indispensable pour express-rate-limit derrière un proxy (comme Docker/Nginx)
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// --- Middlewares ---
const corsOptions = {
  origin: process.env.FRONTEND_URL || ['http://localhost:3000', 'http://192.168.1.39:3000'],
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(bodyParser.json());

// Limiteur de requêtes global
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limite chaque IP à 100 requêtes par fenêtre de 15 min
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Limiteur spécifique pour l'authentification
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limite chaque IP à 10 tentatives d'authentification
  message: 'Trop de tentatives de connexion, veuillez réessayer plus tard.'
});

// --- Routes ---
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/leaves', leaveRoutes);

// --- Route de test ---
app.get('/', (req, res) => {
  res.status(200).json({
    message: "Serveur Orion Attendance démarré et connecté à MongoDB."
  });
});

// --- Gestion globale des erreurs ---
app.use((err, req, res, next) => {
  console.error("Erreur serveur :", err);
  res.status(err.status || 500).json({
    message: err.message || 'Erreur interne du serveur',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
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

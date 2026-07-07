// server/routes/attendance.js

import express from 'express';
import Attendance from '../models/Attendance.js';
import auth from '../middleware/auth.js'; // Le middleware pour vérifier le JWT

const router = express.Router();

const OFFICE_START_TIME = '09:00:00'; // Heure de début officielle du travail

const timeToMinutes = (timeString) => {
    // Le format attendu est HH:MM:SS (comme envoyé par le frontend)
    const parts = timeString.split(':').map(Number);
    const hours = parts[0] || 0;
    const minutes = parts[1] || 0;
    const seconds = parts[2] || 0;
    // Convertir tout en minutes
    return (hours * 60) + minutes + (seconds / 60); 
};

const getCurrentLocalTime = () => {
    // Utilise le fuseau horaire défini dans .env, ou par défaut l'heure d'Afrique Centrale / Paris (UTC+1)
    const tz = process.env.TIMEZONE || 'Africa/Douala'; 
    const now = new Date();
    
    // en-CA donne le format YYYY-MM-DD
    const date = now.toLocaleDateString('en-CA', { timeZone: tz });
    
    // en-GB donne le format HH:MM:SS (24h)
    const time = now.toLocaleTimeString('en-GB', { timeZone: tz, hour12: false });
    
    return { date, time };
};
// ------------------------------------------------------------------
// GET /api/attendance : Récupérer les enregistrements
// (Tous pour admin, seulement les siens pour employee)
// ------------------------------------------------------------------
router.get('/', auth, async (req, res) => {
    // Les données utilisateur (userId et role) sont attachées à req.user par le middleware 'auth'
    const userId = req.user.userId;
    const userRole = req.user.role;

    try {
        let query = {};

        // Si l'utilisateur n'est PAS un admin, il ne voit que ses propres enregistrements
        if (userRole !== 'admin') {
            query = { employeeId: userId };
        }
        // Si l'utilisateur est admin, la requête reste vide, renvoyant TOUS les enregistrements.

        const records = await Attendance.find(query)
            .sort({ date: -1, arrivalTime: -1 });

        res.status(200).json(records);
    } catch (error) {
        console.error("Erreur lors de la récupération :", error);
        res.status(500).json({ message: "Erreur serveur lors de la récupération des données." });
    }
});

// ------------------------------------------------------------------
// POST /api/attendance/check-in : Enregistrement d'arrivée
// ------------------------------------------------------------------
router.post('/check-in', auth, async (req, res) => {
    const { date, time } = getCurrentLocalTime();
    const employeeId = req.user.userId;

    try {
        // 1. Convertir les heures de référence et d'arrivée en minutes
        const limitInMinutes = timeToMinutes(OFFICE_START_TIME);
        const arrivalInMinutes = timeToMinutes(time);

        // 2. DÉTERMINER LE STATUT
        let status = 'Present';
        if (arrivalInMinutes > limitInMinutes) {
            status = 'Late'; // L'arrivée est après l'heure limite
        }

        const newRecord = await Attendance.create({
            employeeId,
            date,
            arrivalTime: time,
            status: status 
        });

        res.status(201).json(newRecord);
    } catch (error) {
        // ... (Gestion des erreurs inchangée)
        if (error.code === 11000) {
            return res.status(400).json({ message: "Vous avez déjà pointé l'arrivée aujourd'hui." });
        }
        console.error("Erreur check-in :", error);
        res.status(500).json({ message: "Échec de l'enregistrement d'arrivée." });
    }
});

// ------------------------------------------------------------------
// POST /api/attendance/check-out : Enregistrement de départ
// ------------------------------------------------------------------
router.post('/check-out', auth, async (req, res) => {
    const { time } = getCurrentLocalTime();
    const employeeId = req.user.userId;

    try {
        // 1. Trouver l'enregistrement du jour qui n'a pas encore d'heure de départ
        const updatedRecord = await Attendance.findOneAndUpdate(
            { employeeId, departureTime: null },
            { departureTime: time },
            { new: true } // Retourner le document mis à jour
        );

        if (!updatedRecord) {
            // Cela peut arriver si l'utilisateur essaie de pointer le départ sans s'être pointé à l'arrivée
            return res.status(404).json({ message: "Arrivée non enregistrée ou départ déjà validé." });
        }

        res.status(200).json(updatedRecord);
    } catch (error) {
        console.error("Erreur check-out :", error);
        res.status(500).json({ message: "Échec de l'enregistrement de départ." });
    }
});

export default router;
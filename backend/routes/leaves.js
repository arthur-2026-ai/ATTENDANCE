// backend/routes/leaves.js
import express from 'express';
import Leave from '../models/Leave.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// ------------------------------------------------------------------
// GET /api/leaves : Récupérer les demandes
// (Toutes pour admin, seulement les siennes pour employee)
// ------------------------------------------------------------------
router.get('/', auth, async (req, res) => {
    const userId = req.user.userId;
    const userRole = req.user.role;

    try {
        let query = {};
        if (userRole !== 'admin') {
            query = { employeeId: userId };
        }

        const leaves = await Leave.find(query)
            .populate('employeeId', 'firstName lastName department position')
            .sort({ createdAt: -1 });

        res.status(200).json(leaves);
    } catch (error) {
        console.error("Erreur récupération congés :", error);
        res.status(500).json({ message: "Erreur serveur lors de la récupération des congés." });
    }
});

// ------------------------------------------------------------------
// POST /api/leaves : Nouvelle demande (Employé seulement)
// ------------------------------------------------------------------
router.post('/', auth, async (req, res) => {
    const { type, startDate, endDate, reason } = req.body;
    const employeeId = req.user.userId;

    if (!type || !startDate || !endDate || !reason) {
        return res.status(400).json({ message: "Veuillez remplir tous les champs obligatoires." });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (start < today) {
        return res.status(400).json({ message: "La date de début ne peut pas être dans le passé." });
    }
    if (end < start) {
        return res.status(400).json({ message: "La date de fin doit être postérieure ou égale à la date de début." });
    }

    try {
        // Vérifier les chevauchements
        const overlappingLeave = await Leave.findOne({
            employeeId,
            status: { $in: ['Pending', 'Approved'] },
            $or: [
                { startDate: { $lte: endDate }, endDate: { $gte: startDate } }
            ]
        });

        if (overlappingLeave) {
            return res.status(400).json({ message: "Vous avez déjà une demande de congé sur cette période." });
        }
        const newLeave = await Leave.create({
            employeeId,
            type,
            startDate,
            endDate,
            reason
        });

        const populatedLeave = await Leave.findById(newLeave._id).populate('employeeId', 'firstName lastName department position');
        res.status(201).json(populatedLeave);
    } catch (error) {
        console.error("Erreur création congé :", error);
        res.status(500).json({ message: "Échec de la soumission de la demande." });
    }
});

// ------------------------------------------------------------------
// PATCH /api/leaves/:id/status : Valider ou Refuser (Admin seulement)
// ------------------------------------------------------------------
router.patch('/:id/status', auth, async (req, res) => {
    const { status, adminComment } = req.body;
    const userRole = req.user.role;

    if (userRole !== 'admin') {
        return res.status(403).json({ message: "Accès refusé. Réservé aux administrateurs." });
    }

    if (!['Approved', 'Rejected'].includes(status)) {
        return res.status(400).json({ message: "Statut invalide." });
    }

    try {
        const updatedLeave = await Leave.findByIdAndUpdate(
            req.params.id,
            { status, adminComment },
            { new: true }
        ).populate('employeeId', 'firstName lastName department position');

        if (!updatedLeave) {
            return res.status(404).json({ message: "Demande introuvable." });
        }

        res.status(200).json(updatedLeave);
    } catch (error) {
        console.error("Erreur mise à jour statut congé :", error);
        res.status(500).json({ message: "Erreur lors de la mise à jour de la demande." });
    }
});

export default router;

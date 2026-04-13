import express from 'express';
import auth from '../middleware/auth.js'; 
import User from '../models/User.js';

const router = express.Router();

// GET /api/users/profile : Récupérer les données du profil de l'utilisateur connecté
// Cette route est PROTÉGÉE par le middleware 'auth'
router.get('/profile', auth, async (req, res) => {
    try {
        // L'ID de l'utilisateur est accessible via req.user grâce au middleware 'auth'
        const user = await User.findById(req.user.userId).select('-password'); // On exclut le mot de passe
        
        if (!user) {
            return res.status(404).json({ message: "Utilisateur non trouvé." });
        }
        
        res.status(200).json(user);

    } catch (error) {
        console.error("Erreur lors de la récupération du profil :", error);
        res.status(500).json({ message: "Erreur serveur." });
    }
});

export default router;
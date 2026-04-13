// server/routes/employees.js

import express from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User.js'; 
import auth from '../middleware/auth.js'; 

const router = express.Router();

// Middleware pour vérifier le rôle d'administrateur
const adminAuth = (req, res, next) => {
    // Le middleware 'auth' a déjà attaché req.user
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ message: "Accès refusé. Réservé aux administrateurs." });
    }
    next();
};

// ==================================================================
// 1. GET /api/employees : Récupérer tous les employés (Admin Only)
// ==================================================================
router.get('/', auth, adminAuth, async (req, res) => {
    try {
        // Exclure le rôle 'admin' pour ne montrer que les employés standards, 
        // ou inclure tous les utilisateurs sauf les champs sensibles comme le mot de passe.
        const employees = await User.find({})
            .select('-password') // N'envoyez jamais le mot de passe
            .sort({ lastName: 1 });
        
        res.status(200).json(employees);
    } catch (error) {
        console.error("Erreur lors de la récupération des employés :", error);
        res.status(500).json({ message: "Échec de la récupération des données employés." });
    }
});

// ==================================================================
// 2. POST /api/employees : Ajouter un nouvel employé (Admin Only)
// ==================================================================
router.post('/', auth, adminAuth, async (req, res) => {
    const { firstName, lastName, email, department, position, phone, joinDate, password } = req.body;

    if (!email || !password || !firstName || !lastName || !department) {
        return res.status(400).json({ message: "Veuillez fournir tous les champs requis, y compris le mot de passe initial." });
    }

    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: "Un utilisateur avec cet email existe déjà." });
        }

        // 1. Hacher le mot de passe
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 2. Créer l'employé (rôle par défaut 'employee')
        user = new User({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            department,
            position,
            phone,
            joinDate,
            role: 'employee', // S'assurer que les nouveaux utilisateurs sont des employés
        });

        await user.save();
        
        // 3. Renvoyer l'employé sans le mot de passe
        const newEmployee = user.toObject();
        delete newEmployee.password; 

        res.status(201).json(newEmployee);
    } catch (error) {
        console.error("Erreur lors de la création de l'employé :", error);
        res.status(500).json({ message: "Échec de la création du nouvel employé." });
    }
});

// ==================================================================
// 3. PUT /api/employees/:id : Mettre à jour un employé (Admin Only)
// ==================================================================
router.put('/:id', auth, adminAuth, async (req, res) => {
    const userId = req.params.id;
    const updates = req.body;
    
    // Empêcher la modification directe du rôle ou du mot de passe par la même route (pour sécurité)
    delete updates.role; 
    delete updates.password; 

    try {
        const updatedEmployee = await User.findByIdAndUpdate(
            userId, 
            { $set: updates }, 
            { new: true, runValidators: true } // Retourne le nouveau document et valide
        ).select('-password'); // Exclure le mot de passe

        if (!updatedEmployee) {
            return res.status(404).json({ message: "Employé non trouvé." });
        }

        res.status(200).json(updatedEmployee);
    } catch (error) {
        console.error("Erreur lors de la mise à jour de l'employé :", error);
        res.status(500).json({ message: "Échec de la mise à jour des données de l'employé." });
    }
});

// ==================================================================
// 4. DELETE /api/employees/:id : Supprimer un employé (Admin Only)
// ==================================================================
router.delete('/:id', auth, adminAuth, async (req, res) => {
    const userId = req.params.id;

    try {
        // Empêcher l'administrateur de se supprimer lui-même (si implémenté)
        
        const deletedEmployee = await User.findByIdAndDelete(userId);

        if (!deletedEmployee) {
            return res.status(404).json({ message: "Employé non trouvé." });
        }

        // Optionnel : Supprimer également tous ses enregistrements de présence
        // await Attendance.deleteMany({ employeeId: userId });

        res.status(200).json({ message: "Employé supprimé avec succès." });
    } catch (error) {
        console.error("Erreur lors de la suppression de l'employé :", error);
        res.status(500).json({ message: "Échec de la suppression de l'employé." });
    }
});

export default router;
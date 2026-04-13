import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'; 
import User from '../models/User.js'; 

const router = express.Router();

// POST /api/auth/login
router.post('/login', async (req, res) => { // La fonction doit être async
    const { email, password } = req.body;

    try {
        // 1. Trouver l'utilisateur
        const identifiedUser = await User.findOne({ email });
        
        if (!identifiedUser) {
            return res.status(401).json({ message: "Mot de passe ou Email invalides." });
        }

        // 2. Vérifier le mot de passe
        const isMatch = await bcrypt.compare(password, identifiedUser.password); 

        if (!isMatch) {
            return res.status(401).json({ message: "Mot de passe ou Email invalides." });
        }

        // 2.5. (Optionnel) Générer un token JWT pour les sessions
        const token = jwt.sign(
            { userId: identifiedUser._id, role: identifiedUser.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // 3. Connexion réussie (on envoie le profil, pas le hash)
        const user = {
            id: identifiedUser._id,
            email: identifiedUser.email,
            role: identifiedUser.role,
            firstName: identifiedUser.firstName, 
            lastName: identifiedUser.lastName,
            department: identifiedUser.department,
            position: identifiedUser.position,
            phone: identifiedUser.phone,
            joinDate: identifiedUser.joinDate   
        };
        
        res.status(200).json({ 
            message: "Connexion réussie", 
            user: user,
            token: token
        });

    } catch (error) {
        console.error("Erreur lors de la connexion :", error);
        res.status(500).json({ message: "Une erreur serveur est survenue." });
    }
});


// POST /api/auth/register
router.post('/register', async (req, res) => { 
    const { name, email, password, role } = req.body;

    try {
        // 1. verifie si un utilisateur avec cet email existe
        const existingUser = await User.findOne({ email });
        
        if (existingUser) {
            return res.status(409).json({ message: "Un utilisateur avec cet mail existe deja." });
        }

        // 2. Hasher le mot de passe avant de le stocker
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Créer un nouvel utilisateur avec le mot de passe hashé
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            role: role || 'employee'
        });

        await newUser.save();
        
        res.status(201).json({ 
            message: "Utilisateur créé avec succès.",
            userId: newUser._id
        });
    } catch (error) {
        console.error("Erreur lors de la création de l'utilisateur :", error);

        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message });
       }
        res.status(500).json({ message: "Erreur serveur lors de la création de l'utilisateur." });
    }
});

export default router;
import jwt from 'jsonwebtoken';

const auth = (req, res, next) => {
    // 1. Récupérer le jeton
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Accès refusé. Jeton non fourni ou au mauvais format.' });
    }

    // Isoler le jeton (retirer "Bearer ")
    const token = authHeader.split(' ')[1];

    try {
        // 2. Vérifier et décoder le jeton
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // 3. Attacher l'ID et le rôle de l'utilisateur à l'objet requête
        req.user = { 
            userId: decoded.userId, 
            role: decoded.role 
        };
        
        // Continuer vers la route (la fonction principale)
        next();

    } catch (error) {
        // Erreur si le jeton est invalide ou expiré
        return res.status(401).json({ message: 'Jeton invalide ou expiré.' });
    }
};

export default auth;
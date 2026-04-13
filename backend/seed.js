import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js'; 
import bcrypt from 'bcryptjs';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

const users = [
  {
    firstName: "Arthur",
    lastName: "Fotso",
    email: "arthur@horion.io",
    role: "admin",
    password: "", // Sera généré dynamiquement
    department: "IT",
    position: "DevOps Engineer",
    phone: "+237 656 69 70 43",
    joinDate: "2022-01-15",
  },
  {
    firstName: "Alice",
    lastName: "Ngoma",
    email: "alice@example.com",
    role: "employee",
    password: "", // Sera généré dynamiquement
    department: "Marketing",
    position: "Product Manager",
    phone: "+237 600 00 00 00",
    joinDate: "2023-05-20",
  }
];

async function seed() {
  try {
    console.log("⏳ Hachage des mots de passe...");
    // On définit le même mot de passe pour les tests : password123
    const hashedPassword = await bcrypt.hash("password123", 10);
    
    // On applique le hash à tous les utilisateurs du tableau
    users.forEach(user => {
      user.password = hashedPassword;
    });

    if (!MONGO_URI) throw new Error("MONGO_URI est manquante dans le .env");
    
    console.log("🔗 Connexion à MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connecté à MongoDB.");

    // Nettoyage de la base
    await User.deleteMany({}); 
    console.log("🗑️ Collection User vidée.");
    
    // Insertion des nouveaux comptes
    await User.insertMany(users);
    console.log(`✅ Seed terminé ! ${users.length} utilisateurs insérés.`);
    console.log("🔑 Identifiants : arthur@horion.io / password123");
    console.log("🔑 Identifiants : alice@example.com / password123");
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("❌ ERREUR LORS DU SEEDING :", err);
    process.exit(1);
  }
}

seed();
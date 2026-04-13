import bcrypt from 'bcryptjs';

const password = "employee123"; // 🚨 REMPLACEZ PAR LE MOT DE PASSE QUE VOUS VOULEZ UTILISER

async function generateHash() {
    try {
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);
        console.log("-----------------------------------------");
        console.log(`Mot de passe en clair : ${password}`);
        console.log("HASH BCrypt à copier :");
        console.log(hash);
        console.log("-----------------------------------------");
        process.exit(0);
    } catch (error) {
        console.error("Erreur lors du hachage:", error);
        process.exit(1);
    }
}

generateHash();
const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'entries.json');
const UPLOADS_DIR = path.join(__dirname, 'public', 'uploads');

// Création du dossier d'upload s'il n'existe pas
if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Configuration du stockage des images avec Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOADS_DIR),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

// Helper : Lire la base JSON
function readData() {
    if (!fs.existsSync(DATA_FILE)) return [];
    try {
        const raw = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(raw);
    } catch (e) {
        return [];
    }
}

// Helper : Écrire dans la base JSON
function saveData(data) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
}

// --- ROUTES API ---

// 1. Obtenir toutes les entrées
app.get('/api/entries', (req, res) => {
    res.json(readData());
});

// 2. Créer une nouvelle entrée (avec ou sans fichier image)
app.post('/api/entries', upload.single('imageFile'), (req, res) => {
    const { title, type, content, imageUrl } = req.body;
    let finalImage = imageUrl || '';

    if (req.file) {
        finalImage = `/uploads/${req.file.filename}`;
    }

    const entries = readData();
    const newEntry = {
        id: Date.now().toString(),
        title: title || 'Note sans titre',
        type: type || 'Théorie',
        content: content || '',
        image: finalImage,
        date: new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }),
        timestamp: Date.now()
    };

    entries.push(newEntry);
    saveData(entries);
    res.status(201).json(newEntry);
});

// 3. Supprimer une entrée
app.delete('/api/entries/:id', (req, res) => {
    const { id } = req.params;
    let entries = readData();
    entries = entries.filter(item => item.id !== id);
    saveData(entries);
    res.json({ success: true });
});

// Démarrage du serveur
app.listen(PORT, () => {
    console.log(`Serveur lancé sur le port ${PORT}`);
});
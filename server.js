const express = require("express");
const multer = require("multer");
const sharp = require("sharp");
const path = require("path");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Multer in memoria
const storage = multer.memoryStorage();
const upload = multer({ storage });

const RECIPES_FOLDER = path.join(
  __dirname,
  "../progettoVue/public/images/recipes"
);

// Assicurati che la cartella esista
const fs = require("fs");
if (!fs.existsSync(RECIPES_FOLDER)) {
  fs.mkdirSync(RECIPES_FOLDER, { recursive: true });
}

// Endpoint upload
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Nessun file caricato" });
    }

    const ext = path.extname(req.file.originalname);
    const baseName = Date.now(); // nome univoco
    const filenameOriginal = `${baseName}${ext}`;
    const filenameThumb = `T_${baseName}${ext}`;

    const originalPath = path.join(RECIPES_FOLDER, filenameOriginal);
    const thumbPath = path.join(RECIPES_FOLDER, filenameThumb);

    // Salva immagine 1080x1080
    await sharp(req.file.buffer)
      .resize(1080, 1080, { fit: "cover", position: "center" })
      .toFile(originalPath);

    // Salva immagine 640x640
    await sharp(req.file.buffer)
      .resize(640, 640, { fit: "cover", position: "center" })
      .toFile(thumbPath);

    res.json({
      original: `/images/recipes/${filenameOriginal}`,
      thumbnail: `/images/recipes/${filenameThumb}`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Errore durante l’upload" });
  }
});

// Avvio server
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server backend in ascolto su http://localhost:${PORT}`);
});

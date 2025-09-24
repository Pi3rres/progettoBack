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

// Verifica cartella
const fs = require("fs");
if (!fs.existsSync(RECIPES_FOLDER)) {
  fs.mkdirSync(RECIPES_FOLDER, { recursive: true });
}

app.get("/ping", (req, res) => {
  res.json({ status: "ok", message: "Upload server attivo" });
});

// Creazione route upload
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Nessun file caricato" });
    }
    console.log("req.body:", req.body);
    console.log("req.file:", req.file);

    const filename = req.body.filename || req.file.originalname;
    const ext = path.extname(filename);
    const baseName = path.basename(filename, ext);
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

    res.json({ message: "Upload OK" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: err.message });
  }
});

// Avvio server
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server backend in ascolto su http://localhost:${PORT}`);
});

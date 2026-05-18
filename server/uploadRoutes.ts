import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = Router();

// Criar diretório de uploads se não existir
const uploadsDir = path.join(process.cwd(), "public", "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer em memória — sem salvar em disco
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter(_req, file, cb) {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Apenas imagens são permitidas"));
    }
  },
});

// POST /api/upload/imagem
// Retorna { url: string }
router.post("/imagem", upload.single("imagem"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Nenhuma imagem enviada" });
    }

    const ext = req.file.originalname.split(".").pop() ?? "jpg";
    const randomSuffix = Math.random().toString(36).slice(2, 10);
    const filename = `${Date.now()}-${randomSuffix}.${ext}`;
    const filepath = path.join(uploadsDir, filename);

    // Salvar arquivo localmente
    fs.writeFileSync(filepath, req.file.buffer);

    // Retornar URL pública
    const url = `/uploads/${filename}`;
    return res.json({ url });
  } catch (err: any) {
    console.error("[Upload] Erro:", err);
    return res.status(500).json({ error: err.message ?? "Erro ao fazer upload" });
  }
});

export default router;

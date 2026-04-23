import { Router } from "express";
import multer from "multer";
import { storagePut } from "./storage";

const router = Router();

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
    const key = `blog-capas/${Date.now()}-${randomSuffix}.${ext}`;

    const { url } = await storagePut(key, req.file.buffer, req.file.mimetype);

    return res.json({ url });
  } catch (err: any) {
    console.error("[Upload] Erro:", err);
    return res.status(500).json({ error: err.message ?? "Erro ao fazer upload" });
  }
});

export default router;

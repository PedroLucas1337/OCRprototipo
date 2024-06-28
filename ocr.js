// server.js

const express = require('express');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const sharp = require('sharp'); // Pacote para processamento de imagem

const app = express();
const PORT = 3003;

// Configuração do multer para lidar com o upload de arquivos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Middleware para lidar com JSON e dados de formulário
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Função para pré-processar a imagem para melhorar o contraste
async function preprocessImage(imagePath) {
  try {
    const image = sharp(imagePath);

    // Aplicar um filtro para melhorar o contraste
    const processedImageBuffer = await image
      .linear(0.1, 1.0) // Ajuste os valores conforme necessário para melhorar o contraste
      .toBuffer();

    const processedImageFilePath = path.join('uploads', 'processed-' + path.basename(imagePath));
    await sharp(processedImageBuffer).toFile(processedImageFilePath);

    return processedImageFilePath;
  } catch (err) {
    throw new Error(`Erro ao pré-processar imagem: ${err}`);
  }
}

// Função para detectar região verde na imagem e salvar como nova imagem
async function processImageForOCR(imagePath) {
  try {
    const image = sharp(imagePath);
    const metadata = await image.metadata();

    // Ajuste das dimensões de extração para garantir que fiquem dentro dos limites da imagem
    const left = 0; // Início da extração na lateral esquerda da imagem
    const top = 0; // Início da extração no topo da imagem
    const width = metadata.width; // Largura da imagem original
    const height = metadata.height; // Altura da imagem original

    // Extrair apenas a região verde (exemplo simplificado, ajuste conforme necessário)
    const processedImageBuffer = await image
      .extract({ left, top, width, height }) // Extrair a imagem completa (ajustar conforme necessário)
      .toBuffer();

    const greenImageFilePath = path.join('uploads', 'green-' + path.basename(imagePath));
    await sharp(processedImageBuffer).toFile(greenImageFilePath);

    return greenImageFilePath;
  } catch (err) {
    throw new Error(`Erro ao processar imagem: ${err}`);
  }
}

// Endpoint para realizar OCR em uma imagem
app.post('/ocr', upload.single('image'), async (req, res) => {
  // Verifica se foi enviado um arquivo
  if (!req.file) {
    return res.status(400).send('Nenhuma imagem enviada.');
  }

  // Caminho do arquivo enviado
  const originalImageFilePath = req.file.path;

  try {
    // Pré-processar a imagem para melhorar o contraste
    const processedImageFilePath = await preprocessImage(originalImageFilePath);

    // Processa a imagem para extrair a região verde
    const greenImageFilePath = await processImageForOCR(processedImageFilePath);

    // Executa o script Python para fazer OCR na imagem verde
    const pythonProcess = spawn('python', ['ocrinpdf3.py', greenImageFilePath]);

    // Coleta a saída do script Python
    let output = '';
    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    // Manipula erros do script Python
    pythonProcess.stderr.on('data', (data) => {
      console.error(`Erro no script Python: ${data}`);
      res.status(500).send('Erro ao processar OCR');
    });

    // Quando o processo Python terminar
    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        console.error(`Processo Python encerrado com código de erro ${code}`);
        res.status(500).send('Erro ao processar OCR');
      } else {
        console.log(`Saída do OCR: ${output}`);
        // Extrair números da saída do OCR (exemplo simplificado)
        const numbers = output.match(/\d+/g); // Expressão regular para extrair números

        if (numbers) {
          res.send(`Números detectados: ${numbers.join(', ')}`);
        } else {
          res.send('Nenhum número foi detectado.');
        }
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro ao processar imagem para OCR');
  }
});

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});

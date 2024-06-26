const express = require('express');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const multer  = require('multer');


const app = express();
const PORT = 3003;

// Configuração do multer para lidar com o upload de arquivos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(balanca.png))
  }
});

const upload = multer({ storage: storage });

// Função para ler uma imagem, converter para base64 e retornar o texto OCR

function convertImageToText(imagePath, callback) {
  // Lê a imagem como um buffer
  fs.readFile(imagePath, (err, imgBuffer) => {
    if (err) {
      return callback(err);
    }

    // Converte o buffer para base64
    const base64Image = imgBuffer.toString('base64');

    // Chama o callback com a string base64
    callback(null, base64Image);
  });
}

// Endpoint para realizar OCR em uma imagem
app.post('/ocr', upload.single('image'), (req, res) => {

  // Verifica se foi enviado um arquivo
  if (!req.file) {
    return res.status(400).send('Nenhuma imagem enviada.');
  }
  // Exemplo de arquivo de imagem recebido via POST (você pode adaptar isso dependendo da forma que a imagem é enviada para a API)
  console.log(req.file);
  const imageFilePath = 'req.file.path';

   // Converte a imagem para base64
   convertImageToText(imageFilePath, (err, base64Image) => {
    if (err) {
      console.error(`Erro ao converter imagem para base64: ${err}`);
      return res.status(500).send('Erro ao processar imagem.');
    }

  // Executa o script Python para fazer OCR na imagem
  const pythonProcess = spawn('python', ['ocrinpdf3.py', imageFilePath]);

  // Coleta a saída do script Python
  pythonProcess.stdout.on('data', (data) => {
    console.log(`Saída do OCR: ${data}`);
    res.send(`Texto detectado: ${data}`);
  });

  // Manipula erros do script Python
  pythonProcess.stderr.on('data', (data) => {
    console.error(`Erro no script Python: ${data}`);
    res.status(500).send('Erro ao processar OCR');
  });
});
})

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});

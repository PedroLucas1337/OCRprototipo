# ocrinpdf3.py

import cv2
import pytesseract
from PIL import Image
import sys

# Configuração do caminho do executável do Tesseract (ajustar conforme necessário)
pytesseract.pytesseract.tesseract_cmd = r'C:\Users\pedrolucas\AppData\Local\Programs\Tesseract-OCR\Tesseract.exe'

# Função para reconhecer texto em uma imagem usando Tesseract OCR
def recognize_text(image_path):
    try:
        # Carrega a imagem usando OpenCV
        img = cv2.imread(image_path)

        # Converte a imagem para tons de cinza
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

        # Usa o Tesseract para OCR na imagem
        text = pytesseract.image_to_string(Image.fromarray(gray), config='--psm 6')

        return text.strip()  # Remove espaços em branco no início e no fim
    except Exception as e:
        raise RuntimeError(f"Erro ao reconhecer texto: {e}")

if __name__ == "__main__":
    # Recebe o caminho da imagem verde como argumento
    green_image_path = sys.argv[1]

    try:
        # Reconhece o texto na imagem verde
        recognized_text = recognize_text(green_image_path)
        
        # Imprime o texto reconhecido para que o Node.js possa capturar
        print(recognized_text)

    except Exception as e:
        print(f"Erro: {e}")
        sys.exit(1)

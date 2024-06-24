import cv2
import pytesseract

# Configurações do Tesseract OCR (opcional)
pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'  # Caminho para o executável do Tesseract no Windows

# Carregar a imagem usando OpenCV
image = cv2.imread('nopelo.png')

# Converter a imagem para escala de cinza (opcional)
gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

# Aplicar pré-processamento à imagem (por exemplo, binarização)
# Você pode ajustar este passo dependendo da qualidade da imagem
_, thresh = cv2.threshold(gray, 150, 255, cv2.THRESH_BINARY)

# Detectar texto na imagem usando Tesseract OCR
tessdata_dir_config = '--tessdata-dir "C:\\Program Files\\Tesseract-OCR\\tessdata"'

text = pytesseract.image_to_string(thresh, lang='por', config=tessdata_dir_config)

linhas = text.split("\n")

for linha in linhas:
    if not linha.isspace() and len(linha) > 0:
        print(linha)
# Exibir o texto detectado
print("Texto detectado:")
print(text)

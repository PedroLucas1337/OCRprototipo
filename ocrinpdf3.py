import cv2
import pytesseract
from PIL import Image
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter


pytesseract.pytesseract.tesseract_cmd = r'C:\Users\pedrolucas\AppData\Local\Programs\Tesseract-OCR\Tesseract.exe'

# Função para detectar e recortar região de interesse (ROI) na imagem
def detect_and_crop_numbers(image_path):
    # Carrega a imagem usando OpenCV
    img = cv2.imread(image_path)

    # Converte a imagem para tons de cinza
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    # Aplica thresholding adaptativo para binarizar a imagem
    thresh = cv2.adaptiveThreshold(gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY_INV, 11, 2)

    # Encontra contornos na imagem binarizada
    contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    # Encontra o maior contorno (assumindo que seja a área dos números)
    max_contour = max(contours, key=cv2.contourArea)
    
    # Obtém as coordenadas do retângulo que envolve o maior contorno
    x, y, w, h = cv2.boundingRect(max_contour)

    # Recorta a região de interesse (ROI) da imagem original
    roi = img[y:y+h, x:x+w]

    # Salva a ROI temporariamente para visualização (opcional)
    cv2.imwrite("roi.jpg", roi)

    return roi

# Função para reconhecer texto em uma imagem
def recognize_text(image):
    # Usa o Tesseract para OCR na imagem
    text = pytesseract.image_to_string(Image.fromarray(image), config='--psm 6')

    return text

# Função para gerar PDF com o texto reconhecido
def generate_pdf(text, output_file):
    # Inicializa o canvas do PDF
    c = canvas.Canvas(output_file, pagesize=letter)
    
    # Configurações de fonte e tamanho
    c.setFont("Helvetica", 12)
    
    # Quebra o texto em linhas e escreve no PDF
    lines = text.split("\n")
    y = 750  # Posição inicial
    for line in lines:
        c.drawString(50, y, line)
        y -= 15  # Move para a próxima linha
    
    # Salva o PDF
    c.save()
    print(f"PDF gerado com sucesso: {output_file}")

# Função principal
def main():
    # Caminho da imagem de entrada
    image_path = 'balanca.png'

    try:
        # Detecta e recorta a região com os números
        numbers_region = detect_and_crop_numbers(image_path)

        # Reconhece o texto na região recortada
        recognized_text = recognize_text(numbers_region)
        
        # Mostra o texto reconhecido no console (para depuração)
        print("Texto reconhecido na região dos números:")
        print(recognized_text)
        
        # Gera o PDF com o texto reconhecido
        output_pdf = 'output.pdf'
        generate_pdf(recognized_text, output_pdf)
    
    except Exception as e:
        print(f"Erro ao processar imagem: {e}")

if __name__ == "__main__":
    main()

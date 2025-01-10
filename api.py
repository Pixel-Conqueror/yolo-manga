from flask import Flask, request, jsonify, send_file
from werkzeug.utils import secure_filename
import os
from flask_cors import CORS
import cv2
from ultralytics import YOLO
import pytesseract
from transformers import pipeline
from PIL import Image, ImageDraw, ImageFont

# Initialize Flask app
app = Flask(__name__)
CORS(app, resources={r"/upload": {"origins": "http://localhost:3000"}})  # Activer CORS pour /upload

# Configuration
UPLOAD_FOLDER = 'uploads'
RESULT_FOLDER = 'results'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(RESULT_FOLDER, exist_ok=True)

# Load models
ocr_model = pytesseract
translation_pipeline = pipeline("translation_en_to_fr", model="Helsinki-NLP/opus-mt-en-fr")
yolo_model = YOLO('best.pt')  # Replace with the path to your YOLO model

# Helper functions
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def extract_bubbles(image_path):
    """Use YOLO model to detect text bubbles in the image."""
    results = yolo_model(image_path)
    detections = results[0].boxes
    bubbles = []
    for box in detections:
        x1, y1, x2, y2 = map(int, box.xyxy[0].tolist())
        bubbles.append((x1, y1, x2, y2))
    return bubbles

def extract_text(image, bubbles):
    """Extract text from detected bubbles using OCR."""
    texts = []
    for bubble in bubbles:
        x1, y1, x2, y2 = bubble
        cropped = image[y1:y2, x1:x2]
        text = ocr_model.image_to_string(cropped, lang='eng')
        texts.append((bubble, text))
    return texts

def translate_texts(texts):
    """Translate extracted texts."""
    translations = []
    for bubble, text in texts:
        cleaned_text = text.strip().replace('\n', ' ')
        translated = translation_pipeline(cleaned_text)[0]['translation_text']
        translations.append((bubble, translated))
    return translations

def insert_translations(image, translations):
    """Overlay translated texts back into the bubbles."""
    draw = ImageDraw.Draw(image)
    font = ImageFont.load_default()

    for bubble, text in translations:
        x1, y1, x2, y2 = bubble
        draw.rectangle([(x1, y1), (x2, y2)], outline="black", width=2)
        draw.text((x1 + 5, y1 + 5), text, fill="black", font=font)

    return image

# Routes
@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        file_path = os.path.join(UPLOAD_FOLDER, filename)
        file.save(file_path)

        # Process the image
        image = cv2.imread(file_path)
        bubbles = extract_bubbles(file_path)
        texts = extract_text(image, bubbles)
        translations = translate_texts(texts)

        pil_image = Image.open(file_path)
        result_image = insert_translations(pil_image, translations)

        result_path = os.path.join(RESULT_FOLDER, filename)
        result_image.save(result_path)

        return send_file(result_path, as_attachment=True)
    else:
        return jsonify({"error": "File type not allowed"}), 400

if __name__ == '__main__':
    app.run(debug=True)

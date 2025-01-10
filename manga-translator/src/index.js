import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import './styles.css';

const App = () => {
  const [image, setImage] = useState(null);
  const [translatedImage, setTranslatedImage] = useState(null);
  const [file, setFile] = useState(null); // Stocker le fichier original

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setImage(imageUrl);
      setFile(file); // Stocker le fichier pour la requête
      setTranslatedImage(null); // Réinitialiser l'image traduite
    }
  };

  const handleTranslate = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://127.0.0.1:5000/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        console.error('Erreur lors de la requête vers l\'API :', response);
        throw new Error('Erreur lors de la traduction de l\'image');
      }

      // Lire le contenu binaire de l'image
      const blob = await response.blob();
      const translatedImageUrl = URL.createObjectURL(blob);
      setTranslatedImage(translatedImageUrl);
    } catch (error) {
      console.error('Erreur lors de la requête vers l\'API :', error);
      alert('Une erreur est survenue lors de la traduction de l\'image.');
    }
  };

  const handleDownload = () => {
    if (translatedImage) {
      const link = document.createElement('a');
      link.href = translatedImage;
      link.download = 'translated-image.png';
      link.click();
    }
  };

  return (
    <div className="app-container">
      <header className="header">
        <h1>Manga Translator</h1>
        <p>Traduisez vos scans préférés en un clic !</p>
      </header>
      <main className="main-content">
        <div className="buttons-section">
          <label className="upload-label">
            Importer une image
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="upload-input"
            />
          </label>
          <button
            className="translate-button"
            onClick={handleTranslate}
            disabled={!image}
          >
            Traduire l'image
          </button>
          <button
            className="download-button"
            onClick={handleDownload}
            disabled={!translatedImage}
          >
            Télécharger l'image traduite
          </button>
        </div>
        <div className="images-container">
          {image && (
            <div className="image-preview">
              <h2>Image originale :</h2>
              <img src={image} alt="Uploaded" />
            </div>
          )}
          {translatedImage && (
            <div className="image-preview">
              <h2>Image traduite :</h2>
              <img src={translatedImage} alt="Translated" />
            </div>
          )}
        </div>
      </main>
      <footer className="footer">
        <p>&copy; Pixel Conqueror 2025. Tous droits réservés.</p>
      </footer>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);

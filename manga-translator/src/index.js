import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import './styles.css';

const App = () => {
  const [image, setImage] = useState(null);
  const [translatedImage, setTranslatedImage] = useState(null);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setImage(imageUrl);
      setTranslatedImage(null); // Réinitialiser l'image traduite
    }
  };

  const handleTranslate = () => {
    setTimeout(() => {
      setTranslatedImage(
        'https://www.mangaread.org/wp-content/uploads/WP-manga/data/manga_5db9315acf069/e3448963f2f35d0b5e1e02d90d48acdd/10.jpeg'
      );
    }, 2000); // Simulation de délai (2 secondes)
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

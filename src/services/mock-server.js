// mock-server.js
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());

app.post('/api/mock/analyze', upload.single('image'), (req, res) => {
  const faceShapes = ['Oval', 'Round', 'Square', 'Heart', 'Diamond'];
  const skinTones = ['Fair', 'Light', 'Medium', 'Olive', 'Tan', 'Dark'];
  
  res.json({
    success: true,
    timestamp: new Date().toISOString(),
    analysis: {
      faceShape: faceShapes[Math.floor(Math.random() * faceShapes.length)],
      skinTone: skinTones[Math.floor(Math.random() * skinTones.length)],
      confidence: (Math.random() * 0.3 + 0.7).toFixed(2),
    },
    recommendations: {
      jewelry: ['Minimalist necklace', 'Stud earrings', 'Thin bracelet'],
      colors: ['Navy blue', 'Sage green', 'Cream white'],
    }
  });
});

app.listen(3001, () => {
  console.log('Mock server running on http://localhost:3001');
});
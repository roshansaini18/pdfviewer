const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json()); // For parsing JSON data
app.use(express.static('uploads'));

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf' || file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF and image files are allowed'), false);
  }
};

const upload = multer({ storage, fileFilter });

// In-memory storage for metadata (can be replaced with a database)
let filesData = [];

// Upload route for PDF and cover image
app.post('/upload', upload.fields([{ name: 'file' }, { name: 'cover' }]), (req, res) => {
  const { title, writer } = req.body;
  
  if (!req.files || !req.files.file || !req.files.cover) {
    return res.status(400).json({ message: 'Both PDF and cover image are required' });
  }

  const fileData = {
    id: Date.now(),
    fileName: req.files.file[0].filename,
    coverImage: req.files.cover[0].filename,
    title,
    writer,
    fileUrl: `http://localhost:5000/${req.files.file[0].filename}`,
    coverUrl: `http://localhost:5000/${req.files.cover[0].filename}`,
  };

  filesData.push(fileData);
  res.json({ message: 'File uploaded successfully', file: fileData });
});

// Route to get all uploaded files with metadata
app.get('/files', (req, res) => {
  res.json(filesData);
});

// Start the server
app.listen(5000, () => {
  console.log('Server is running on http://localhost:5000');
});

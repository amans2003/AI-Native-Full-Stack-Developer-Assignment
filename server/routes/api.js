const express = require('express');
const multer = require('multer');
const { protect } = require('../middleware/auth');
const authController = require('../controllers/authController');
const documentController = require('../controllers/documentController');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Authentication Routes
router.post('/auth/login', authController.login);
router.get('/auth/me', protect, authController.getMe);
router.get('/auth/users', protect, authController.getUsers);

// Document CRUD & Share Routes
router.get('/documents', protect, documentController.getDocuments);
router.get('/documents/:id', protect, documentController.getDocumentById);
router.post('/documents', protect, documentController.createDocument);
router.put('/documents/:id', protect, documentController.updateDocument);
router.delete('/documents/:id', protect, documentController.deleteDocument);
router.post('/documents/:id/share', protect, documentController.shareDocument);

// File Upload Route
router.post('/upload', protect, upload.single('file'), documentController.uploadDocument);

module.exports = router;

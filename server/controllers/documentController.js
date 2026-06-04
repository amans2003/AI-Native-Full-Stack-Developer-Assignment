const documentService = require('../services/documentService');

const getDocuments = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const documents = await documentService.getDocumentsForUser(userId);
    res.status(200).json(documents);
  } catch (error) {
    next(error);
  }
};

const getDocumentById = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const docId = req.params.id;
    const document = await documentService.getDocumentById(docId, userId);
    res.status(200).json(document);
  } catch (error) {
    const status = error.status || 500;
    res.status(status).json({ message: error.message });
  }
};

const createDocument = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { title, content } = req.body;
    const document = await documentService.createDocument(userId, title, content);
    res.status(201).json(document);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateDocument = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const docId = req.params.id;
    const { title, content } = req.body;
    const document = await documentService.updateDocument(docId, userId, { title, content });
    res.status(200).json(document);
  } catch (error) {
    const status = error.status || 400;
    res.status(status).json({ message: error.message });
  }
};

const deleteDocument = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const docId = req.params.id;
    const result = await documentService.deleteDocument(docId, userId);
    res.status(200).json(result);
  } catch (error) {
    const status = error.status || 400;
    res.status(status).json({ message: error.message });
  }
};

const shareDocument = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const docId = req.params.id;
    const { email } = req.body;
    const document = await documentService.shareDocument(docId, userId, email);
    res.status(200).json(document);
  } catch (error) {
    const status = error.status || 400;
    res.status(status).json({ message: error.message });
  }
};

const uploadDocument = async (req, res, next) => {
  try {
    const userId = req.user.id;
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    const document = await documentService.createDocumentFromUpload(
      userId,
      req.file.originalname,
      req.file.buffer
    );
    res.status(201).json(document);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  getDocuments,
  getDocumentById,
  createDocument,
  updateDocument,
  deleteDocument,
  shareDocument,
  uploadDocument,
};

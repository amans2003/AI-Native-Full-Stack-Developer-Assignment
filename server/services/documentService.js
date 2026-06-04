const Document = require('../models/Document');
const authService = require('./authService');
const path = require('path');

const createDocument = async (userId, title = 'Untitled Document', content = '') => {
  if (!title || title.trim() === '') {
    throw new Error('Document title cannot be empty');
  }

  const document = new Document({
    title: title.trim(),
    content,
    owner: userId,
    sharedWith: [],
  });

  return document.save();
};

const getDocumentsForUser = async (userId) => {
  const owned = await Document.find({ owner: userId }).sort({ updatedAt: -1 });
  const shared = await Document.find({ sharedWith: userId })
    .populate('owner', 'email name')
    .sort({ updatedAt: -1 });

  return { owned, shared };
};

const getDocumentById = async (docId, userId) => {
  const document = await Document.findById(docId)
    .populate('owner', 'email name')
    .populate('sharedWith', 'email name');

  if (!document) {
    const error = new Error('Document not found');
    error.status = 404;
    throw error;
  }

  const isOwner = document.owner._id.toString() === userId.toString();
  const isShared = document.sharedWith.some(
    (user) => user._id.toString() === userId.toString()
  );

  if (!isOwner && !isShared) {
    const error = new Error('Not authorized to access this document');
    error.status = 403;
    throw error;
  }

  return document;
};

const updateDocument = async (docId, userId, updateData) => {
  const document = await Document.findById(docId);

  if (!document) {
    const error = new Error('Document not found');
    error.status = 404;
    throw error;
  }

  const isOwner = document.owner.toString() === userId.toString();
  const isShared = document.sharedWith.some(
    (id) => id.toString() === userId.toString()
  );

  if (!isOwner && !isShared) {
    const error = new Error('Not authorized to edit this document');
    error.status = 403;
    throw error;
  }

  if (updateData.title !== undefined) {
    if (!updateData.title || updateData.title.trim() === '') {
      throw new Error('Document title cannot be empty');
    }
    document.title = updateData.title.trim();
  }

  if (updateData.content !== undefined) {
    document.content = updateData.content;
  }

  return document.save();
};

const deleteDocument = async (docId, userId) => {
  const document = await Document.findById(docId);

  if (!document) {
    const error = new Error('Document not found');
    error.status = 404;
    throw error;
  }

  const isOwner = document.owner.toString() === userId.toString();
  if (!isOwner) {
    const error = new Error('Only the document owner can delete this document');
    error.status = 403;
    throw error;
  }

  await Document.findByIdAndDelete(docId);
  return { message: 'Document deleted successfully' };
};

const shareDocument = async (docId, ownerId, targetEmail) => {
  const document = await Document.findById(docId);

  if (!document) {
    const error = new Error('Document not found');
    error.status = 404;
    throw error;
  }

  const isOwner = document.owner.toString() === ownerId.toString();
  if (!isOwner) {
    const error = new Error('Only the document owner can share this document');
    error.status = 403;
    throw error;
  }

  if (!targetEmail || targetEmail.trim() === '') {
    throw new Error('Sharing email is required');
  }

  const targetUser = await authService.findUserByEmail(targetEmail.trim().toLowerCase());
  if (!targetUser) {
    const error = new Error('User not found');
    error.status = 404;
    throw error;
  }

  if (targetUser._id.toString() === ownerId.toString()) {
    throw new Error('You cannot share a document with yourself');
  }

  const isAlreadyShared = document.sharedWith.some(
    (id) => id.toString() === targetUser._id.toString()
  );

  if (isAlreadyShared) {
    throw new Error('Document already shared with this user');
  }

  document.sharedWith.push(targetUser._id);
  await document.save();

  return Document.findById(docId)
    .populate('owner', 'email name')
    .populate('sharedWith', 'email name');
};

const createDocumentFromUpload = async (userId, originalName, fileBuffer) => {
  const ext = path.extname(originalName).toLowerCase();
  if (ext !== '.txt' && ext !== '.md') {
    throw new Error('Unsupported file format. Only .txt and .md files are supported.');
  }

  const content = fileBuffer.toString('utf8');
  const title = path.basename(originalName, ext);

  return createDocument(userId, title, content);
};

module.exports = {
  createDocument,
  getDocumentsForUser,
  getDocumentById,
  updateDocument,
  deleteDocument,
  shareDocument,
  createDocumentFromUpload,
};

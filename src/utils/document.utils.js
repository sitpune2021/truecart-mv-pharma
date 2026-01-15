const path = require('path');
const fs = require('fs').promises;
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');

/**
 * Process uploaded documents (PDFs, images, etc.)
 */
async function processDocuments(files) {
  if (!files || files.length === 0) {
    return [];
  }

  const uploadDir = process.env.UPLOAD_PATH || path.join(__dirname, '../../uploads');
  const documentsDir = path.join(uploadDir, 'documents');

  // Ensure documents directory exists
  try {
    await fs.access(documentsDir);
  } catch {
    await fs.mkdir(documentsDir, { recursive: true });
  }

  const processedDocuments = [];

  for (const file of files) {
    try {
      const fileExt = path.extname(file.originalname);
      const fileName = `${uuidv4()}${fileExt}`;
      const filePath = path.join(documentsDir, fileName);

      // Move file to documents directory
      await fs.rename(file.path, filePath);

      // Create document metadata
      const documentInfo = {
        originalName: file.originalname,
        fileName: fileName,
        path: `/uploads/documents/${fileName}`,
        mimeType: file.mimetype,
        size: file.size,
        uploadedAt: new Date().toISOString()
      };

      processedDocuments.push(documentInfo);
    } catch (error) {
      console.error('Error processing document:', error);
      // Continue with other files even if one fails
    }
  }

  return processedDocuments;
}

/**
 * Delete documents from filesystem
 */
async function deleteDocuments(documentPaths) {
  if (!documentPaths || documentPaths.length === 0) {
    return;
  }

  const uploadDir = process.env.UPLOAD_PATH || path.join(__dirname, '../../uploads');

  for (const docPath of documentPaths) {
    try {
      // Extract filename from path
      const fileName = docPath.replace('/uploads/documents/', '');
      const filePath = path.join(uploadDir, 'documents', fileName);

      // Check if file exists
      await fs.access(filePath);
      
      // Delete file
      await fs.unlink(filePath);
    } catch (error) {
      console.error('Error deleting document:', error);
      // Continue with other files even if one fails
    }
  }
}

module.exports = {
  processDocuments,
  deleteDocuments
};

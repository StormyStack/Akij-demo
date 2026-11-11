const express = require('express');
const router = express.Router();
const { uploadImageToAzureBlob, ASSETS_CONTAINER_NAME } = require('../services/blobUploadService');

// POST /api/upload - Upload static image directly into Azure Blob Storage container
router.post('/', async (req, res) => {
  const { filename, contentType, base64Data } = req.body;

  if (!base64Data) {
    return res.status(400).json({
      success: false,
      message: 'Missing base64Data in request payload'
    });
  }

  try {
    const result = await uploadImageToAzureBlob({
      filename: filename || 'bakery_product.jpg',
      contentType: contentType || 'image/jpeg',
      base64Data
    });

    res.status(201).json({
      success: true,
      message: 'Image uploaded successfully to Azure Blob Storage!',
      data: result,
      url: result.url
    });
  } catch (err) {
    console.error('Error uploading to Azure Blob Storage:', err.message);
    res.status(500).json({
      success: false,
      message: `Azure Blob upload failed: ${err.message}`,
      error: err.message
    });
  }
});

// GET /api/upload/info - Check assets container configuration
router.get('/info', (req, res) => {
  res.json({
    success: true,
    container: ASSETS_CONTAINER_NAME,
    configured: !!process.env.AZURE_STORAGE_CONNECTION_STRING
  });
});

module.exports = router;

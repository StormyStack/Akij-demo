const { BlobServiceClient } = require('@azure/storage-blob');
const logger = require('../config/logger');
require('dotenv').config();

const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING || '';
const ASSETS_CONTAINER_NAME = process.env.AZURE_ASSETS_CONTAINER_NAME || 'assets';

async function uploadImageToAzureBlob({ filename, contentType, base64Data }) {
  if (!AZURE_STORAGE_CONNECTION_STRING) {
    throw new Error('Azure Storage Connection String is not configured in backend .env');
  }

  if (!base64Data) {
    throw new Error('No image data provided for upload');
  }

  // Clean filename and make it unique
  const ext = (filename && filename.includes('.')) ? filename.split('.').pop().toLowerCase() : 'jpg';
  const cleanBaseName = filename ? filename.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase() : 'bakery_item';
  const uniqueBlobName = `${cleanBaseName}_${Date.now()}.${ext}`;

  // Convert base64 to Buffer
  const buffer = Buffer.from(base64Data, 'base64');

  logger.info(`[Azure Blob Upload] Uploading ${uniqueBlobName} (${(buffer.length / 1024).toFixed(1)} KB) to container "${ASSETS_CONTAINER_NAME}"...`, {
    BlobName: uniqueBlobName,
    Container: ASSETS_CONTAINER_NAME,
    SizeKb: (buffer.length / 1024).toFixed(1)
  });

  const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
  const containerClient = blobServiceClient.getContainerClient(ASSETS_CONTAINER_NAME);

  // Ensure assets container exists
  await containerClient.createIfNotExists();

  const blockBlobClient = containerClient.getBlockBlobClient(uniqueBlobName);

  await blockBlobClient.uploadData(buffer, {
    blobHTTPHeaders: {
      blobContentType: contentType || `image/${ext === 'jpg' ? 'jpeg' : ext}`,
      blobCacheControl: 'public, max-age=31536000',
    },
    metadata: {
      uploadedBy: 'AkijBakersERPFrontend',
      originalName: filename || uniqueBlobName,
      uploadedAt: new Date().toISOString(),
    }
  });

  logger.info(`[Azure Blob Upload] Successfully uploaded to Azure Blob: ${blockBlobClient.url} ☁️`, {
    Url: blockBlobClient.url,
    Container: ASSETS_CONTAINER_NAME
  });

  return {
    success: true,
    url: blockBlobClient.url,
    filename: uniqueBlobName,
    container: ASSETS_CONTAINER_NAME,
    sizeBytes: buffer.length,
    sizeKb: (buffer.length / 1024).toFixed(1),
  };
}

module.exports = {
  uploadImageToAzureBlob,
  ASSETS_CONTAINER_NAME
};

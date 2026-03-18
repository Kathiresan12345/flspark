// This file is a placeholder for AWS S3 or Firebase Storage configuration
// In local development, we use Multer disk storage.

const storageConfig = {
  provider: process.env.STORAGE_PROVIDER || 'local',
  bucket: process.env.STORAGE_BUCKET,
  region: process.env.STORAGE_REGION,
};

module.exports = storageConfig;

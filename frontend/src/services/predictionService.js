/**
 * Prediction Service Module
 * Handles API operations for health checks, model metadata, and waste classification.
 * Strictly consumes the FastAPI backend endpoints:
 *   - GET /
 *   - GET /model-info
 *   - POST /predict
 */

import { apiRequest } from './api';

/**
 * Health Check: Verifies backend availability.
 * Endpoint: GET /
 *
 * @returns {Promise<{ status: string, message: string }>}
 */
export async function checkHealth() {
  return await apiRequest('/', {
    method: 'GET',
  });
}

/**
 * Model Metadata: Fetches architecture, supported classes, input size, and accuracy.
 * Endpoint: GET /model-info
 *
 * @returns {Promise<{
 *   model_architecture: string,
 *   supported_waste_categories: string[],
 *   total_classes: number,
 *   input_image_dimensions: { width: number, height: number, channels: number },
 *   device: string,
 *   saved_validation_accuracy: number
 * }>}
 */
export async function getModelInfo() {
  return await apiRequest('/model-info', {
    method: 'GET',
  });
}

/**
 * Waste Image Classification: Uploads image file via multipart/form-data.
 * Endpoint: POST /predict
 *
 * Important:
 * - Uses FormData to upload binary file.
 * - Does NOT manually set the multipart Content-Type header.
 * - Returns the exact response from the PyTorch ResNet18 model.
 *
 * @param {File | Blob} file - The image file to classify (JPEG, PNG, WEBP, BMP <= 10MB)
 * @param {string} [fileName] - Optional custom filename if file is a Blob
 * @param {number} [weightKg] - Optional waste weight in kilograms
 * @returns {Promise<{
 *   success: boolean,
 *   scan_id?: number,
 *   image_url?: string,
 *   filename: string,
 *   predicted_class: string,
 *   confidence: number,
 *   confidence_percentage: number,
 *   top_predictions: Array<{ class: string, confidence: number }>,
 *   recycling_category?: string,
 *   disposal_recommendation?: string
 * }>}
 */
export async function predictImage(file, fileName, weightKg) {
  if (!file) {
    throw new Error('A valid image file must be provided for classification.');
  }

  const formData = new FormData();
  const nameToUse = fileName || file.name || 'waste_image.jpg';
  formData.append('file', file, nameToUse);

  if (weightKg !== undefined && weightKg !== null && !isNaN(weightKg)) {
    formData.append('weight_kg', String(weightKg));
  }

  // apiRequest detects FormData and omits 'Content-Type' so the browser
  // automatically calculates the multipart boundary
  const result = await apiRequest('/predict', {
    method: 'POST',
    body: formData,
  });

  return result;
}

export default {
  checkHealth,
  getModelInfo,
  predictImage,
};

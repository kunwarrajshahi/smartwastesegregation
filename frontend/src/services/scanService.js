/**
 * Scan Telemetry Service Module
 * Handles persistent scan fetching, searching, category filtering, verification, and deletion.
 */

import { apiRequest } from './api';

/**
 * Get paginated scans list with optional filtering and search.
 * Endpoint: GET /api/scans
 */
export async function getScans({
  page = 1,
  limit = 10,
  search = '',
  category = '',
  user_only = false,
} = {}) {
  const params = new URLSearchParams();
  if (page) params.append('page', String(page));
  if (limit) params.append('limit', String(limit));
  if (search && search.trim()) params.append('search', search.trim());
  if (category && category.trim() && category !== 'All' && category !== 'All Categories') {
    params.append('category', category.trim());
  }
  if (user_only) params.append('user_only', 'true');

  const query = params.toString() ? `?${params.toString()}` : '';
  return await apiRequest(`/api/scans${query}`, {
    method: 'GET',
  });
}

/**
 * Get a single scan by ID.
 * Endpoint: GET /api/scans/{id}
 */
export async function getScanById(id) {
  return await apiRequest(`/api/scans/${id}`, {
    method: 'GET',
  });
}

/**
 * Update verification status of a scan.
 * Endpoint: PATCH /api/scans/{id}/verify
 */
export async function verifyScan(id, { verified_class, notes = '' }) {
  return await apiRequest(`/api/scans/${id}/verify`, {
    method: 'PATCH',
    body: JSON.stringify({ verified_class, notes }),
  });
}

/**
 * Delete a scan by ID.
 * Endpoint: DELETE /api/scans/{id}
 */
export async function deleteScan(id) {
  return await apiRequest(`/api/scans/${id}`, {
    method: 'DELETE',
  });
}

export default {
  getScans,
  getScanById,
  verifyScan,
  deleteScan,
};

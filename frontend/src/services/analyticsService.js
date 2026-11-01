/**
 * Analytics and Environmental Reporting Service
 * Connects frontend widgets to real dynamic database telemetry,
 * transparent CO2e formulas, EPA equivalents, and CSV exports.
 */

import { apiRequest, API_BASE_URL } from './api';
import { TOKEN_STORAGE_KEY } from './authService';

/**
 * Get aggregate overview KPIs.
 * Endpoint: GET /api/analytics/overview
 */
export async function getOverview(userOnly = false) {
  const query = userOnly ? '?user_only=true' : '';
  return await apiRequest(`/api/analytics/overview${query}`, {
    method: 'GET',
  });
}

/**
 * Get category-wise distribution breakdown.
 * Endpoint: GET /api/analytics/categories
 */
export async function getCategoryDistribution(userOnly = false) {
  const query = userOnly ? '?user_only=true' : '';
  return await apiRequest(`/api/analytics/categories${query}`, {
    method: 'GET',
  });
}

/**
 * Get verified environmental impact and EPA equivalent statistics.
 * Endpoint: GET /api/analytics/environmental
 */
export async function getEnvironmentalImpact(userOnly = false) {
  const query = userOnly ? '?user_only=true' : '';
  return await apiRequest(`/api/analytics/environmental${query}`, {
    method: 'GET',
  });
}

/**
 * Get temporal activity trends.
 * Endpoint: GET /api/analytics/trends
 * @param {'daily' | 'weekly' | 'monthly'} timeframe
 * @param {boolean} userOnly
 */
export async function getTrends(timeframe = 'weekly', userOnly = false) {
  const params = new URLSearchParams();
  if (timeframe) params.append('timeframe', timeframe);
  if (userOnly) params.append('user_only', 'true');

  const query = params.toString() ? `?${params.toString()}` : '';
  return await apiRequest(`/api/analytics/trends${query}`, {
    method: 'GET',
  });
}

/**
 * Trigger CSV export download directly in the browser.
 */
export async function downloadCsvExport(userOnly = false) {
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem(TOKEN_STORAGE_KEY) : null;
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const query = userOnly ? '?user_only=true' : '';
  const url = `${API_BASE_URL}/api/analytics/export${query}`;

  const response = await fetch(url, { headers });
  if (!response.ok) {
    throw new Error(`Failed to export data: ${response.statusText}`);
  }

  const blob = await response.blob();
  const downloadUrl = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = downloadUrl;
  a.download = `waste_scans_export_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(downloadUrl);
}

/**
 * Get system recycling rules.
 * Endpoint: GET /api/recycling/rules
 */
export async function getRecyclingRules() {
  return await apiRequest('/api/recycling/rules', {
    method: 'GET',
  });
}

export default {
  getOverview,
  getCategoryDistribution,
  getEnvironmentalImpact,
  getTrends,
  downloadCsvExport,
  getRecyclingRules,
};

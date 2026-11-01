/**
 * System Settings & Recycling Rules Service
 * Manages edge AI inference parameters, actuator delays, safety interlocks,
 * and customizable recycling rules.
 */

import { apiRequest } from './api';

const SETTINGS_STORAGE_KEY = 'ecosort_system_settings';

export const DEFAULT_SETTINGS = {
  model_type: 'yolov11n-seg',
  confidence_threshold: 85,
  actuator_delay_ms: 140,
  enable_pneumatic_diversion: true,
  hazard_alert_sound: true,
  auto_save_telemetry: true,
};

/**
 * Get system settings. Tries backend GET /api/settings first,
 * with localStorage fallback.
 */
export async function getSettings() {
  try {
    const data = await apiRequest('/api/settings', { method: 'GET' });
    if (data && typeof data === 'object') {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(data));
      return data;
    }
  } catch (err) {
    console.warn('Backend settings fetch failed, using local storage:', err);
  }

  const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // ignore
    }
  }

  return DEFAULT_SETTINGS;
}

/**
 * Update system settings in backend and localStorage.
 */
export async function updateSettings(settings) {
  localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));

  try {
    const updated = await apiRequest('/api/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
    return updated;
  } catch (err) {
    console.warn('Backend settings update failed, saved locally:', err);
    return settings;
  }
}

/**
 * Reset settings to defaults.
 */
export async function resetSettings() {
  localStorage.removeItem(SETTINGS_STORAGE_KEY);
  try {
    const reset = await apiRequest('/api/settings/reset', { method: 'POST' });
    return reset;
  } catch (err) {
    return DEFAULT_SETTINGS;
  }
}

/**
 * Update a specific recycling rule.
 * Endpoint: PUT /api/recycling/rules/{category_key}
 */
export async function updateRecyclingRule(categoryKey, ruleData) {
  return await apiRequest(`/api/recycling/rules/${categoryKey}`, {
    method: 'PUT',
    body: JSON.stringify(ruleData),
  });
}

export default {
  getSettings,
  updateSettings,
  resetSettings,
  updateRecyclingRule,
  DEFAULT_SETTINGS,
};

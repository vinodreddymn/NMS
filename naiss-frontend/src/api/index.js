import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3005/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Device Types API
export const deviceTypeAPI = {
  getAll: (limit = 100, offset = 0) => api.get(`/device-types?limit=${limit}&offset=${offset}`),
  getById: (id) => api.get(`/device-types/${id}`),
  create: (data) => api.post('/device-types', data),
  update: (id, data) => api.put(`/device-types/${id}`, data),
  delete: (id) => api.delete(`/device-types/${id}`)
};

// Devices API
export const deviceAPI = {
  getAll: (limit = 100, offset = 0) => api.get(`/devices?limit=${limit}&offset=${offset}`),
  getById: (id) => api.get(`/devices/${id}`),
  search: (query, limit = 100, offset = 0) => api.get(`/devices/search?q=${query}&limit=${limit}&offset=${offset}`),
  getByPole: (poleId, limit = 100, offset = 0) => api.get(`/devices/by-pole/${poleId}?limit=${limit}&offset=${offset}`),
  getBySwitch: (switchId, limit = 100, offset = 0) => api.get(`/devices/by-switch/${switchId}?limit=${limit}&offset=${offset}`),
  getByDeviceType: (typeId, limit = 100, offset = 0) => api.get(`/devices/by-type/${typeId}?limit=${limit}&offset=${offset}`),
  create: (data) => api.post('/devices', data),
  update: (id, data) => api.put(`/devices/${id}`, data),
  delete: (id) => api.delete(`/devices/${id}`)
};

// Poles API
export const poleAPI = {
  getAll: (limit = 100, offset = 0) => api.get(`/poles?limit=${limit}&offset=${offset}`),
  getById: (id) => api.get(`/poles/${id}`),
  getByRegulator: (regulatorId, limit = 100, offset = 0) => api.get(`/poles/by-regulator/${regulatorId}?limit=${limit}&offset=${offset}`),
  getByPhase: (phase, limit = 100, offset = 0) => api.get(`/poles/by-phase/${phase}?limit=${limit}&offset=${offset}`),
  create: (data) => api.post('/poles', data),
  update: (id, data) => api.put(`/poles/${id}`, data),
  delete: (id) => api.delete(`/poles/${id}`)
};

// Switches API
export const switchAPI = {
  getAll: (limit = 100, offset = 0) => api.get(`/switches?limit=${limit}&offset=${offset}`),
  getById: (id) => api.get(`/switches/${id}`),
  getByPole: (poleId, limit = 100, offset = 0) => api.get(`/switches/by-pole/${poleId}?limit=${limit}&offset=${offset}`),
  getChildren: (parentId, limit = 100, offset = 0) => api.get(`/switches/children/${parentId}?limit=${limit}&offset=${offset}`),
  create: (data) => api.post('/switches', data),
  update: (id, data) => api.put(`/switches/${id}`, data),
  delete: (id) => api.delete(`/switches/${id}`)
};

// Substations API
export const substationAPI = {
  getAll: (limit = 100, offset = 0) => api.get(`/substations?limit=${limit}&offset=${offset}`),
  getById: (id) => api.get(`/substations/${id}`),
  create: (data) => api.post('/substations', data),
  update: (id, data) => api.put(`/substations/${id}`, data),
  delete: (id) => api.delete(`/substations/${id}`)
};

// Voltage Regulators API
export const regulatorAPI = {
  getAll: (limit = 100, offset = 0) => api.get(`/voltage-regulators?limit=${limit}&offset=${offset}`),
  getById: (id) => api.get(`/voltage-regulators/${id}`),
  getBySubstation: (substationId, limit = 100, offset = 0) => api.get(`/voltage-regulators/by-substation/${substationId}?limit=${limit}&offset=${offset}`),
  create: (data) => api.post('/voltage-regulators', data),
  update: (id, data) => api.put(`/voltage-regulators/${id}`, data),
  delete: (id) => api.delete(`/voltage-regulators/${id}`)
};

// Alarm Events API
export const alarmAPI = {
  getAll: (limit = 100, offset = 0) => api.get(`/alarm-events?limit=${limit}&offset=${offset}`),
  getById: (id) => api.get(`/alarm-events/${id}`),
  getActive: (limit = 100, offset = 0) => api.get(`/alarm-events/active?limit=${limit}&offset=${offset}`),
  getByDevice: (deviceId, limit = 100, offset = 0) => api.get(`/alarm-events/by-device/${deviceId}?limit=${limit}&offset=${offset}`),
  getBySeverity: (severity, limit = 100, offset = 0) => api.get(`/alarm-events/by-severity/${severity}?limit=${limit}&offset=${offset}`),
  getByEventType: (eventType, limit = 100, offset = 0) => api.get(`/alarm-events/by-type/${eventType}?limit=${limit}&offset=${offset}`),
  create: (data) => api.post('/alarm-events', data),
  update: (id, data) => api.put(`/alarm-events/${id}`, data),
  acknowledge: (id, acknowledgedBy) => api.post(`/alarm-events/${id}/acknowledge`, { acknowledged_by: acknowledgedBy }),
  delete: (id) => api.delete(`/alarm-events/${id}`)
};

// Device Status Logs API
export const deviceStatusLogAPI = {
  getAll: (limit = 100, offset = 0) => api.get(`/device-status-logs?limit=${limit}&offset=${offset}`),
  getById: (id) => api.get(`/device-status-logs/${id}`),
  getByDevice: (deviceId, limit = 100, offset = 0) => api.get(`/device-status-logs/by-device/${deviceId}?limit=${limit}&offset=${offset}`),
  getLatest: (deviceId) => api.get(`/device-status-logs/latest/${deviceId}`),
  getByDateRange: (startDate, endDate, limit = 100, offset = 0) =>
    api.get(`/device-status-logs/date-range?startDate=${startDate}&endDate=${endDate}&limit=${limit}&offset=${offset}`),
  getMetrics: (deviceId, days = 7) => api.get(`/device-status-logs/metrics/${deviceId}?days=${days}`),
  create: (data) => api.post('/device-status-logs', data),
  delete: (id) => api.delete(`/device-status-logs/${id}`)
};

// Power Status Logs API
export const powerStatusLogAPI = {
  getAll: (limit = 100, offset = 0) => api.get(`/power-status-logs?limit=${limit}&offset=${offset}`),
  getById: (id) => api.get(`/power-status-logs/${id}`),
  getBySubstation: (substationId, limit = 100, offset = 0) => api.get(`/power-status-logs/by-substation/${substationId}?limit=${limit}&offset=${offset}`),
  getByRegulator: (regulatorId, limit = 100, offset = 0) => api.get(`/power-status-logs/by-regulator/${regulatorId}?limit=${limit}&offset=${offset}`),
  getByPole: (poleId, limit = 100, offset = 0) => api.get(`/power-status-logs/by-pole/${poleId}?limit=${limit}&offset=${offset}`),
  getLatest: (substationId) => api.get(`/power-status-logs/latest/${substationId}`),
  getByDateRange: (startDate, endDate, limit = 100, offset = 0) =>
    api.get(`/power-status-logs/date-range?startDate=${startDate}&endDate=${endDate}&limit=${limit}&offset=${offset}`),
  getOutages: (limit = 100, offset = 0) => api.get(`/power-status-logs/outages?limit=${limit}&offset=${offset}`),
  getMetrics: (substationId, days = 7) => api.get(`/power-status-logs/metrics/${substationId}?days=${days}`),
  create: (data) => api.post('/power-status-logs', data),
  delete: (id) => api.delete(`/power-status-logs/${id}`)
};

export default api;

import api from './client';

export async function getGa4Status(projectId) {
  const { data } = await api.get(`/projects/${projectId}/ga4/status`);
  return data;
}

export async function connectGa4(projectId) {
  const { data } = await api.get(`/projects/${projectId}/ga4/connect`);
  return data;
}

export async function getGa4Properties(projectId) {
  const { data } = await api.get(`/projects/${projectId}/ga4/properties`);
  return data;
}

export async function selectGa4Property(projectId, propertyId) {
  const { data } = await api.post(`/projects/${projectId}/ga4/property`, { propertyId });
  return data;
}

export async function getGa4Report(projectId, params = {}) {
  const { data } = await api.get(`/projects/${projectId}/ga4/report`, { params });
  return data;
}

export async function disconnectGa4(projectId) { const { data } = await api.post(`/projects/${projectId}/ga4/disconnect`); return data; }

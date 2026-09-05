import api from "./client";

export async function getGscStatus(projectId) {
  const { data } = await api.get(`/projects/${projectId}/gsc/status`);
  return data;
}

export async function connectGsc(projectId) {
  const { data } = await api.get(`/projects/${projectId}/gsc/connect`);
  return data;
}

export async function getGscPerformance(projectId, params = {}) {
  const { data } = await api.get(`/projects/${projectId}/gsc/performance`, {
    params,
  });
  return data;
}

export async function syncGscHistory(projectId, params = {}) {
  const { data } = await api.post(`/projects/${projectId}/gsc/history/sync`, {}, { params });
  return data;
}

export async function getGscHistory(projectId, params = {}) {
  const { data } = await api.get(`/projects/${projectId}/gsc/history`, { params });
  return data;
}

// Backward-compatible alias for older page builds/imports.
export async function syncPerformanceHistory(projectId, params = {}) {
  return syncGscHistory(projectId, params);
}

export async function disconnectGsc(projectId) { const { data } = await api.post(`/projects/${projectId}/gsc/disconnect`); return data; }

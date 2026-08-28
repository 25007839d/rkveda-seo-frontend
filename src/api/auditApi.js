import api from "./client";

export async function getAudits(projectId) {
  return (await api.get(`/projects/${projectId}/audits`)).data;
}

export async function getAudit(id) {
  return (await api.get(`/audits/${id}`)).data;
}

export async function createAudit(projectId) {
  return (await api.post(`/projects/${projectId}/audits`)).data;
}

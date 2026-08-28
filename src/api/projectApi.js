import api from "./client";

export async function getProject(id) {
  const response = await api.get(`/projects/${id}`);
  return response.data;
}

export async function getDashboard(id) {
  const response = await api.get(`/projects/${id}/dashboard`);
  return response.data;
}
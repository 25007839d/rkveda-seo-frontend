import api from "./client";

// =====================================================
// GET ALL PROJECTS
// =====================================================

export async function getProjects() {
  const response = await api.get("/projects");
  return response.data;
}

// =====================================================
// GET SINGLE PROJECT
// =====================================================

export async function getProject(id) {
  const response = await api.get(`/projects/${id}`);
  return response.data;
}

// =====================================================
// GET PROJECT DASHBOARD
// =====================================================

export async function getDashboard(id) {
  const response = await api.get(`/projects/${id}/dashboard`);
  return response.data;
}

// =====================================================
// CREATE PROJECT / WEBSITE
// =====================================================

export async function createProject(data) {
  const response = await api.post("/projects", data);
  return response.data;
}

// =====================================================
// UPDATE PROJECT
// =====================================================

export async function updateProject(id, data) {
  const response = await api.put(`/projects/${id}`, data);
  return response.data;
}

// =====================================================
// DELETE PROJECT
// =====================================================

export async function deleteProject(id) {
  const response = await api.delete(`/projects/${id}`);
  return response.data;
}
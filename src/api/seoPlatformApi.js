import api from './client';

export const getSeoOverview = async (projectId) => (await api.get(`/projects/${projectId}/seo/overview`)).data;
export const getIntegrations = async (projectId) => (await api.get(`/projects/${projectId}/seo/integrations`)).data;
export const saveIntegration = async (projectId, type, payload) => (await api.put(`/projects/${projectId}/seo/integrations/${type}`, payload)).data;
export const saveSocial = async (projectId, platform, payload) => (await api.put(`/projects/${projectId}/seo/social/${platform}`, { ...payload, platform })).data;
export const getContentPlans = async (projectId) => (await api.get(`/projects/${projectId}/seo/content`)).data;
export const createContentPlan = async (projectId, payload) => (await api.post(`/projects/${projectId}/seo/content`, payload)).data;
export const getRecommendations = async (projectId) => (await api.get(`/projects/${projectId}/seo/recommendations`)).data;
export const createRecommendation = async (projectId, payload) => (await api.post(`/projects/${projectId}/seo/recommendations`, payload)).data;
export const getReports = async (projectId) => (await api.get(`/projects/${projectId}/seo/reports`)).data;
export const createReport = async (projectId, payload) => (await api.post(`/projects/${projectId}/seo/reports`, payload)).data;

export const getKeywordIntelligence = async (projectId, params = {}) => (await api.get(`/projects/${projectId}/seo/keywords`, { params })).data;

export const getBacklinks = async (projectId) => (await api.get(`/projects/${projectId}/backlinks`)).data;
export const createBacklink = async (projectId, payload) => (await api.post(`/projects/${projectId}/backlinks`, payload)).data;
export const updateBacklink = async (id, payload) => (await api.put(`/backlinks/${id}`, payload)).data;
export const deleteBacklink = async (id) => (await api.delete(`/backlinks/${id}`)).data;

export const getCompetitorIntelligence = async (projectId) => (await api.get(`/projects/${projectId}/seo/competitors/intelligence`)).data;
export const createCompetitor = async (projectId, payload) => (await api.post(`/projects/${projectId}/competitors`, payload)).data;
export const deleteCompetitor = async (id) => (await api.delete(`/competitors/${id}`)).data;
export const createCompetitorKeyword = async (competitorId, payload) => (await api.post(`/competitors/${competitorId}/keywords`, payload)).data;
export const createCompetitorBacklink = async (competitorId, payload) => (await api.post(`/competitors/${competitorId}/backlinks`, payload)).data;
export const createBacklinkOpportunity = async (projectId, payload) => (await api.post(`/projects/${projectId}/seo/backlink-opportunities`, payload)).data;
export const getBacklinkOpportunities = async (projectId) => (await api.get(`/projects/${projectId}/backlink-opportunities`)).data;

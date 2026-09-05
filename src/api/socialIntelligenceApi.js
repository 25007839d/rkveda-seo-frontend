import api from './client';
export const getSocialIntelligence=async(projectId)=>(await api.get(`/projects/${projectId}/seo/social-intelligence`)).data;
export const connectSocial=async(projectId,platform)=>(await api.get(`/projects/${projectId}/seo/social-intelligence/${platform}/connect`)).data;
export const syncSocial=async(projectId,platform)=>(await api.post(`/projects/${projectId}/seo/social-intelligence/${platform}/sync`)).data;
export const disconnectSocial=async(projectId,platform)=>(await api.post(`/projects/${projectId}/seo/social-intelligence/${platform}/disconnect`)).data;

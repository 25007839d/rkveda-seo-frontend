import api from './client';
export const getGbpStatus=async(projectId)=>(await api.get(`/projects/${projectId}/gbp/status`)).data;
export const connectGbp=async(projectId)=>(await api.get(`/projects/${projectId}/gbp/connect`)).data;
export const getGbpAccounts=async(projectId)=>(await api.get(`/projects/${projectId}/gbp/accounts`)).data;
export const getGbpLocations=async(projectId)=>(await api.get(`/projects/${projectId}/gbp/locations`)).data;
export const selectGbpLocation=async(projectId,payload)=>(await api.post(`/projects/${projectId}/gbp/location`,payload)).data;
export const getGbpReport=async(projectId,params={})=>(await api.get(`/projects/${projectId}/gbp/report`,{params})).data;
export const syncGbp=async(projectId,params={})=>(await api.post(`/projects/${projectId}/gbp/sync`,null,{params})).data;

export const disconnectGbp=async(projectId)=>(await api.post(`/projects/${projectId}/gbp/disconnect`)).data;

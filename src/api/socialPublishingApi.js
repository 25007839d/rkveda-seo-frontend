
import api from './client';
export const listPublishingJobs=async(projectId)=>(await api.get(`/projects/${projectId}/social/publishing`)).data;
export const createPublishingJob=async(projectId,payload)=>(await api.post(`/projects/${projectId}/social/publishing`,payload)).data;
export const getPublishingJob=async(projectId,jobId)=>(await api.get(`/projects/${projectId}/social/publishing/${jobId}`)).data;
export const publishPublishingJob=async(projectId,jobId)=>(await api.post(`/projects/${projectId}/social/publishing/${jobId}/publish`)).data;
export const cancelPublishingJob=async(projectId,jobId)=>(await api.post(`/projects/${projectId}/social/publishing/${jobId}/cancel`)).data;

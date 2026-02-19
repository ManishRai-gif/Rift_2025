import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '';

export const api = axios.create({
  baseURL: API_URL,
  timeout: 300000,
  headers: { 'Content-Type': 'application/json' },
});

export async function runAgent(body) {
  const payload = {
    repoUrl: body.repoUrl,
    teamName: body.teamName,
    leaderName: body.leaderName,
    ...(body.githubToken && { githubToken: body.githubToken }),
    ...(body.retryLimit != null && body.retryLimit !== '' && { retryLimit: Number(body.retryLimit) }),
  };
  const { data } = await api.post('/api/run-agent', payload);
  return data;
}

export function isPrivateRepoError(err) {
  return err.response?.status === 401 && err.response?.data?.error === 'PRIVATE_REPO';
}

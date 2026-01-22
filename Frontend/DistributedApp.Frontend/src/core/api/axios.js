import axios from 'axios';


const apiAuth = axios.create({
  baseURL: 'https://localhost:7182/api', 
  headers: {
    'Content-Type': 'application/json',
  },
});

// API del módulo de Activos
const apiAssets = axios.create({
  baseURL: 'https://localhost:7174/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export { apiAuth, apiAssets };
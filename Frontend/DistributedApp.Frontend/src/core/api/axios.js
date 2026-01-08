import axios from 'axios';


const apiAuth = axios.create({
  baseURL: 'https://localhost:7182/api', 
  headers: {
    'Content-Type': 'application/json',
  },
});

export { apiAuth };
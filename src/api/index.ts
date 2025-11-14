import axios from 'axios';
import { API_URL } from 'src/constant';

export const api = axios.create({
  baseURL: API_URL,
  // headers: {
  //   'Content-Type': 'application/json',
  // },
});

// const api = axios.create({
//   baseURL: 'https://your-api.com', // replace
// });
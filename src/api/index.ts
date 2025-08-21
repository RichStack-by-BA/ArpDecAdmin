import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://13.60.253.221/api/v1',
  // headers: {
  //   'Content-Type': 'application/json',
  // },
});

// const api = axios.create({
//   baseURL: 'https://your-api.com', // replace
// });
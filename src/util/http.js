import axios from 'axios';
import { HOST_URL } from './name';

let BASE_URL;
if (process.env.NODE_ENV === "development") {
  BASE_URL = 'http://localhost:3000';
} else {
  BASE_URL = "http" + HOST_URL;
}

axios.defaults.baseURL = BASE_URL;

export default axios;
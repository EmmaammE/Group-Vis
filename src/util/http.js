import axios from 'axios';
import { HOST_URL } from './name';

let BASE_URL;
if (process.env.NODE_ENV === "development") {
  BASE_URL = "http://localhost:3000";
} else {
  BASE_URL = "http" + HOST_URL;
}

axios.defaults.baseURL = BASE_URL;
axios.defaults.adapter = require('axios/lib/adapters/http');

// 请求拦截  设置统一header
axios.interceptors.request.use(
    config => {
        return config;
    },
    error => {
        console.log(error);
        return Promise.reject(error);
    }
);

// 响应拦截  401 token过期处理
axios.interceptors.response.use(
    response => {
        console.log(response);
        return response;
    },
    error => {
        // 错误提醒
        console.log(error);
        return Promise.reject(error);
    }
);

export default axios;
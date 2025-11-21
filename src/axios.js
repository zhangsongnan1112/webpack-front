// src/utils/request.ts
import axios from 'axios';

// 创建 Axios 实例
const instance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL, // 从环境变量获取基础地址
    timeout: 10000, // 超时时间
    headers: {
        'Content-Type': 'application/json;charset=utf-8',
    },
});


instance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    }
);


instance.interceptors.response.use(
    (response) => {
        const { data } = response;
        if (data.code === 200) {
            return data.data; 
        }
    },
    (error) => {
        if (axios.isCancel(error)) {
            return Promise.reject(new Error('请求已取消'));
        } else if (error.code === 'ECONNABORTED') {
            console.error('请求超时');
            return Promise.reject(new Error('请求超时，请稍后重试'));
        } else if (error.response) {
            const status = error.response.status;
            switch (status) {
                case 401:
                    console.error('未授权，跳转登录页');
                    window.location.href = '/login';
                    break;
                case 403:
                    console.error('权限不足');
                    break;
                case 500:
                    console.error('服务器错误');
                    break;
                default:
                    console.error(`HTTP错误：${status}`);
            }
        } else {

            console.error('网络错误，请检查网络连接');
        }
        return Promise.reject(error);
    }
);

// 封装请求方法（支持传入 AbortSignal 用于取消请求）
export const request = async (config) => {
    try {
        return await instance(config);
    } catch (error) {
        return Promise.reject(error);
    }
};

export const get =(
    url,
    params,
    config
) => {
    return request({ ...config, url, method: 'GET', params });
};

export const post =(
    url,
    data,
    config
) => {
    return request({ ...config, url, method: 'POST', data });
};

export default instance;



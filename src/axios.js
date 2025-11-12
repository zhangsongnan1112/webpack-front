// src/utils/request.ts
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

// 创建 Axios 实例
const instance: AxiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL, // 从环境变量获取基础地址
    timeout: 10000, // 超时时间
    headers: {
        'Content-Type': 'application/json;charset=utf-8',
    },
});


instance.interceptors.request.use(
    (config: AxiosRequestConfig) => {
        const token = localStorage.getItem('token');
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config; // 必须返回 config，否则请求会失败
    }
);

// 2. 响应拦截器：处理响应后的逻辑（如统一错误处理）
instance.interceptors.response.use(
    (response: AxiosResponse) => {
        const { data } = response;
        // 示例：假设后端接口统一返回 { code: number, data: any, msg: string }
        if (data.code === 200) {
            return data.data; // 只返回业务数据，简化组件使用
        }
    },
    (error: AxiosError) => {
        // 响应拦截器错误（如网络错误、超时、取消请求等）
        if (axios.isCancel(error)) {
            // 取消请求的错误（不视为异常，可忽略或特殊处理）
            console.log('请求已取消：', error.message);
            return Promise.reject(new Error('请求已取消'));
        } else if (error.code === 'ECONNABORTED') {
            // 超时错误
            console.error('请求超时');
            return Promise.reject(new Error('请求超时，请稍后重试'));
        } else if (error.response) {
            // HTTP 错误状态码（如 401、403、500）
            const status = error.response.status;
            switch (status) {
                case 401:
                    console.error('未授权，跳转登录页');
                    // 示例：跳转到登录页
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
            // 其他错误（如网络断开）
            console.error('网络错误，请检查网络连接');
        }
        return Promise.reject(error);
    }
);

// 封装请求方法（支持传入 AbortSignal 用于取消请求）
export const request = async <T = any>(
    config: AxiosRequestConfig & { signal?: AbortSignal }
): Promise<T> => {
    try {
        return await instance(config);
    } catch (error) {
        // 可在这里进一步统一处理错误（如抛出自定义错误）
        return Promise.reject(error);
    }
};

// 导出常用的请求方法（可选，简化调用）
export const get = <T = any>(
    url: string,
    params?: any,
    config?: AxiosRequestConfig & { signal?: AbortSignal }
) => {
    return request < T > ({ ...config, url, method: 'GET', params });
};

export const post = <T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig & { signal?: AbortSignal }
) => {
    return request < T > ({ ...config, url, method: 'POST', data });
};

export default instance;
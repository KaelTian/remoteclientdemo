// src/services/serverService.js
import axios from 'axios';
import { getServerUrl } from '../utils/configService';

// 配置基础URL（根据你的环境可能需要动态设置）
const apiClient = axios.create({
    //baseURL: getServerUrl(), // 确保这是你的后端地址
    headers: {
        'Content-Type': 'application/json'
    }
});

// 添加请求拦截器,每次请求前动态设置 baseURL
apiClient.interceptors.request.use(
    (config) => {
        const serverUrl = getServerUrl();
        if (serverUrl) {
            config.baseURL = serverUrl;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);


// 通用 POST 调用，针对工作单元接口
export async function callWorkUnit(workunit, argsObj) {
    try {
        console.log('当前使用的 server url: ' + getServerUrl());
        const response = await apiClient.post(
            `/server/${workunit}`, // 注意路径要与后端路由匹配
            argsObj
        );
        return response.data;
    } catch (error) {
        console.error(`[WorkUnit: ${workunit}] 调用失败:`, error);
        throw error;
    }
}

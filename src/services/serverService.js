// src/services/serverService.js
import axios from 'axios';

// 配置基础URL（根据你的环境可能需要动态设置）
const apiClient = axios.create({
    baseURL: 'http://localhost:8091', // 确保这是你的后端地址
    headers: {
        'Content-Type': 'application/json'
    }
});


// 通用 POST 调用，针对工作单元接口
export async function callWorkUnit(workunit, argsObj) {
    try {
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

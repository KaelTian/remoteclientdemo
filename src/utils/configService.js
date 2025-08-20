let config = {
    serverUrl: ''
};

// 从localStorage加载用户设置的URL
const loadUserConfig = () => {
    const savedUrl = localStorage.getItem('serverUrl');
    if (savedUrl) {
        config.serverUrl = savedUrl;
        console.log('加载用户配置成功, serverUrl:', savedUrl);
        return true;
    }
    return false;
};

// 从配置文件加载默认URL
const loadDefaultConfig = async () => {
    try {
        const response = await fetch('/config.json');
        const defaultConfig = await response.json();
        config.serverUrl = defaultConfig.serverUrl;
        console.info('加载默认配置成功, serverUrl:', defaultConfig.serverUrl);
        return true;
    } catch (error) {
        console.error('加载默认配置失败:', error);
        return false;
    }
};

// 初始化配置
export const initConfig = async () => {
    // 先尝试加载用户设置的URL，如果没有则加载默认配置
    console.log('初始化配置...');
    if (!loadUserConfig()) {
        await loadDefaultConfig();
    }
};

// 获取当前后端服务URL
export const getServerUrl = () => {
    //console.log('获取当前后端服务URL:', config.serverUrl);
    return config.serverUrl;
};

// 保存后端服务URL到localStorage
export const saveServerUrl = async (url) => {
    if (!url) {
        console.error('URL不能为空');
        return;
    }
    try {
        // 1. 保存到本地localStorage
        config.serverUrl = url;
        localStorage.setItem('serverUrl', url);
        console.log('保存用户配置成功, serverUrl:', url);

        // // 有持久化需求，才调用后端接口 通过后端Node Express server 持久化配置

        // // 2. 调用后端接口（注意端口要和后端启动的端口一致）
        // const response = await fetch('http://localhost:8092/api/update-config', {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json',
        //     },
        //     body: JSON.stringify({ serverUrl: url }),
        // });

        // if (response.ok) {
        //     console.log('服务器配置文件已更新');
        // } else {
        //     console.warn('服务器配置文件更新失败');
        // }
    } catch (error) {
        console.error('保存配置时出错:', error);
    }
};

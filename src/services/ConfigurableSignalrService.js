import * as signalR from "@microsoft/signalr";

class ConfigurableSignalrService {
    constructor(config) {
        this.connection = null;
        this.startedPromise = null;
        // 使用对象来存储不同方法的处理器数组
        this.handlersMap = {};
        this.maxRetries = config.maxRetries || 5;
        this.retryCount = 0;
        this.config = config;

        // 初始化处理器映射
        this.initializeHandlers();
    }

    initializeHandlers() {
        // 如果配置了多个接收方法，为每个方法创建处理器数组
        if (this.config.receiveMethods && Array.isArray(this.config.receiveMethods)) {
            this.config.receiveMethods.forEach(method => {
                this.handlersMap[method] = [];
            });
        }

        // 向后兼容：如果只配置了单个方法，也支持
        if (this.config.receiveMethod && !this.config.receiveMethods) {
            this.handlersMap[this.config.receiveMethod] = [];
        }
    }

    start() {
        this.retryCount = 0;
        this.connection = new signalR.HubConnectionBuilder()
            .withUrl(this.config.url, {
                withCredentials: this.config.withCredentials || false
            })
            .withAutomaticReconnect()
            .build();

        // 注册多个接收数据的方法
        this.registerAllHandlers();

        this.startedPromise = this.connection.start().then(() => {
            console.log("SignalR connection started");
        }).catch(err => {
            console.error("SignalR connection failed to start: " + err);
            if (this.retryCount < this.maxRetries) {
                this.retryCount++;
                return new Promise((resolve, reject) => {
                    setTimeout(() => {
                        this.start().then(resolve).catch(reject);
                    }, 5000);
                });
            } else {
                console.error("达到最大重试次数，重连失败。");
                if (this.onReconnectFailed) {
                    this.onReconnectFailed(err);
                }
                return Promise.reject(err);
            }
        });

        return this.startedPromise;
    }

    registerAllHandlers() {
        // 为每个配置的方法注册监听器
        Object.keys(this.handlersMap).forEach(methodName => {
            this.connection.on(methodName, (data) => {
                const parsedData = typeof data === 'string' ? JSON.parse(data) : data;
                this.handlersMap[methodName].forEach(handler => handler(parsedData));
            });
        });
    }

    // 监听特定方法的数据接收
    onDataReceived(methodName, handler) {
        if (!this.handlersMap[methodName]) {
            this.handlersMap[methodName] = [];
        }

        this.handlersMap[methodName].push(handler);

        // 返回取消监听的函数
        return () => {
            this.handlersMap[methodName] = this.handlersMap[methodName].filter(h => h !== handler);
        }
    }

    // 向后兼容：监听默认方法（如果配置了单个方法）
    onDeviceDataReceived(handler) {
        const methodName = this.config.receiveMethod || Object.keys(this.handlersMap)[0];
        if (!methodName) {
            console.warn('没有配置默认的接收方法');
            return () => { };
        }
        return this.onDataReceived(methodName, handler);
    }

    stop() {
        return this.connection.stop();
    }

    setReconnectFailedCallback(callback) {
        this.onReconnectFailed = callback;
    }

    send(...args) {
        if (!this.connection || this.connection.state !== signalR.HubConnectionState.Connected) {
            console.error('SignalR 连接未建立，无法发送数据。');
            return Promise.reject(new Error('SignalR 连接未建立'));
        }
        console.log('发送数据:', this.config.callbackUser, this.config.callbackMethod, args);
        return this.connection.invoke(this.config.sendMethod, this.config.callbackUser, this.config.callbackMethod, ...args)
            .catch(err => {
                console.error('调用失败:', err);
                return Promise.reject(err);
            });
    }

    // 获取当前已注册的方法列表
    getRegisteredMethods() {
        return Object.keys(this.handlersMap);
    }

    // 检查是否已注册某个方法
    hasMethod(methodName) {
        return this.handlersMap.hasOwnProperty(methodName);
    }
}

export default ConfigurableSignalrService;
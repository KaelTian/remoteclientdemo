import * as signalR from "@microsoft/signalr";

class ConfigurableSignalrService {
    constructor(config) {
        this.connection = null;
        this.startedPromise = null;
        this.deviceDataHandlers = [];
        this.maxRetries = config.maxRetries || 5;
        this.retryCount = 0;
        this.config = config;
    }

    start() {
        this.retryCount = 0;
        this.connection = new signalR.HubConnectionBuilder()
            .withUrl(this.config.url, {
                withCredentials: this.config.withCredentials || false
            })
            .withAutomaticReconnect()
            .build();

        // 注册接收数据的方法
        this.connection.on(this.config.receiveMethod, (data) => {
            const parsedData = typeof data === 'string' ? JSON.parse(data) : data;
            this.deviceDataHandlers.forEach(handler => handler(parsedData));
        });

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

    onDeviceDataReceived(handler) {
        this.deviceDataHandlers.push(handler);
        return () => {
            this.deviceDataHandlers = this.deviceDataHandlers.filter(h => h !== handler);
        }
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
        console.log('发送数据:', this.config.callbackUser,this.config.callbackMethod, args);
        return this.connection.invoke(this.config.sendMethod,this.config.callbackUser,this.config.callbackMethod, ...args)
            .catch(err => {
                console.error('调用失败:', err);
                return Promise.reject(err);
            });
    }
}

export default ConfigurableSignalrService;
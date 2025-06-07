import * as signalR from "@microsoft/signalr";
class RemoteControlService {
    constructor() {
        this.connection = null;
        this.startedPromise = null;
        this.deviceDataHandlers = [];
        this.maxRetries = 5; // 设置最大重试次数
        this.retryCount = 0; // 初始化重试计数器
    }
    start() {
        this.retryCount = 0; // 每次启动时重置重试计数器
        this.connection = new signalR.HubConnectionBuilder()
            .withUrl("http://192.168.0.210:8091/signalr?group=192.168.0.210_group", {
                withCredentials: false, // 禁用身份验证凭据
            })
            .withAutomaticReconnect()
            .build();

        // 注册接收远程截图数据的方法
        this.connection.on("Screen", (data) => {
            // 1. 传递给所有处理器
            this.deviceDataHandlers.forEach(handler => handler(data));
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
                    }, 5000); // 5秒后重试
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

    // 添加数据处理器
    onDeviceDataReceived(handler) {
        this.deviceDataHandlers.push(handler);
        return () => {
            this.deviceDataHandlers = this.deviceDataHandlers.filter(h => h !== handler);
        }
    }

    // 断开连接
    stop() {
        return this.connection.stop(); // 断开连接并返回 Promise 以等待连接关闭
    }
    // 添加重连失败回调
    setReconnectFailedCallback(callback) {
        this.onReconnectFailed = callback;
    }
    // 发送命令的方法
    sendCommand(command, callbackMethod = 'Mouse') {
        if (!this.connection || this.connection.state !== signalR.HubConnectionState.Connected) {
            console.error('SignalR 连接未建立，无法发送命令。');
            return Promise.reject(new Error('SignalR 连接未建立'));
        }
        console.log('发送命令:', command); // 打印发送的命令，方便调试和分析问题
        this.connection.invoke('Message', '192.168.0.209_client', callbackMethod, JSON.stringify(command))
            .catch(err => console.error('调用失败:', err));
    }
}

export default new RemoteControlService();
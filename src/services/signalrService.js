import * as signalR from "@microsoft/signalr";
class SignalrService {
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
            .withUrl("http://localhost:8091/signalr?user=Receiver1&group=OmronDevice1PLCGroup",{
                withCredentials: false, // 禁用身份验证凭据
            })
            .withAutomaticReconnect()
            .build();

        // 注册接收PLC数据的方法
        this.connection.on("ReceivePLCData", (data) => {
            // 1. 解析原始JSON数据（假设data已经是对象，如果是字符串需要先parse）
            const plcData = typeof data === 'string' ? JSON.parse(data) : data;

            // 2. 转换DeviceId（Base64转字节数组）
            if (plcData.DeviceId) {
                plcData.DeviceId = this.base64ToBytes(plcData.DeviceId);
            }

            // 3. 传递给所有处理器
            this.deviceDataHandlers.forEach(handler => handler(plcData));
        });
        
        // 注册接收PLC点数据的方法
        this.connection.on("ReceivePLCPointsEvent", (data) => {
            // 1. 解析原始JSON数据
            const pointsData = typeof data === 'string' ? JSON.parse(data) : data;
            
            // 2. 传递给所有处理器
            this.deviceDataHandlers.forEach(handler => handler(pointsData));
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

    // Base64转字节数组函数
    base64ToBytes(base64) {
        const binaryString = atob(base64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return Array.from(bytes); // 转为普通数组方便JSON序列化
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
    
    // 发送数据到服务器
    send(methodName, ...args) {
        if (!this.connection || this.connection.state !== signalR.HubConnectionState.Connected) {
            console.error('SignalR 连接未建立，无法发送数据。');
            return Promise.reject(new Error('SignalR 连接未建立'));
        }
        console.log('发送数据:', methodName, args);
        return this.connection.invoke("Message","CollectorOmron",methodName, ...args)
            .catch(err => {
                console.error('调用失败:', err);
                return Promise.reject(err);
            });
    }
}

export default new SignalrService();
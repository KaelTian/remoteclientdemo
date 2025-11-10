<template>
    <div class="signalr-test">
        <h1>SignalR 多方法监听测试</h1>

        <div :class="['status', connectionStatus]">
            状态: {{ statusText }}
        </div>

        <div class="controls">
            <button @click="connect" :disabled="isConnected || isConnecting">连接</button>
            <button @click="disconnect" :disabled="!isConnected">断开</button>
        </div>

        <div class="method-control">
            <h3>监听方法</h3>
            <div v-for="method in methods" :key="method.name" class="method-item">
                <input type="checkbox" :id="method.name" v-model="method.active" @change="toggleMethod(method)">
                <label :for="method.name">{{ method.name }}</label>
            </div>
        </div>

        <div class="send-section">
            <h3>发送消息</h3>
            <input v-model="sendMethod" placeholder="发送方法名">
            <input v-model="messageText" placeholder="消息内容">
            <button @click="sendMessage" :disabled="!isConnected">发送</button>
        </div>

        <div class="messages">
            <h3>接收到的消息</h3>
            <div v-for="(msg, index) in messages" :key="index" :class="['message', msg.type]">
                <span class="time">{{ msg.time }}</span>
                <span class="method">{{ msg.method }}:</span>
                <span class="content">{{ msg.data }}</span>
            </div>
        </div>
    </div>
</template>

<script>
import ConfigurableSignalrService from '../services/ConfigurableSignalrService'
import { getServerUrl } from '../utils/configService'

export default {
    name: 'SignalRTest',
    data() {
        return {
            signalrService: null,
            isConnected: false,
            isConnecting: false,
            messages: [],
            methods: [
                { name: 'UpdateStorehouseEvent', active: true },
                { name: 'UpdateDeviceEvent', active: true },
                { name: 'UpdateRollerEvent', active: true }
            ],
            sendMethod: 'SendMessage',
            messageText: '测试消息'
        }
    },
    computed: {
        connectionStatus() {
            if (this.isConnected) return 'connected'
            if (this.isConnecting) return 'connecting'
            return 'disconnected'
        },
        statusText() {
            if (this.isConnected) return '已连接'
            if (this.isConnecting) return '连接中...'
            return '未连接'
        }
    },
    methods: {
        connect() {
            this.isConnecting = true

            const activeMethods = this.methods.filter(m => m.active).map(m => m.name)

            const config = {
                url: `${getServerUrl()}/signalr?user=Receiver1&group=MachiningGroup`, // 修改为你的Hub地址
                receiveMethods: activeMethods,
                maxRetries: 3
            }

            this.signalrService = new ConfigurableSignalrService(config)

            this.signalrService.start()
                .then(() => {
                    this.isConnected = true
                    this.isConnecting = false
                    this.addMessage('系统', 'SignalR 连接成功', 'system')

                    // 为每个激活的方法注册监听器
                    activeMethods.forEach(methodName => {
                        this.signalrService.onDataReceived(methodName, (data) => {
                            this.addMessage(methodName, JSON.stringify(data), this.getMessageType('Notification'))
                        })
                    })
                })
                .catch(error => {
                    this.isConnecting = false
                    this.addMessage('系统', '连接失败: ' + error, 'system')
                })
        },

        disconnect() {
            if (this.signalrService) {
                this.signalrService.stop()
                    .then(() => {
                        this.isConnected = false
                        this.addMessage('系统', '连接已断开', 'system')
                    })
            }
        },

        sendMessage() {
            if (!this.isConnected) {
                alert('请先建立连接')
                return
            }

            this.signalrService.send(this.sendMethod, this.messageText)
                .then(() => {
                    this.addMessage('发送', `方法: ${this.sendMethod}, 内容: ${this.messageText}`, 'system')
                })
                .catch(error => {
                    this.addMessage('错误', '发送失败: ' + error, 'system')
                })
        },

        toggleMethod(method) {
            this.addMessage('系统', `${method.name} ${method.active ? '已启用' : '已禁用'}`, 'system')
        },

        addMessage(method, data, type = 'default') {
            this.messages.unshift({
                method: method,
                data: data,
                type: type,
                time: new Date().toLocaleTimeString()
            })

            if (this.messages.length > 50) {
                this.messages.pop()
            }
        },

        getMessageType(methodName) {
            if (methodName.includes('System')) return 'system'
            if (methodName.includes('Notification')) return 'notification'
            return 'default'
        }
    },

    mounted() {
        this.addMessage('系统', '页面加载完成，点击"连接"开始测试', 'system')
    },

    beforeDestroy() {
        if (this.signalrService) {
            this.signalrService.stop()
        }
    }
}
</script>

<style scoped>
.signalr-test {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
}

.status {
    padding: 10px;
    margin: 10px 0;
    border-radius: 5px;
    font-weight: bold;
}

.connected {
    background: #d4edda;
    color: #155724;
}

.disconnected {
    background: #f8d7da;
    color: #721c24;
}

.connecting {
    background: #fff3cd;
    color: #856404;
}

.controls {
    margin: 15px 0;
}

button {
    padding: 8px 15px;
    margin-right: 10px;
    border: none;
    border-radius: 4px;
    background: #007bff;
    color: white;
    cursor: pointer;
}

button:disabled {
    background: #6c757d;
    cursor: not-allowed;
}

.method-control {
    margin: 20px 0;
    padding: 15px;
    border: 1px solid #ddd;
    border-radius: 5px;
}

.method-item {
    margin: 10px 0;
}

.send-section {
    margin: 20px 0;
}

.send-section input {
    padding: 8px;
    margin-right: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
}

.messages {
    border: 1px solid #ddd;
    border-radius: 5px;
    padding: 15px;
    max-height: 400px;
    overflow-y: auto;
}

.message {
    padding: 8px;
    margin: 5px 0;
    border-left: 4px solid #007bff;
    background: #f8f9fa;
}

.message.system {
    border-left-color: #28a745;
}

.message.notification {
    border-left-color: #ffc107;
}

.time {
    font-size: 12px;
    color: #666;
    margin-right: 10px;
}

.method {
    font-weight: bold;
    margin-right: 5px;
}

.content {
    word-break: break-all;
}
</style>
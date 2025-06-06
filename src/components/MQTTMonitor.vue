<template>
    <div>
        <h1>PLC 数据监控</h1>
        <div v-for="(value, key) in plcData" :key="key">
            {{ key }}: {{ value }}
        </div>
    </div>
</template>
<script>
import MQTT_SERVICE from '../services/mqttService.js';
export default {
    name: 'MQTTMonitorTemplate',
    data() {
        return {
            plcData: {}, // 存储PLC数据的对象
            connection: null
        }
    },
    mounted() {
        this.connectToBroker(); // 连接到MQTT代理 
    },
    beforeDestroy() {
        MQTT_SERVICE.disconnect(); // 断开MQTT连接，释放资源
        this.connection = null;
    },
    methods: {
        connectToBroker() {
            // 连接配置
            const brokerUrl = 'ws://192.168.0.209:8083'; // 使用WebSocket协议连接MQTT代理
            const options = {
                clientId: 'vue-client-' + Math.random().toString(16).substr(2, 8),
                // username: 'your-username',
                // password: 'your-password',
                clean: true,
                connectTimeout: 4000,
                reconnectPeriod: 1000 // 自动重连间隔
            };

            this.connection = MQTT_SERVICE.connect(brokerUrl, options); // 使用MQTT_SERVICE连接

            // 订阅PLC数据主题
            MQTT_SERVICE.subscribe('plc/data', (message) => {
                try {
                    this.plcData = JSON.parse(message.toString()); // 解析接收到的JSON数据
                }
                catch (e) {
                    console.error('Failed to parse PLC data:', e);
                }
            });
        }
    }
}
</script>
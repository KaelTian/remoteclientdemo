<script setup>
import DeviceTable from './components/DeviceTable.vue'
import { ref } from 'vue'
import MQTTMonitor from './components/MQTTMonitor.vue'
import RemoteControlMonitor from './components/RemoteControlMonitor.vue'

// 设备类型枚举
const DeviceType = Object.freeze({
    SIEMENS: 'Siemens',
    OMRON: 'Omron',
    MELSEC: 'Melsec'
});

const DeviceStatus = Object.freeze({
    ONLINE: '在线',
    OFFLINE: '离线'
});

const devices = ref([
    {
        id: 1,
        name: 'PLC_212_DB4000',
        type: DeviceType.SIEMENS,
        status: DeviceStatus.ONLINE,
        plcConfig: {
            title: '西门子_PLC_212_DB4000',
            signalrUrl: 'http://localhost:8091/signalr?user=Receiver1&group=SiemensDevice1PLCGroup',
            receiveMethod: 'ReceivePLCPointsEvent',
            sendMethod: 'Message',
            callbackUser: 'SiemensDevice1Collector1',
            callbackMethod: 'UpdatePLCPointsEvent',
            updateFields: [
                // {name: 'bit_1',label:'bit_1 点位',type:'number', defaultValue: 0},
                { name: 'string', label: 'string 点位', type: 'string', defaultValue: '' },
                // {name: 'word',label:'word 点位',type:'string', defaultValue: ''},
                // {name: 'word组',label:'word组 点位',type:'string', defaultValue: ''}
            ],
            callbackWorkUnit: 'SiemensPlcToDBWorkUnit1'
        }
    },
    {
        id: 2,
        name: 'PLC_212_DB4002',
        type: DeviceType.SIEMENS,
        status: DeviceStatus.ONLINE,
        plcConfig: {
            title: '西门子_PLC_212_DB4002',
            signalrUrl: 'http://localhost:8091/signalr?user=Receiver1&group=SiemensDevice2PLCGroup',
            receiveMethod: 'ReceivePLCPointsEvent',
            sendMethod: 'Message',
            callbackUser: 'SiemensDevice2Collector1',
            callbackMethod: 'UpdatePLCPointsEvent',
            updateFields: [
                // {name: 'bit_1',label:'bit_1 点位',type:'number', defaultValue: 0},
                { name: 'string', label: 'string 点位', type: 'string', defaultValue: '' },
                // {name: 'word',label:'word 点位',type:'string', defaultValue: ''},
                // {name: 'word组',label:'word组 点位',type:'string', defaultValue: ''}
                { name: 'datetime', label: 'datetime 点位', type: 'string', defaultValue: '' }
            ],
            callbackWorkUnit: 'SiemensPlcToDBWorkUnit2'
        }
    },
    {
        id: 3,
        name: '欧姆龙PLC设备1',
        type: DeviceType.OMRON,
        status: DeviceStatus.ONLINE,
        plcConfig: {
            title: '欧姆龙 PLC 点位测试',
            signalrUrl: 'http://localhost:8091/signalr?user=Receiver1&group=OmronDevice1PLCGroup',
            receiveMethod: 'ReceivePLCPointsEvent',
            sendMethod: 'Message',
            callbackUser: 'OmronDevice1Collector1',
            callbackMethod: 'UpdatePLCPointsEvent',
            updateFields: [
                // { name: 'Name_string', label: 'Name_string 点位', type: 'string', defaultValue: '' },
                { name: 'Name_word', label: 'Name_word 点位', type: 'string', defaultValue: '' },
                // { name: 'Name_usint', label: 'Name_usint 点位', type: 'number', defaultValue: 0 }
            ],
            callbackWorkUnit: 'OmronPlcToDBWorkUnit1'
        }
    },
    {
        id: 4,
        name: '三菱PLC设备1',
        type: DeviceType.MELSEC,
        status: DeviceStatus.ONLINE,
        plcConfig: {
            title: '三菱 PLC 点位测试',
            signalrUrl: 'http://localhost:8091/signalr?user=Receiver1&group=MelsecDevice1PLCGroup',
            receiveMethod: 'ReceivePLCPointsEvent',
            sendMethod: 'Message',
            callbackUser: 'MelsecDevice1Collector1',
            callbackMethod: 'UpdatePLCPointsEvent',
            updateFields: [
                { name: 'string', label: 'string 点位', type: 'string', defaultValue: '' }
            ],
            callbackWorkUnit: 'MelsecPlcToDBWorkUnit1'
        }
    }
    // 可以继续添加更多设备
])
</script>

<template>
    <div class="app-container">
        <DeviceTable :devices="devices" />
    </div>
</template>

<!-- <template>
  <div class="app-container">
    <MQTTMonitor/>
  </div>
</template> -->

<!-- <template>
  <div >
    <RemoteControlMonitor/>
  </div>
</template> -->

<style scoped>
.app-container {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
}

.navbar {
    background: #2c3e50;
    padding: 1rem 2rem;
    display: flex;
    gap: 1rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.navbar a {
    color: #ecf0f1;
    text-decoration: none;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    transition: all 0.3s ease;
}

.navbar a:hover {
    background: #34495e;
}

.navbar a.router-link-active {
    background: #3498db;
    font-weight: 500;
}

main {
    flex: 1;
    padding: 2rem;
    background: #f5f7fa;
}

@media (min-width: 1024px) {
    .navbar {
        justify-content: center;
    }
}
</style>
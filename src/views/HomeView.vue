<script setup>
import DeviceTable from '../components/DeviceTable.vue'
import { ref } from 'vue'
import MQTTMonitor from '../components/MQTTMonitor.vue'
import RemoteControlMonitor from '../components/RemoteControlMonitor.vue'
import { getServerUrl } from '../utils/configService'


// 设备类型枚举
const DeviceType = Object.freeze({
    SIEMENS: 'Siemens',
    OMRON: 'Omron',
    MELSEC: 'Melsec',
    RESTAPI: 'RestApi'
});

const DeviceStatus = Object.freeze({
    ONLINE: '在线',
    OFFLINE: '离线'
});

const devices = ref([
    {
        id: 1,
        name: '捷佳系统设置',
        type: DeviceType.OMRON,
        status: DeviceStatus.ONLINE,
        plcConfig: {
            title: '捷佳系统设置',
            signalrUrl: `${getServerUrl()}/signalr?user=Receiver1&group=JJHostCollectorGroup`,
            receiveMethod: 'GetJJSystemSettingPointsEvent',
            sendMethod: 'Message',
            callbackUser: 'Collector1',
            callbackMethod: 'UpdatePLCPointsEvent',
            updateFields: [
            ],
            callbackWorkUnit: 'JJSystemSettingsCollectorWorkUnit',
            isIncremental: true
        }
    },
    {
        id: 2,
        name: '捷佳主机信息',
        type: DeviceType.OMRON,
        status: DeviceStatus.ONLINE,
        plcConfig: {
            title: '捷佳主机信息',
            signalrUrl: `${getServerUrl()}/signalr?user=Receiver1&group=JJHostCollectorGroup`,
            receiveMethod: 'GetJJHostPointsEvent',
            sendMethod: 'Message',
            callbackUser: 'Collector1',
            callbackMethod: 'UpdatePLCPointsEvent',
            updateFields: [
                // { name: 'MES_CA2_O2_Set', label: 'MES_CA2_O2_Set 点位', type: 'number', defaultValue: 0 },
                // { name: 'MES_控制请求_CA2流量O2', label: 'MES_控制请求_CA2流量O2 点位', type: 'number', defaultValue: 0 }
            ],
            callbackWorkUnit: 'JJSummaryCollectorWorkUnit',
            isIncremental: true
        }
    },
    {
        id: 3,
        name: '捷佳报警信息',
        type: DeviceType.OMRON,
        status: DeviceStatus.ONLINE,
        plcConfig: {
            title: '捷佳报警信息',
            signalrUrl: `${getServerUrl()}/signalr?user=Receiver1&group=JJHostCollectorGroup`,
            receiveMethod: 'GetJJAlarmPointsEvent',
            sendMethod: 'Message',
            callbackUser: 'Collector1',
            callbackMethod: 'UpdatePLCPointsEvent',
            updateFields: [
            ],
            callbackWorkUnit: 'JJAlarmsCollectorWorkUnit',
            isIncremental: false
        }
    },
    {
        id: 4,
        name: '捷佳门阀信息',
        type: DeviceType.OMRON,
        status: DeviceStatus.ONLINE,
        plcConfig: {
            title: '捷佳门阀信息',
            signalrUrl: `${getServerUrl()}/signalr?user=Receiver1&group=JJHostCollectorGroup`,
            receiveMethod: 'GetJJEQIOPointsEvent',
            sendMethod: 'Message',
            callbackUser: 'Collector1',
            callbackMethod: 'UpdatePLCPointsEvent',
            updateFields: [
                //{ name: 'D222', label: 'D222 点位', type: 'string', defaultValue: 0 },
            ],
            callbackWorkUnit: 'JJEQIOCollectorWorkUnit',
            isIncremental: true
        }
    },
    {
        id: 5,
        name: '捷佳主机和门阀信息',
        type: DeviceType.OMRON,
        status: DeviceStatus.ONLINE,
        plcConfig: {
            title: '捷佳主机和门阀信息',
            signalrUrl: `${getServerUrl()}/signalr?user=Receiver1&group=JJHostCollectorGroup`,
            receiveMethod: 'GetJJHostAndEQIOPointsEvent',
            sendMethod: 'Message',
            callbackUser: 'Collector1',
            callbackMethod: 'UpdatePLCPointsEvent',
            updateFields: [
                //{ name: 'D222', label: 'D222 点位', type: 'string', defaultValue: 0 },
            ],
            callbackWorkUnit: 'JJSummaryAndEQIOCollectorWorkUnit',
            isIncremental: true
        }
    },
    {
        id: 6,
        name: '欣奕华主机信息',
        type: DeviceType.OMRON,
        status: DeviceStatus.ONLINE,
        plcConfig: {
            title: '欣奕华主机信息',
            signalrUrl: `${getServerUrl()}/signalr?user=Receiver1&group=XYHHostCollectorGroup`,
            receiveMethod: 'GetXYHHostPointsEvent',
            sendMethod: 'Message',
            callbackUser: 'Collector1',
            callbackMethod: 'UpdatePLCPointsEvent',
            updateFields: [
                //{ name: 'D222', label: 'D222 点位', type: 'string', defaultValue: 0 },
            ],
            callbackWorkUnit: 'XYHCollectorWorkUnit',
            isIncremental: true
        }
    },
    {
        id: 7,
        name: '欣奕华报警信息',
        type: DeviceType.OMRON,
        status: DeviceStatus.ONLINE,
        plcConfig: {
            title: '欣奕华报警信息',
            signalrUrl: `${getServerUrl()}/signalr?user=Receiver1&group=XYHHostCollectorGroup`,
            receiveMethod: 'GetXYHAlarmPointsEvent',
            sendMethod: 'Message',
            callbackUser: 'Collector1',
            callbackMethod: 'UpdatePLCPointsEvent',
            updateFields: [
            ],
            callbackWorkUnit: 'XYHAlarmsCollectorWorkUnit',
            isIncremental: false
        }
    },
    {
        id: 8,
        name: '欣奕华上下料信息',
        type: DeviceType.MELSEC,
        status: DeviceStatus.ONLINE,
        plcConfig: {
            title: '欣奕华上下料信息',
            signalrUrl: `${getServerUrl()}/signalr?user=Receiver1&group=XYHLoadingAndUnloadingCollectorGroup`,
            receiveMethod: 'GetXYHLoadingAndUnloadingHostPointsEvent',
            sendMethod: 'Message',
            callbackUser: 'Collector1',
            callbackMethod: 'UpdatePLCPointsEvent',
            updateFields: [
            ],
            callbackWorkUnit: 'XYHLoadingAndUnloadingCollectorWorkUnit',
            isIncremental: true
        }
    },
    {
        id: 9,
        name: '欣奕华上下料报警',
        type: DeviceType.MELSEC,
        status: DeviceStatus.ONLINE,
        plcConfig: {
            title: '欣奕华上下料报警',
            signalrUrl: `${getServerUrl()}/signalr?user=Receiver1&group=XYHLoadingAndUnloadingCollectorGroup`,
            receiveMethod: 'GetXYHLoadingAndUnloadingAlarmPointsEvent',
            sendMethod: 'Message',
            callbackUser: 'Collector1',
            callbackMethod: 'UpdatePLCPointsEvent',
            updateFields: [
            ],
            callbackWorkUnit: 'XYHLoadingAndUnloadingAlarmsCollectorWorkUnit',
            isIncremental: false,
            useCallbackWorkUnit: false
        }
    },
    {
        id: 10,
        name: '激光P1报警',
        type: DeviceType.RESTAPI,
        status: DeviceStatus.ONLINE,
        plcConfig: {
            title: '激光P1报警',
            signalrUrl: `${getServerUrl()}/signalr?user=Receiver1&group=JGP1HostGroup`,
            receiveMethod: 'GetP1AlarmData',
            sendMethod: 'Message',
            callbackUser: 'Collector1',
            callbackMethod: 'UpdatePLCPointsEvent',
            updateFields: [
            ],
            callbackWorkUnit: 'JiGuangP1WorkUnit',
            isIncremental: false,
            useCallbackWorkUnit: false
        }
    },
    {
        id: 11,
        name: '激光P2报警',
        type: DeviceType.RESTAPI,
        status: DeviceStatus.ONLINE,
        plcConfig: {
            title: '激光P2报警',
            signalrUrl: `${getServerUrl()}/signalr?user=Receiver1&group=JGP2HostGroup`,
            receiveMethod: 'GetP2AlarmData',
            sendMethod: 'Message',
            callbackUser: 'Collector1',
            callbackMethod: 'UpdatePLCPointsEvent',
            updateFields: [
            ],
            callbackWorkUnit: 'JiGuangP2WorkUnit',
            isIncremental: false,
            useCallbackWorkUnit: false
        }
    },
    {
        id: 12,
        name: '激光P3报警',
        type: DeviceType.RESTAPI,
        status: DeviceStatus.ONLINE,
        plcConfig: {
            title: '激光P3报警',
            signalrUrl: `${getServerUrl()}/signalr?user=Receiver1&group=JGP3HostGroup`,
            receiveMethod: 'GetP3AlarmData',
            sendMethod: 'Message',
            callbackUser: 'Collector1',
            callbackMethod: 'UpdatePLCPointsEvent',
            updateFields: [
            ],
            callbackWorkUnit: 'JiGuangP3WorkUnit',
            isIncremental: false,
            useCallbackWorkUnit: false
        }
    },
    {
        id: 13,
        name: '激光P4报警',
        type: DeviceType.RESTAPI,
        status: DeviceStatus.ONLINE,
        plcConfig: {
            title: '激光P4报警',
            signalrUrl: `${getServerUrl()}/signalr?user=Receiver1&group=JGP4HostGroup`,
            receiveMethod: 'GetP4AlarmData',
            sendMethod: 'Message',
            callbackUser: 'Collector1',
            callbackMethod: 'UpdatePLCPointsEvent',
            updateFields: [
            ],
            callbackWorkUnit: 'JiGuangP3WorkUnit',
            isIncremental: false,
            useCallbackWorkUnit: false
        }
    },
    {
        id: 14,
        name: '层压机主机',
        type: DeviceType.SIEMENS,
        status: DeviceStatus.ONLINE,
        plcConfig: {
            title: '层压机主机',
            signalrUrl: `${getServerUrl()}/signalr?user=Receiver1&group=CengYaJiHostGroup`,
            receiveMethod: 'GetCYJPointsEvent',
            sendMethod: 'Message',
            callbackUser: 'Collector1',
            callbackMethod: 'UpdatePLCPointsEvent',
            updateFields: [
            ],
            callbackWorkUnit: 'JiGuangP3WorkUnit',
            isIncremental: false,
            useCallbackWorkUnit: false,
            plcPointsUrl: `/CYJCollectorWorkUnit/PLCPoints`,
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
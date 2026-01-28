<script setup>
import ObjectTable from '../components/ObjectTable.vue'
import { ref } from 'vue'
import { getServerUrl } from '../utils/configService'

// 设备类型枚举
const DeviceType = Object.freeze({
    TUBU: '涂布',
    JIGUANG: '激光'
});

const DeviceStatus = Object.freeze({
    ONLINE: '在线',
    OFFLINE: '离线'
});
const devices = ref([
    {
        id: 1,
        name: '涂布主界面数据',
        type: DeviceType.TUBU,
        status: DeviceStatus.ONLINE,
        signalrConfig: {
            title: '涂布主界面数据',
            signalrUrl: `${getServerUrl()}/signalr?user=Receiver1&group=TuBuHostGroup`,
            receiveMethod: 'GetTBMachineMainFormEvent',
            sendMethod: 'Message'
        }
    },
    {
        id: 2,
        name: 'VCD主界面数据',
        type: DeviceType.TUBU,
        status: DeviceStatus.ONLINE,
        signalrConfig: {
            title: 'VCD主界面数据',
            signalrUrl: `${getServerUrl()}/signalr?user=Receiver1&group=TuBuHostGroup`,
            receiveMethod: 'GetTBVcdMainFormEvent',
            sendMethod: 'Message'
        }
    },
    {
        id: 3,
        name: 'P1激光秒采数据',
        type: DeviceType.JIGUANG,
        status: DeviceStatus.ONLINE,
        signalrConfig: {
            title: 'P1激光秒采数据',
            signalrUrl: `${getServerUrl()}/signalr?user=Receiver1&group=JGP1HostGroup`,
            receiveMethod: 'GetP1SecondData',
            sendMethod: 'Message'
        }
    },
    {
        id: 4,
        name: 'P1激光片采数据',
        type: DeviceType.JIGUANG,
        status: DeviceStatus.ONLINE,
        signalrConfig: {
            title: 'P1激光片采数据',
            signalrUrl: `${getServerUrl()}/signalr?user=Receiver1&group=JGP1HostGroup`,
            receiveMethod: 'GetP1PieceData',
            sendMethod: 'Message'
        }
    },
    {
        id: 5,
        name: 'P2激光秒采数据',
        type: DeviceType.JIGUANG,
        status: DeviceStatus.ONLINE,
        signalrConfig: {
            title: 'P2激光秒采数据',
            signalrUrl: `${getServerUrl()}/signalr?user=Receiver1&group=JGP2HostGroup`,
            receiveMethod: 'GetP2SecondData',
            sendMethod: 'Message'
        }
    },
    {
        id: 6,
        name: 'P2激光片采数据',
        type: DeviceType.JIGUANG,
        status: DeviceStatus.ONLINE,
        signalrConfig: {
            title: 'P2激光片采数据',
            signalrUrl: `${getServerUrl()}/signalr?user=Receiver1&group=JGP2HostGroup`,
            receiveMethod: 'GetP2PieceData',
            sendMethod: 'Message'
        }
    },
    {
        id: 7,
        name: 'P3激光秒采数据',
        type: DeviceType.JIGUANG,
        status: DeviceStatus.ONLINE,
        signalrConfig: {
            title: 'P3激光秒采数据',
            signalrUrl: `${getServerUrl()}/signalr?user=Receiver1&group=JGP3HostGroup`,
            receiveMethod: 'GetP3SecondData',
            sendMethod: 'Message'
        }
    },
    {
        id: 8,
        name: 'P3激光片采数据',
        type: DeviceType.JIGUANG,
        status: DeviceStatus.ONLINE,
        signalrConfig: {
            title: 'P3激光片采数据',
            signalrUrl: `${getServerUrl()}/signalr?user=Receiver1&group=JGP3HostGroup`,
            receiveMethod: 'GetP3PieceData',
            sendMethod: 'Message'
        }
    },
    {
        id: 9,
        name: 'P4激光秒采数据',
        type: DeviceType.JIGUANG,
        status: DeviceStatus.ONLINE,
        signalrConfig: {
            title: 'P4激光秒采数据',
            signalrUrl: `${getServerUrl()}/signalr?user=Receiver1&group=JGP4HostGroup`,
            receiveMethod: 'ReceiveP4StatusData',
            sendMethod: 'Message'
        }
    },
    {
        id: 10,
        name: 'P4激光配方秒采数据',
        type: DeviceType.JIGUANG,
        status: DeviceStatus.ONLINE,
        signalrConfig: {
            title: 'P4激光配方秒采数据',
            signalrUrl: `${getServerUrl()}/signalr?user=Receiver1&group=JGP4HostGroup`,
            receiveMethod: 'ReceiveP4RecipeData',
            sendMethod: 'Message'
        }
    },
    {
        id: 11,
        name: 'P4激光片采数据',
        type: DeviceType.JIGUANG,
        status: DeviceStatus.ONLINE,
        signalrConfig: {
            title: 'P4激光片采数据',
            signalrUrl: `${getServerUrl()}/signalr?user=Receiver1&group=JGP4HostGroup`,
            receiveMethod: 'ReceiveP4PieceData',
            sendMethod: 'Message'
        }
    }
    // 可以继续添加更多设备
])
</script>

<template>
    <div class="app-container">
        <ObjectTable :devices="devices" />
    </div>
</template>

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
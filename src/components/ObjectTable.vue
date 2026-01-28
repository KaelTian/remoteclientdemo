<template>
    <div class="device-table-container">
        <table class="device-table">
            <thead>
                <tr>
                    <th>设备ID</th>
                    <th>设备名称</th>
                    <th>设备类型</th>
                    <th>状态</th>
                    <th>操作</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="device in devices" :key="device.id">
                    <td>{{ device.id }}</td>
                    <td>{{ device.name }}</td>
                    <td>{{ device.type }}</td>
                    <td>{{ device.status }}</td>
                    <td>
                        <button @click="showDeviceDetails(device)">详情</button>
                    </td>
                </tr>
            </tbody>
        </table>

        <dialog v-if="showDialog" @click.self="closeDialog" class="device-dialog">
            <div class="dialog-content">
                <button @click="closeDialog" class="close-button">×</button>
                <RealTimeObjectMonitor v-if="selectedDevice" :signalrConfig="selectedDevice.signalrConfig"
                    :title="selectedDevice.name" />
            </div>
        </dialog>
    </div>
</template>

<script>
import RealTimeObjectMonitor from './RealTimeObjectMonitor.vue'

export default {
    name: 'ObjectTable',
    components: {
        RealTimeObjectMonitor
    },
    props: {
        devices: {
            type: Array,
            required: true,
            default: () => []
        }
    },
    data() {
        return {
            showDialog: false,
            selectedDevice: null
        }
    },
    methods: {
        showDeviceDetails(device) {
            this.selectedDevice = device
            this.showDialog = true
        },
        closeDialog() {
            this.showDialog = false
            this.selectedDevice = null
        }
    }
}
</script>

<style scoped>
.device-table-container {
    width: 100%;
    padding: 20px;
}

.device-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 20px;
}

.device-table th,
.device-table td {
    border: 1px solid #ddd;
    padding: 8px;
    text-align: left;
}

.device-table th {
    background-color: #f2f2f2;
}

.device-table tr:nth-child(even) {
    background-color: #f9f9f9;
}

.device-table tr:hover {
    background-color: #f1f1f1;
}

.device-dialog {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.dialog-content {
    background-color: white;
    padding: 20px;
    border-radius: 5px;
    width: 80%;
    max-width: 900px;
    max-height: 90vh;
    overflow-y: auto;
    position: relative;
}

.close-button {
    position: absolute;
    top: 10px;
    right: 10px;
    background: none;
    border: none;
    font-size: 20px;
    cursor: pointer;
}
</style>
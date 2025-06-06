<template>
  <div class="plc-points-monitor">
    <h2>电池焊接类加工设备</h2>
    <div class="device-status">
      <div class="status-item">
        <div class="input-group">
          <label class="status-name">更新数据:</label>
        </div>
        <div class="update-controls">
          <!-- <div class="input-group">
            <label>bit_1 点位:</label>
            <input v-model="updateData.bit_1" type="number" class="update-input">
          </div>
          <div class="input-group">
            <label>string 点位:</label>
            <input v-model="updateData.string" type="string" class="update-input">
          </div> -->
          <div class="input-group">
            <label>欧姆龙 string 点位:</label>
            <input v-model="updateData.Name_string" type="string" class="update-input">
          </div>
          <button @click="sendUpdateData" class="update-button">更新</button>
        </div>
      </div>
    </div>

    <div class="status-item">
      <span class="status-name">最后更新时间:</span>
      <span class="status-value">{{ lastUpdateTime }}</span>
    </div>
    
    <h2>动态PLC点位测试类</h2>
    <div class="data-list">
      <div class="data-item" v-for="(value, key) in pointsData" :key="key" :class="{ 'odd-row': $index % 2 === 0 }">
        <div class="field-container">
          <span class="field-name">{{ key }}:</span>
          <span class="field-value" v-if="key.includes('Bool')">
            {{ value ? '1' : '0' }}
          </span>
          <span class="field-value" v-else-if="key.includes('DateTime') && Array.isArray(value)">
            {{ value.join(', ') }}
          </span>
          <span class="field-value" v-else>
            {{ value }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import signalRService from '../services/signalrService'
import ConfigurableSignalrService from '../services/ConfigurableSignalrService'

export default {
  name: 'PlcPointsMonitor',
  setup() {
    const pointsData = ref({
    })
    const updateData = ref({
      // bit_1:0,
      // string:"",
      Name_string:""
    })

    const loading = ref(true)
    const error = ref(null)
    const lastUpdateTime = ref('')

    const handleDataReceived = (newData) => {
      pointsData.value = { ...pointsData.value, ...newData };
      // 更新最后更新时间
      lastUpdateTime.value = new Date().toLocaleString();
    }

    onMounted(async () => {
      try {
        await signalRService.start()
        signalRService.onDeviceDataReceived(handleDataReceived)
        loading.value = false
      } catch (err) {
        error.value = err.message
        loading.value = false
      }
    })

    onBeforeUnmount(() => {
      signalRService.stop()
    })
    const sendUpdateData = async () => {
      try {
        await signalRService.send('UpdatePLCPointsEvent', JSON.stringify(updateData.value))
      } catch (err) {
        error.value = err.message
      }
    }

    return {
      pointsData,
      loading,
      error,
      updateData,
      sendUpdateData,
      lastUpdateTime
    }
  }
}
</script>

<style scoped>
.plc-points-monitor {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
}

.device-status {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 15px;
  margin-bottom: 30px;
}

.status-item {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 5px;
  display: flex;
  justify-content: space-between;
}

.status-name {
  font-weight: 600;
  color: #555;
}

.status-value {
  color: #333;
}

.status-value.running {
  color: #4CAF50;
  font-weight: 600;
}

.status-value.stopped {
  color: #F44336;
  font-weight: 600;
}

.status-value.alarm {
  color: #FF9800;
  font-weight: 600;
}

.update-controls {
  display: flex;
  flex-direction: column;
  gap: 15px;
  padding: 10px 0;
}

.input-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.input-group label {
  min-width: 80px;
  font-weight: 500;
  color: #555;
}

.update-input {
  padding: 8px 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  min-width: 150px;
}

.update-button {
  padding: 6px 12px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.update-button:hover {
  background-color: #45a049;
}

h2 {
  text-align: center;
  margin-bottom: 20px;
  color: #333;
  font-size: 1.5em;
}

.data-list {
  display: table;
  width: 100%;
  border-collapse: collapse;
}

.data-item {
  display: table-row;
}

.data-item:nth-child(even) {
  background-color: #f8f9fa;
}

.field-container {
  display: table-cell;
  padding: 8px 12px;
  border-bottom: 1px solid #eaeaea;
  margin-right: 10px;
}

.field-name {
  font-weight: 600;
  color: #555;
  font-size: 0.9em;
  width: 40%;
  padding-right: 15px;
}

.field-value {
  color: #0a3feb;
  font-size: 0.95em;
  max-width: 200px;
  white-space: normal;
  word-break: break-word;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

.field-value[data-type="bool"] {
  color: #4CAF50;
  font-weight: 600;
}

.field-value[data-type="datetime"] {
  color: #2196F3;
}

.field-value[data-type="number"] {
  color: #9C27B0;
}
</style>
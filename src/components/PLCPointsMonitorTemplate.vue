<template>
  <div class="plc-points-monitor">
    <h2>{{ plcConfig.title }}</h2>
    <div v-if="plcConfig.updateFields && plcConfig.updateFields.length > 0">
      <div class="device-status" >
        <div class="status-item">
          <div class="input-group">
            <label class="status-name">更新数据:</label>
          </div>
          <div class="update-controls">
            <div v-for="(field, index) in plcConfig.updateFields" :key="index" class="input-group">
              <label>{{ field.label }}:</label>
              <input v-model="updateData[field.name]" :type="field.type" class="update-input">
            </div>
            <button @click="sendUpdateData" class="update-button">更新</button>
          </div>
        </div>
      </div>
      <div class="status-item">
        <span class="status-name">最后更新时间:</span>
        <span class="status-value">{{ lastUpdateTime }}</span>
      </div>
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
import { ref, onMounted, onBeforeUnmount } from 'vue'
import ConfigurableSignalrService from '../services/ConfigurableSignalrService'

export default {
  name: 'PLCPointsMonitorTemplate',
  props: {
    plcConfig: {
      type: Object,
      required: true,
      validator: (config) => {
        return [
          'title',
          'signalrUrl',
          'receiveMethod',
          'sendMethod',
          'callbackUser',
          'callbackMethod',
          'updateFields'
        ].every(key => key in config)
      }
    }
  },
  setup(props) {
    const pointsData = ref({})
    const updateData = ref({})
    const loading = ref(true)
    const error = ref(null)
    const lastUpdateTime = ref('')

    // 初始化更新数据字段
    props.plcConfig.updateFields.forEach(field => {
      updateData.value[field.name] = field.defaultValue || ''
    })

    const handleDataReceived = (newData) => {
      pointsData.value = { ...pointsData.value, ...newData }
      lastUpdateTime.value = new Date().toLocaleString('zh-CN', {
        hour12: false,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        fractionalSecondDigits: 3
      })
    }

    const signalrService = new ConfigurableSignalrService({
      url: props.plcConfig.signalrUrl,
      receiveMethod: props.plcConfig.receiveMethod,
      sendMethod: props.plcConfig.sendMethod,
      callbackUser: props.plcConfig.callbackUser,
      callbackMethod: props.plcConfig.callbackMethod,
      withCredentials: false
    })

    onMounted(async () => {
      try {
        await signalrService.start()
        signalrService.onDeviceDataReceived(handleDataReceived)
        loading.value = false
      } catch (err) {
        error.value = err.message
        loading.value = false
      }
    })

    onBeforeUnmount(() => {
      signalrService.stop()
    })

    const sendUpdateData = async () => {
      try {
        await signalrService.send(JSON.stringify(updateData.value))
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

data-list {
  display: table;
  width: 100%;
  border-collapse: collapse;
}

data-item {
  display: table-row;
}

data-item:nth-child(even) {
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
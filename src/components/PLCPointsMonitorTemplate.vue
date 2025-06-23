<template>
  <div class="plc-points-monitor">
    <h2>{{ plcConfig.title }}</h2>
    <div v-if="plcConfig.updateFields && plcConfig.updateFields.length > 0">
      <div class="device-status">
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
      <div class="data-item" v-for="(item, index) in pointsData" :key="index" :class="{ 'odd-row': index % 2 === 0 }">
        <div class="field-container">
          <div style="display: flex;">
            <span class="field-name">{{ item.displayName || item.plcPointName }}:</span>
            <span class="field-value">
              {{ item.plcPointValue }}
            </span>
          </div>
          <div class="field-attrs">
            <span class="field-attr">类别: {{ item.category }}</span>
            <span class="field-attr">只读: {{ item.isReadOnly }}</span>
            <span class="field-attr">点位名: {{ item.plcPointName }}</span>
            <span class="field-attr">时间戳: {{ item.timestamp }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import ConfigurableSignalrService from '../services/ConfigurableSignalrService'
import { callWorkUnit } from '@/services/serverService'


const PlcDataRequestType = Object.freeze({
  Read: 0,
  Write: 1
});

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
    const pointsData = ref([])
    const updateData = ref({})
    const loading = ref(true)
    const error = ref(null)
    const lastUpdateTime = ref('')
    // 定义PLC请求数据结构
    const plcDataRequest = ref({
      requestType: PlcDataRequestType.Read,
      parameters: null
    });
    // 作业单元名字
    const workunit = props.plcConfig.callbackWorkUnit;
    // 增量更新函数
    function mergePointsData(sourceItems, newItems) {
      const map = new Map();

      for (const item of sourceItems) {
        if (item.plcPointName) {
          map.set(item.plcPointName, item);
        }
      }

      for (const newItem of newItems) {
        const key = newItem.plcPointName;
        if (!key) continue;

        if (map.has(key)) {
          Object.assign(map.get(key), newItem);
        } else {
          map.set(key, newItem);
        }
      }

      // ✨关键是：更新 sourceItems 本体，而不是重赋值
      // 所以我们直接改 pointsData.value 的数组
      sourceItems.length = 0;
      sourceItems.push(...map.values());
    }
    // 初始化更新数据字段
    props.plcConfig.updateFields.forEach(field => {
      updateData.value[field.name] = field.defaultValue || ''
    })

    const handleDataReceived = (newItems) => {
      mergePointsData(pointsData.value, newItems);
      //pointsData.value = [...newItems];
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

    // 发送HTTP请求函数
    const fetchPlcData = async () => {
      try {
        loading.value = true;
        plcDataRequest.value.requestType = PlcDataRequestType.Read;
        plcDataRequest.value.parameters = null;
        const response = await callWorkUnit(workunit, plcDataRequest.value);
        console.log("PLC全量数据结果:");
        console.log(response);
        if (response && response.result !== undefined && response.result === 1) {
          mergePointsData(pointsData.value, response.data);
        }
        else {
          alert("获取PLC全量数据失败: " + response.message);
        }
      } catch (err) {
        error.value = err.message;
      } finally {
        loading.value = false;
      }
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
        await fetchPlcData();
        await signalrService.start()
        signalrService.onDeviceDataReceived(handleDataReceived)
        loading.value = false
      } catch (err) {
        console.error("onMounted error: " + err);
        error.value = err.message
        loading.value = false
      }
    })

    onBeforeUnmount(() => {
      signalrService.stop()
    })


    const sendUpdateData = async () => {
      if (workunit && workunit !== '') {
        // web api 实现
        try {
          plcDataRequest.value.requestType = PlcDataRequestType.Write;
          plcDataRequest.value.parameters = updateData.value;
          const result = await callWorkUnit(workunit, plcDataRequest.value);
          console.log('callWorkUnit 调用成功:', result);
        } catch (err) {
          console.warn('callWorkUnit 执行任务失败：', err.message);
        }
      }
      else {
        // signalr 实现
        try {
          await signalrService.send(JSON.stringify(updateData.value))
        } catch (err) {
          error.value = err.message
        }
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
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}

.data-item {
  display: flex;
  padding: 12px;
  border-radius: 4px;
  background-color: #f8f9fa;
}

.data-item.odd-row {
  background-color: #ffffff;
}

.field-container {
  display: block;
  flex-wrap: wrap;
  gap: 8px 16px;
  width: 100%;
}

.field-main {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1 1 60%;
  min-width: 280px;
}

.field-attrs {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1 1 40%;
  min-width: 240px;
}

.field-attr {
  display: inline-block;
  color: #666;
  font-size: 0.9em;
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
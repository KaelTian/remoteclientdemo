<template>
    <div class="plc-monitor">
      <h2>焊接设备监控</h2>
      
      <div v-if="loading" class="loading">连接中...</div>
      <div v-else-if="error" class="error">连接错误: {{ error }}</div>
      
      <div v-else class="device-data">
        <div class="data-card">
          <h3>设备状态</h3>
          <div class="status-indicator" :class="{ 'running': data.DeviceStatus, 'stopped': !data.DeviceStatus }">
            {{ data.DeviceStatus ? '运行中' : '停止' }}
          </div>
        </div>
        
        <div class="data-card">
          <h3>报警状态</h3>
          <div class="alarm-indicator" :class="{ 'alarm': data.HasAlarm }">
            {{ data.HasAlarm ? '有报警' : '正常' }}
            <div v-if="data.HasAlarm" class="alarm-code">代码: {{ data.AlarmCode }}</div>
          </div>
        </div>
        
        <div class="data-card">
          <h3>当前温度</h3>
          <div class="temperature">
            {{ data.CurrentTemp }} °C
          </div>
        </div>
        
        <div class="data-card">
          <h3>工序编号</h3>
          <div class="step-number">
            {{ data.StepNumber }}
          </div>
        </div>
        
        <div class="data-card">
          <h3>完成数量</h3>
          <div class="product-counter">
            {{ data.ProductCounter }}
          </div>
        </div>
        
        <div class="data-card">
          <h3>设备ID</h3>
          <div class="device-id">
            {{ deviceIdString }}
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
  import signalRService from '../services/signalrService'
  
  export default {
    setup() {
      const data = ref({
        DeviceStatus: false,
        HasAlarm: false,
        AlarmCode: 0,
        CurrentTemp: 0,
        StepNumber: 0,
        ProductCounter: 0,
        DeviceId: new Array(30).fill(0)
      })
      
      const loading = ref(true)
      const error = ref(null)
      
      // 转换设备ID为字符串
      const deviceIdString = computed(() => {
        const bytes = data.value.DeviceId
        if (!bytes) return ''
        
        // 过滤掉空字节(0)并转换为字符串
        const validBytes = bytes.filter(b => b !== 0)
        return String.fromCharCode(...validBytes)
      })
      
      // 处理接收到的数据
      const handleDataReceived = (newData) => {

        data.value = { ...data.value, ...newData }
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
      
      return {
        data,
        loading,
        error,
        deviceIdString
      }
    }
  }
  </script>
  
  <style scoped>
  .plc-monitor {
    max-width: 1000px;
    margin: 0 auto;
    padding: 20px;
  }
  
  h2 {
    text-align: center;
    margin-bottom: 30px;
    color: #333;
  }
  
  .device-data {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 20px;
  }
  
  .data-card {
    background: white;
    border-radius: 8px;
    padding: 15px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }
  
  .status-indicator, .alarm-indicator {
    padding: 10px;
    border-radius: 5px;
    text-align: center;
    font-weight: bold;
    margin-top: 10px;
  }
  
  .status-indicator.running {
    background-color: #4CAF50;
    color: white;
  }
  
  .status-indicator.stopped {
    background-color: #F44336;
    color: white;
  }
  
  .alarm-indicator {
    background-color: #8BC34A;
    color: white;
  }
  
  .alarm-indicator.alarm {
    background-color: #FF9800;
  }
  
  .alarm-code {
    margin-top: 5px;
    font-size: 0.9em;
  }
  
  .temperature, .step-number, .product-counter, .device-id {
    font-size: 1.5em;
    text-align: center;
    margin-top: 10px;
    padding: 10px;
    background: #f5f5f5;
    border-radius: 5px;
  }
  
  .loading, .error {
    text-align: center;
    padding: 20px;
    font-size: 1.2em;
  }
  
  .error {
    color: #F44336;
  }
  </style>
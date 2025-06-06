import { createRouter, createWebHistory } from 'vue-router'
import SiemensPlcPointsMonitor from '../components/SiemensPlcPointsMonitor.vue'
import OmronPlcPointsMonitor from '../components/OmronPlcPointsMonitor.vue'
import PLCPointsMonitorTemplate from '@/components/PLCPointsMonitorTemplate.vue'

const routes = [
  {
    path: '/siemens',
    name: 'Siemens',
    component: PLCPointsMonitorTemplate,
    props: {
      plcConfig: {
        title: '西门子 PLC 点位测试',
        signalrUrl: 'http://localhost:8091/signalr?user=Receiver1&group=Device1PLCGroup',
        receiveMethod: 'ReceivePLCPointsEvent',
        sendMethod: 'Message',
        callbackUser: 'Collector1',
        callbackMethod: 'UpdatePLCPointsEvent',
        updateFields: [
          {name: 'bit_1',label:'bit_1 点位',type:'number', defaultValue: 0},
          {name: 'string',label:'string 点位',type:'string', defaultValue: ''},
          {name: 'word',label:'word 点位',type:'string', defaultValue: ''},
          {name: 'word组',label:'word组 点位',type:'string', defaultValue: ''}
        ]
      }
    }
  },
  {
    path: '/omron',
    name: 'Omron',
    component: OmronPlcPointsMonitor
  },
  {
    path: '/',
    redirect: '/siemens'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import Settings from '../views/Settings.vue' // 导入Settings组件
import SignalRTest from '../views/SignalRTest.vue'
import ObjectView from '../views/ObjectView.vue'

import { initConfig } from '../utils/configService'


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView // 你的主页面（包含DeviceTable）
    },
    {
      path: '/settings',
      name: 'settings',
      component: Settings // 配置页面
    },
    {
      path: '/signalrtest',
      name: 'signalrtest',
      component: SignalRTest // SignalR测试页面
    },
    {
      path: '/objectview',
      name: 'objectview',
      component: ObjectView // SignalR测试页面
    }
  ]
})

// // 全局前置守卫,等待配置加载完成
// router.beforeEach(async (to, from, next) => {
//   // 检查配置是否已初始化
//   if (!window.configInitialized) {
//     await initConfig();
//     window.configInitialized = true;
//   }
//   next();
// });


export default router

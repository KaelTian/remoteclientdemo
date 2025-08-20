import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { initConfig } from './utils/configService'

// 初始化配置
initConfig().then(() => {
    createApp(App).use(router).mount('#app')
});

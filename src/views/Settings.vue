<template>
    <div class="settings-container">
        <h2>服务配置</h2>
        <div class="form-group">
            <label for="serverUrl">后端服务地址:</label>
            <input type="text" id="serverUrl" v-model="serverUrl" class="form-control">
        </div>
        <button @click="saveSettings" class="btn-save">保存设置</button>
        <div v-if="message" class="message">{{ message }}</div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getServerUrl, saveServerUrl } from '../utils/configService';

const serverUrl = ref('');
const message = ref('');

onMounted(() => {
    serverUrl.value = getServerUrl();
});

const saveSettings = () => {
    if (serverUrl.value) {
        saveServerUrl(serverUrl.value);
        message.value = '设置已保存，将使用新的服务地址';

        // 3秒后清除提示消息
        setTimeout(() => {
            message.value = '';
        }, 3000);
    }
};
</script>

<style scoped>
.settings-container {
    max-width: 600px;
    margin: 2rem auto;
    padding: 2rem;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.form-group {
    margin-bottom: 1rem;
}

label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: bold;
}

.form-control {
    width: 100%;
    padding: 0.5rem;
    font-size: 1rem;
    border: 1px solid #ddd;
    border-radius: 4px;
}

.btn-save {
    background-color: #42b983;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1rem;
}

.btn-save:hover {
    background-color: #359e75;
}

.message {
    margin-top: 1rem;
    padding: 0.5rem;
    background-color: #e3f2fd;
    color: #0d47a1;
    border-radius: 4px;
}
</style>

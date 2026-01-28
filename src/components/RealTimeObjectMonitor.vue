<template>
    <div class="object-monitor">
        <!-- 组件标题 -->
        <h2>{{ title }}</h2>

        <!-- 最后更新时间 -->
        <div class="status-item">
            <span class="status-name">最后更新时间:</span>
            <span class="status-value">{{ lastUpdateTime }}</span>
        </div>

        <!-- 动态对象展示区域 -->
        <h2>实时对象数据展示</h2>

        <!-- 无数据提示 -->
        <div v-if="Object.keys(objectData).length === 0 && !loading" class="empty-tip">
            暂无实时数据
        </div>

        <!-- 加载提示 -->
        <div v-if="loading" class="loading-tip">
            正在连接实时数据服务...
        </div>

        <!-- 错误提示 -->
        <div v-if="error" class="error-tip">
            连接失败: {{ error }}
        </div>

        <!-- 对象属性列表 -->
        <div class="object-data-list" v-else>
            <div class="object-data-item" v-for="(value, key, index) in objectData" :key="index"
                :class="{ 'odd-row': index % 2 === 0 }">
                <div class="field-container">
                    <!-- 属性名 -->
                    <span class="field-name">{{ formatKeyName(key) }}:</span>
                    <!-- 属性值（兼容复杂类型展示） -->
                    <span class="field-value" :data-type="getValueType(value)">
                        {{ formatValue(value) }}
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
    name: 'RealTimeObjectMonitor',
    props: {
        // 组件标题
        title: {
            type: String,
            required: true,
            default: '实时对象数据展示'
        },
        // SignalR配置（仅保留核心连接参数）
        signalrConfig: {
            type: Object,
            required: true,
            validator: (config) => {
                return [
                    'signalrUrl',
                    'receiveMethod',
                    'sendMethod'
                ].every(key => key in config)
            }
        },
        // 是否增量更新（合并新对象属性，而非全量替换）
        isIncremental: {
            type: Boolean,
            default: true
        }
    },
    setup(props) {
        // 核心数据：存储SignalR推送的对象
        const objectData = ref({})
        const loading = ref(true)
        const error = ref(null)
        const lastUpdateTime = ref('')

        // SignalR服务实例
        let signalrService = null

        // 格式化属性名（优化显示，如驼峰转中文/空格）
        const formatKeyName = (key) => {
            //return key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()).trim();
            return key;
        }

        // 获取值的类型（用于样式区分）
        const getValueType = (value) => {
            if (typeof value === 'boolean') return 'bool';
            if (typeof value === 'number') return 'number';
            if (value instanceof Date) return 'datetime';
            if (typeof value === 'string') return 'string';
            return 'object';
        }

        // 格式化值（兼容复杂类型、复杂对象数组展示）
        const formatValue = (value) => {
            if (value === null) return 'null';
            if (value === undefined) return 'undefined';

            // 日期类型格式化
            if (value instanceof Date) {
                return value.toLocaleString('zh-CN', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                });
            }

            // 数组类型处理（区分简单数组和复杂对象数组）
            if (Array.isArray(value)) {
                // 判断数组是否包含复杂对象（非基础类型）
                const hasComplexObject = value.some(item => {
                    return item !== null && typeof item === 'object' && !(item instanceof Date);
                });

                // 复杂对象数组：转格式化JSON字符串
                if (hasComplexObject) {
                    return JSON.stringify(value, null, 2);
                }
                // 简单数组（基础类型）：逗号拼接
                else {
                    return `[${value.join(', ')}]`;
                }
            }

            // 复杂对象（非数组、非日期）：转格式化JSON字符串
            if (typeof value === 'object') {
                return JSON.stringify(value, null, 2);
            }

            // 基础类型直接返回
            return value;
        }

        // 合并对象数据（增量更新）
        const mergeObjectData = (sourceObj, newObj) => {
            if (!newObj || typeof newObj !== 'object' || Array.isArray(newObj)) return;
            Object.assign(sourceObj, newObj);
        }

        // 处理SignalR接收的对象数据
        const handleDataReceived = (newObj) => {
            // 校验数据类型（确保是对象）
            if (typeof newObj !== 'object' || newObj === null || Array.isArray(newObj)) {
                console.warn('接收的数据不是有效对象，已忽略:', newObj);
                return;
            }

            // 增量更新：合并属性；全量更新：直接替换
            if (props.isIncremental) {
                mergeObjectData(objectData.value, newObj);
            } else {
                objectData.value = { ...newObj }; // 浅拷贝避免引用问题
            }

            // 更新时间戳
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

        // 初始化SignalR连接
        const initSignalR = async () => {
            try {
                loading.value = true;
                error.value = null;

                // 创建SignalR服务实例
                signalrService = new ConfigurableSignalrService({
                    url: props.signalrConfig.signalrUrl,
                    receiveMethod: props.signalrConfig.receiveMethod,
                    sendMethod: props.signalrConfig.sendMethod,
                    withCredentials: false
                });

                // 启动连接并监听数据
                await signalrService.start();
                signalrService.onDeviceDataReceived(handleDataReceived);

                console.log('SignalR连接成功，开始接收实时对象数据');
            } catch (err) {
                error.value = err.message;
                console.error('SignalR连接失败:', err);
            } finally {
                loading.value = false;
            }
        }

        // 生命周期：挂载时初始化SignalR
        onMounted(async () => {
            await initSignalR();
        })

        // 生命周期：卸载时关闭SignalR连接
        onBeforeUnmount(() => {
            if (signalrService) {
                signalrService.stop();
                console.log('SignalR连接已断开');
            }
        })

        return {
            objectData,
            loading,
            error,
            lastUpdateTime,
            formatKeyName,
            formatValue,
            getValueType
        }
    }
}
</script>

<style scoped>
.object-monitor {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
}

/* 基础样式 */
.status-item {
    background: #f8f9fa;
    padding: 15px;
    border-radius: 5px;
    display: flex;
    justify-content: space-between;
    margin-bottom: 20px;
}

.status-name {
    font-weight: 600;
    color: #555;
}

.status-value {
    color: #333;
}

h2 {
    text-align: center;
    margin-bottom: 20px;
    color: #333;
    font-size: 1.5em;
}

/* 提示样式 */
.empty-tip,
.loading-tip {
    text-align: center;
    padding: 20px;
    color: #666;
    font-size: 1em;
}

.error-tip {
    text-align: center;
    padding: 20px;
    color: #f44336;
    font-size: 1em;
    background: #ffebee;
    border-radius: 4px;
    margin-bottom: 20px;
}

/* 对象属性列表样式 */
.object-data-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    width: 100%;
}

.object-data-item {
    padding: 12px;
    border-radius: 4px;
    background-color: #f8f9fa;
}

.object-data-item.odd-row {
    background-color: #ffffff;
}

.field-container {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
    gap: 8px;
    width: 100%;
}

.field-name {
    font-weight: 600;
    color: #555;
    font-size: 0.95em;
    min-width: 120px;
    flex-shrink: 0;
}

.field-value {
    color: #0a3feb;
    font-size: 0.95em;
    flex: 1;
    word-break: break-all;
    white-space: pre-wrap;
    /* 兼容JSON格式化后的换行 */
}

/* 不同类型值的样式区分 */
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

.field-value[data-type="object"] {
    color: #e91e63;
    font-family: monospace;
    font-size: 0.9em;
}
</style>
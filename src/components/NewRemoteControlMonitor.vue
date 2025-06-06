<template>
    <div>
        <div id="new-remote">
            <canvas id="remote-canvas"
                ref="canvasRef"
                :width="canvasWidth"
                :height="canvasHeight"
                class="remote-screen" />
        </div>
    </div>
</template>

<script>
import remoteControlService from '../services/remoteControlService';
import { initialize, drawFrame, dispose } from '../services/RemoteDisplay.vue';

export default {
    data() {
        return {
            remoteImageSrc: '',
            canvasWidth: 0,
            canvasHeight: 0
        };
    },
    mounted() {
        this.updateCanvasSize();
        window.addEventListener('resize', this.updateCanvasSize);
        
        this.handler = (message) => {
            const canvas = this.$refs.canvasRef;
            if (canvas) {
                const width = canvas.width;
                const height = canvas.height;
                drawFrame('remote-canvas', 0, 0, width, height, message);
            }
        };
        remoteControlService.onDeviceDataReceived(this.handler);
        remoteControlService.start();
        this.$nextTick(() => {
            initialize('remote-canvas');
        });
    },
    beforeUnmount() {
        window.removeEventListener('resize', this.updateCanvasSize);
        
        if (this.handler) {
            const removeHandler = remoteControlService.onDeviceDataReceived(this.handler);
            removeHandler();
        }
        remoteControlService.stop();
        dispose('remote-canvas');
    },
    methods: {
        updateCanvasSize() {
            const container = this.$el.querySelector('#new-remote');
            if (container) {
                this.canvasWidth = container.clientWidth;
                this.canvasHeight = container.clientHeight;
            }
        }
    }
};
</script>

<style scoped>
#new-remote {
    width: 800px;
    height: 600px;
    position: relative;
    display: inline-block;
    overflow: hidden;
    background-color: #f0f0f0;
    /* 加载时的背景色 */
    text-align: center;
    /* 使图片居中 */
}

#new-remote img {
    max-width: 100%;
    height: auto;
    display: block;
    margin: 0 auto;
    /* 水平居中 */
    user-select: none;
    /* 防止图片被选中 */
    -webkit-user-drag: none;
    /* 防止拖动 */
    pointer-events: none;
    /* 如果想让事件直接作用于容器而不是图片 */
}

/* 加载中的样式 */
#new-remote.loading::before {
    content: "加载中...";
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: #666;
}

/* 远程控制光标样式 */
#new-remote.remote-active {
    cursor: none;
}

#new-remote.remote-active::after {
    content: "";
    position: absolute;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background-color: red;
    pointer-events: none;
    transform: translate(-5px, -5px);
}

/* canvas元素样式 */
.remote-screen {
    max-width: 100%;
    height: auto;
    display: block;
    margin: 0 auto;
    user-select: none;
    -webkit-user-drag: none;
    
    border: 2px solid red;
}
</style>
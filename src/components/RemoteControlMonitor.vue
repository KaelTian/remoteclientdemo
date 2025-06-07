<template>

    <div id="remote" ref="remoteContainer" @mousemove="handleMouseMove" @mousedown="handleMouseDown"
        @mouseup="handleMouseUp" @wheel="handleMouseWheel" @contextmenu="handleContextMenu">
        <img :src="remoteImageSrc" alt="Remote Screenshot" />
    </div>

</template>

<script>
import remoteControlService from '../services/remoteControlService';
import pako from 'pako';

export default {
    data() {
        return {
            remoteImageSrc: '',
            lastMousePosition: { x: 0, y: 0 }
        };
    },
    mounted() {
        this.handler = (message) => {
            // 解压
            const uint8Array = Uint8Array.from(atob(message), c => c.charCodeAt(0));
            const decompressed = pako.ungzip(uint8Array);
            const base64 = btoa(String.fromCharCode.apply(null, decompressed));
            this.remoteImageSrc = `data:image;base64,${base64}`;
        };
        remoteControlService.onDeviceDataReceived(this.handler);
        remoteControlService.start();
        // 添加键盘事件监听
        window.addEventListener('keydown', this.handleKeyDown);
        window.addEventListener('keyup', this.handleKeyUp);
    },
    beforeUnmount() {
        // 移除事件监听
        window.removeEventListener('keydown', this.handleKeyDown);
        window.removeEventListener('keyup', this.handleKeyUp);
        if (this.handler) {
            const removeHandler = remoteControlService.onDeviceDataReceived(this.handler);
            removeHandler();
        }
        remoteControlService.stop();
    },
    methods: {
        /**
        * 获取鼠标事件的标志位（兼容标准按钮+侧键+组合键，与后端MouseEventFlags完全兼容）
        * @param {MouseEvent} event 鼠标事件对象
        * @param {string} eventType 事件类型（'mousedown'/'mouseup'/'mousemove'/'wheel'/'dblclick'）
        * @returns {number} 组合后的标志位（uint），与后端MouseEventFlags定义一致
        */
        getMouseEventFlag(event, eventType) {
            let flags = 0;

            // 1. 处理鼠标按钮事件（左/中/右键 + 侧键X1/X2），严格遵循后端位定义
            switch (eventType) {
                case 'mousedown':
                    switch (event.button) {
                        case 0: // 左键按下
                            flags |= 0x0002; // MOUSEEVENTF_LEFTDOWN
                            break;
                        case 1: // 中键按下
                            flags |= 0x0020; // MOUSEEVENTF_MIDDLEDOWN
                            break;
                        case 2: // 右键按下
                            flags |= 0x0008; // MOUSEEVENTF_RIGHTDOWN
                            break;
                        case 3: // 侧后退键 (X1) 按下
                        case 4: // 侧前进键 (X2) 按下
                            flags |= 0x0080; // MOUSEEVENTF_XDOWN
                            break;
                    }
                    break;
                case 'mouseup':
                    switch (event.button) {
                        case 0: // 左键释放
                            flags |= 0x0004; // MOUSEEVENTF_LEFTUP
                            break;
                        case 1: // 中键释放
                            flags |= 0x0040; // MOUSEEVENTF_MIDDLEUP
                            break;
                        case 2: // 右键释放
                            flags |= 0x0010; // MOUSEEVENTF_RIGHTUP
                            break;
                        case 3: // 侧后退键 (X1) 释放
                        case 4: // 侧前进键 (X2) 释放
                            flags |= 0x0100; // MOUSEEVENTF_XUP
                            break;
                    }
                    break;
                case 'mousemove':
                    flags |= 0x0001; // MOUSEEVENTF_MOVE
                    break;
                case 'wheel':
                    flags |= 0x0800; // MOUSEEVENTF_WHEEL
                    break;
            }
            // // 2. 处理组合键状态（Ctrl/Shift/Alt），使用独立的位定义（注意：后端未定义组合键位，需协商新增定义或使用保留位）
            // // 注意：后端MouseEventFlags未包含组合键定义，以下为临时解决方案，建议前后端协商统一标准
            // if (event.ctrlKey) { flags |= 0x1000; }  // 建议使用保留位0x1000表示Ctrl键
            // if (event.shiftKey) { flags |= 0x2000; } // 建议使用保留位0x2000表示Shift键
            // if (event.altKey) { flags |= 0x4000; }   // 建议使用保留位0x4000表示Alt键

            return flags;
        },
        // 获取元素相对位置（百分比）
        getRelativePosition(event) {
            const rect = this.$refs.remoteContainer.getBoundingClientRect();
            const width = rect.width;
            const height = rect.height;
            return {
                x: (event.clientX - rect.left) / width,
                y: (event.clientY - rect.top) / height
            };
        },
        // 鼠标移动事件
        handleMouseMove(event) {
            event.preventDefault();
            const flags = this.getMouseEventFlag(event, 'mousemove');
            // 获取位置百分比
            const pos = this.getRelativePosition(event);
            this.lastMousePosition = pos;
            remoteControlService.sendCommand({
                k: flags,
                x: pos.x,
                y: pos.y
            });
        },
        // 鼠标按下事件
        handleMouseDown(event) {
            event.preventDefault();
            console.log('鼠标按下事件触发');
            const flags = this.getMouseEventFlag(event, 'mousedown');
            remoteControlService.sendCommand({
                k: flags
            });

            // 阻止侧键的默认行为（如浏览器后退/前进）
            if (event.button === 3 || event.button === 4) {
                event.preventDefault();
            }
        },
        // 鼠标释放事件
        handleMouseUp(event) {
            event.preventDefault();
            console.log('鼠标释放事件触发');
            const flags = this.getMouseEventFlag(event, 'mouseup');
            remoteControlService.sendCommand({
                k: flags,
                button: event.button
            });
        },
        // 鼠标滚轮事件
        handleMouseWheel(event) {
            event.preventDefault();
            const delta = event.deltaY > 0 ? -120 : 120; // 固定步进，方向修正
            const flags = this.getMouseEventFlag(event, 'wheel');
            remoteControlService.sendCommand({ k: flags, d: delta });
        },
        // 键盘按下事件
        handleKeyDown(event) {
            event.preventDefault();
            // to do
            console.log('键盘按下事件触发');
            remoteControlService.sendCommand({
                k: event.keyCode,

                f: 0
            }, 'Keyboard');
        },
        // 键盘释放事件
        handleKeyUp(event) {
            event.preventDefault();
            // to do
            console.log('键盘释放事件触发');
            remoteControlService.sendCommand({
                k: event.keyCode,
                f: 2
            }, 'Keyboard');
        },
        
        // 右键菜单事件
        handleContextMenu(event) {
            event.preventDefault();
            console.log('右键菜单事件触发');
            // const flags = this.getMouseEventFlag(event, 'mousedown');
            // remoteControlService.sendCommand({
            //     k: flags,
            //     x: this.lastMousePosition.x,
            //     y: this.lastMousePosition.y
            // });
        }
    }
};
</script>

<style scoped>
#remote {
    position: relative;
    margin: 0 auto;
    background-color: #f0f0f0;
    /* 加载时的背景色 */
    border: 2px solid red;
    display: inline-block;
    line-height: 0;
}

#remote img {
    max-width: none;
    max-height: none;
    object-fit: contain;
    background-color: #000;
    user-select: none;
    -webkit-user-drag: none;
    pointer-events: none;
}

/* 加载中的样式 */
#remote.loading::before {
    content: "加载中...";
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: #666;
}

/* 远程控制光标样式 */
#remote.remote-active {
    cursor: none;
}

#remote.remote-active::after {
    content: "";
    position: absolute;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background-color: red;
    pointer-events: none;
    transform: translate(-5px, -5px);
}
</style>
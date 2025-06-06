<template>
    <div>
        <div id="remote" ref="remoteContainer" @mousemove="handleMouseMove" @mousedown="handleMouseDown"
            @mouseup="handleMouseUp" @dblclick="handleDoubleClick" @contextmenu.prevent="handleContextMenu"
            @wheel="handleMouseWheel">
            <img :src="remoteImageSrc" alt="Remote Screenshot" />
        </div>
    </div>
</template>

<script>
import remoteControlService from '../services/remoteControlService';
import pako from 'pako';

export default {
    data() {
        return {
            remoteImageSrc: '',
            isMouseDown: false,
            lastMousePosition: { x: 0, y: 0 },
            mouseButton: null
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
 * 获取鼠标事件的标志位（兼容标准按钮+侧键+组合键）
 * @param {MouseEvent} event 鼠标事件对象
 * @param {string} eventType 事件类型（'mousedown'/'mouseup'/'mousemove'/'wheel'）
 * @returns {number} 组合后的标志位（uint）
 */
        getMouseEventFlag(event, eventType) {
            let flags = 0;

            // 1. 处理鼠标按钮事件（左/中/右键 + 侧键X1/X2）
            switch (eventType) {
                case 'mousedown':
                case 'mouseup':
                    switch (event.button) {
                        case 0: // 左键
                            flags |= (eventType === 'mousedown' ? 0x0002 /* LEFTDOWN */ : 0x0004 /* LEFTUP */);
                            break;
                        case 1: // 中键
                            flags |= (eventType === 'mousedown' ? 0x0020 /* MIDDLEDOWN */ : 0x0040 /* MIDDLEUP */);
                            break;
                        case 2: // 右键
                            flags |= (eventType === 'mousedown' ? 0x0008 /* RIGHTDOWN */ : 0x0010 /* RIGHTUP */);
                            break;
                        case 3: // 侧后退键 (X1)
                        case 4: // 侧前进键 (X2)
                            flags |= (eventType === 'mousedown' ? 0x0080 /* XDOWN */ : 0x0100 /* XUP */);
                            break;
                    }
                    break;
                case 'mousemove':
                    flags |= 0x0001; // MOVE
                    break;
                case 'wheel':
                    flags |= 0x0800; // WHEEL
                case 'dblclick':
                    flags |= 0x0410; // Double Click
                    break;
            }

            // 2. 处理组合键状态（Ctrl/Shift/Alt）
            if (event.ctrlKey) { flags |= 0x0008; }  // Ctrl 键状态（借用 RIGHTDOWN 的位）
            else if (event.shiftKey) { flags |= 0x0004; }  // Shift 键状态（借用 LEFTUP 的位）
            else if (event.altKey) { flags |= 0x0002; } // Alt 键状态（借用 LEFTDOWN 的位）

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
            //console.log('鼠标移动事件触发');
            const flags = this.getMouseEventFlag(event, 'mousemove');
            const pos = this.getRelativePosition(event);
            //console.log('鼠标移动位置:', pos);
            this.lastMousePosition = pos;

            remoteControlService.sendCommand({
                cmd: flags,
                x: pos.x,
                y: pos.y
            });
        },

        // 鼠标按下事件
        handleMouseDown(event) {
            console.log('鼠标按下事件触发');
            const flags = this.getMouseEventFlag(event, 'mousedown');
            const pos = this.getRelativePosition(event);
            console.log('鼠标按下位置:', pos);

            remoteControlService.sendCommand({
                cmd: flags,
                // x: Math.round(pos.x),
                // y: Math.round(pos.y),
                button: event.button // 可选：额外传递 button 值区分 X1/X2
            });

            // 阻止侧键的默认行为（如浏览器后退/前进）
            if (event.button === 3 || event.button === 4) {
                event.preventDefault();
            }
        },

        // 鼠标释放事件
        handleMouseUp(event) {
            console.log('鼠标释放事件触发');
            const flags = this.getMouseEventFlag(event, 'mouseup');
            const pos = this.getRelativePosition(event);
            console.log('鼠标释放位置:', pos);
            this.isMouseDown = false;

            remoteControlService.sendCommand({
                cmd: flags,
                // x: Math.round(pos.x),
                // y: Math.round(pos.y),
                button: event.button
            });
            this.mouseButton = null;
        },

        // 双击事件
        handleDoubleClick(event) {
            console.log('双击事件触发');
            const flags = this.getMouseEventFlag(event, 'dblclick');
            const pos = this.getRelativePosition(event);
            console.log('双击位置:', pos);

            remoteControlService.sendCommand({
                cmd: flags,
                button: event.button
            });
        },

        // 右键菜单事件
        handleContextMenu(event) {
            console.log('右键菜单事件触发');
            console.log('handleContextMenu 方法被调用');
            // 已经阻止默认行为，只需要发送右键按下事件
            // 实际右键按下已经在handleMouseDown中处理
        },

        // 鼠标滚轮事件
        handleMouseWheel(event) {
            console.log('鼠标滚轮事件触发');
            const flags = this.getMouseEventFlag(event, 'wheel');
            const pos = this.getRelativePosition(event);
            console.log('鼠标滚轮位置:', pos);

            remoteControlService.sendCommand({
                cmd: flags,
                x: pos.x,
                y: pos.y,
                dw: event.deltaY
            });
        },

        // 键盘按下事件
        handleKeyDown(event) {
            console.log('键盘按下事件触发');
            //0x0000（即 0）：表示按键按下（KEY_DOWN）。

            //0x0002（即 2）：表示按键释放（KEY_UP）。

            //0x0001（即 1）：扩展键标志（如功能键、小键盘键等，一般不常用）。
            remoteControlService.sendCommand({
                key: event.key,
                keyCode: event.keyCode,
                s: 0,
                f: 0
            });

            // 阻止默认行为（可选）
            if ([9, 13, 27, 32].includes(event.keyCode)) { // Tab, Enter, Esc, Space
                event.preventDefault();
            }
        },

        // 键盘释放事件
        handleKeyUp(event) {
            console.log('键盘释放事件触发');
            //0x0000（即 0）：表示按键按下（KEY_DOWN）。

            //0x0002（即 2）：表示按键释放（KEY_UP）。

            //0x0001（即 1）：扩展键标志（如功能键、小键盘键等，一般不常用）。
            remoteControlService.sendCommand({
                key: event.key,
                keyCode: event.keyCode,
                s: 0,
                f: 2
            });
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
    border: 1px solid #ccc;
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
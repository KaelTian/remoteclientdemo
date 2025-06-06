import pako from 'pako';
class State {
    /** @type {CanvasRenderingContext2D} */
    canvas2dContext;
    /** @type {HTMLCanvasElement} */
    canvasElement;
    /** @type {string} */
    canvasId;
    // /** @type {any} */
    // componentRef;
    /** @type {"touch" | "mouse"} */
    currentPointerType;
    /** @type {boolean} */
    isDragging;
    /** @type {number} */
    lastMouseMove;
    /** @type {boolean} */
    longPressStarted;
    /** @type {number} */
    longPressStartOffsetX;
    /** @type {number} */
    longPressStartOffsetY;
    /** @type {number} */
    mouseMoveTimeout;
    /** @type {PointerEvent} */
    pointerDownEvent;
    /** @type {number} */
    previousPinchDistance;
    /** @type {number} */
    touchClickTimeout;
    /** @type {TouchList} */
    touchList;
    /** @type {WindowEventHandler[]} */
    windowEventHandlers;

    constructor() {
        this.windowEventHandlers = [];
        this.touchList = { length: 0 };
        this.previousPinchDistance = -1;
        this.mouseMoveTimeout = -1;
        this.touchClickTimeout = -1;
        this.lastMouseMove = Date.now();
    }
    /**
     * 调用 .NET 方法
     * @param {string} methodName - 要调用的 .NET 方法名
     * @param {...any} args - 传递给 .NET 方法的参数
     * @returns {Promise<any>}
     */
    invokeDotNet(methodName, ...args) {
        // 基本参数验证
        if (typeof methodName !== 'string' || methodName.trim() === '') {
            throw new Error('方法名必须是有效的非空字符串');
        }

        // 调试日志（可选保留，但不再受 options.log 控制）
        console.groupCollapsed(`[invokeDotNet] 调用方法: ${methodName}`);
        console.log('参数:', args);
        console.groupEnd();

        try {
            // 实际调用 .NET 的代码（取消注释以下行）
            // return this.componentRef.invokeMethodAsync(methodName, ...args);

            // 临时返回（仅用于测试）
            return Promise.resolve({
                methodName,
                args
            });
        } catch (error) {
            console.error(`调用 .NET 方法 ${methodName} 失败:`, error);
            throw error;
        }
    }
}

class WindowEventHandler {
    /** @type {keyof WindowEventMap} */
    type;
    /** @type {EventListener} */
    handler;

    /**
     * 
     * @param {keyof WindowEventMap} type
     * @param {EventListener} handler
     */
    constructor(type, handler) {
        this.type = type;
        this.handler = handler;
    }
}


/**
 * 
 * @param {string} canvasId
 */
export async function dispose(canvasId) {
    const state = getState(canvasId);

    state.windowEventHandlers.forEach(x => {
        console.log("Removing event handler: ", x);
        window.removeEventListener(x.type, x.handler);
    })

    delete window[canvasId];
}

/**
 * Draws the encoded image onto the canvas at the specified region.
 * @param {string} canvasId
 * @param {Number} x
 * @param {Number} y
 * @param {Number} width
 * @param {Number} height
 * @param {Uint8Array} encodedRegion
 */
export async function drawFrame(canvasId, x, y, width, height, encodedRegion) {
    const state = getState(canvasId);
    // 解压并优化图像质量
    const uint8Array = Uint8Array.from(atob(encodedRegion), c => c.charCodeAt(0));
    const decompressed = pako.ungzip(uint8Array);

    // 使用更高质量的图像解码选项
    const imageBlob = new Blob([decompressed], { type: 'image/jpeg' });
    const bitmap = await createImageBitmap(imageBlob, {
        premultiplyAlpha: 'none',
        colorSpaceConversion: 'none',
        imageOrientation: 'none',
        resizeQuality: 'high'
    });

    // 使用更平滑的绘制方式并保持原始比例
    state.canvas2dContext.imageSmoothingEnabled = true;
    state.canvas2dContext.imageSmoothingQuality = 'high';

    // 计算保持原始比例的绘制尺寸
    const canvasRatio = width / height;
    const imageRatio = bitmap.width / bitmap.height;
    let drawWidth = width;
    let drawHeight = height;

    if (imageRatio > canvasRatio) {
        drawHeight = width / imageRatio;
    } else {
        drawWidth = height * imageRatio;
    }

    const offsetX = (width - drawWidth) / 2;
    const offsetY = (height - drawHeight) / 2;

    state.canvas2dContext.drawImage(bitmap, x + offsetX, y + offsetY, drawWidth, drawHeight);
    bitmap.close();
}

/**
 * Retains a reference to the canvas element ID and registers
 * event handlers for the canvas element.
 * @param {any} componentRef
 * @param {string} canvasId
 */
export async function initialize(canvasId) {
    const state = getState(canvasId);
    console.log("Initializing with state: ", state);

    /** @type {HTMLCanvasElement} */
    const canvas = document.getElementById(canvasId);

    //state.componentRef = componentRef;
    state.canvasId = canvasId;
    state.canvasElement = canvas;
    state.canvas2dContext = canvas.getContext("2d");

    canvas.addEventListener("pointerup", async ev => {
        if (state.currentPointerType != "touch") {
            return;
        }

        if (canvas.classList.contains("scroll-mode")) {
            ev.preventDefault();
            ev.stopPropagation();
            return;
        }

        if (state.longPressStarted && !state.isDragging) {
            await sendMouseButtonEvent(ev.offsetX, ev.offsetY, true, 2, state);
            await sendMouseButtonEvent(ev.offsetX, ev.offsetY, false, 2, state);
        }

        if (state.longPressStarted && state.isDragging) {
            await sendMouseButtonEvent(ev.offsetX, ev.offsetY, false, 0, state);
        }

        resetTouchState(state);
    });

    canvas.addEventListener("pointercancel", ev => {
        resetTouchState(state);
    });
    canvas.addEventListener("pointerout", ev => {
        resetTouchState(state);
    });
    canvas.addEventListener("pointerleave", ev => {
        resetTouchState(state);
    });

    canvas.addEventListener("pointermove", async ev => {
        if (canvas.classList.contains("minimized")) {
            return;
        }

        if (canvas.classList.contains("scroll-mode")) {
            ev.preventDefault();
            ev.stopPropagation();

            await sendPointerMove(state.pointerDownEvent.offsetX, state.pointerDownEvent.offsetY, state);

            const percentX = ev.offsetX / state.canvasElement.clientWidth;
            const percentY = ev.offsetY / state.canvasElement.clientHeight;

            if (Math.abs(ev.movementY) > Math.abs(ev.movementX)) {
                await state.invokeDotNet("SendWheelScroll", percentX, percentY, ev.movementY * 3, 0);
            }
            else if (Math.abs(ev.movementX) > Math.abs(ev.movementY)) {
                await state.invokeDotNet("SendWheelScroll", percentX, percentY, 0, ev.movementX * -3);
            }
            return;
        }

        if (state.longPressStarted && !state.isDragging) {
            ev.preventDefault();
            ev.stopPropagation();

            const moveDistance = getDistanceBetween(
                state.longPressStartOffsetX,
                state.longPressStartOffsetY,
                ev.offsetX,
                ev.offsetY);

            if (moveDistance > 10) {
                state.isDragging = true;
                await sendPointerMove(state.longPressStartOffsetX, state.longPressStartOffsetY, state);
                await sendMouseButtonEvent(state.longPressStartOffsetX, state.longPressStartOffsetY, true, 0, state);
            }

            return;
        }

        if (state.isDragging) {
            ev.preventDefault();
            ev.stopPropagation();
            await sendPointerMove(ev.offsetX, ev.offsetY, state, true);
        }
    })


    canvas.addEventListener("pointerdown", ev => {
        state.currentPointerType = ev.pointerType;
        state.pointerDownEvent = ev;
    });

    canvas.addEventListener("pointerenter", ev => {
        state.currentPointerType = ev.pointerType;
    });

    canvas.addEventListener("touchmove", ev => {
        if (state.longPressStarted || state.isDragging || canvas.classList.contains("scroll-mode")) {
            ev.preventDefault();
        }
    });

    canvas.addEventListener("mousemove", async ev => {
        if (canvas.classList.contains("minimized")) {
            return;
        }

        await sendPointerMove(ev.offsetX, ev.offsetY, state, true);
    });

    canvas.addEventListener("mousedown", async ev => {
        ev.stopPropagation();

        if (state.currentPointerType == "touch") {
            return;
        }

        if (ev.button == 3 || ev.button == 4) {
            ev.preventDefault();
        }

        if (canvas.classList.contains("minimized")) {
            return;
        }

        await sendMouseButtonEvent(ev.offsetX, ev.offsetY, true, ev.button, state);
    });

    canvas.addEventListener("mouseup", async ev => {
        ev.stopPropagation();

        if (state.currentPointerType == "touch") {
            return;
        }

        if (ev.button == 3 || ev.button == 4) {
            ev.preventDefault();
        }

        if (canvas.classList.contains("minimized")) {
            return;
        }

        await sendMouseButtonEvent(ev.offsetX, ev.offsetY, false, ev.button, state);
    });

    canvas.addEventListener("click", async ev => {
        ev.stopPropagation();

        if (state.currentPointerType == "mouse") {
            return;
        }

        window.clearTimeout(state.touchClickTimeout);
        state.touchClickTimeout = window.setTimeout(
            async () => {
                await sendMouseClick(ev.offsetX, ev.offsetY, ev.button, false, state);
            },
            500);
    });

    canvas.addEventListener("dblclick", async ev => {
        ev.stopPropagation();

        if (state.currentPointerType == "mouse") {
            return;
        }

        window.clearTimeout(state.touchClickTimeout);
        await sendMouseClick(ev.offsetX, ev.offsetY, ev.button, true, state);
    });

    canvas.addEventListener("wheel", async ev => {
        ev.preventDefault();
        ev.stopPropagation();

        if (canvas.classList.contains("minimized")) {
            return;
        }

        const percentX = ev.offsetX / state.canvasElement.clientWidth;
        const percentY = ev.offsetY / state.canvasElement.clientHeight;

        await state.invokeDotNet("SendWheelScroll", percentX, percentY, -ev.deltaY, 0);
    });

    canvas.addEventListener("contextmenu", async ev => {
        ev.preventDefault();
        ev.stopPropagation();

        if (canvas.classList.contains("minimized") ||
            canvas.classList.contains("scroll-mode")) {
            return;
        }

        if (state.currentPointerType == "touch") {
            state.longPressStarted = true;
            state.longPressStartOffsetX = ev.offsetX;
            state.longPressStartOffsetY = ev.offsetY;
        }
    });


    /** @param {KeyboardEvent} ev */
    const onKeyDown = async (ev) => {
        if (document.querySelector("input:focus") || document.querySelector("textarea:focus")) {
            return;
        }

        if (canvas.classList.contains("minimized")) {
            return;
        }

        if (!ev.ctrlKey || !ev.shiftKey || ev.key.toLowerCase() != "i") {
            ev.preventDefault();
        }

        await state.invokeDotNet("SendKeyEvent", ev.key, true);
    };
    window.addEventListener("keydown", onKeyDown);
    state.windowEventHandlers.push(new WindowEventHandler("keydown", onKeyDown));

    /** @param {KeyboardEvent} ev */
    const onKeyUp = (ev) => {
        if (document.querySelector("input:focus") || document.querySelector("textarea:focus")) {
            return;
        }

        if (canvas.classList.contains("minimized")) {
            return;
        }
        ev.preventDefault();
        const keyPressDto = {
            dtoType: "keyEvent",
            isPressed: false,
            key: ev.key
        };

        state.invokeDotNet("SendKeyEvent", ev.key, false);
    }
    window.addEventListener("keyup", onKeyUp);
    state.windowEventHandlers.push(new WindowEventHandler("keyup", onKeyUp));

    const onBlur = async () => {
        await state.invokeDotNet("SendKeyboardStateReset");
    }
    window.addEventListener("blur", onBlur);
    state.windowEventHandlers.push(new WindowEventHandler("blur", onBlur));
}


/**
 * 
 * @param {number} pinchCenterX
 * @param {number} pinchCenterY
 * @param {HTMLDivElement} contentDiv
 * @param {HTMLcanvasElement} canvasRef
 * @param {number} canvasCssWidth
 * @param {number} canvasCssHeight
 * @param {number} widthChange
 * @param {number} heightChange
 */
export async function scrollTowardPinch(pinchCenterX, pinchCenterY, contentDiv, canvasRef, canvasCssWidth, canvasCssHeight, widthChange, heightChange) {
    canvasRef.style.width = `${canvasCssWidth}px`;
    canvasRef.style.height = `${canvasCssHeight}px`;

    var clientAdjustedScrollLeftPercent = (contentDiv.scrollLeft + (contentDiv.clientWidth * .5)) / contentDiv.scrollWidth;
    var clientAdjustedScrollTopPercent = (contentDiv.scrollTop + (contentDiv.clientHeight * .5)) / contentDiv.scrollHeight;

    var pinchAdjustX = pinchCenterX / window.innerWidth - .5;
    var pinchAdjustY = pinchCenterY / window.innerHeight - .5;

    var scrollByX = widthChange * (clientAdjustedScrollLeftPercent + (pinchAdjustX * contentDiv.clientWidth / contentDiv.scrollWidth));
    var scrollByY = heightChange * (clientAdjustedScrollTopPercent + (pinchAdjustY * contentDiv.clientHeight / contentDiv.scrollHeight));

    contentDiv.scrollBy(scrollByX, scrollByY);
}


/**
 * 
 * @param {string} key
 * @param {string} canvasId
 */
export async function sendKeyPress(key, canvasId) {
    const state = getState(canvasId);

    await state.invokeDotNet("SendKeyEvent", key, true);
    await state.invokeDotNet("SendKeyEvent", key, false);
}

/**
 * @param {number} point1X
 * @param {number} point1Y
 * @param {number} point2X
 * @param {number} point2Y
 */
function getDistanceBetween(point1X, point1Y, point2X, point2Y) {
    return Math.sqrt(Math.pow(point1X - point2X, 2) +
        Math.pow(point1Y - point2Y, 2));
}

/**
 * 
 * @param {string} canvasId
 * @returns {State}
 */
function getState(canvasId) {
    if (!window[`state-${canvasId}`]) {
        window[`state-${canvasId}`] = new State();
    }
    return window[`state-${canvasId}`];
}


/**
 * 
 * @param {State} state
 */
function resetTouchState(state) {
    state.longPressStarted = false;
    state.isDragging = false;
    state.canvasElement.parentElement.style.touchAction = "";
}

/**
 * 
 * @param {number} offsetX
 * @param {number} offsetY
 * @param {State} state
 * @param {boolean} throttle
 */
async function sendPointerMove(offsetX, offsetY, state, throttle = false) {
    const percentX = offsetX / state.canvasElement.clientWidth;
    const percentY = offsetY / state.canvasElement.clientHeight;
    const throttleTimeout = 50;

    if (!throttle) {
        await state.invokeDotNet("SendPointerMove", percentX, percentY);
        return
    }

    window.clearTimeout(state.mouseMoveTimeout);

    const now = Date.now();
    if (now - state.lastMouseMove > throttleTimeout) {
        await state.invokeDotNet("SendPointerMove", percentX, percentY);
        state.lastMouseMove = now;
        return;
    }

    state.mouseMoveTimeout = window.setTimeout(async () => {
        await state.invokeDotNet("SendPointerMove", percentX, percentY);
    }, throttleTimeout);
}

/**
 * 
 * @param {number} offsetX
 * @param {number} offsetY
 * @param {boolean} isPressed
 * @param {number} button
 * @param {State} state
 */
async function sendMouseButtonEvent(offsetX, offsetY, isPressed, button, state) {
    const percentX = offsetX / state.canvasElement.clientWidth;
    const percentY = offsetY / state.canvasElement.clientHeight;
    await state.invokeDotNet("SendMouseButtonEvent", button, isPressed, percentX, percentY);
}


/**
 * 
 * @param {number} offsetX
 * @param {number} offsetY
 * @param {number} button
 * @param {boolean} isDoubleClick
 * @param {State} state
 */
async function sendMouseClick(offsetX, offsetY, button, isDoubleClick, state) {
    const percentX = offsetX / state.canvasElement.clientWidth;
    const percentY = offsetY / state.canvasElement.clientHeight;
    await state.invokeDotNet("SendMouseClick", button, isDoubleClick, percentX, percentY);
}
<template>
    <div class="app-container">
        <!-- 导航栏 -->
        <nav class="app-nav">
            <router-link to="/" class="nav-link">点位集合设备列表</router-link>
            <router-link to="/objectview" class="nav-link">对象设备列表</router-link>
            <router-link to="/settings" class="nav-link">服务设置</router-link>
            <!--<router-link to="/signalrtest" class="nav-link">SignalR测试</router-link> -->
        </nav>

        <!-- 路由出口：根据当前路由显示对应的组件 -->
        <router-view />
    </div>
</template>

<style scoped>
.app-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
}

.app-nav {
    display: flex;
    gap: 16px;
    padding: 16px 0;
    border-bottom: 1px solid #e0e0e0;
    margin-bottom: 24px;
}

.nav-link {
    text-decoration: none;
    color: #333;
    padding: 8px 16px;
    border-radius: 4px;
}

.nav-link:hover {
    background-color: #f5f5f5;
}

/* 当前激活的路由链接样式 */
.nav-link.router-link-exact-active {
    color: #42b983;
    font-weight: bold;
    border-bottom: 2px solid #42b983;
}
</style>

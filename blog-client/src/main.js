import { createApp } from 'vue'
import './style.css'
/* 编程式 ElMessageBox 不会走按需组件样式，需单独引入 overlay / message-box 基础样式，否则遮罩无 fixed 会堆在 body 末尾 */
import 'element-plus/es/components/message-box/style/css'
import 'element-plus/es/components/message/style/css'
import '@/styles/markdown-body.less'
import App from './App.vue'
import router from './router'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

const app = createApp(App)
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(router).mount('#app')

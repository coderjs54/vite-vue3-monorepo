import { createApp } from 'vue'
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'
import './style.css'
import App from './App.vue'

const app = createApp(App)

// 全局注册 QuillEditor 组件
app.component('QuillEditor', QuillEditor)

app.mount('#app')

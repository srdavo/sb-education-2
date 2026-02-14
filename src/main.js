import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { pinia } from './stores'
import { VueQueryPlugin } from '@tanstack/vue-query'

import './styles/main.css'

createApp(App).use(router).use(pinia).use(VueQueryPlugin).mount('#app')

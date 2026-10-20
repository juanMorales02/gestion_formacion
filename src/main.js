import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPersist from 'pinia-plugin-persistedstate'
import { Quasar } from 'quasar'
import '@quasar/extras/material-icons/material-icons.css'
import 'quasar/dist/quasar.css'
import './css/app.css'
import App from './App.vue'
import router from './router'

const pinia = createPinia()
pinia.use(piniaPersist)
createApp(App).use(Quasar).use(pinia).use(router).mount('#app')

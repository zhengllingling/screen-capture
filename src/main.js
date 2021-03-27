import Vue from 'vue'
import App from './App.vue'
import store from './store'

import './style/index.scss'
import './assets/iconfont/iconfont.css'

Vue.config.productionTip = false

new Vue({
  store,
  render: h => h(App)
}).$mount('#app')

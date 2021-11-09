// Base imports
import Vue from 'vue'
import App from './App.vue'
import store from './store'

// Plugin import
// Side effect plugins are imported in plugins/index.js
import {
	vuetify,
	i18n,
	router,
	momentJs
} from '@/plugins'

// Shared function import
import '@/common/utilities'

// Global component import
import '@/components'

// Style dependencies import
import '@/assets'

// Vue configuration
Vue.config.silent = true

new Vue({
    el: '#app',
    router,
    store,
	i18n,
	vuetify,
	momentJs,
	components: { App },
	template: '<App/>'
})

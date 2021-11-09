import Vue from 'vue'
import Api from '../axios/api'

// Global access to the axios API
Vue.prototype._api = Api

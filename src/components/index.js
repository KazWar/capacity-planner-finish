import Vue from 'vue'

import Snackbar from '@/components/Snackbar.vue'
import NotificationSnackbar from '@/components/NotificationSnackbar.vue'
import NotificationItem from '@/components/NotificationItem.vue'
import Loader from '@/components/Loader.vue'
import Navigation from '@/components/Navigation.vue'
import PageContent from '@/components/PageContent.vue'
import WorkOrder from '@/components/WorkOrder.vue'
import Chart from '@/components/Chart.vue'
import Picker from '@/components/Picker.vue'
import Badge from '@/components/Badge.vue'
import TrainSchedule from '@/components/TrainSchedule.vue'
import KPI from '@/components/KPI.vue'
import Gantt from '@/components/Gantt.vue'
import DateTimePicker from '@/components/DateTimePicker.vue'
import TreeSelect from '@/components/TreeSelect.vue'
import FleetStatusDots from '@/components/FleetStatusDots.vue'
import TextInput from '@/components/TextInput.vue'
import Modal from '@/components/Modal.vue'

Vue.component('snackbar', Snackbar)
Vue.component('notification-snackbar', NotificationSnackbar)
Vue.component('notification-item', NotificationItem)
Vue.component('loader', Loader)
Vue.component('navigation', Navigation)
Vue.component('page-content', PageContent)
Vue.component('work-order', WorkOrder)
Vue.component('chart', Chart)
Vue.component('picker', Picker)
Vue.component('badge', Badge)
Vue.component('train-schedule', TrainSchedule)
Vue.component('kpi', KPI)
Vue.component('gantt', Gantt)
Vue.component('DateTimePicker', DateTimePicker)
Vue.component('TreeSelect', TreeSelect)
Vue.component('fleetstatusdots', FleetStatusDots)
Vue.component('TextInput', TextInput)
Vue.component('modal', Modal)

import Vue from 'vue'
import Moment from 'moment-timezone'
import VueMomentJS from 'vue-momentjs'
import { extendMoment } from 'moment-range'

const moment = extendMoment(Moment)
moment.updateLocale(moment.locale('nl'), { invalidDate: "" })
moment.suppressDeprecationWarnings = true

Vue.use(VueMomentJS, moment)

export const momentJs = moment()


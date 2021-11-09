import Vue from 'vue'
import Vuex from 'vuex'

import locations from './locations'
import uiStyle from './ui-style'
import common from './common'
import security from './security'
import administration from './administration'
import internationalization from './internationalization'

Vue.use(Vuex)

/*
 * If not building with SSR mode, you can
 * directly export the Store instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Store instance.
 */

export default new Vuex.Store(
	{
		modules: {
			common,
			administration,
			security,
			internationalization,
			locations,
			uiStyle
		},
		// enable strict mode (adds overhead!)
		// for dev mode and --debug builds only
		strict: process.env.NODE_ENV !== 'production'
	})

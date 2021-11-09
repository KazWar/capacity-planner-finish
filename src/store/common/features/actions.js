import { DemoService } from '@/services'

export default {
	async loadFeatures({ commit }) {
		const data = await DemoService.getFeatures()
		if (data) {
			commit('storeFeatures', data)
		}
	}
}


import { DemoService } from '@/services'
import { Guardian } from '@/common/model'
import features from '@/data/demo/features.json'

export default {
	async loadUser({ commit, dispatch }) {
		console.log("Retrieving account...")
		const data = await DemoService.getAccount()

		console.log(`Account retrieved! ${data}`)
		if (data) {
			console.log(`Storing account ${data}`)
			commit('registerUser', data)
			console.log(`Account stored! ${data}`)
		}

		// Create a guardian using the user's data.
		console.log("Creating guardian...")

		const guardian = new Guardian({
				features: features,
				principal: data,
				permissions: data.permissions
			}
		)
		console.log(`Guardian created! ${guardian}`)

		if (guardian){
			console.log(`Registering guardian...`)
			dispatch('guardian/saveGuardian', guardian, {root:true})
			console.log(`Guardian Registered!`)
		}
	}
}


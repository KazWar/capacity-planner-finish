import { User } from '@/common/model/security/user'
import { DemoService } from '@/services'

export default {
	async loadUsers({ commit }) {
		const data = await DemoService.getUsers()
		if (data) {
			commit('storeUsers', data)
		}
	},

	async saveUser({ commit }, data) {
		if (data){
			const user = new User(data)
			commit('storeUser', user)
		}
	}
}


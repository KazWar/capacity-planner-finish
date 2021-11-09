export default {
	async saveGuardian ({commit}, guardian){
		commit('registerGuardian', guardian)
	},

	async deleteGuardian({commit}){
		commit('purgeGuardian')
	}
}

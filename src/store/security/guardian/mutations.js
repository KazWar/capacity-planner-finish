export default {
	registerGuardian(state, guardian){
		state.current = guardian
	},

	purgeGuardian(state){
		state.current = null
	}
}

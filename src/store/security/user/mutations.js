export default {
	/**
	 * Registers the currently logged in user into the store.
	 */
	registerUser(state, user) {
		state.current = user
	},

	/**
	 * Purges the currently logged in user from the store.
	 */
	purgeUser(state) {
		state.current = null
	}
}

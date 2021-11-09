export default {
	/**
	 * Adds a list of all users
	 */
	storeUsers(state, items = []) {
		state.allUsers = items
		state.hasUsers = true
	},

	/**
	 * Adds a new user.
	 */
	storeUser(state, user) {
		state.list.push(user)
	},

	/**
	 * Modifies an existing user
	 */
	updateUser(state, user) {
		const index = state.list.findIndex(u => u.id === user.id)
		// On specified index remove the specified number of records.
		// Optionally inserts new records at this position
		state.list.splice(index, 1, user)
	},

	/**
	 * Delete an user
	 */
	deleteUser(state, user) {
		const index = state.list.findIndex(u => u.id === user.id)
		state.list[index].isDeleted = false
	}
}

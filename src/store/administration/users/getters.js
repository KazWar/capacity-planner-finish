export default {
	getUserById: (state) => (id) => {
		return state.allUsers.find(u => u.id === id)
	}
}


export default {
	SET_LOCATIONS (state, payload) {
		state.locations = payload
	},
	SET_UPDATED_LOCATIONS (state, payload) {
		state.updatedLocations = payload
	},
	SET_GENERATED_LOCATIONS (state, payload) {
		state.generatedlocations = payload
	},
	SET_UPDATED_GENERATED_LOCATIONS (state, payload) {
		state.updatedGeneratedLocations = payload
	},
	SET_CURRENT_LOCATION_ID (state, payload) {
		const sessionLoc = sessionStorage.getItem('locationId')
		if (!sessionLoc || sessionLoc === 'null') {
			sessionStorage.setItem('locationId', localStorage.getItem('locationId'))
		}
		state.curentLocationId = sessionStorage.getItem('locationId')
	}
}

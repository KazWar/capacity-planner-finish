export default {
	GET_LOCATIONS: state => {
		return state.locations
	},

	GET_UPDATED_LOCATIONS: state => {
		return state.updatedLocations
	},

	GET_GENERATED_LOCATIONS: state => {
		return state.generatedlocations
	},

	GET_UPDATED_GENERATED_LOCATIONS: state => {
		return state.updatedGeneratedLocations
	},

	GET_CURRENT_LOCATION_ID: state => {
		return state.curentLocationId
	},

	GET_CURRENT_LOCATION: state => {
		return state.updatedLocations.find(item => item.id === +state.curentLocationId) || null
	},

	GET_DECLINE_REASONS: state => {
		return state.declineReasonsServiceRequest
	}
}

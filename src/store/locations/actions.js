export default {
	GET_LOCATIONS_FROM_API ({ commit, state }, {vm}) {
		this._vm._api.getLocationList()
			.then(res => {
				res.forEach(item => {
					item.defaultReasonMaintenance === 'Service' ? item.defaultReasonMaintenance = 'SERVICE' : item.defaultReasonMaintenance
				})
				let locations = vm.sortLocations(vm.parseValues(res))
				let generatedLocations = vm.generateLocationTree(locations)
				let updatedGeneratedLocations = this._vm._.cloneDeep(generatedLocations)
				updatedGeneratedLocations.unshift({
					id: 'MAT',
					label: 'MAT'
				}, {
					id: 'TRANS',
					label: 'TRANS'
				}, {
					id: 'BUIT',
					label: 'BUIT'
				})
				let updatedLocations = this._vm._.cloneDeep(locations)
				updatedLocations.unshift({
					id: 'MAT',
					label: 'MAT',
					name: 'MAT',
					locationNumber: 'MAT',
					station: 'MAT'
				}, {
					id: 'TRANS',
					label: 'TRANS',
					name: 'TRANS',
					locationNumber: 'TRANS',
					station: 'TRANS'
				}, {
					id: 'BUIT',
					label: 'BUIT',
					name: 'BUIT',
					locationNumber: 'BUIT',
					station: 'BUIT'
				})

				commit('SET_LOCATIONS', locations)
				commit('SET_GENERATED_LOCATIONS', generatedLocations)
				commit('SET_UPDATED_LOCATIONS', updatedLocations)
				commit('SET_UPDATED_GENERATED_LOCATIONS', updatedGeneratedLocations)
			})
			.catch(err => {
				console.log(err)
			})
	}
}

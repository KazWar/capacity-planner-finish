import Vue from 'vue'

Vue.mixin({
	data: function () {
		return {
			globalOverflow: false,
			scrollBarOpts: {
				handlers: ['click-rail', 'drag-thumb', 'keyboard', 'wheel', 'touch'],
				minScrollbarLength: 20
				// useBothWheelAxes: true,
			}
		}
	},
	methods: {
		getCurrentPage () {
			let afterHash = window.location.hash.substr(1)
			return afterHash
		},
		sortLocations (locations) {
			return this._.orderBy(locations, ['name'], ['asc'])
		},
		formatToHours (n) {
			return Math.round(n / 60)
		},
		parseValues (arr) {
			let result = arr

			for (let i in result) {
				for (let key in arr[i]) {
					if (result[i].hasOwnProperty(key) && typeof result[i][key] === 'string') {
						result[i][key] = result[i][key].replace(/\b\s+/, ' ')
					}
				}
			}

			return result
		},
		generateLocationTree (locations) {
			let locationGroups = this._.uniq(locations.map(i => i.region))

			let result = []

			for (let i in locationGroups) {
				let group = locationGroups[i]
				let groupObject = {
					id: group,
					label: group,
					station: group,
					children: locations.map(i => ({
						id: i.id,
						label: i.name,
						group: i.region,
						station: i.station || i.region
					})).filter(x => {
						return x.group == group
					})
				}

				result.push(groupObject)
			}

			return result
		}
	}
})

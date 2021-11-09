<template>
	<div class="content-half-full">
		<div class="content-child-full">
			<div class="scrollable-y content-child content-footered">
				<div class="data-col-item"
					 v-for="(location, locationIndex) in locations"
					 :key="locationIndex"
					 @click="openModalWindow(location)"
				>
					<div class="col">
						{{String(location.locationNumber)}}
					</div>
					<div class="col">
						{{location.name}}
					</div>
					<div class="col">
						{{location.locationType}}
					</div>
					<div class="col">
						{{location.code}}
					</div>
					<div class="col">
						{{getDurationTimeStampFromMinutes(location.shuntingTime)}}
					</div>
					<div class="col">
						<div class="icon-container aanpassen">
							<icon color="#0079D3" :size="30" name="aanpassen"></icon>
						</div>
					</div>
				</div>
			</div>
		</div>
		<modal v-model="displayLocationModal" :title="selectedLocation.id ? 'Locatie aanpassen' : 'Nieuwe locatie'" scrollable="true" v-if="displayLocationModal">
			<div slot="content" style="padding-top: 10px;">
				<TreeSelect
					v-model="selectedLocation.region"
					:options="regions"
					options-label="name"
					options-id="name"
					:async="true"
					label="Kies regio"
					title="Kies regio"
					:class="{'danger': formWarnings.indexOf('region') !== -1}"
				/>
				<TextInput
					:paddingless="true"
					:number="true"
					title="Kies locatie nummer"
					placeholder="Kies locatie nummer"
					v-model="selectedLocation.locationNumber"
					:class="{'danger': formWarnings.indexOf('locationNumber') !== -1}"
				/>
				<TextInput
					:paddingless="true"
					title="Vul naam van locatie in"
					placeholder="Vul naam van locatie in"
					v-model="selectedLocation.name"
					:class="{'danger': formWarnings.indexOf('name') !== -1}"
				/>
				<TextInput
					:paddingless="true"
					title="Vul locatie type in"
					placeholder="Vul locatie type in"
					v-model="selectedLocation.locationType"
					:class="{'danger': formWarnings.indexOf('locationType') !== -1}"
				/>
				<TextInput
					:paddingless="true"
					title="Vul station afkorting in"
					placeholder="Vul station afkorting in"
					v-model="selectedLocation.station"
					:class="{'danger': formWarnings.indexOf('station') !== -1}"
				/>
				<DateTimePicker
					label="Kies minimale overstandtijd"
					title="Kies minimale overstandtijd"
					v-model="selectedLocation.minOverstandMinutes"
					class="picker-container"
					onlyTime="true"
					:class="{'danger': formWarnings.indexOf('shuntingTime') !== -1}"
				/>
				<DateTimePicker
					label="Kies rangeertijd"
					title="Kies rangeertijd"
					v-model="selectedLocation.shuntingTime"
					class="picker-container"
					onlyTime="true"
				/>
				<TextInput
					:paddingless="true"
					title="Vul dienstregelpunt in"
					placeholder="Vul dienstregelpunt in"
					v-model="selectedLocation.NTTstation"
					:class="{'danger': formWarnings.indexOf('NTTstation') !== -1}"
				/>
				<TextInput
					:paddingless="true"
					title="Standaardopdracht PersonId"
					placeholder="Standaardopdracht PersonId"
					v-model="selectedLocation.defaultAssignmentPersonId"
					:class="{'danger': formWarnings.indexOf('defaultAssignmentPersonId') !== -1}"
				/>
				<DateTimePicker
					label="Starttijd"
					title="Starttijd"
					v-model="openingHoursStart"
					class="picker-container"
					onlyTime="true"
				/>
				<DateTimePicker
					label="Eindtijd"
					title="Eindtijd"
					:minDate="openingHoursStart"
					v-model="openingHoursEnd"
					class="picker-container"
					onlyTime="true"
				/>
				<TreeSelect
					v-model="selectedLocation.defaultReasonMaintenance"
					:options="reasonMaintenances"
					options-id="code"
					options-label="reason"
					label="Standaard reden onderhoud"
					title="Standaard reden onderhoud"
					:class="{'danger': formWarnings.indexOf('region') !== -1}"
				/>
				<TextInput
					:paddingless="true"
					title="Knooppunt"
					placeholder="Knooppunt"
					v-model="selectedLocation.knoopPunt"
				/>
				<TextInput
					:paddingless="true"
					title="Aantal gelijktijdig onderhoud"
					placeholder="Aantal gelijktijdig onderhoud"
					v-model="selectedLocation.maxSimultaneousMaintenance"
					:number="true"
				/>
				<TextInput
					:paddingless="true"
					title="Aantal gelijktijdig EBK"
					placeholder="Aantal gelijktijdig EBK"
					v-model="selectedLocation.maxSimultaneousEBK"
					:number="true"
				/>
				<TextInput
					:paddingless="true"
					title="Aantal gelijktijdig Kuilwielenbank"
					placeholder="Aantal gelijktijdig Kuilwielenbank"
					v-model="selectedLocation.maxSimultaneousKuilwielenbank"
					:number="true"
				/>
				<TreeSelect
					v-model="selectedLocation.commodityGroups"
					:options="commodityGroups"
					options-label="name"
					options-id="name"
					label="Kies een dienstgroep"
					title="Dienstgroep"
					:searchable="false"
					:limit="5"
					:limitText="count => `en nog ${count}`"
					:multiple="true"
					:flat="true"
					:autoSelectDescendants="true"
					:autoDeselectDescendants="true"
					:defaultExpandLevel="1"
					:normalize="false"
					:replaceValue="false"
				/>
				<div class="checkbox" :class="{'checked': selectedLocation.implemented}">
					<input type="checkbox" v-model="selectedLocation.implemented" id="doorBool">
					<icon name="vinkje" size="45" color="#0079D3" v-if="selectedLocation.implemented"/>
					<label for="doorBool">Binnen/buiten plussen</label>
				</div>
				<div class="checkbox" :class="{'checked': selectedLocation.autoplan}">
					<input type="checkbox" v-model="selectedLocation.autoplan" id="autoplanBool">
					<icon name="vinkje" size="45" color="#0079D3" v-if="selectedLocation.autoplan"/>
					<label for="autoplanBool">Automatisch plannen en toewijzen</label>
				</div>
			</div>
			<div slot="buttons" style="padding-top: 20px;">
				<div class="delete" style="position: absolute; left: 20px;" v-if="selectedLocation.id" @click="openDeleteLocationModal()">
					<div class="icon-container plus">
						<icon :size="30" color="#DC0000" name="plus"></icon>
					</div>
					<div class="label">
						Verwijderen
					</div>
				</div>
				<button class="button right" @click="saveLocation()">Opslaan</button>
			</div>
		</modal>
`
		<!-- Delete location -->
		<modal v-model="displayDeleteLocationModal" title="Locatie verwijderen" v-if="displayDeleteLocationModal">
			<div slot="content" style="padding-top: 10px;">
				Weet u zeker dat u deze locatie wilt verwijderen? Dit kan niet ongedaan gemaakt worden.
			</div>
			<div slot="buttons" style="padding-top: 20px;">
				<button class="button blue left" @click="closeDeleteLocationModal()">Nee, terug</button>
				<button class="button red right" @click="deleteLocation()">Ja, verwijderen</button>
			</div>
		</modal>
	</div>
</template>

<script>
	import $loader from '@/modules/loader-module'
	import $snackbar from '@/modules/snackbar-module'
	import $date from '@/modules/date-module'
	export default {
		data () {
			return {
				footerButton: 'Locatie toevoegen',
				openingHoursStart: null,
				displayDeleteLocationModal: false,
				openingHoursEnd: null,
				formWarnings: [],
				uploads: [],
				selectedLocation: {},
				commodityGroups: [],
				reasonMaintenances: [],
				regions: [],
				initialLocation: {
					region: null,
					locationNumber: null,
					locationType: null,
					name: null,
					shuntingTime: null,
					minOverstandMinutes: null,
					station: null,
					NTTstation: null
				},
				displayLocationModal: false,
			}
		},
		computed: {
			locations: {
				get () {
					return this.$store.getters.GET_LOCATIONS
				},
				set (val) {
					console.log(val)
				}
			},
		},
		watch: {
			displayLocationModal () {
				if (!this.displayLocationModal) {
					this.openingHoursStart = null
					this.openingHoursEnd = null
				}
			},
		},
		beforeMount () {
			this.updateRegions()
			this.getReasonMaintenances()
		},
		methods: {
			footerButtonMethod () {
				this.openModalWindow()
			},
			deleteLocation () {
				$loader.message = 'Locatie verwijderen'
				this._api.deleteLocation(this.selectedLocation.id)
					.then(res => {
						for (let i = this.locations.length - 1; i >= 0; i--) {
							let location = this.locations[i]
							if (location.id === this.selectedLocation.id) {
								this.locations.splice(i, 1)
							}
						}
						this.selectedLocation = Object.assign({}, this.initialLocation)
						this.displayDeleteLocationModal = false
						$snackbar.add('Locatie verwijderd')
						$loader.message = null
						this.$forceUpdate()
					})
					.catch(err => {
						console.log(err)
						$loader.message = null
					})
			},
			saveLocation () {
				if (!this.validateLocation()) {
					return
				}

				let offset = this.$moment().utcOffset();
				let openingHoursStart, openingHoursEnd;

				if(this.openingHoursStart){
					let openingHoursStartHours = this.openingHoursStart.split(':')[0],
						openingHoursStartMinutes = this.openingHoursStart.split(':')[1]

					openingHoursStart = this.$moment().utc().set({'hours': openingHoursStartHours, 'minutes': openingHoursStartMinutes}).subtract(offset, 'minutes').format('HH:mm')
				}
				if(this.openingHoursEnd){
					let openingHoursEndHours = this.openingHoursEnd.split(':')[0],
						openingHoursEndMinutes = this.openingHoursEnd.split(':')[1]

					openingHoursEnd = this.$moment().utc().set({'hours': openingHoursEndHours, 'minutes': openingHoursEndMinutes}).subtract(offset, 'minutes').format('HH:mm')
				}
				const locationId = this.selectedLocation.id
				const message = locationId ? 'Locatie aanpassen' : 'Locatie toevoegen'
				$loader.message = message

				const data = {
					...this.selectedLocation,
					shuntingTime: Number(this.selectedLocation.shuntingTime.substring(0, 2)) * 60 + Number(this.selectedLocation.shuntingTime.substring(3, 5)),
					minOverstandMinutes: Number(this.selectedLocation.minOverstandMinutes.substring(0, 2)) * 60 + Number(this.selectedLocation.minOverstandMinutes.substring(3, 5)),
					implemented: this.selectedLocation.implemented,
					autoplan: this.selectedLocation.autoplan,
					autoplanComodity: this.selectedLocation.autoplanComodity,
					autolocation: this.selectedLocation.autolocation,
					commodityGroups: this.selectedLocation.commodityGroups,
					knoopPunt: this.selectedLocation.knoopPunt,
					openingHoursStart: openingHoursStart,
					openingHoursEnd: openingHoursEnd
				}
				this._api.setLocation(data).then(res => {
					this.$store.dispatch('GET_LOCATIONS_FROM_API', {vm:this})
					this.selectedLocation = Object.assign({}, this.initialLocation)
					this.displayLocationModal = false
					$snackbar.add('Locatie toegevoegd')
					$loader.message = null
					this.openingHoursStartHours = null
					this.openingHoursStartEnd = null
				}).catch(err => {
					console.log(err)
					$loader.message = null
				})
			},
			validateLocation () {
				this.formWarnings = []
				if (!this.selectedLocation) {
					return false
				}

				let properties = Object.keys(this.initialLocation)
				for (let propertyIndex in properties) {
					let propertyName = properties[propertyIndex]
					let value = this.selectedLocation[propertyName]
					if (value === null || value === '') {
						this.formWarnings.push(propertyName)
					}
				}
				return this.formWarnings.length === 0
			},
			openModalWindow (data) {
				this.formWarnings = []
				this.getCommodityGroups()
				if (data) {
					this.selectedLocation = Object.assign({}, {
						...data,
						shuntingTime: this.getDurationTimeStampFromMinutes(data.shuntingTime || 0),
						minOverstandMinutes: this.getDurationTimeStampFromMinutes(data.minOverstandMinutes || 0),
						implemented: data.implemented,
						autoplan: data.autoplan,
						autoplanComodity: data.autoplanComodity,
						autolocation: data.autolocation,
						commodityGroups: data.commodityGroups,
						openingHoursStart: data.openingHoursStart,
						openingHoursEnd: data.openingHoursEnd
					})
					this.commodityGroup = data.commodityGroups

					this.updateOpeningHours();
				}
				else {
					this.selectedLocation = Object.assign({}, this.initialLocation)
				}
				this.displayLocationModal = true
			},
			getDurationTimeStampFromMinutes (minutes) {
				let hours = Math.floor(minutes / 60)
				minutes = minutes - hours * 60
				hours = String(hours)
				if (hours.length === 1) {
					hours = '0' + hours
				}
				minutes = String(minutes)
				if (minutes.length === 1) {
					minutes = '0' + minutes
				}
				return hours + ':' + minutes
			},
			getCommodityGroups () {
				this._api.getWorkorderCommodityGroups()
					.then(res => {
						this.commodityGroups = res.map(item => {
							return {
								label: item,
								id: item
							}
						})
					})
			},
			updateOpeningHours(){
				let offset = this.$moment().utcOffset();

				let openingHoursStart, openingHoursEnd;

				if(this.selectedLocation.openingHoursStart){
					let openingHoursStartHours = this.selectedLocation.openingHoursStart.split(':')[0],
						openingHoursStartMinutes = this.selectedLocation.openingHoursStart.split(':')[1]

					this.openingHoursStart = this.$moment().clone().utc().set({'hours': openingHoursStartHours, 'minutes': openingHoursStartMinutes}).add(offset, 'minutes').format('HH:mm')
				}
				if(this.selectedLocation.openingHoursEnd){
					let openingHoursEndHours = this.selectedLocation.openingHoursEnd.split(':')[0],
						openingHoursEndMinutes = this.selectedLocation.openingHoursEnd.split(':')[1]

					this.openingHoursEnd = this.$moment().clone().utc().set({'hours': openingHoursEndHours, 'minutes': openingHoursEndMinutes}).add(offset, 'minutes').format('HH:mm')
				}
			},
			openDeleteLocationModal () {
				this.displayLocationModal = false
				this.displayDeleteLocationModal = true
			},
			closeDeleteLocationModal () {
				this.displayDeleteLocationModal = false
				this.displayLocationModal = true
			},
			getReasonMaintenances () {
				this._api.getReasonMaintenances().then((res) => {
					this.reasonMaintenances = res
				})
			},
			updateRegions (callback) {
				$loader.message = 'Regios ophalen'
				this._api.getLocationRegionList().then(res => {
					this.regions = res
					$loader.message = null
					this.uploads = []
					this.regions.forEach((region) => {
						if (!region.uploadfilename) {
							return
						}
						this.uploads.push({
							date: new Date(region.updatedAt || 0).getDate() + ' ' + $date.monthNames[new Date(region.updatedAt || 0).getMonth()] + ' ' + new Date(region.updatedAt || 0).getFullYear(),
							time: $date.toDateString(new Date(region.updatedAt || 0)).substring(11, 16),
							documentTitle: region.uploadfilename,
							uploaderName: region.name
						})
					})
					if (callback) {
						callback()
					}
				}).catch(err => {
					console.log(err)
					$loader.message = null
				})
			}
		}
	}
</script>
<style lang="scss" scoped src="../../../assets/scss/pages/data/data.scss" />

<template>
	<ModalWrapper :title='"Wijzig opstellingen: " + timeslotMaterial' :isModalOpened="isModalOpened" :canClose="true"  width="900px">
			<div slot="content">
				<TreeSelect
					icon="kalender"
					v-model="selectedTimeslot"
					:options="timeslots"
					options-label="value"
					options-id="id"
					label="Choose a service window"
				/>
				<div class="slots">
					<div class="row timeslots" v-for="(timeslot, index) in selectedTimeslots" :id="timeslot.id" :class="{'error': timeslot.error}">
						<div class="item">
							<TextInput
								:paddingless="true"
								icon="ladder"
								placeholder="Spoor"
								v-model="timeslot.maintenanceTrack"
								size="sm"
							/>
						</div>
						<div class="item">
							<DateTimePicker label="Starttijd" icon="kalender" v-model="timeslot.startTime" class="picker-container right-padding" :overlay="true"/>
						</div>
						<div class="item">
							<DateTimePicker label="Eindtijd" icon="kalender" v-model="timeslot.endTime" class="picker-container  right-padding" :overlay="true"/>
						</div>
						<div class="delete" @click="removeTimeslot(index)">
							<div class="icon-container plus">
								<icon :size="30" color="#FFFFFF" name="plus"></icon>
							</div>
						</div>
					</div>
				</div>
			</div>
			<div slot="buttons" :style="{'text-align': 'right', 'padding-top': '20px'}">
				<button class="button" @click="createNewTimeslotRow()">Toevoegen</button>
				<button class="button" @click="saveTimeslots()">Opslaan</button>
			</div>
	</ModalWrapper>
</template>

<script>
import ModalWrapper from '@/components/modals/ModalWrapper.vue'
import $loader from '@/modules/loader-module'
import $snackbar from '@/modules/snackbar-module'
export default {
	components: {
		ModalWrapper
	},
	props: {
		currentLocationData: {
			type: Object,
			default: () => {}
		},
		trainSchedules: {
			type: Array,
			default: () => []
		}
	},
	data () {
		return {
			selectedTimeslot: null,
			selectedTimeslots: [],
			timeslotMaterial: '',
			timeslots: [],
			amountOfConflicts: null,
			isModalOpened: false,
			errors: false
		}
	},
	mounted: function () {
		document.addEventListener('keyup', this.onKeyUp)
		this.$root.$on('openWOTimeSlotsModal', this.openModal)
		this.$root.$on('closeModal', this.closeModal)
	},

	beforeDestroy: function () {
		document.removeEventListener('keyup', this.onKeyUp)
	},
	watch: {
		selectedTimeslot: function(){
			const slot = this.timeslots.find(item => item.id === this.selectedTimeslot)
			if (slot) {
				if (!this.selectedTimeslots.find(item => slot.id === item.serviceWindowId))
				this.selectedTimeslots = []
				slot.emplacement.map(item => {
					let timeslot = {
						id: item.id,
						serviceWindowStart: slot.serviceWindowStart,
						serviceWindowEnd: slot.serviceWindowEnd,
						emplacementStart: item.emplacementStart,
						emplacementEnd: item.emplacementEnd,
						maintenanceTrack: item.maintenanceTrack,
						serviceWindowId: item.serviceWindowId,
						startTime: item.startTime || this.$moment(item.emplacementStart).format("YYYY-MM-DD HH:mm"),
						endTime: item.endTime || this.$moment(item.emplacementEnd).format("YYYY-MM-DD HH:mm"),
						error: false
					}
					this.selectedTimeslots.push(timeslot);
				})
			}
		},
	},
	methods: {
		/**
		 * On key up
		 * @param {Event} event the keyup event arguments
		 */
		onKeyUp (event) {
			if (event.keyCode !== 27 || !this.value) {
				return
			}
			this.closeModal()
		},
		closeModal () {
			this.selectedTimeslot = null
			this.selectedTimeslots = []
			this.timeslotMaterial = ''
			this.timeslots = []
			this.isModalOpened = false
		},
		openModal (e) {
			let srIds = e.srIds;
			this._api.getServiceWindows(JSON.stringify(srIds)).then(res => {
				res.map(item => {
					this.timeslots.push({
						id: item.id,
						value: this.$moment(item.serviceWindowStart).subtract(this.currentLocationData.shuntingTime || 0, 'minutes').format('DD MMM HH:mm') + ' - ' + this.$moment(item.serviceWindowEnd).add(this.currentLocationData.shuntingTime || 0, 'minutes').format('DD MMM HH:mm'),
						serviceWindowStart: item.serviceWindowStart,
						serviceWindowEnd: item.serviceWindowEnd,
						emplacement: item.emplacement
					})
				})
				this.selectedTimeslot = this.timeslots[0].id
				this.timeslotMaterial = e.materialNumber
				this.timeslotsModalShow = true
			})
			this.isModalOpened = true
		},
		confirmPlan (e) {
			this.$emit('confirmPlan', {})
		},
		saveTimeslots(){
			let valid = this.validateTimespansBeforeSend();

			if(valid.errors){
				$snackbar.addWarning(valid.message);
				return;
			} else {
				let serviceWindow = _.find(this.trainSchedules, {"serviceWindowId": this.selectedTimeslot}).serviceWindow;

				this.selectedTimeslots.map(item => {
					let data = {
						data: {
							emplacementStart: this.$moment(item.startTime).toISOString(),
							emplacementEnd: this.$moment(item.endTime).toISOString(),
							maintenanceTrack: item.maintenanceTrack,
							serviceWindowId: item.serviceWindowId
						}
					}

					if(item.id){
						data.data.id = item.id
					}

					this._api.saveServiceEmplacement(data).then(res => {
						for(let i = 0; i < serviceWindow.emplacement.length; i++){
							if(serviceWindow.emplacement[i].id == res.id){
								serviceWindow.emplacement.push(res);
								serviceWindow.emplacement.splice(i , 1);
								break;
							} else {
								serviceWindow.emplacement.push(res);
								break;
							}
						}
					})
				})

				this.timeslotsModalShow = false;
				$snackbar.add("Timeslots created");
				this.closeModal()
			}
		},
		removeTimeslot(index){
			if(this.selectedTimeslots[index].id){
				let data = {
					id: this.selectedTimeslots[index].id
				}

				let serviceWindow = _.find(this.trainSchedules, {"serviceWindowId": this.selectedTimeslot}).serviceWindow;

				this._api.deleteServiceEmplacement(data).then(res => {
					$snackbar.add("Timeslot removed");
					for(let i = 0; i < serviceWindow.emplacement.length; i++){
						if(serviceWindow.emplacement[i].id == data.id){
							serviceWindow.emplacement.splice(i, 1);
							this.selectedTimeslots.splice(index, 1);
						}
					}
				})
			} else {
				this.selectedTimeslots.splice(index, 1);
			}


		},
		validateTimespansBeforeSend(){
			let message = ''
			this.removeAllErrors()
			this.selectedTimeslots = this.selectedTimeslots.map((item, index) => {

				let srStart = this.$moment(item.serviceWindowStart).subtract(this.currentLocationData.shuntingTime || 0, 'minutes')
				let srEnd = this.$moment(item.serviceWindowEnd).add(this.currentLocationData.shuntingTime || 0, 'minutes')
				srStart = this.$moment(srStart).format('YYYY-MM-DD HH:mm')
				srEnd = this.$moment(srEnd).format('YYYY-MM-DD HH:mm')
				if (!item.startTime || !item.endTime) {
					this.errors = true
					message = 'Opstelling kan niet opgeslagen worden zonder start- en eindtijd'
					item.error = true
				}
				const slotStart = this.$moment(item.startTime).format('YYYY-MM-DD HH:mm')
				const slotEnd = this.$moment(item.endTime).format('YYYY-MM-DD HH:mm')
				const betweenStart = this.$moment(slotStart).isBetween(srStart, srEnd) || this.$moment(slotStart).isSame(srStart)
				const betweenEnd = this.$moment(slotEnd).isBetween(srStart, srEnd) || this.$moment(slotEnd).isSame(srEnd)
				const endIsAfter = this.$moment(slotEnd).isSame(slotStart) || this.$moment(slotEnd).isAfter(slotStart)
				if (!this.errors) {
					if (betweenStart && betweenEnd && endIsAfter) {
						let rangeToCheck = this.$moment.range([slotStart, slotEnd]);
						const notSame = this.selectedTimeslots.filter(slot => slot !== item)
						notSame.map(slot => {
							const start = this.$moment(slot.startTime).format('YYYY-MM-DD HH:mm')
							const end = this.$moment(slot.endTime).format('YYYY-MM-DD HH:mm')
							let slotRangeToCheck = this.$moment.range([start, end]);
							if (rangeToCheck.overlaps(slotRangeToCheck)) {
								this.errors = true
								message = 'Timeslot overlaps another timeslot'
								item.error = true
							}
						})
					} else {
						this.errors = true
						message = 'De opstelling moet binnen de totale overstand liggen';
						item.error = true
					}
				}
				return item
			})
			if (!this.errors) {
				this.removeAllErrors()
			}
			return {errors: this.errors, message: message}
		},
		removeAllErrors(){
			this.errors = false
			for(let i = 0; i < this.selectedTimeslots.length; i++){
				this.selectedTimeslots[i].error = false;
			}
		},
		createNewTimeslotRow(){
			const item = this.timeslots.find(item => item.id === this.selectedTimeslot)
			this.selectedTimeslots.push({
				serviceWindowStart: item.serviceWindowStart,
				serviceWindowEnd: item.serviceWindowEnd,
				emplacementStart: item.serviceWindowStart,
				emplacementEnd: item.serviceWindowEnd,
				maintenanceTrack: null,
				error: false,
				serviceWindowId: this.selectedTimeslot,
				startTime: null,
				endTime: null
			})
		},
	}
}
</script>

<style scoped lang="scss">
::v-deep .item {
	.title {
		margin: 10px 0;
	}
}
.timeslots {
	position: relative;
	display: flex;
	margin-bottom: 0 !important;
	align-items: center;
	.item {
		width: 33%;
		::v-deep .picker-container {
			.field-input {
				width: 180px;
			}
		}
	}
	h3 {
		font-weight: 300;
		margin: 10px 0;
	}
}
.delete {
	margin: 0;
	vertical-align: middle;
	height: 30px;
	width: 30px;
	background: #DC0000;
	box-sizing: border-box;
	font-size: 13px;
	font-weight: 500;
	display: flex;
	.icon-container {
		position: relative;
		width: 30px;
		height: 30px;
		transform: rotate(-45deg);
		-o-transform: rotate(-45deg);
		-moz-transform: rotate(-45deg);
		-webkit-transform: rotate(-45deg);
	}
	.label {
		line-height: 28px;
		margin-left: 5px;
		color: #dc0000;
	}
	&.selected, &:hover {
		&.red {
			color: #dc0000;
			border: 1px solid #dc0000;
		}
	}

	&:not(:first-child) {
		margin-left: 15px;
	}

	&:hover {
		cursor: pointer;
	}
}
</style>

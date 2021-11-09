<script>
import _ from 'lodash'
import env from '@/env'
import { Guardian } from '@/common/model'

export default {
	props: {
		workOrder: {
			type: Object,
			default: () => {}
		},
		declineReasonsServiceRequest: {
			type: Array,
			default: () => []
		},
		type: {
			type: String
		},
		isSelected: {
			type: Boolean,
			default: false
		},
		wrapperClass: {
			type: String,
			default: ''
		},
		guardian:{
			type: Object
		}
	},
	computed: {
		typedWorkOrder () {
			const workOrder = {
				title: 'Aankomstdatum',
				date: this.workOrder.arrivalDate
			}
			switch (this.type) {
				case 'mbn-monitor-unassigned':
					workOrder.title = 'Opleveringsdatum'
					workOrder.date = this.workOrder.dueDate
					break
				case 'mbn-monitor-assigned':
					break
				case 'mbn-monitor-declined':
					break
				case 'mbn-monitor-logistic':
					break
				default:
					break
			}
			return workOrder
		}
	},
	data () {
		return {
			env,
			locations: this.$store.getters.GET_LOCATIONS
		}
	},
	methods: {
		toggleWorkOrder (id) {
			this.$emit('toggleWorkOrder', this.isSelected ? null : id)
		},
		toggleBRegeling () {
			return
		},
		checkStatusAndBool (bool) {
			const statuses = ['INUITV', 'GGK']
			return bool && !statuses.some(item => item === this.workOrder.status)
		},
		openLeadTimeMinutesModal () {
			this.$root.$emit('openWOLeadTimeModal', {
				index: null,
				workOrder: this._.cloneDeep(this.workOrder)
			})
		},
		openQualificationsModal () {
			this.$root.$emit('openWOQualificationsModal', {
				index: null,
				workOrder: this._.cloneDeep(this.workOrder)
			})

		},
		openEquipmentModal () {
			this.$root.$emit('openWOEquipmentTypeModal', {
				index: null,
				workOrder: this._.cloneDeep(this.workOrder)
			})

		},
		openLocationTypeModal () {
			this.$root.$emit('openWOLocationsModal', {
				index: null,
				workOrder: this._.cloneDeep(this.workOrder)
			})
		},
		getLocationById(id){
			let locationName = _.find(this.locations, {id: id});
			if(locationName){
				return locationName.name;
			} else {
				return '';
			}
		},
		getTrainscheduleArrivalDate (arrivalDate, trainSchedules) {
			const trainSchedule = trainSchedules.find(item => this.$moment(item.departureDate) > this.$moment(arrivalDate))
			return trainSchedule ? this.$moment(trainSchedule.arrivalDate).format('DD MMM YYYY HH:mm') : ''
		},
		getTrainscheduleDepartureDate (arrivalDate, trainSchedules) {
			const trainSchedule = trainSchedules.find(item => this.$moment(item.departureDate) > this.$moment(arrivalDate))
			return trainSchedule ? this.$moment(trainSchedule.departureDate).format('DD MMM YYYY HH:mm') : ''
		},
		getMaintanceLocationName (maintenanceLocation) {
			let result
			const maintenanceLocations = ['MAT', 'TRANS', 'BUIT']
			result = maintenanceLocations.find(item => maintenanceLocation === item)
			if (!result) {
				result = this.locations.find(item => item.locationNumber === parseInt(maintenanceLocation)).name
			}
			return result
		},
		revertServiceRequest () {
			if (this.workOrder.bRegeling) {
				this.workOrder.bRegeling = false
			}
			let obj = {
				detail: {
					workOrder: this.workOrder
				}
			}
			this.$emit('revertServiceRequest', obj)
		},
		planAndRevert () {
			this.planServiceRequest()
			this.revertServiceRequest()
		},
		planServiceRequest () {
			setTimeout(() => {
				this.$router.push({
					name: 'ServiceRequestsMBN',
					params: {
						serviceRequestId: this.workOrder.serviceRequest.id
					}
				})
			}, 1000)
		}
	}
}
</script>

<template>
	<div :class="wrapperClass">
		<div class="workorders-container" :class="{'workorder-active': isSelected}">
			<div class="workorder-header workorder-header-middle" @click="toggleWorkOrder(workOrder.id)">
				<ul class="workorder-header-list flex-left">
					<li title="Stel/stam nummer" class="workorder-header-item workorders-number pr-0">
						<span class="w-40">{{workOrder.inRollingStock}}</span>
					</li>

					<li :title="workOrder.description"  class="workorder-header-item workorders-description pl-5 pr-5 w-90">
						<span>{{workOrder.description}}
						</span>
					</li>
					<li :title="typedWorkOrder.title" class="workorder-header-item workorders-kalendar">
						<span>{{ typedWorkOrder.date ? this.$moment(typedWorkOrder.date).format('D-M HH:mm') : 'Onbekend' }}</span>
					</li>
				</ul>
				<ul class="workorder-header-list flex-right w-90">
					<template v-if="type === 'mbn-monitor-assigned'">
						<li
							v-if="type === 'mbn-monitor-assigned' && workOrder.serviceRequestWarning"
							class="workorder-header-item workorders-alert workorders-alert-orange"
							title="Trein is op locatie maar werkorder is nog niet goedgekeurd">
						</li>
						<li
							v-if="type === 'mbn-monitor-assigned' && workOrder.isScheduled && !workOrder.serviceRequestWarning && workOrder.status !== 'INUITV'"
							class="workorder-header-item workorders-vinkje workorders-vinkje-green"
							title="Werkorder is goedgekeurd">
						</li>
						<li
							v-if="type === 'mbn-monitor-assigned' && !workOrder.serviceRequestWarning && workOrder.status == 'INUITV'"
							class="workorder-header-item workorders-vinkje2 workorders-vinkje2-green"
							title="Werkorder in uitvoering">
						</li>
					</template>
					<li class="workorder-header-item workorders-plus"
						v-if="type === 'mbn-monitor-declined'">
					</li>
					<li
						v-if="workOrder.notCompletedWarning"
						class="workorder-header-item workorders-alert workorders-alert-red"
						title="Trein vertrekt binnen 60 minuten maar de werkorder is nog niet gereed">
					</li>
					<li @click.stop="toggleBRegeling"
						v-if="checkStatusAndBool(workOrder.bRegeling)"
						class="workorder-header-item workorders-alert_BR workorders-alert-red"
						title="Let op: er is een B-regeling van toepassing">
					</li>
					<li class="workorder-header-item workorders-toggle">
					</li>
				</ul>
			</div>
			<div class="workorder-content" v-if="isSelected">
				<div class="reason-declined" v-if="type === 'mbn-monitor-declined'">
					<div class="reason-decline-container" v-if="workOrder.serviceRequest && workOrder.serviceRequest.declinedReason">
						<div class="reason-decline">
							<div class="title">
								Toelichting geweigerd:
							</div>
							<div class="decline-content">
								{{
									workOrder.serviceRequest && workOrder.serviceRequest.declinedReason
										?
										(
											declineReasonsServiceRequest.filter(x => x.id === workOrder.serviceRequest.declinedReason).length > 0
												? declineReasonsServiceRequest.filter(x => x.id === workOrder.serviceRequest.declinedReason)[0].name
												: 'N/A'
										)
										:
										'N/A'
								}}
								<md-tooltip md-direction="right" style="margin-top: -10px">
									{{
										workOrder.serviceRequest && workOrder.serviceRequest.declinedReason
											?
											(
												declineReasonsServiceRequest.filter(x => x.id === workOrder.serviceRequest.declinedReason).length > 0
													? declineReasonsServiceRequest.filter(x => x.id === workOrder.serviceRequest.declinedReason)[0].name
													: 'N/A'
											)
											:
											'N/A'
									}}
								</md-tooltip>
							</div>
						</div>
					</div>
				</div>
				<div class="task">
					<div class="task-squares">
						<div class="square linked" title="Taaknummer">
							<a :href="env.maximoURL + workOrder.WO" target="_blank">{{workOrder.WO}}</a>
						</div>
						<div class="square" title="Taakstatus">
							{{workOrder.status}}
						</div>
					</div>
					<div class="description">
						{{workOrder.description}}
					</div>
					<ul class="fields">
						<li>
							<TreeSelect
								:disabled="true"
								:options="locations"
								:value="workOrder.workLocationId"
								options-label="name"
								additionalSearch="station"
								icon="lokatie_W"
								class="picker-container"
								:always-open="true"
							/>
						</li>
						<li>
							<TreeSelect
								:disabled="true"
								:options="locations"
								:value="workOrder.repairLocationId"
								options-label="name"
								additionalSearch="station"
								icon="lokatie_R"
								class="picker-container"
							/>
						</li>
						<li>
							<DateTimePicker
								:disabled="true"
								:icon="true"
								:paddingless="true"
								:value="workOrder.arrivalDate ? $moment(workOrder.arrivalDate).format('YYYY-MM-DD HH:mm:ss') : null"
								class="picker-container"
							/>
						</li>
						<template v-if="type === 'mbn-monitor-assigned'">
							<li>
								<TextInput
									:nopadding="true"
									:disabled="true"
									icon="ankomst"
									:value="getTrainscheduleArrivalDate(workOrder.arrivalDate, workOrder.trainSchedule)"
									class="picker-container"
								/>
							</li>
							<li>
								<TextInput
									:nopadding="true"
									:disabled="true"
									icon="vertrek"
									:value="getTrainscheduleDepartureDate(workOrder.arrivalDate, workOrder.trainSchedule)"
									class="picker-container"
								/>
							</li>
						</template>
						<li>
							<TextInput
								icon="klok"
								:nopadding="true"
								:number="true"
								suffix="Minuten"
								disabled="true"
								:step="5"
								:value="workOrder.totalLeadTimeMinutes"
								minValue="0"
							/>
						</li>
						<li>
							<TextInput
								:nopadding="true"
								:disabled="true"
								icon="lokatie"
								:value="getMaintanceLocationName(workOrder.asset.maintenanceLocation)"
								class="picker-container"
							/>
						</li>
					</ul>
					<div class="buttons">
						<button v-if="guardian.canUse('Required qualifications selectionfadfaf')" class="task-button kwalificatie p-0 mr-5" @click="openQualificationsModal()" title="Kwalificaties"></button>
						<button v-if="guardian.canUse('Outillage selection')" class="task-button ladder p-0 mr-5" @click="openEquipmentModal()" title="Outillage"></button>
						<button v-if="guardian.canUse('Work order type selection')" class="task-button wrench p-0 mr-5" @click="openLocationTypeModal()" title="Klus Type"></button>
						<button v-if="guardian.canUse('Work order duration selection')" class="task-button klock p-0 mr-5" @click="openLeadTimeMinutesModal()" title="Doorlooptijd taak"></button>
					</div>
				</div>
				<div class="work-order-content-bottom task">
					<div class="buttons" v-if="type !== 'mbn-monitor-unassigned'">
						<button @click="planAndRevert" class="blue">
							Herplannen
						</button>
						<button @click="revertServiceRequest" class="red" v-if="workOrder.repairLocationId">
							Terugzetten
						</button>
					</div>
				</div>
			</div>
		</div>
	</div>

</template>

<style lang="scss" scoped>
	::v-deep .testClass {
		padding: 15px 0;
	}
</style>

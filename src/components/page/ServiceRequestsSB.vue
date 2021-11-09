<template>
    <div class="service-requests page-content-footerless">
		<div class="content content-full scrollable-x scrollable-show">
			<div>
				<div class="content-child-full content-fourth-row">
					<div class="content-row monitor-row content-footered">
						<div class="row-head">
							{{$moment(today).format('D dddd')}}
						</div>
						<div class="row-content scrollable-y content-child-row content-titled">
							<template v-for="(workOrder, index) in workordersByDate.today">
								<work-order-sb
									:key="index"
									:workOrder="workOrder"
									:isSelected="workOrder.id === selectedWorkOrder"
									v-if="filterMatch(workOrder)"
									:statusFlag="checkStatusFlag(workOrder)"
									@toggleWorkOrder="toggleWorkOrder"
								/>
							</template>
						</div>
					</div>
					<div class="content-row monitor-row content-footered">
						<div class="row-head">
							{{$moment(tomorrow).format('D dddd')}}
						</div>
						<div class="row-content scrollable-y content-child-row content-titled">
							<template v-for="(workOrder, index) in workordersByDate.tomorrow">
								<work-order-sb
									:key="index"
									:workOrder="workOrder"
									:isSelected="workOrder.id === selectedWorkOrder"
									v-if="filterMatch(workOrder)"
									:statusFlag="checkStatusFlag(workOrder)"
									@toggleWorkOrder="toggleWorkOrder"
								/>
							</template>
						</div>
					</div>
					<div class="content-row monitor-row content-footered">
						<div class="row-head">
							{{$moment(dayAfterTomorrow).format('D dddd')}}
						</div>
						<div class="row-content scrollable-y content-child-row content-titled">
							<template v-for="(workOrder, index) in workordersByDate.dayAfterTomorrow" >
								<work-order-sb
									:key="index"
									:workOrder="workOrder"
									:isSelected="workOrder.id === selectedWorkOrder"
									v-if="filterMatch(workOrder)"
									:statusFlag="checkStatusFlag(workOrder)"
									@toggleWorkOrder="toggleWorkOrder"
								/>
							</template>
						</div>
					</div>
					<div class="content-row monitor-row content-footered">
						<div class="row-head">
							Later
						</div>
						<div class="row-content scrollable-y content-child-row content-titled">
							<template v-for="(workOrder, index) in workordersByDate.later">
								<work-order-sb
									:key="index"
									:workOrder="workOrder"
									:isSelected="workOrder.id === selectedWorkOrder"
									v-if="filterMatch(workOrder)"
									:statusFlag="checkStatusFlag(workOrder)"
									@toggleWorkOrder="toggleWorkOrder"
								/>
							</template>
						</div>
					</div>
				</div>
			</div>
        </div>
		<WorkOrdersLeadTimeModal
			@updateWorkOrder="updateWorkOrders"
		/>
		<WorkOrdersQualificationsModal
			:qualificationList="qualifications"
			:canEditQualification="false"
			@updateWorkOrder="updateWorkOrders"
		/>
		<WorkOrdersEquipmentsTypesModal
			:equipmentList="equipmentTypes"
			:canEditEquipment="true"
			@updateWorkOrder="updateWorkOrders"
		/>
		<WorkOrderDeclineServiceRequestModal
			@updateWorkOrders="deleteWorkOrder"
		/>
    </div>
</template>

<script>
	export default {
		components: {
			WorkOrderSb: () => import('@/components/WorkOrders/WorkOrderSB'),
			WorkOrdersLeadTimeModal: () => import('@/components/modals/WorkOrdersLeadTimeModal'),
			WorkOrdersQualificationsModal: () => import('@/components/modals/WorkOrdersQualificationsModal'),
			WorkOrdersEquipmentsTypesModal: () => import('@/components/modals/WorkOrdersEquipmentsTypesModal'),
			WorkOrderDeclineServiceRequestModal: () => import('@/components/modals/WorkOrderDeclineServiceRequestModal')
		},
		data: function () {
			return {
				qualifications: [],
				equipmentTypes: [],
				today: this.$moment().format('YYYY-MM-DD'),
				tomorrow: this.$moment().add(1, 'days').format('YYYY-MM-DD'),
				yesterday: this.$moment().subtract(1, 'month').format('YYYY-MM-DD'),
				dayAfterTomorrow: this.$moment().add(2, 'days').format('YYYY-MM-DD'),
				workOrders: [],
				selectedWorkOrder: null
			}
		},
		computed: {
			workordersByDate () {
				const workOrders = this.workOrders
				const dates = {
					today: workOrders.filter(item => this.$moment(item.arrivalDate).format('YYYY-MM-DD') <= this.today && !_.isEmpty(item.arrivalDate)),
					tomorrow: workOrders.filter(item => this.$moment(item.arrivalDate).format('YYYY-MM-DD') === this.tomorrow),
					dayAfterTomorrow: workOrders.filter(item => this.$moment(item.arrivalDate).format('YYYY-MM-DD') === this.dayAfterTomorrow),
					later: workOrders.filter(item => this.$moment(item.arrivalDate).format('YYYY-MM-DD') > this.dayAfterTomorrow || _.isEmpty(item.arrivalDate)),
				}
				return dates
			}
		},
		beforeMount () {
			this.getQualifications()
			// this.getEquipmentTypes()
		},
		mounted: function () {
			this.getWorkOrders()
		},
		methods: {
			toggleWorkOrder (id) {
				this.selectedWorkOrder = id
			},
			deleteWorkOrder (wo) {
				const index = this.workOrders.indexOf(this.workOrders.find(item => item.id === wo.id))
				this.workOrders.splice(index, 1)
			},
			updateWorkOrders (wo) {
				const index = this.workOrders.indexOf(this.workOrders.find(item => item.id === wo.id))
				this.workOrders[index] = wo
			},
			async getQualifications () {
				await this._api.getQualificationList()
					.then(res => {
						this.qualifications = res
					}).catch(err => {
					console.log(err)
				})
			},
			async getEquipmentTypes () {
				this._api.getEquipmentTypesList()
					.then(res => {
						this.equipmentTypes = res
					})
					.catch(err => {
						console.log(err)
					})
			},
			checkStatusFlag (wo) {
				let statusFlag = '';
				const locationIdIsExist = wo.locationId && wo.workLocationId
				const locationIdNotEquals = locationIdIsExist && wo.workLocationId != wo.locationId
				const locationIdEquals = locationIdIsExist && wo.workLocationId == wo.locationId
				if (locationIdNotEquals) {
					statusFlag = 1;
				} else if ((wo.tasks || []).length <= 0) {
					statusFlag = 2;
				} else if (locationIdNotEquals && wo.status != "WGK") {
					statusFlag = 4;
				} else if (locationIdEquals && wo.status == "WOM") {
					statusFlag = 5;
				}
				return statusFlag;
			},
			filterMatch(wo){
				return true;
				if(
					wo.serviceRequest
					&& wo.serviceRequest.declinedReason === null
					&& wo.serviceRequest.declinedStatus !== true
				){
					return true;
				}
			},
			getWorkOrders (dateIndex) {
				let locationId = +this.$store.getters['GET_CURRENT_LOCATION_ID']
				this._api.getWorkorderSbList(locationId, this.yesterday).then(res => {
					this.workOrders = res
				})
			},

		}
	}
</script>

<style lang="scss" scoped src="../../assets/scss/pages/monitor.scss" />

<template>
	<div class="workorders-container" :class="{'workorder-active': isSelected}">
		<ul class="workorder-header workorder-header-small" @click="toggleWorkOrder(workOrder.id)">
			<li class="workorder-header-item workorders-link" >
				<a href="" target="_blank">{{workOrder.WO}}</a>
			</li>
			<li class="workorder-header-item workorders-number" title="Stel/stam nummer">
				{{workOrder.materialNumber}}
			</li>
			<li class="workorder-header-item workorders-code">
				{{workOrder.seriesCode}}
			</li>
			<li class="workorder-header-item workorders-type">
				{{workOrder.type}}
			</li>
			<li class="workorder-header-item workorders-time">
				{{workOrder.totalLeadTimeMinutes || 0}} min
			</li>
			<li class="workorder-header-item workorders-toggle">
			</li>
		</ul>
		<div class="workorder-content" v-if="isSelected">
			<div class="description mb-20">
				{{workOrder.description}}
			</div>
			<div class="task" v-if="statusFlagText || _.isEmpty(workOrder.tasks)">
				<div class="task-title">
					<div class="description warning">{{statusFlagText || 'Taak ontbreekt'}}</div>
				</div>
				<div class="task-content">
					<div class="workorder-content-items workorder-content-date">
						<div class="content">Streefdatum einde</div>
						<div class="content blue">{{$moment(workOrder.dueDate).format('DD MMMM YYYY HH:mm')}}</div>
					</div>
				</div>
				<div class="buttons" v-if="workOrder.tasks.length !== 0">
					<button class="task-button klock" v-if="canEditLeadTime"></button>
					<button class="task-button document"></button>
					<button class="task-button alert"></button>
				</div>
			</div>
			<div class="task" v-for="(task, index) in workOrder.tasks" :key="index" v-else>
				<div class="task-squares">
					<div class="square hovered">
						{{task.taskOrder}}
					</div>
					<div class="square">
						{{task.status}}
					</div>
				</div>
				<div class="buttons">
					<button class="task-button klock" @click="openLeadTimeMinutesModal(index)" v-if="canEditLeadTime"></button>
					<button class="task-button kwalificatie" @click="openQualificationsModal(index)"></button>
					<button class="task-button ladder" @click="openEquipmentModal(index)"></button>
				</div>
			</div>
			<div class="work-order-content-bottom task">
				<div class="buttons" v-if="workOrder.serviceRequest">
					<button @click="openDeclineServiceRequestModal" class="red" v-if="workOrder.repairLocationId">
						Weiger
					</button>
					<button @click="planServiceRequest(workOrder.serviceRequest.id)" class="blue">
						Plan
					</button>
					<button class="task-button alert_BR" @click="toggleBRegeling" v-if="workOrder.bRegeling"></button>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
	export default {
		props: {
			workOrder: {
				type: Object,
				default: null
			},
			statusFlag: {
				type: Number,
				default: null
			},
			canEditLeadTime: {
				type: Boolean,
				default: false
			},
			isSelected: {
				type: Boolean,
				default: false
			},
		},
		data () {
			return {
				modalLeadTimeIsShow: false
			}
		},
		computed: {
			statusFlagText () {
				switch (this.statusFlag) {
					case 1:
						return 'Werklocatie incorrect.'
					case 2:
						return 'Taak ontbreekt.'
					case 3:
						return 'Toewijzing ontbreekt'
					case 4:
						return 'Werklocatie en taak incorrect.'
					case 5:
						return 'Status is WOM'
					default:
						return null
				}
			}
		},
		methods: {
			openLeadTimeMinutesModal (index) {
				this.$root.$emit('openWOLeadTimeModal', {
					index: index,
					workOrder: this._.cloneDeep(this.workOrder)
				})
			},
			openQualificationsModal (index) {
				this.$root.$emit('openWOQualificationsModal', {
					index: index,
					workOrder: this._.cloneDeep(this.workOrder)
				})

			},
			openEquipmentModal (index) {
				this.$root.$emit('openWOEquipmentTypeModal', {
					index: index,
					workOrder: this._.cloneDeep(this.workOrder)
				})

			},
			openDeclineServiceRequestModal (index) {
				this.$root.$emit('openWODeclineReasonModal', {
					workOrder: this._.cloneDeep(this.workOrder)
				})
			},
			toggleBRegeling () {
					return
			},
			toggleWorkOrder (id) {
				this.$emit('toggleWorkOrder', this.isSelected ? null : id)
			},
			planServiceRequest () {
				this.$router.push({
					name: 'WorkOrders',
					params: {
						serviceRequestId: this.workOrder.serviceRequest.id
					}
				})
			}
		}
	}
</script>

<style lang="scss" scoped>

</style>

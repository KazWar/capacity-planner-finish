<template>
	<ModalWrapper title="Benodigde outillage" :isModalOpened="isModalOpened" :canClose="true">
		<div slot="content">
			<div
				class="item"
				:style="{'margin-top': index === 0 ? '25px' : 0}"
				v-for="(taskEquipment, index) in selectedFilteredEquipments" :key="index">

				<div class="col" style="height: 40px; line-height: 40px;">
					{{taskEquipment.name}}
					<span style="position: absolute; right: 100px;">
						{{getTaskIdsForEquipment(taskEquipment.id)}}
					</span>
				</div>

				<div class="col icon" @click="deleteTaskEquipment(taskEquipment)" v-if="canEditEquipment">
					<icon name="sluiten" :size="40" :colors="{'default': '#d2d2d4', 'hover': '#003082'}"/>
				</div>
			</div>
			<TreeSelect
				:options="filteredEquipmentsList"
				:value="selectedValue"
				:cleareAfterSelect="true"
				options-label="name"
				options-id="id"
				icon="ladder"
				label="Kies outillage type"
				class="picker-container"
				@input="selectEquipments"
			/>
		</div>
		<div slot="buttons">
			<div class="button right" @click="saveEquipment" v-if="canEditEquipment">Opslaan</div>
			<div class="button right" @click="displayModalEquipment = false" v-else>OK</div>
		</div>
	</ModalWrapper>
</template>

<script>
import ModalWrapper from '@/components/modals/ModalWrapper.vue'
import _ from 'lodash'
export default {
	components: {
		ModalWrapper
	},
	props: {
		equipmentList: {
			type: Array,
			default: () => []
		},
		canEditEquipment: {
			type: Boolean,
			default: false
		}
	},
	data () {
		return {
			index: null,
			workOrder: null,
			isModalOpened: false,
			selectedEquipments: [],
			selectedValue: null
		}
	},
	mounted: function () {
		this.$root.$on('openWOEquipmentTypeModal', this.openModal)
		this.$root.$on('closeModal', this.closeModal)
	},
	computed: {
		filteredEquipmentsList () {
			return this.equipmentList.filter(item => !this.selectedEquipments.find(selected => selected === item.id))
		},
		selectedFilteredEquipments () {
			return this.equipmentList.filter(item => this.selectedEquipments.find(selected => selected === item.id))
		},
	},
	methods: {
		closeModal () {
			this.isModalOpened = false
		},
		openModal (e) {
			const { index, workOrder } = e
			this.workOrder = workOrder
			this.index = index
			this.selectedEquipments = typeof this.index === 'number' ? this.workOrder.tasks[this.index].equipments.map(item => item.equipment.id) : this.workOrder.equipmentTypesIds || []
			this.isModalOpened = true
		},
		selectEquipments (id) {
			this.selectedValue = id
			if (!this.selectedEquipments.includes(id)) {
				this.selectedEquipments.push(id)
			}
			this.selectedEquipments = _.uniq(this.selectedEquipments)
		},
		saveEquipment () {
			if (this.index) {
				this.selectedEquipments
					.filter(item => !this.workOrder.tasks[this.index || 0].equipments
						.find(equip => equip.equipment === item))
					.map(item => {
						this._api.createTaskEquipment({
							taskId: this.workOrder.tasks[this.index || 0].id,
							equipmentId: item
						}).then(res => {
							const filter = {"include": { "relation": "tasks", "scope": { "include": "equipments" }}}
							this._api.getWorkorderFilteredDetail(this.workOrder.id, JSON.stringify(filter)).then(result => {
								this.$root.$emit('updateWO', this.workOrder)
								setTimeout(() => {
									this.$emit('preventPlaning', false)
								}, 1500)
							})
						})
					})
			}
			const workOrder = this.workOrder
			this.selectedEquipments = _.without(this.selectedEquipments, undefined, null);
			workOrder.equipmentTypesIds = this.selectedEquipments;
			workOrder.equipmentTypeManual = true
			this._api.saveWorkOrder(workOrder)
				.then(res => {
					console.log(this.workOrder)
					this.$emit('updateWorkOrder', this.workOrder)
					let eventArgs = {
						detail: {
							workOrder: workOrder
						}
					}
					this.$emit('onSelectedWorkOrderChange', eventArgs)
				})
			this.closeModal()
		},
		deleteTaskEquipment (taskEquipment) {
			this.selectedEquipments = this.selectedEquipments.filter(item => item !== taskEquipment.id)
			let workOrder = this.workOrder
			workOrder.equipmentTypesIds = this.selectedEquipments
			workOrder.equipmentTypeManual = true
			this._api.saveWorkOrder(workOrder)
				.then(res => {
					this.$emit('updateWorkOrder', res)
				})
			if (this.index) {
				const equipment = this.workOrder.tasks[this.index].equipments.find(item => item.equipmentId === taskEquipment.id)
				this._api.deleteTaskEquipment(equipment.id).then(res => {
					this.$root.$emit('updateWorkOrders', true)
				})
			}
		},
		getTaskIdsForEquipment (equipmentId) {
			let returnString = ''
			if (this.taskIndex === null) {
				taskLoop: for (let taskIndex in this.workOrder.tasks) {
					let task = this.workOrder.tasks[taskIndex]
					for (let taskEquipmentIndex in task.equipments) {
						let taskEquipment = task.equipments[taskEquipmentIndex]
						if (taskEquipment.equipment.id === equipmentId) {
							returnString += task.taskOrder + ', '
							continue taskLoop
						}
					}
				}
			}
			return returnString.length > 0 ? '(' + returnString.substring(0, returnString.length - 2) + ')' : returnString
		},
	}
}
</script>

<style lang="scss" scoped>
	@import "./src/assets/scss/variables";
.item {
	border-bottom: 2px solid map-get($colors, default-grey);
	display: flex;
	justify-content: space-between;
	align-items: center;
}
</style>

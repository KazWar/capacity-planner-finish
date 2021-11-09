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
					<icon name="sluiten" :size="40" :colors="{'default': '#0079D3', 'hover': '#003082'}"/>
				</div>
			</div>
			<TreeSelect
				:options="equipmentList"
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
			selectedEquipments: []
		}
	},
	mounted: function () {
		document.addEventListener('keyup', this.onKeyUp)
		this.$root.$on('openWOEquipmentModal', this.openModal)
		this.$root.$on('closeModal', this.closeModal)
	},

	beforeDestroy: function () {
		document.removeEventListener('keyup', this.onKeyUp)
	},
	computed: {
		selectedFilteredEquipments () {
			return this.equipmentList.filter(item => this.selectedEquipments.find(selected => selected === item.id))
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
			this.isModalOpened = false
		},
		openModal (e) {
			const { index, workOrder } = e
			this.workOrder = workOrder
			this.index = index
			this.selectedEquipments = this.workOrder.tasks[this.index].equipments.map(item => item.equipment.id)
			this.isModalOpened = true
		},
		selectEquipments (id) {
			if (!this.selectedEquipments.includes(id)) {
				this.selectedEquipments.push(id)
			}
			this.selectedEquipments = _.uniq(this.selectedEquipments)
		},
		saveEquipment () {
			this.closeModal()
			this.$emit('preventPlaning', true)
			this.selectedEquipments
				.filter(item => !this.workOrder.tasks[this.index].equipments
					.find(equip => equip.equipment.id === item))
				.map(item => {
					this._api.createTaskEquipment({
						taskId: this.workOrder.tasks[this.index].id,
						equipmentId: item
					}).then(res => {
						const filter = {"include": { "relation": "tasks", "scope": { "include": "equipments" }}}
						this._api.getWorkorderFilteredDetail(this.workOrder.id, JSON.stringify(filter)).then(result => {
							this.$root.$emit('updateWO', result)
							setTimeout(() => {
								this.$emit('preventPlaning', false)
							}, 1500)
						})
					})
				})
		},
		deleteTaskEquipment (taskEquipment) {
			this.selectedEquipments.splice(this.selectedEquipments.indexOf(taskEquipment.id), 1)
			const equipment = this.workOrder.tasks[this.index].equipments.find(item => item.equipmentId === taskEquipment.id)
			if (equipment) {
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

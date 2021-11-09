<template>
	<ModalWrapper title="Doorlooptijd aanpassen" :isModalOpened="isModalOpened" :canClose="true">
		<div slot="content">
			<TextInput
				icon="klok"
				:paddingless="true"
				:number="true"
				suffix="min"
				:step="5"
				placeholder="Kies een doorlooptijd"
				v-model="leadTimeMinutes"
				minValue="0"
			/>
		</div>
		<div slot="buttons">
			<div class="button right" @click="saveLeadTimeMinutes()">Opslaan</div>
		</div>
	</ModalWrapper>
</template>

<script>
import ModalWrapper from '@/components/modals/ModalWrapper.vue'
export default {
	components: {
		ModalWrapper
	},
	props: {
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
			leadTimeMinutes: null
		}
	},
	mounted: function () {
		this.$root.$on('openWOLeadTimeModal', this.openModal)
		this.$root.$on('closeModal', this.closeModal)
	},
	methods: {
		closeModal () {
			this.isModalOpened = false
		},
		openModal (e) {
			const { index, workOrder } = e
			this.workOrder = workOrder
			this.index = index
			this.leadTimeMinutes = this.index ? this.workOrder.tasks[this.index].importedLeadTime : this.workOrder.totalLeadTimeMinutes
			this.isModalOpened = true
		},
		saveLeadTimeMinutes () {
				this.workOrder.leadTimeManual = true

			if (this.index !== null) {
				this.workOrder.tasks[this.index].leadTimeMinutes = this.leadTimeMinutes
				this.workOrder.tasks[this.index].manualLeadTime = this.leadTimeMinutes
				this.workOrder.tasks[this.index].importedLeadTime = this.leadTimeMinutes
				const totalLeadTimeMinutes = this.workOrder.tasks.reduce((accumulator, currentValue) => {
					return +accumulator + +currentValue.importedLeadTime
				}, 0)
				this.workOrder.totalLeadTimeMinutes = totalLeadTimeMinutes
				let obj = {
					wo: this.workOrder,
					task: this.workOrder.tasks[this.index]
				}
				this.$emit('reinitWorkOrders', obj)
				this.$emit('workOrderTaskChange', {
					detail: {
						materialNumber: this.workOrder.materialNumber,
						task: this.workOrder.tasks[this.index],
						workOrderId: this.workOrder.id
					}
				})
			}
			this.workOrder.totalLeadTimeMinutes = this.leadTimeMinutes
			this.$emit('onWorkOrderChange', this.workOrder)
			this.$emit('updateWorkOrder', this.workOrder)
			this.closeModal()
		},
	}
}
</script>

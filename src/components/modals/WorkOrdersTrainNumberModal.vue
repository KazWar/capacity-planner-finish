<template>
	<ModalWrapper title="In te plannen na:" :isModalOpened="isModalOpened" :canClose="true">
		<div slot="content">
			<TreeSelect
				v-model="selectedSameTrainNumber"
				:options="sameTrainNumbers"
				options-label="name"
				options-id="id"
				icon="info"
				label="Selecteer werkorder"
				class="picker-container"
			/>
		</div>
		<div slot="buttons">
			<div class="button right" @click="saveModalSameTrainNumber()">Opslaan</div>
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
		sameTrainNumbers: {
			type: Array,
			default: () => []
		},
		sameTrainNumber: {
			type: Number,
			default: () => []
		},
	},
	data () {
		return {
			index: null,
			workOrder: null,
			isModalOpened: false,
			selectedSameTrainNumber: null,
		}
	},
	mounted: function () {
		this.$root.$on('setSameNumbers', this.setSameNumbers)
		this.$root.$on('openWOTrainNumberModal', this.openModal)
		this.$root.$on('closeModal', this.closeModal)
	},
	methods: {
		closeModal () {
			this.isModalOpened = false
		},
		setSameNumbers (e) {
		},
		openModal (e) {
			const { index, workOrder } = e
			this.workOrder = workOrder
			this.index = index
			this.sameTrainNumbers = e.sameTrainNumbers
			this.selectedSameTrainNumber = this.workOrder.waitingForWO
			this.isModalOpened = true
		},
		saveModalSameTrainNumber () {
			let workOrder = this.workOrder
			if (this.sameTrainNumber) {
				let obj = {
					WO: this.workOrder.WO,
					waitingForWO: this.selectedSameTrainNumber
				}
				this._api.linkWorkorder(obj).then(response => {
					workOrder.waitingForWO = this.sameTrainNumber
					this.$emit('checkWOLinked', this.sameTrainNumber)
					this.$emit('workOrderToBottom', this.workOrder.WO)
					this.$emit('updateWorkOrder', workOrder)
				})
			} else {
				let obj = {
					WO: this.workOrder.WO
				}
				this._api.unLinkWorkorder(obj).then(response => {
					workOrder.waitingForWO = null
					this.$emit('checkWOLinked', this.sameTrainNumber)
					this.$emit('removeWorkorderFromBottom', this.workOrder.WO)
					this.$emit('updateWorkOrder', workOrder)
				})
			}
			this.closeModal()
		}
	}
}
</script>

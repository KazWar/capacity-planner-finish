<template>
	<ModalWrapper title="Klus type" :isModalOpened="isModalOpened" :canClose="true">
		<div slot="content">
			<TreeSelect
				v-model="selectedLocationType"
				:options="locationTypes"
				options-label="name"
				options-id="name"
				icon="wrench"
				label="Geen type"
				class="picker-container"
				s					/>
		</div>
		<div slot="buttons">
			<div class="button right" @click="saveLocationType()">Opslaan</div>
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
		locationTypes: {
			type: Array,
			default: () => []
		},
		canEditQualification: {
			type: Boolean,
			default: false
		}
	},
	data () {
		return {
			index: null,
			workOrder: null,
			isModalOpened: false,
			selectedLocationType: null
		}
	},
	mounted: function () {
		this.$root.$on('openWOLocationsModal', this.openModal)
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
			this.selectedLocationType = this.workOrder.ntLocationType
			this.isModalOpened = true
		},
		saveLocationType () {
			let workOrder = this.workOrder
			workOrder.ntLocationType = this.ntLocationType
			let obj = {
				workOrderId: this.workOrder.id,
				ntLocationType: this.selectedLocationType
			}
			this._api.changeNtLocationType(obj).then(res => {
				this.$emit('updateWorkOrder', res)
				if (workOrder.ntLocationType !== 'SB' && workOrder.ntLocationType !== 'GSL') {
					this.$emit('hideCharts')
				}
			})
			this.closeModal()
		},
	}
}
</script>

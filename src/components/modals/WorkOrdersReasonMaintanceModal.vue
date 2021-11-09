<template>
	<ModalWrapper title="Reden binnenkomst wijzigen" :isModalOpened="isModalOpened" :canClose="true">
			<div slot="content">
				<TreeSelect
					icon="info"
					v-model="selectedReasonMaintenance"
					:options="maintenanceReasons"
					options-label="reason"
					options-id="code"
					label="Kies werklocatie"
				/>
			</div>
			<div slot="buttons" :style="{'text-align': 'right', 'padding-top': '20px'}">
				<button class="button" @click="saveReasonMaintenance">Opslaan</button>
			</div>
	</ModalWrapper>
</template>

<script>
import ModalWrapper from '@/components/modals/ModalWrapper.vue'
import $loader from '@/modules/loader-module'
import $snackbar from '@/modules/snackbar-module'
import _ from 'lodash'
export default {
	components: {
		ModalWrapper
	},
	props: {
		assets: {
			type: Array,
			default: () => []
		},
		chartData: {
			type: Array,
			default: () => []
		},
		maintenanceReasons: {
			type: Array,
			default: () => []
		}
	},
	data () {
		return {
			index: null,
			workOrder: null,
			isModalOpened: false,
			reasonMaintenanceModal: {
				enabled: false,
				materialNumber: null,
				reasonMaintenance: null,
				asset: null
			},
			selectedReasonMaintenance: null,
		}
	},
	mounted: function () {
		document.addEventListener('keyup', this.onKeyUp)
		this.$root.$on('openWOReasonMaintanceModal', this.openModal)
		this.$root.$on('closeModal', this.closeModal)
	},

	beforeDestroy: function () {
		document.removeEventListener('keyup', this.onKeyUp)
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
			this.selectedReasonMaintenance = null
		},
		openModal (e) {
			let id = e.id;
			this.selectedReasonMaintenance = e.reasonMaintenance;
			let asset = this.assets.find(item => item.serialNumber === e.id)
			this.reasonMaintenanceModal = {
				...this.reasonMaintenanceModal,
				enabled: true,
				materialNumber: id,
				reasonMaintenance: this.selectedReasonMaintenance || null,
				asset: asset
			}
			this.isModalOpened = true
		},
		saveReasonMaintenance () {
			if (!this.reasonMaintenanceModal.reasonMaintenance) {
				$snackbar.addWarning('Gelieve een reden op te geven.')
				return
			}
			if (!this.reasonMaintenanceModal.asset) {
				$snackbar.addWarning('Het asset kon niet worden gevonden.')
				return
			}
			$loader.message = 'Asset aanpassen'
			this._api.saveAssetReasonMaintenance({
				...this.reasonMaintenanceModal.asset,
				reasonMaintenance: this.selectedReasonMaintenance
			}).then(res => {
				$loader.message = null
				$snackbar.add('Het asset is aangepast.')
				this.reasonMaintenanceModal.enabled = false
				let item = _.find(this.chartData.data, {"id": this.reasonMaintenanceModal.materialNumber});
				item.reasonMaintenance = res.reasonMaintenance;
				this.$root.$emit('changeReasonMaintance', item)
			}).catch(err => {
				console.log(err)
				$loader.message = null
				$loader.error = true
				$snackbar.addWarning('Er is een probleem opgetreden bij het aanpassen van het asset, probeer het later opnieuw.')
			})
			this.closeModal()
		}
	}
}
</script>

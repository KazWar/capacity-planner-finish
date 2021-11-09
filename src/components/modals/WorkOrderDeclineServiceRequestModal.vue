<template>
	<ModalWrapper title="Service aanvraag weigeren" :isModalOpened="isModalOpened" :canClose="true">
		<div slot="content">
			<TreeSelect
				v-model="declineReasonServiceRequest"
				:options="declineReasonsServiceRequest"
				options-label="name"
				options-id="id"
				icon="info"
				label="Selecteer reden"
				class="picker-container"
			/>
		</div>
		<div slot="buttons">
			<div class="button right" @click="saveModalDeclineServiceRequest">Opslaan</div>
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
		data () {
			return {
				workOrder: null,
				isModalOpened: false,
				declineReasonServiceRequest: null,
				declineReasonsServiceRequest: this.$store.getters.GET_DECLINE_REASONS
			}
		},
		mounted: function () {
			this.$root.$on('openWODeclineReasonModal', this.openModal)
			this.$root.$on('closeModal', this.closeModal)
		},
		methods: {
			closeModal () {
				this.isModalOpened = false
			},
			openModal (e) {
				const { workOrder } = e
				this.declineReasonServiceRequest = null
				this.workOrder = workOrder
				this.isModalOpened = true
			},
			saveModalDeclineServiceRequest () {
				if (!this.declineReasonServiceRequest || this.declineReasonsServiceRequest.filter(x => x.id === this.declineReasonServiceRequest).length === 0) {
					$snackbar.addWarning('Gelieve een reden op te geven.')
					return
				}
				$loader.message = 'Service aanvraag weigeren'
				this._api.declineStatus(this.workOrder.serviceRequest.id, this.declineReasonServiceRequest).then(res => {
					$loader.message = null
					$snackbar.add('Service aanvraag geweigerd.')
					this.$emit('updateWorkOrders', this.workOrder)
					this.closeModal()
				}).catch(response => {
					$loader.message = null
					$snackbar.addWarning('De service aanvraag kon niet worden geweigerd, gelieve het later nogmaals te proberen.')
				})
			},

		}
	}
</script>

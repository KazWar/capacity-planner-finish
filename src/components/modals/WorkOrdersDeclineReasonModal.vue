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
			declineReasonServiceRequest: null,
			declineReasonsServiceRequest: [
				{
					id: 'A',
					name: 'Geen kennis/bevoegdheid/opleiding'
				},
				{
					id: 'B',
					name: 'Onvoldoende tijd/korte overstand'
				},
				{
					id: 'C',
					name: 'Overdracht dienst'
				},
				{
					id: 'C2',
					name: 'Diagnoseopdracht MBN'
				},
				{
					id: 'D',
					name: 'Geen onderdelen aanwezig'
				},
				{
					id: 'E',
					name: 'Geen outillage/gereedschap'
				},
				{
					id: 'F',
					name: 'Noodherstelling uitgevoerd'
				},
				{
					id: 'G',
					name: 'Weersomstandigheden'
				},
				{
					id: 'H',
					name: 'Materieel niet afgekomen'
				},
				{
					id: 'I',
					name: 'Geen assistentie aanwezig'
				},
				{
					id: 'J',
					name: 'Geen geschikt behandelspoor'
				},
				{
					id: 'K',
					name: 'Geen oorzaak gevonden'
				},
				{
					id: 'L',
					name: 'Geen defect aangetroffen'
				},
				{
					id: 'M',
					name: 'Milieuregelgeving'
				}
			],
		}
	},
	mounted: function () {
		document.addEventListener('keyup', this.onKeyUp)
		this.$root.$on('openWODeclineReasonModal', this.openModal)
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
		},
		openModal (e) {
			const { index, workOrder } = e
			this.workOrder = workOrder
			this.index = index
			this.isModalOpened = true
		},
		saveModalDeclineServiceRequest () {
			if (!this.declineReasonServiceRequest || this.declineReasonsServiceRequest.filter(x => x.id === this.declineReasonServiceRequest).length === 0) {
				$snackbar.addWarning('Gelieve een reden op te geven.')
				return
			}

			this.closeModal()
			$loader.message = 'Service aanvraag weigeren'
			this._api.declineStatus(this.workOrder.serviceRequest.id, this.declineReasonServiceRequest).then(res => {
				$loader.message = null
				$snackbar.add('Service aanvraag geweigerd.')
			}).catch(response => {
				$loader.message = null
				$snackbar.addWarning('De service aanvraag kon niet worden geweigerd, gelieve het later nogmaals te proberen.')
			})
		},
	}
}
</script>

<template>
	<ModalWrapper :title="null" :isModalOpened="isModalOpened" :canClose="true">
			<div slot="content">
				<div class="content-left" :style="{'margin-left': '-20px', 'margin-top': '-10px'}">
					<icon name="alert" :size="60" color="rgb(255, 120, 0)"/>
				</div>
				<div class="content-right">
					<p v-if="amountOfConflicts !== 1">Er bevinden zich <span style="font-weight: normal;">{{amountOfConflicts}}</span> conflicten in het plan.</p>
					<p v-else>Er bevindt zich <span style="font-weight: normal;">{{amountOfConflicts}}</span> conflict in het plan.</p>
					<p>Weet u zeker dat u de planning naar Maximo wilt sturen?</p>
				</div>
			</div>
			<div slot="buttons" :style="{'text-align' : 'right'}">
				<button class="button orange" :style="{'margin-right': '15px'}" @click="confirmPlan">
					Ja
				</button><button class="button orange" @click="closeModal">
				Nee
			</button>
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
			amountOfConflicts: null,
			isModalOpened: false,
		}
	},
	mounted: function () {
		document.addEventListener('keyup', this.onKeyUp)
		this.$root.$on('openWOConflictModal', this.openModal)
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
			this.isModalOpened = true
		},
		confirmPlan (e) {
			this.$emit('confirmPlan', {})
		},
	}
}
</script>

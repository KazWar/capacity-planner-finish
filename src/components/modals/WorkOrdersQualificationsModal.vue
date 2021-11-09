<template>
	<ModalWrapper title="Benodigde kwalificaties" :isModalOpened="isModalOpened" :canClose="true">
		<div slot="content" v-if="(!canEditQualification)">
			Er zijn nog geen kwalificaties toegewezen aan deze taak/werkorder.
		</div>
		<div slot="content">
			<div class="item" v-for="item in filteredSelectedQualificationList">
				<span class="label">
					{{item.name}}
					<span>({{item.externalId}})</span>
				</span>
				<div class="col icon" @click="deleteTaskQualification(item)" v-if="canEditQualification">
					<icon name="sluiten" :size="40" :colors="{'default': '#C5C5CB', 'hover': '#0079D3'}"/>
				</div>
			</div>
			<TreeSelect
				v-if="canEditQualification"
				:value="selectedQualification"
				:options="filteredQualificationList"
				:cleareAfterSelect="true"
				icon="kwalificatie"
				options-id="id"
				options-label="name"
				label="Kwalificatie toevoegen"
				@input="selectQualification"
			/>
		</div>
		<div slot="buttons">
			<div class="button right" v-if="canEditQualification" @click="saveQualifications">Opslaan</div>
			<div class="button right" @click="closeModal" v-else>OK</div>
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
		qualificationList: {
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
			selectedQualifications: [],
			selectedQualification: null,
			newQualification: null,
			qualifications: []
		}
	},
	mounted: function () {
		this.$root.$on('openWOQualificationsModal', this.openModal)
		this.$root.$on('closeModal', this.closeModal)
	},
	computed: {
		filteredQualificationList () {
			return this.qualificationList.filter(item => !this.selectedQualifications.find(selected => selected === item.id))
		},
		filteredSelectedQualificationList () {
			return this.qualificationList.filter(item => this.selectedQualifications.find(selected => selected === item.id))
		}
	},
	methods: {
		selectQualification (e) {
			this.selectedQualifications.push(e)
		},
		closeModal () {
			this.isModalOpened = false
		},
		openModal (e) {
			const { index, workOrder } = e
			this.workOrder = workOrder
			this.index = index
			this.selectedQualifications = typeof this.index === 'number' ? this.workOrder.tasks[this.index].qualifications.map(item => item.qualification.id) : (this.workOrder.qualificationIds || [])
			this.isModalOpened = true
		},
		saveQualifications () {
			let workOrder = this.workOrder
			workOrder.qualificationManual = true
			this.selectedQualifications = _.without(this.selectedQualifications, undefined, null);
			workOrder.qualificationIds = this.selectedQualifications;
			if (this.index) {
				let obj = {
					id: this.workOrder.tasks[this.index || 0].id,
					qualificationIds: this.selectedQualifications
				}
				this._api.saveQualificationTask(obj)
			}
			this._api.saveWorkOrder(workOrder)
				.then(res => {
					this.$emit('updateWorkOrder', res)
				})
			this.closeModal()
		},
		deleteTaskQualification (qualification) {
			this.selectedQualifications = this.selectedQualifications.filter(item => item !== qualification.id)
			let workOrder = this.workOrder
			workOrder.qualificationIds = this.selectedQualifications
			this._api.saveWorkOrder(workOrder)
				.then(res => {
					this.$emit('updateWorkOrder', res)
				})
			if (this.index) {
				this._api.deleteTaskQualification(qualification.id)
			}
		},
	}
}
</script>

<style lang="scss" scoped>
	@import "../../assets/scss/variables";
	.item {
		border-bottom: 2px solid map-get($colors, default-grey);
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
</style>

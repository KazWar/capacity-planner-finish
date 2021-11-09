<template>
	<div class="content-half-full">
		<div class="content-child-full">
			<div class="scrollable-y content-child content-footered">
				<div class="data-col-item" v-for="item in reasonMaintenances" @click="openEditReasonMaintenance(item)">
					<div class="col push-left">{{item.code}}</div>
					<div class="col push-left" :style="{'width': '250px'}">{{item.reason}}</div>
					<div class="col">
						<div class="icon-container aanpassen">
							<icon color="#0079D3" :size="30" name="aanpassen"></icon>
						</div>
					</div>
				</div>
			</div>
		</div>
		<modal v-model="displayEditReasonMaintenance" title="Reason Maintenance" v-if="displayEditReasonMaintenance">
			<div slot="content" style="padding-top: 10px;" class="content-inline">
				<TextInput
					:paddingless="true"
					placeholder="Code"
					v-model="reasonMaintenance_code"
				/>
				<TextInput
					:paddingless="true"
					placeholder="Reason"
					v-model="reasonMaintenance_reason"
				/>
			</div>
			<div slot="buttons" style="padding-top: 20px;">
				<template v-if="reasonMaintenance_id !== null">
					<button class="button blue left" @click="saveReasonMaintenance()">Save</button>
					<button class="button red right" @click="deleteReasonMaintenance()">Delete</button>
				</template>
				<template v-else>
					<button class="button blue left" @click="createNewReasonMaintenance()">Create</button>
				</template>
			</div>
		</modal>
	</div>
</template>

<script>
	export default {
		data () {
			return {
				footerButton: 'Reason maintenance toevoegen',
				reasonMaintenances: [],
				displayEditReasonMaintenance: false,
				reasonMaintenance_code: null,
				reasonMaintenance_reason: null,
				reasonMaintenance_id: null,
			}
		},
		beforeMount () {
			this.getReasonMaintenances()
		},
		methods: {
			footerButtonMethod () {
				this.openEditReasonMaintenance()
			},
			getReasonMaintenances () {
				this._api.getReasonMaintenances().then((res) => {
					this.reasonMaintenances = res
				})
			},
			openEditReasonMaintenance (item) {
				console.log(item)
				this.displayEditReasonMaintenance = true
				this.reasonMaintenance_code = item ? item.code : null
				this.reasonMaintenance_reason = item ? item.reason : null
				this.reasonMaintenance_id = item ? item.id : null
			},
			saveReasonMaintenance () {
				let obj = {
					code: this.reasonMaintenance_code,
					reason: this.reasonMaintenance_reason
				}
				this._api.updateReasonMaintenances(this.reasonMaintenance_id, obj).then((res) => {
					for (let i = 0; i < this.reasonMaintenances.length; i++) {
						let current = this.reasonMaintenances[i]

						if (current.id == res.id) {
							current.code = res.code
							current.reason = res.reason
							break
						}
					}

					this.reasonMaintenance_id = null
					this.reasonMaintenance_code = null
					this.reasonMaintenance_reason = null

					this.displayEditReasonMaintenance = false
				})
			},
			deleteReasonMaintenance () {
				this._api.deleteReasonMaintenances(this.reasonMaintenance_id).then((res) => {
					for (let i = 0; i < this.reasonMaintenances.length; i++) {
						let current = this.reasonMaintenances[i]

						if (current.id == this.reasonMaintenance_id) {
							this.reasonMaintenances.splice(i, 1)
							break
						}
					}
					this.reasonMaintenance_id = null
					this.reasonMaintenance_code = null
					this.reasonMaintenance_reason = null

					this.displayEditReasonMaintenance = false
				})
			},
			createNewReasonMaintenance () {
				let obj = {
					code: this.reasonMaintenance_code,
					reason: this.reasonMaintenance_reason
				}

				this._api.setReasonMaintenances(obj).then((res) => {
					this.reasonMaintenances.unshift(res)

					this.reasonMaintenance_id = null
					this.reasonMaintenance_code = null
					this.reasonMaintenance_reason = null

					this.displayEditReasonMaintenance = false
				})
			},
		}
	}
</script>

<style lang="scss" scoped src="../../../assets/scss/pages/data/data.scss" />

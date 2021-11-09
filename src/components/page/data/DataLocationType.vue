<template>
	<div class="content-half-full">
		<div class="content-child-full">
			<div class="scrollable-y content-child content-footered">
				<div class="data-col-item" v-for="item in ntLocationTypes" @click="openEditLocationTypeModal(item)">
					<div class="col push-left">{{item.name}}</div>
					<div class="col">
						<div class="icon-container aanpassen">
							<icon color="#0079D3" :size="30" name="aanpassen"></icon>
						</div>
					</div>
				</div>
			</div>
		</div>
		<modal v-model="displayEditLocationTypeModal" title="Klus type" @closeModal="closeModal" v-if="displayEditLocationTypeModal">
			<div slot="content" style="padding-top: 10px;">
				<TextInput
					:paddingless="true"
					placeholder="Klus type"
					v-model="editLocationType"
					v-if="selectedLocationType !== null"
				/>
				<TextInput
					:paddingless="true"
					placeholder="Klus type"
					v-model="newLocationType"
					v-else
				/>
			</div>
			<div slot="buttons" style="padding-top: 20px;">
				<template v-if="selectedLocationType">
					<button class="button blue left" @click="saveLocationType()">Save</button>
					<button class="button red right" @click="deleteLocationType()">Delete</button>
				</template>
				<template v-else>
					<button class="button blue left" @click="createNewLocationType()">Create</button>
				</template>

			</div>
		</modal>
	</div>
</template>

<script>
	import $snackbar from '@/modules/snackbar-module'
	import $loader from '@/modules/loader-module'
	export default {
		data () {
			return {
				footerButton: 'Type toevoegen',
				ntLocationTypes: [],
				displayEditLocationTypeModal: false,
				editLocationType: null,
				selectedLocationType: null,
				newLocationType: null,
			}
		},
		beforeMount () {
			this.getNtLocationTypes()
		},
		methods: {
			footerButtonMethod () {
				this.openEditLocationTypeModal()
			},
			openEditLocationTypeModal (item) {
				this.displayEditLocationTypeModal = true
				if (item) {
					this.selectedLocationType = item
					this.editLocationType = this.selectedLocationType.name
				}
			},
			saveLocationType () {
				let obj = {
					name: this.editLocationType
				}

				this._api.updatetLocationTypeList(this.selectedLocationType.id, obj)
					.then(res => {
						$snackbar.add('Bijgewerkt')
						this.displayEditLocationTypeModal = false

						for (let i = 0; i < this.ntLocationTypes.length; i++) {
							let current = this.ntLocationTypes[i]

							if (current.id == res.id) {
								current.name = res.name
							}
						}

						this.editLocationType = null
						this.selectedLocationType = null
					})
					.catch(err => {
						console.log(err)
					})
			},
			deleteLocationType (id) {
				this._api.deleteLocationType(this.selectedLocationType.id)
					.then(res => {
						$snackbar.add('Bijgewerkt')
						this.displayEditLocationTypeModal = false
						for (let i = 0; i < this.ntLocationTypes.length; i++) {
							let currentId = this.ntLocationTypes[i].id

							if (currentId == this.selectedLocationType.id) {
								this.ntLocationTypes.splice(i, 1)
							}
						}
						this.selectedLocationType = null
					})
			},
			createNewLocationType () {
				let obj = {
					name: this.newLocationType
				}
				this._api.setLocationType(obj)
					.then(res => {
						$snackbar.add('Bijgewerkt')
						this.ntLocationTypes.push(res)
						this.displayEditLocationTypeModal = false
						this.newLocationType = null
					})
			},
			getNtLocationTypes () {
				this.ntLocationTypes = []
				this._api.getLocationTypeList()
					.then(res => {
						this.ntLocationTypes = res
						$loader.message = null
					})
					.catch(err => {
						console.log(err)
						$loader.error = true
					})
			},
			closeModal () {
				this.selectedLocationType = null
				this.newLocationType = null
			},
		}
	}
</script>

<style lang="scss" scoped src="../../../assets/scss/pages/data/data.scss" />

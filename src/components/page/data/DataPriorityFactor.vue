<template>
	<div class="content-half-full">
		<div class="content-child-full">
						<div class="scrollable-y content-child content-footered">
								<div class="data-col-item"
										v-for="(priorityFactor, priorityFactorIndex) in priorityFactors"
										:key="priorityFactorIndex"
										@click="openPriorityFactorModal(priorityFactor)"
								>
										<div class="col">
											{{priorityFactor.title}}
										</div>
										<div class="col">
												<div class="icon-container aanpassen">
														<icon color="#0079D3" :size="30" name="aanpassen"></icon>
												</div>
										</div>
								</div>
						</div>
				</div>
				<modal v-model="displayPriorityFactorModal" :title="selectedPriorityFactor.id ? 'Prioriteitscore aanpassen' : 'Nieuwe prioriteitscore'" v-if="displayPriorityFactorModal">
					<div slot="content" style="padding-top: 10px;">
						<TextInput
							:paddingless="true"
							title="Kies titel"
							placeholder="Kies titel"
							v-model="selectedPriorityFactor.title"
							:class="{'danger': formWarnings.indexOf('title') !== -1}"
						/>
						<TextInput
							:paddingless="true"
							:number="true"
							title="SDM prioriteit"
							placeholder="SDM prioriteit"
							v-model="selectedPriorityFactor.sdmPriority"
							:class="{'danger': formWarnings.indexOf('sdmPriority') !== -1}"
						/>
						<TextInput
							:paddingless="true"
							:number="true"
							title="Klantbehoefte"
							placeholder="Kies score"
							v-model="selectedPriorityFactor.klantbehoefte"
							:class="{'danger': formWarnings.indexOf('klantbehoefte') !== -1}"
						/>
						<TextInput
							:paddingless="true"
							:number="true"
							title="Dagen tot streefdatum"
							placeholder="Kies score"
							v-model="selectedPriorityFactor.daysUntillDueDate"
							:class="{'danger': formWarnings.indexOf('daysUntillDueDate') !== -1}"
						/>
						<TextInput
							:paddingless="true"
							:number="true"
							title="Normtijd"
							placeholder="Kies score"
							v-model="selectedPriorityFactor.leadTimeInHours"
							:class="{'danger': formWarnings.indexOf('leadTimeInHours') !== -1}"
						/>
					</div>
					<div slot="buttons" style="padding-top: 20px;">
						<div class="delete" style="position: absolute; left: 20px;" v-if="selectedPriorityFactor.id" @click="openDeletePriorityFactorModal()">
							<div class="icon-container plus">
								<icon :size="30" color="#DC0000" name="plus"></icon>
							</div><div class="label">
							Verwijderen
						</div>
						</div>
						<button class="button right" @click="savePriorityFactor()">Opslaan</button>
					</div>
				</modal>
				<modal v-model="displayDeletePriorityFactorModal" title="Prioriteitscore verwijderen" v-if="displayDeletePriorityFactorModal">
			<div slot="content" style="padding-top: 10px;">
				Weet u zeker dat u deze prioriteitscore wilt verwijderen? Dit kan niet ongedaan gemaakt worden.
			</div>
			<div slot="buttons" style="padding-top: 20px;">
				<button class="button blue left" @click="closeDeletePriorityFactorModal()">Nee, terug</button>
				<button class="button red right" @click="deletePriorityFactor()">Ja, verwijderen</button>
			</div>
		</modal>
		</div>
</template>

<script>
	import $loader from '@/modules/loader-module'
	import $snackbar from '@/modules/snackbar-module'
	import $date from '@/modules/date-module'
	export default {
		data () {
			return {
				footerButton: 'Prioriteitscore toevoegen',
				priorityFactors: [],
				formWarnings: [],
				displayPriorityFactorModal: false,
				displayDeletePriorityFactorModal: false,
				initialPriorityFactor: {
					title: null,
					sdmPriority: null,
					klantbehoefte: null,
					daysUntillDueDate: null,
					leadTimeInHours: null
				},
				selectedPriorityFactor: {}
				}
		},
		beforeMount () {
			this.updatePriorityFactors()
		},
		methods: {
			footerButtonMethod () {
				this.openPriorityFactorModal()
			},
			updatePriorityFactors (callback) {
				$loader.message = 'Prioriteitscores ophalen'
				this._api.getPriorityList().then(res => {
					this.priorityFactors = res
					$loader.message = null
					if (callback) {
						callback()
					}
				}).catch(response => {
					$loader.message = null
				})
			},

			deletePriorityFactor () {
				$loader.message = 'Prioriteitscore verwijderen'
				this._api.deletePriority(this.selectedPriorityFactor.id).then(res => {
					for (let i = this.priorityFactors.length - 1; i >= 0; i--) {
						let priorityFactor = this.priorityFactors[i]
						if (priorityFactor.id === this.selectedPriorityFactor.id) {
							this.priorityFactors.splice(i, 1)
						}
					}
					this.displayDeletePriorityFactorModal = false
					$snackbar.add('Prioriteitscore verwijderd')
					$loader.message = null
					this.selectedPriorityFactor = Object.assign({}, this.initialPriorityFactor)
				}).catch(err => {
					console.log(err)
					$loader.message = null
				})
			},
			savePriorityFactor () {
				if (!this.validatePriorityFactor()) {
					return
				}
				if (!this.selectedPriorityFactor.id) {
					$loader.message = 'Prioriteitscore toevoegen'
					this._api.setPriority(this.selectedPriorityFactor).then(res => {
						let priorityFactor = res
						this.priorityFactors.push(priorityFactor)
						this.selectedPriorityFactor = Object.assign({}, this.initialPriorityFactor)
						this.displayPriorityFactorModal = false
						$snackbar.add('Prioriteitscore toegevoegd')
						$loader.message = null
					}).catch(response => {
						$loader.message = null
					})
				}
				else {
					$loader.message = 'Prioriteitscore aanpassen'
					this._api.updatePriority(this.selectedPriorityFactor).then(res => {
					this.selectedPriorityFactor = res
						for (let i = this.priorityFactors.length - 1; i >= 0; i--) {
							let priorityFactor = this.priorityFactors[i]
							if (priorityFactor.id === this.selectedPriorityFactor.id) {
								for (let propertyName in this.selectedPriorityFactor) {
									priorityFactor[propertyName] = this.selectedPriorityFactor[propertyName]
								}
							}
						}
						this.displayPriorityFactorModal = false
						$snackbar.add('Prioriteitscore aangepast')
						$loader.message = null
						this.selectedPriorityFactor = Object.assign({}, this.initialMaterial)
					}).catch(response => {
							$loader.message = null
					})
				}
			},
			validatePriorityFactor () {
				this.formWarnings = []
				if (!this.selectedPriorityFactor) {
					return false
				}
				let properties = Object.keys(this.initialPriorityFactor)
				for (let propertyIndex in properties) {
					let propertyName = properties[propertyIndex]
					let value = this.selectedPriorityFactor[propertyName]
					if (value === null || value === '') {
						this.formWarnings.push(propertyName)
					}
				}
				return this.formWarnings.length === 0
			},
			openPriorityFactorModal (data) {
			this.formWarnings = []
			if (data) {
				this.selectedPriorityFactor = Object.assign({}, data)
			}
			else {
				this.selectedPriorityFactor = Object.assign({}, this.initialPriorityFactor)
			}
			this.displayPriorityFactorModal = true
			},
			openDeletePriorityFactorModal () {
				this.displayPriorityFactorModal = false
				this.displayDeletePriorityFactorModal = true
			},
			closeDeletePriorityFactorModal () {
				this.displayDeletePriorityFactorModal = false
				this.displayPriorityFactorModal = true
			}
		}
	}
</script>

<style lang="scss" scoped src="../../../assets/scss/pages/data/data.scss" />

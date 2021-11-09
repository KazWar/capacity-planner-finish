<template>
	<div class="content-full">
		<div class="table-content scrollable-y content-child content-footered" >
			<table>
				<thead>
				<tr>
					<th>SDM code</th>
					<th>Diagnose Code</th>
					<th>Outillage</th>
					<th>Doorlooptijd</th>
					<th>Kwalificatie</th>
					<th></th>
				</tr>
				</thead>
				<tbody>
				<tr
					v-for="material in _.orderBy(materials.filter(x => x.seriesCode === selectedMaterialSerie), ['classFailureCode'], ['asc'])"
					@click="openMaterialModal(material)"
				>
					<td>{{material.classFailureCode}}</td>
					<td>{{material.matDiagnosisCode}}</td>
					<td>{{material.equipmentTypeName}}</td>
					<td>{{getDurationTimeStampFromMinutes(material.averageLeadTimeMinutes || 0)}}</td>
					<td>{{material.qualificationName}}</td>
					<td>
						<icon color="#0079D3" :size="30" name="aanpassen"></icon>
					</td>
				</tr>
				</tbody>
			</table>
		</div>
		<!-- Add/modify material -->
		<modal v-model="displayMaterialModal" :title="selectedMaterial.id ? 'Normtijd aanpassen' : 'Nieuwe normtijd'" v-if="displayMaterialModal">
			<div slot="content" style="padding-top: 10px;">
				<TextInput
					:paddingless="true"
					title="Kies SDM code"
					placeholder="Kies SDM code"
					v-model="selectedMaterial.sdmCode"
					:class="{'danger': formWarnings.indexOf('sdmCode') !== -1}"
				/>
				<TextInput
					:paddingless="true"
					title="Kies diagnose code"
					placeholder="Kies diagnose code"
					v-model="selectedMaterial.matDiagnosisCode"
					:class="{'danger': formWarnings.indexOf('matDiagnosisCode') !== -1}"
				/>
				<TextInput
					:paddingless="true"
					title="Kies materieelserie"
					placeholder="Kies materieelserie"
					v-model="selectedMaterial.sdmCode"
					:class="{'danger': formWarnings.indexOf('sdmCode') !== -1}"
				/>
				<TreeSelect
					v-model="selectedMaterial.sdmPriority"
					:options="sdmPriorities"
					options-label="value"
					label="SDM prioriteit"
					title="SDM prioriteit"
					:class="{'danger': formWarnings.indexOf('sdmPriority') !== -1}"
				/>
				<TreeSelect
					v-model="selectedMaterial.equipmentTypeId"
					:options="equipmentTypes"
					options-label="name"
					label="Kies outillage type"
					title="Kies outillage type"
					:hideUnknown="true"
					:class="{'danger': formWarnings.indexOf('equipmentTypeId') !== -1}"
				/>
				<DateTimePicker
					label="Kies doorlooptijd"
					title="Kies doorlooptijd"
					v-model="selectedMaterial.averageLeadTimeMinutes"
					class="picker-container"
					onlyTime="true"
					:class="{'danger': formWarnings.indexOf('averageLeadTimeMinutes') !== -1}"
				/>
				<TreeSelect
					v-model="selectedMaterial.qualificationId"
					:options="qualifications"
					options-label="name"
					label="Kies kwalificatie"
					title="Kies kwalificatie"
					:class="{'danger': formWarnings.indexOf('equipmentTypeId') !== -1}"
				/>
			</div>
			<div slot="buttons" style="padding-top: 20px;">
				<div class="delete" style="position: absolute; left: 20px;" v-if="selectedMaterial.id" @click="openDeleteMaterialModal()">
					<div class="icon-container plus">
						<icon :size="30" color="#DC0000" name="plus"></icon>
					</div>
					<div class="label">
						Verwijderen
					</div>
				</div>
				<button class="button right" @click="saveMaterial()">Opslaan</button>
			</div>
		</modal>

		<!-- Delete material -->
		<modal v-model="displayDeleteMaterialModal" title="Normtijd verwijderen" v-if="displayDeleteMaterialModal">
			<div slot="content" style="padding-top: 10px;">
				Weet u zeker dat u deze normtijd wilt verwijderen? Dit kan niet ongedaan gemaakt worden.
			</div>
			<div slot="buttons" style="padding-top: 20px;">
				<button class="button blue left" @click="closeDeleteMaterialModal()">Nee, terug</button>
				<button class="button red right" @click="deleteMaterial()">Ja, verwijderen</button>
			</div>
		</modal>

	</div>
</template>

<script>
	import $loader from '@/modules/loader-module'
	import $snackbar from '@/modules/snackbar-module'
	export default {
		data () {
			return {
				footerButton: 'Normtijd toevoegen',
				formWarnings: [],
				materials: [],
				materialSeries: [],
				selectedMaterialSerie: null,
				selectedMaterial: {},
				displayMaterialModal: false,
				displayDeleteMaterialModal: false,
				equipmentTypes: [],
				qualifications: [],
				sdmPriorities: [
					{
						id: 0,
						value: 'Nee'
					},
					{
						id: 1,
						value: 'Ja'
					}
				],
				initialMaterial: {
					averageLeadTimeMinutes: null,
					equipmentTypeId: null,
					equipmentTypeName: null,
					sdmPriority: 0,
					sdmCode: null,
					seriesCode: null
				},
				selectedQualificationId: null,
			}
		},
		watch: {
			selectedMaterialSerie: function () {
				if (!this.selectedMaterialSerie) {
					return
				}
				localStorage.setItem('dataSelectedMaterialSerie', this.selectedMaterialSerie)
			}
		},
		created: function () {
			this.selectedMaterialSerie = localStorage.getItem('dataSelectedMaterialSerie') || null
		},
		beforeMount () {
			this.updateMaterials()
			this.updateEquipmentTypes()
		},
		mounted () {
			this.$root.$on('selectChild', this.selectChild)
		},
		methods: {
			footerButtonMethod () {
				this.openMaterialModal()
			},
			selectChild (e) {
				this.selectedMaterialSerie = e.child
			},
			updateQualifications () {
				$loader.message = 'Kwalificaties ophalen'
				this._api.getQualificationList()
					.then(res => {
						this.qualifications = res
						$loader.message = null
					}).catch(err => {
						console.log(err)
						$loader.message = null
					})
			},
			async updateEquipmentTypes (callback) {
				$loader.message = 'Outillage types ophalen'
				await this._api.getEquipmentTypesList()
					.then(res => {
						this.equipmentTypes = res
						$loader.message = null

						if (callback) {
							callback()
						}
					})
					.catch(err => {
						console.log(err)
						$loader.message = null
					})
			},
			updateMaterials (callback) {
				console.log('methods tab material updateMaterials')
				$loader.message = 'Normtijden ophalen'
				this._api.getMaterialList()
					.then(res => {
						this.materials = res

						for (let i = 0; i < this.materials.length; i++) {
							let material = this.materials[i]
							if (!material.classFailureCode) {
								material.classFailureCode = material.failureCode
							}
						}
						this.materialSeries = this.materials.map(x => x.seriesCode).filter((v, i, a) => v && a.indexOf(v) === i)

						this.materialSeries = _.orderBy(this.materialSeries, ['asc'])
						const childrens = this.materialSeries.map(item => {
							return {
								title: item,
								count: this.materials.filter(x => x.seriesCode === item).length
							}
						})
						this.$root.$emit('setSideBarChildrens', {
							title: 'Normtijden',
							data: childrens
						})
						if (localStorage.getItem('dataSelectedMaterialSerie') && this.materialSeries.map(x => String(x)).indexOf(String(localStorage.getItem('dataSelectedMaterialSerie'))) !== -1) {
							this.selectedMaterialSerie = localStorage.getItem('dataSelectedMaterialSerie')
						}
						else if (this.materialSeries.length > 0) {
							this.selectedMaterialSerie = this.materialSeries[0]
						}
						this.$root.$emit('selectChild', {
							title: 'Normtijden',
							child: this.selectedMaterialSerie
						})
						$loader.message = null

						if (callback) {
							callback()
						}
					})
					.catch(err => {
						console.log(err)
						$loader.message = null
					})
			},
			openMaterialModal (data) {
				this.formWarnings = []
				// console.log(data.equipmentTypeName);
				if (data) {
					this.selectedMaterial = Object.assign({}, {
						...data,
						sdmCode: data.classFailureCode || data.failureCode,
						averageLeadTimeMinutes: this.getDurationTimeStampFromMinutes(data.averageLeadTimeMinutes),
						qualificationId: data.qualificationId

					})
				}
				else {
					this.selectedMaterial = Object.assign({}, {
						...this.initialMaterial,
						seriesCode: this.selectedMaterialSerie,
						qualificationId: this.selectedQualificationId
					})
				}
				this.displayMaterialModal = true
			},
			getDurationTimeStampFromMinutes (minutes) {
				let hours = Math.floor(minutes / 60)
				minutes = minutes - hours * 60

				hours = String(hours)
				if (hours.length === 1) {
					hours = '0' + hours
				}

				minutes = String(minutes)
				if (minutes.length === 1) {
					minutes = '0' + minutes
				}

				return hours + ':' + minutes
			},
			saveMaterial () {
				if (!this.validateMaterial()) {
					return
				}
				let averageLeadTimeMinutes = null;
				if(this.selectedMaterial.averageLeadTimeMinutes !== null){
					averageLeadTimeMinutes = Number(this.selectedMaterial.averageLeadTimeMinutes.substring(0, 2)) * 60 + Number(this.selectedMaterial.averageLeadTimeMinutes.substring(3, 5))
				}

				const data = {
					...this.selectedMaterial,
					averageLeadTimeMinutes: averageLeadTimeMinutes,
					failureCode: this.selectedMaterial.failureCode,
					classFailureCode: this.selectedMaterial.sdmCode,
					equipmentTypeName: this.getSelectedEequipmentTypeName(),
					qualificationId: this.getSelectedQualificationId(this.selectedQualificationId),
					qualificationName: this.getSelectedQualificationName(this.selectedQualificationId)
				}
				if (!this.selectedMaterial.id) {
					$loader.message = 'Normtijd toevoegen'
					let averageLeadTimeMinutes = null
					this._api.createMaterial(data).then(res => {
						let material = res
						this.materials.push(material)
						this.selectedMaterial = Object.assign({}, this.initialMaterial)
						this.displayMaterialModal = false
						$snackbar.add('Normtijd toegevoegd')
						$loader.message = null
						this.materialSeries = this.materials.map(x => x.seriesCode).filter((v, i, a) => v && a.indexOf(v) === i)
					}).catch(response => {
						$loader.message = null
					})
				}
				else {
					$loader.message = 'Normtijd aanpassen'
					this._api.editMaterial(data).then(res => {
						this.selectedMaterial = res
						for (let i = this.materials.length - 1; i >= 0; i--) {
							let material = this.materials[i]
							if (material.id === this.selectedMaterial.id) {
								for (let propertyName in this.selectedMaterial) {
									material[propertyName] = this.selectedMaterial[propertyName]
								}
							}
						}
						this.displayMaterialModal = false
						$snackbar.add('Normtijd aangepast')
						$loader.message = null
						this.materialSeries = this.materials.map(x => x.seriesCode).filter((v, i, a) => v && a.indexOf(v) === i)
						if (this.materialSeries.indexOf(this.selectedMaterialSerie) === -1) {
							this.selectedMaterialSerie = this.selectedMaterial.seriesCode
						}
						this.selectedMaterial = Object.assign({}, this.initialMaterial)
					}).catch(err => {
						console.log(err)
						$loader.message = null
					})
				}
			},
			deleteMaterial () {
				$loader.message = 'Normtijd verwijderen'
				this._api.deleteMaterial(this.selectedMaterial.id)
					.then(res => {
						for (let i = this.materials.length - 1; i >= 0; i--) {
							let material = this.materials[i]
							if (material.id === this.selectedMaterial.id) {
								this.materials.splice(i, 1)
							}
						}
						this.displayDeleteMaterialModal = false
						$snackbar.add('Normtijd verwijderd')
						$loader.message = null
						this.materialSeries = this.materials.map(x => x.seriesCode).filter((v, i, a) => v && a.indexOf(v) === i)
						if (this.materialSeries.indexOf(this.selectedMaterialSerie) === -1 && this.materialSeries.length > 0) {
							this.selectedMaterialSerie = this.materialSeries[0]
						}
						this.selectedMaterial = Object.assign({}, this.initialMaterial)
					})
					.catch(err => {
						console.log(err)
						$loader.message = null
					})
			},
			validateMaterial () {
				this.formWarnings = []
				if (!this.selectedMaterial) {
					return false
				}
				let properties = Object.keys(this.initialMaterial).map(x => ['equipmentTypeId'].indexOf(x) === -1)
				for (let propertyIndex in properties) {
					let propertyName = properties[propertyIndex]
					let value = this.selectedMaterial[propertyName]
					if (value === null || value === '') {
						this.formWarnings.push(propertyName)
					}
				}
				return this.formWarnings.length === 0
			},
			getSelectedQualificationId (selectedId) {
				if (selectedId) {
					for (let i = 0; i < this.qualifications.length; i++) {
						if (selectedId == this.qualifications[i].id) {
							// console.log(this.qualifications[i].name);
							return this.qualifications[i].id
						}
					}
				} else {
					for (let i = 0; i < this.qualifications.length; i++) {
						if (this.selectedMaterial.qualificationId == this.qualifications[i].id) {
							// console.log(this.qualifications[i].name);
							return this.qualifications[i].id
						}
					}
				}
			},
			getSelectedEequipmentTypeName () {
				for (let i = 0; i < this.equipmentTypes.length; i++) {
					if (this.selectedMaterial.equipmentTypeId == this.equipmentTypes[i].id) {
						console.log(this.equipmentTypes[i].name)
						return this.equipmentTypes[i].name
					}
				}
			},

			getSelectedQualificationName (selectedId) {
				if (selectedId) {
					for (let i = 0; i < this.qualifications.length; i++) {
						if (selectedId == this.qualifications[i].id) {
							return this.qualifications[i].name
						}
					}
				} else {
					for (let i = 0; i < this.qualifications.length; i++) {
						if (this.selectedMaterial.qualificationId == this.qualifications[i].id) {
							return this.qualifications[i].name
						}
					}
				}
			},
			openDeleteMaterialModal () {
				this.displayMaterialModal = false
				this.displayDeleteMaterialModal = true
			},
			closeDeleteMaterialModal () {
				this.displayDeleteMaterialModal = false
				this.displayMaterialModal = true
			},
		}
	}
</script>

<style lang="scss" scoped src="../../../assets/scss/pages/data/data.scss" />

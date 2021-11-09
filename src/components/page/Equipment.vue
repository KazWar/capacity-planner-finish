
<template>
    <div class="equipment">
        <div class="content content-headered">
			<div class="content-sidebar">
				<div class="content-sidebar-left"></div>
				<div class="content-sidebar-right">
					<div class="equipment-filters">
						<TreeSelect
							v-if="!_.isEmpty(locations) && selectedTab === 'equipments'"
							:value="selectedLocationId"
							:options="locations"
							options-label="name"
							additionalSearch="station"
							label=""
							:async="true"
							:borderless="false"
							:clearable="false"
							:selectSize="52"
							:selectWidth="200"
							@input="changeLocation"
						/>
					</div>
				</div>
			</div>
			<div class="content-sidebar">
				<div class="content-sidebar-left">
					<div class="sidebar scrollable-y content-child-row content-footered">
						<Sidebar
							:items="sideBarItems"
							:selectedTab="selectedTab"
							@selectTab="setSelectedTab"
						/>
					</div>
				</div>
				<div class="content-sidebar-right">
					<div class="equipment-content scrollable-y content-child-row content-flex-row content-footered">
						<template v-if="selectedTab === 'equipments'">
							<div
								class="equipment-col-item content-row mb-20"
								v-for="(equipment, equipmentIndex) in equipmentList.filter(x =>
							!selectedLocationId || x.locationId === selectedLocationId)"
								:key="equipmentIndex"
								@click="openEquipmentModal(equipment)"
							>
								<div class="col" >
									{{equipment.name}}
								</div>
								<div class="col" :class="[!equipment.available ? 'col-red' : 'col-green']">
									{{!equipment.available ? 'Niet beschikbaar' : 'Beschikbaar'}}
								</div>
								<div class="col">
									<div class="icon-container aanpassen">
										<icon color="#0079D3" :size="30" name="aanpassen"></icon>
									</div>
								</div>
							</div>
						</template>
						<template v-else>
							<div
								class="equipment-col-item equipment-col-type content-row mb-20"
								v-for="(equipmentType, equipmentTypeIndex) in equipmentTypes"
								:key="equipmentType.id"
								@click="openEquipmentTypeModal(equipmentType)"
							>
								<div class="col">
									{{equipmentType.name}}
								</div>
								<div class="col">
									<div class="icon-container aanpassen">
										<icon color="#0079D3" :size="30" name="aanpassen"></icon>
									</div>
								</div>
							</div>
						</template>
					</div>
				</div>
			</div>
        </div>
		<div class="footer">
			<div class="flex-wrap flex-right">
				<div class="equipment-bottom-right">
					<button class="button-orange" @click="selectedTab === 'equipments' ? openEquipmentModal() : openEquipmentTypeModal()">{{sideBarItems.find(x => x.id === selectedTab).singular}} toevoegen</button>
				</div>
			</div>
		</div>
		<modal v-model="displayEquipmentModal" :title="selectedEquipment.id ? 'Outillage aanpassen' : 'Nieuwe outillage'">
			<div slot="content" style="padding-top: 10px;">
				<div class="availability">
					<button :class="{
                        'selected': selectedEquipment.available,
                        'green': true
                    }" @click="selectedEquipment.available = true">
						Beschikbaar
					</button><button :class="{
                        'selected': !selectedEquipment.available,
                        'red': true
                    }" @click="selectedEquipment.available = false">
					Niet beschikbaar
				</button>
				</div>
				<TextInput
					placeholder="Kies naam"
					v-model="selectedEquipment.name"
					:paddingless="true"
					:class="{'danger': formWarnings.indexOf('name') !== -1}"
				/>
				<TreeSelect
					v-model="selectedEquipment.equipmentTypeId"
					:options="equipmentTypes"
					options-label="name"
					label="Kies type"
					:class="{'danger': formWarnings.indexOf('equipmentTypeId') !== -1}"
				/>

				<!-- Disabled from -->
				<DateTimePicker
					label="Kies datum"
					title="Niet beschikbaar van"
					:icon="true"
					v-model="selectedEquipment.startDate"
					class="picker-container"
				/>
				<!-- Disabled to -->
				<DateTimePicker
					label="Kies datum"
					title="Niet beschikbaar tot"
					:icon="true"
					:minDate="selectedEquipment.startDate"
					v-model="selectedEquipment.endDate"
					class="picker-container"
				/>
			</div>
			<div slot="buttons" style="padding-top: 20px;">
				<div class="delete" style="position: absolute; left: 20px;" v-if="selectedEquipment.id" @click="openDeleteEquipmentModal()">
					<div class="icon-container plus">
						<icon :size="30" color="#DC0000" name="plus"></icon>
					</div>
					<div class="label">
						Verwijderen
					</div>
				</div>
				<!-- <button class="button right" @click="saveEquipment()">Opslaan</button> -->
				<button class="button right" @click="saveEquipment()">Opslaan</button>
			</div>
		</modal>

		<modal v-model="displayDeleteEquipmentModal" title="Outillage verwijderen">
			<div slot="content" style="padding-top: 10px;">
				Weet u zeker dat u dit outillage wilt verwijderen? Dit kan niet ongedaan gemaakt worden.
			</div>
			<div slot="buttons" style="padding-top: 20px;">
				<button class="button blue left" @click="closeDeleteEquipmentModal()">Nee, terug</button>
				<button class="button red right" @click="deleteEquipment()">Ja, verwijderen</button>
			</div>
		</modal>

		<modal v-model="displayEquipmentTypeModal" :title="selectedEquipmentType.id ? 'Outillage type aanpassen' : 'Nieuwe outillage type'">
			<div slot="content" style="padding-top: 10px;">
				<TextInput
					:paddingless="true"
					placeholder="Kies naam"
					v-model="selectedEquipmentType.name"
					:class="{'danger': formWarnings.indexOf('name') !== -1}"
				/>
			</div>
			<div slot="buttons" style="padding-top: 20px;">
				<div class="delete" style="position: absolute; left: 20px;" v-if="selectedEquipmentType.id" @click="openDeleteEquipmentTypeModal()">
					<div class="icon-container plus">
						<icon :size="30" color="#DC0000" name="plus"></icon>
					</div>
					<div class="label">
						Verwijderen
					</div>
				</div>
				<button class="button right" @click="saveEquipmentType()">Opslaan 1</button>
			</div>
		</modal>

		<modal v-model="displayDeleteEquipmentTypeModal" title="Outillage type verwijderen">
			<div slot="content" style="padding-top: 10px;">
				Weet u zeker dat u dit outillage type wilt verwijderen? Dit kan niet ongedaan gemaakt worden.
			</div>
			<div slot="buttons" style="padding-top: 20px;">
				<button class="button blue left" @click="closeDeleteEquipmentTypeModal()">Nee, terug</button>
				<button class="button red right" @click="deleteEquipmentType()">Ja, verwijderen</button>
			</div>
		</modal>
    </div>
</template>

<script>
import $date from '@/modules/date-module'
import $loader from '@/modules/loader-module'
import $snackbar from '@/modules/snackbar-module'
import _ from 'lodash'
export default {
	components: {
		Sidebar: () => import('@/components/Sidebar')
	},
    data: function () {
        return {
            selectedLocationId: +this.$store.getters['GET_CURRENT_LOCATION_ID'],
            selectedTab: 'equipments',
			sideBarItems: [
				{
					title: 'Outillage',
					icon: 'ladder',
					singular: 'Outillage',
					id: 'equipments'
				},
				{
					title: 'Outillage types',
					icon: 'ladder',
					singular: 'Outillage type',
					id: 'equipment-types'
				},
			],
            formWarnings: [],

            displayEquipmentModal: false,

            displayDeleteEquipmentModal: false,

            displayEquipmentTypeModal: false,

            displayDeleteEquipmentTypeModal: false,

            equipmentList: [],

            equipmentTypes: [],

            selectedEquipment: {
                startDate: null,
                endDate: null
            },

            selectedEquipmentType: {
                name: null
            },

            initialEquipment: {
                startDate: null,
                endDate: null,
                name: null,
                available: true,
                equipmentTypeId: null
            },

            initialEquipmentType: {
                name: null
            },

            applicationTypes: ['SB', 'MBN', 'ADMIN'].map(x => ({
                id: x,
                value: x
            }))
        }
    },
	created: function () {
        this.updateData()
    },
    watch: {
        displayEquipmentModal: function () {
            if (!this.displayEquipmentModal) {
                this.formWarnings = []
            }
        },

        displayDeleteModal: function () {
            if (!this.displayDeleteModal) {
                this.formWarnings = []
            }
        },

        selectedTab: function () {
            if (!this.selectedTab) {
                return
            }
            localStorage.setItem('equipmentSelectedTab', this.selectedTab)
        }
    },
	computed: {
		locations () {
			return this.$store.getters.GET_LOCATIONS
		},
		currentLocationId () {
			return +this.$store.getters['GET_CURRENT_LOCATION_ID']
		}
	},
    methods: {
		changeLocation (e) {
			if (e && e !== 0) {
				this.selectedLocationId = e
			}
		},

		setSelectedTab(tabId) {
			this.selectedTab = tabId;
		},
        //Compare dates (end date can not be less then start date)
        compareDates(){
            this.saveEquipment()
        },
        /**
         * Updates all data
         */
        updateData () {
            $loader.message = 'Outillage ophalen'
            this._api.getEquipmentList().then(res => {
                this.equipmentList = res.map(x => ({
                    ...x,
                    startDate: x.startDate ? $date.toDateString(new Date(x.startDate)) : null,
                    endDate: x.endDate ? $date.toDateString(new Date(x.endDate)) : null
                }))
                $loader.message = 'Locaties ophalen'
                this.selectedEquipment = this.equipmentList[0]

				this._api.getEquipmentTypesList()
					.then(res => {
						this.equipmentTypes = res
						$loader.message = null
					}).catch(response => {
					$loader.message = null
					$loader.error = true;
				})
            }).catch(response => {
                $loader.message = null
                $loader.error = true;
            })
        },

        /**
         * Opens the equipment modal
         * @param {object} equipment the equipment object to use
         */
        openEquipmentModal (equipment) {
            if (equipment) {
                this.selectedEquipment = Object.assign({}, equipment)
            }
            else {
                this.selectedEquipment = Object.assign({}, this.initialEquipment)
            }
            this.displayEquipmentModal = true
        },

        /**
         * Opens the delete modal
         */
        openDeleteEquipmentModal () {
            this.displayEquipmentModal = false
            this.displayDeleteEquipmentModal = true
        },

        /**
         * Closes the delete modal
         */
        closeDeleteEquipmentModal () {
            this.displayDeleteEquipmentModal = false
            this.displayEquipmentModal = true
        },

        /**
         * Opens the equipment type modal
         * @param {object} equipmentType the equipment type object to use
         */
        openEquipmentTypeModal (equipmentType) {
            if (equipmentType) {
                this.selectedEquipmentType = Object.assign({}, equipmentType)
            }
            else {
                this.selectedEquipmentType = Object.assign({}, this.initialEquipmentType)
            }
            this.displayEquipmentTypeModal = true
        },

        /**
         * Opens the delete modal
         */
        openDeleteEquipmentTypeModal () {
            this.displayEquipmentTypeModal = false
            this.displayDeleteEquipmentTypeModal = true
        },

        /**
         * Closes the delete modal
         */
        closeDeleteEquipmentModal () {
            this.displayDeleteEquipmentTypeModal = false
            this.displayEquipmentTypeModal = true
        },

        /**
         * Deletes the equipment
         */
        deleteEquipment () {
            $loader.message = 'Outillage verwijderen'
            console.log(this.selectedEquipment);
            this._api.deleteEquipment(this.selectedEquipment.id).then(res => {
                for (let i = this.equipmentList.length - 1; i >= 0; i--) {
                    let equipment = this.equipmentList[i]
                    if (equipment.id === this.selectedEquipment.id) {
                        this.equipmentList.splice(i, 1)
                    }
                }
                this.selectedEquipment = Object.assign({}, this.initialEquipment)
                this.displayDeleteEquipmentModal = false
                $snackbar.add('Outillage verwijderd')
                $loader.message = null
                this.$forceUpdate()
            }).catch(response => {
                $loader.message = null
                $loader.error = true;
            })
        },

        /**
         * Deletes the equipment type
         */
        deleteEquipmentType () {
            $loader.message = 'Outillage type verwijderen'
			this._api.deleteEquipmentType(this.selectedEquipmentType.id).then(res => {
                for (let i = this.equipmentTypes.length - 1; i >= 0; i--) {
                    let equipmentType = this.equipmentTypes[i]
                    if (equipmentType.id === this.selectedEquipmentType.id) {
                        this.equipmentTypes.splice(i, 1)
                    }
                }
                this.selectedEquipmentType = Object.assign({}, this.initialEquipmentType)
                this.displayDeleteEquipmentTypeModal = false
                $snackbar.add('Outillage type verwijderd')
                $loader.message = null
                this.$forceUpdate()
            }).catch(response => {
                $loader.message = null
                $loader.error = true;
            })
        },

        /**
         * Attempt to add a equipment
         */
        saveEquipment () {
            console.log(this.selectedEquipment.startDate);
            console.log(this.selectedEquipment.endDate);
            let startDate = null,
                endDate = null;

            if(this.selectedEquipment.startDate) {
                startDate = new Date(this.selectedEquipment.startDate).toJSON()
            }

            if(this.selectedEquipment.endDate) {
                endDate = new Date(this.selectedEquipment.endDate).toJSON()
            }

            if (!this.validateEquipment()) {
                return
            }

            if (!this.selectedEquipment.id) {
                $loader.message = 'Outillage toevoegen'
                this._api.createEquipment({
                    ...this.selectedEquipment,
                    startDate: startDate,
                    endDate: endDate,
                    locationId: this.selectedLocationId
                }).then(res => {
                    let equipment = res
                    this.equipmentList.push({
                        ...equipment,
                        startDate: equipment.startDate ? $date.toDateString(new Date(equipment.startDate)) : null,
                        endDate: equipment.endDate ? $date.toDateString(new Date(equipment.endDate)) : null
                    })
                    this.selectedEquipment = Object.assign({}, this.initialEquipment)
                    this.displayEquipmentModal = false
                    $snackbar.add('Outillage toegevoegd')
                    $loader.message = null
                }).catch(response => {
                    $loader.message = null
                    $loader.error = true;
                })
            }
            else {
                $loader.message = 'Outillage aanpassen'
				this._api.saveEquipment({
                    ...this.selectedEquipment,
                    startDate: startDate,
                    endDate: endDate,
                    equipmentType: null
                }).then(res => {
                    this.selectedEquipment = res
                    this.selectedEquipment = {
                        ...this.selectedEquipment,
                        startDate: this.selectedEquipment.startDate ? $date.toDateString(new Date(this.selectedEquipment.startDate)) : null,
                        endDate: this.selectedEquipment.endDate ? $date.toDateString(new Date(this.selectedEquipment.endDate)) : null
                    }
                    for (let i = this.equipmentList.length - 1; i >= 0; i--) {
                        let equipment = this.equipmentList[i]
                        if (equipment.id === this.selectedEquipment.id) {
                            for (let propertyName in this.selectedEquipment) {
                                equipment[propertyName] = this.selectedEquipment[propertyName]
                            }
                        }
                    }
                    this.selectedEquipment = Object.assign({}, this.initialEquipment)
                    this.displayEquipmentModal = false
                    $snackbar.add('Outillage aangepast')
                    $loader.message = null
                }).catch(response => {
                    $loader.message = null
                    $loader.error = true;
                })
            }
        },

        /**
         * Attempt to add a equipment type
         */
        saveEquipmentType () {
            if (!this.validateEquipmentType()) {
                return
            }

            if (!this.selectedEquipmentType.id) {
                $loader.message = 'Outillage type toevoegen'
                this._api.createEquipmentType(this.selectedEquipmentType).then(res => {
                    let equipmentType = res
                    this.equipmentTypes.push(equipmentType)
                    this.selectedEquipmentType = Object.assign({}, this.initialEquipmentType)
                    this.displayEquipmentTypeModal = false
                    $snackbar.add('Outillage type toegevoegd')
                    $loader.message = null
                }).catch(response => {
                    $loader.message = null
                    $loader.error = true;
                })
            }
            else {
                $loader.message = 'Outillage type aanpassen'
				this._api.saveEquipmentType(this.selectedEquipmentType).then(res => {
                    this.selectedEquipmentType = res
                    for (let i = this.equipmentTypes.length - 1; i >= 0; i--) {
                        let equipmentType = this.equipmentTypes[i]
                        if (equipmentType.id === this.selectedEquipmentType.id) {
                            for (let propertyName in this.selectedEquipmentType) {
                                equipmentType[propertyName] = this.selectedEquipmentType[propertyName]
                            }
                        }
                    }
                    this.selectedEquipmentType = Object.assign({}, this.initialEquipmentType)
                    this.displayEquipmentTypeModal = false
                    $snackbar.add('Outillage type aangepast')
                    $loader.message = null
                }).catch(response => {
                    $loader.message = null
                    $loader.error = true;
                })
            }
        },

        /**
         * Validates the equipment
         */
        validateEquipment () {
            this.formWarnings = []
            if (!this.selectedEquipment) {
                return false
            }
            let properties = Object.keys(this.initialEquipment)
            for (let propertyIndex in properties) {
                let propertyName = properties[propertyIndex]
                let value = this.selectedEquipment[propertyName]
                if ((propertyName !== 'startDate' && propertyName !== 'endDate') && (value === null || value === '')) {
                    this.formWarnings.push(propertyName)
                }
            }
            return this.formWarnings.length === 0
        },

         /**
         * Validates the equipment type
         */
        validateEquipmentType () {
            this.formWarnings = []
            if (!this.selectedEquipmentType) {
                return false
            }
            let properties = Object.keys(this.initialEquipmentType)
            for (let propertyIndex in properties) {
                let propertyName = properties[propertyIndex]
                let value = this.selectedEquipmentType[propertyName]
                if (value === null || value === '') {
                    this.formWarnings.push(propertyName)
                }
            }
            return this.formWarnings.length === 0
        },
    }
}
</script>
<style lang="scss"  src="../../assets/scss/pages/equipments.scss" />

<script>
import $date from '@/modules/date-module'
import $loader from '@/modules/loader-module'
import $snackbar from '@/modules/snackbar-module'
import $cache from '@/modules/cache-module'
import _ from 'lodash'
import WorkOrdersWo from '@/components/WorkOrders/WorkOrdersWo.vue'
import WorkOrdersEquipmentModal from '@/components/modals/WorkOrdersEquipmentModal.vue'
import WorkOrdersLeadTimeModal from '@/components/modals/WorkOrdersLeadTimeModal.vue'
import WorkOrdersDeclineReasonModal from '@/components/modals/WorkOrdersDeclineReasonModal.vue'
import WorkOrdersQualificationsModal from '@/components/modals/WorkOrdersQualificationsModal.vue'
import WorkOrdersReasonMaintanceModal from '@/components/modals/WorkOrdersReasonMaintanceModal.vue'
import WorkOrdersConflictsModal from '@/components/modals/WorkOrdersConflictsModal.vue'
import WorkOrdersTimeSlotsModal from '@/components/modals/WorkOrdersTimeSlotsModal.vue'

export default {
	components: {
		WorkOrdersEquipmentModal,
		WorkOrdersWo,
		WorkOrdersLeadTimeModal,
		WorkOrdersDeclineReasonModal,
		WorkOrdersQualificationsModal,
		WorkOrdersReasonMaintanceModal,
		WorkOrdersConflictsModal,
		WorkOrdersTimeSlotsModal,
	},
	data: function () {
        return {
            sortingTrainschedulesOptions: [{
                name: 'Vertrek'
            }, {
                name: 'Aankomst'
            }],
            sortingTrainschedulesValue: 'Vertrek',
            defaultmechanic: null,
            activeMobileTab: 0,
			selectedSheduleFilter: [0,1],
			allFilteredWorkOrders: [],
            workOrders: [],

            mechanics: [],

            mechanicSchedules: [],

            trainSchedules: [],

            startDate: $date.toDateString(new Date()),

			displayHours: Number(localStorage.getItem('sbWorkOrdersDisplayHours') || 8),

			workOrderFilter: this._.isEmpty(localStorage.getItem('sbWorkOrdersWorkOrderFilter')) ? [0] : localStorage.getItem('sbWorkOrdersWorkOrderFilter').split(',').map(item => Number(item)),

            maxRows: {
                trains: 0,
                mechanics: 0,
                equipment: 0
            },

            labels: {
                trains: [],
                mechanics: [],
                equipment: []
            },

            overlays: {
                trains: [],
                mechanics: [],
                equipment: []
            },

            selectMechanics: [],

            selectedMaterialNumber: null,

            selectedMechanicId: null,

            selectedTaskIds: [],

            assets: [],

            equipment: [],

            chartIds: {
                trains: 1,
                mechanics: 2,
                equipment: 3
            },

            offsetHours: 0,

            initializeWorkOrderId: null,

            displayConflictsModal: false,

            amountOfConflicts: 0,

            selectedWorkOrder: null,

            updateAfterSocketUpdatePerTaskId: {},


            maintenanceReasons: [],
            materialSearchQuery: '',

            listenSentToMaximo: true,

            badges: {
                mandatory: 0,
                nonMandatory: 0,
                serviceRequests: 0
            },

            workTypes: [
                {
                    name: 'DC'
                },
                {
                    name: 'CO'
                },
                {
                    name: 'WUI'
                },
                {
                    name: 'PREIN'
                },
                {
                    name: 'CREIN'
                },
                {
                    name: 'PO'
                }
            ],
            filterByWorkType: null,

            counts: {
                mandatory: 0,
                isWatched: 0,
                others: 0
            },

            preventFastButtonClicks: false,

			chartData: {
				data: [],
				options: {
					type: 'workorderPage',
					id: 'mainChart',
					visualizeCurrentHour: true,
					startFromCurrentHour: true, //visualizeCurrentHour must be set to true
					prevTimeHours: 0,
					rangeHours:  Number(localStorage.getItem('sbWorkOrdersDisplayHours') || 8), //from current hour
					hourStep: 1,
					cellWidth: 120,
					labelsWidth: 200,
					visualizeEachHour: false,
					labelsClickable: true,
					hideOutOfRange: true,
					tasksClickable: true,
					hightlightMaterial: null,
					broadcastScrollEvents: true,
					allowTimeslots: true
				}
			},
			equipmentChartData: {
				data: [],
				options: {
					type: 'equipment',
					id: 'equipmentChart',
					visualizeCurrentHour: true,
					startFromCurrentHour: true, //visualizeCurrentHour must be set to true
					prevTimeHours: 0,
					rangeHours:  Number(localStorage.getItem('sbWorkOrdersDisplayHours') || 8), //from current hour
					hourStep: 1,
					cellWidth: 120,
					labelsWidth: 200,
					visualizeEachHour: false,
					labelsClickable: true,
					hideOutOfRange: false,
					tasksClickable: true,
					hightlightMaterial: null,
					hideTopLabels: true,
					broadcastScrollEvents: true
				}
			},
			trainScheduleMaterials: [],
			timeslotsModalShow: false,
			timeslots: [],
			watchTimeslots: false,
			visibleMaterialNumbers: [],
			notYetBuitengeplust: [],

			filteredMechanics: [],
			displayOptionsModal: false,

                maintenanceStatuses: [{
                    title: 'NBVD'
                }, {
                    title: 'OVERSTAND'
                }, {
                    title: 'BVD'
                }],
                reasonMaintenanceList: null,
                asyncSelect: false,

                materialModels: {
                    assetStatus: null,
                    maintenanceLocation: null,
                    reasonMaintenance: null,
                    memo: null,
                    id: null
                }
            }
        },

    computed: {
		locations () {
			return this.$store.getters.GET_UPDATED_LOCATIONS
		},
		currentLocationData () {
			let current = this.$store.getters.GET_CURRENT_LOCATION
			if (!_.isEmpty(current)) {
				this.updateData()
				return current
			}
			return null
		},
		filteredWO () {
			const filtered = []
			const filter = this.selectedSheduleFilter
			_.sortBy(this.workOrderFilter).forEach(item => {
				switch (item) {
					case 0:
						filtered.push(...this.workOrdersObstructive)
						break
					case 1:
						filtered.push(...this.workOrdersWarning)
						break
					case 2:
						filtered.push(...this.workOrdersOther)
						break
					default:
						break
				}
			})
			return filtered.filter(item => filter.includes(0) && filter.includes(1) ? item : filter.includes(0) ? !item.isScheduled : item.isScheduled )
		},
		workOrdersObstructive () {
			const filter = this.selectedSheduleFilter;
			const wo = this.filterWorkOrdersByQueries(this.workOrders.filter(e => e.mandatory))
			return wo.filter(item => filter.includes(0) && filter.includes(1) ? item : filter.includes(0) ? !item.isScheduled : item.isScheduled ) || []
		},
		workOrdersWarning () {
			const filter = this.selectedSheduleFilter;
			const wo = this.filterWorkOrdersByQueries(this.workOrders.filter(e => e.isWatched))
			return wo.filter(item => filter.includes(0) && filter.includes(1) ? item : filter.includes(0) ? !item.isScheduled : item.isScheduled ) || []
		},
		workOrdersOther () {
			const filter = this.selectedSheduleFilter;
			const wo = this.filterWorkOrdersByQueries(this.workOrders.filter(e => !e.isWatched && !e.mandatory))
			return wo.filter(item => filter.includes(0) && filter.includes(1) ? item : filter.includes(0) ? !item.isScheduled : item.isScheduled ) || []
		},
        /**
         * Get the list of filtered workorder ids
         */
        filteredWorkOrderIds () {
			// console.log('WO page computed filteredWorkOrderIds')
            let ids = []
            let materialNumbers = this.trainSchedules.map(x => x.materialNumber).filter((v, i, a) => a.indexOf(v) === i)

            workOrderLoop: for (let workOrderIndex in this.workOrders) {
                let workOrder = this.workOrders[workOrderIndex]


                if (materialNumbers.indexOf(workOrder.materialNumber) === -1) {
                    continue
                }

                if (this.selectedMaterialNumber !== null) {
                    if (String(this.selectedMaterialNumber) !== String(workOrder.materialNumber)) {
                        continue
                    }
                }
                let foundMechanic = false
                if (this.selectedMechanicId !== null) {
                    for (let taskIndex in workOrder.tasks) {
                        let task = workOrder.tasks[taskIndex]
                        if (task.mechanicId !== this.selectedMechanicId) {
                            continue
                        }
                        foundMechanic = true
                    }
                    if (!foundMechanic) {
                        continue
                    }

                }

                if (this.workOrderFilter.includes(0) && workOrder.mandatory == true && workOrder.isWatched !== true) {
                    ids.push(workOrder.id)
                }
                else if (this.workOrderFilter.includes(1) && workOrder.isWatched == true && workOrder.mandatory !== true) {
                    ids.push(workOrder.id)
                }

                else if (
                    this.workOrderFilter.includes(2) && (workOrder.mandatory !== true && workOrder.isWatched !== true) ||
                    this.workOrderFilter.includes(2) && (workOrder.mandatory == true && workOrder.isWatched == true)) {
                    ids.push(workOrder.id)
                }
            }
            return ids
        }
    },

	created: function () {
		// console.log('WO page created')
		document.addEventListener('workOrdersParamsChange', this.onWorkOrdersParamsChange)
		document.addEventListener('chartSelectLabel', this.onChartSelectLabel)
		document.addEventListener('selectedTaskIdsChange', this.onSelectedTaskIdsChange)
		document.addEventListener('selectedWorkOrderChange', this.onSelectedWorkOrderChange)
		document.addEventListener('workOrderTaskEquipmentChange', this.onWorkOrderTaskEquipmentChange)
		document.addEventListener('chartClickOverlay', this.onChartClickOverlay)
		document.addEventListener('workOrderInitializeOnStart', this.onWorkOrderInitializeOnStart)

		this.getReasonMaintenanceList();
	},

    mounted: function () {
		// console.log('WO page mounted')
		this.$root.$on('changeReasonMaintance', this.changeReasonMaintance)
		this.$root.$on('updateWorkOrders', this.updateData)
    },

    beforeDestroy: function () {
		// console.log('WO page beforeDestroy')
        document.removeEventListener('workOrdersParamsChange', this.onWorkOrdersParamsChange)
        document.removeEventListener('chartSelectLabel', this.onChartSelectLabel)
        document.removeEventListener('selectedTaskIdsChange', this.onSelectedTaskIdsChange)
        document.removeEventListener('workOrderTaskEquipmentChange', this.onWorkOrderTaskEquipmentChange)
        document.removeEventListener('chartClickOverlay', this.onChartClickOverlay)
        document.removeEventListener('workOrderInitializeOnStart', this.onWorkOrderInitializeOnStart)
    },

    watch: {
        filterByWorkType: function(){
			// console.log('WO page watch filterByWorkType')
			this.workOrderFilter = this._.uniq(this.workOrderFilter)
			localStorage.setItem('sbWorkOrdersWorkOrderFilter', this.workOrderFilter)
        },
        sortingTrainschedulesValue: function(){
			// console.log('WO page watch sortingTrainschedulesValue')
            this.sortMainChartItems();
        },
        materialSearchQuery: _.debounce(function() {
            this.generateChartData(true, false, true, null, this.selectedWorkOrder);
        }, 100),
        displayHours: function() {
			// console.log('WO page watch displayHours')
            localStorage.setItem('sbWorkOrdersDisplayHours', this.displayHours || 8)
            this.$forceUpdate()
            this.$nextTick(() => {
                document.dispatchEvent(new CustomEvent('chartRegenerateHours', {
                    detail: {
                        x: this.offsetHours,
                        y: 0
                    }
                }))
            })
        },

        mechanics: {
            handler: function () {
				// console.log('WO page watch mechanics')
                this.onChangeMechanics()
            },
            deep: true
        },

        mechanicSchedules: {
            handler: function () {
				// console.log('WO page watch mechanicSchedules')
                this.updateShiftOverlaysInMechanicChart()
            },
            deep: true
        },

        trainSchedules: {
            handler: function () {
				// console.log('WO page watch trainSchedules')
                this.generateChartData(true, false, true, null, this.selectedWorkOrder)
            },
            deep: true
        },

        selectedMechanicId: function () {
			// console.log('WO page watch selectedMechanicId')
            if (this.selectedMechanicId === null) {
                // De-emphasize the label in the mechanic chart
                document.dispatchEvent(new CustomEvent('chartEmphasizeRowIndicesChange', {
                    detail: {
                        id: this.chartIds.mechanics,
                        indices: []
                    }
                }))
                return
            }

            // Deselect the material number (only one filter at a time)
            this.selectedMaterialNumber = null

            // Deselect the label index for the train chart
            document.dispatchEvent(new CustomEvent('chartDeselectIndex', {
                detail: {
                    chartId: this.chartIds.trains
                }
            }))

            // De-emphasize the label in train chart
            document.dispatchEvent(new CustomEvent('chartEmphasizeRowIndicesChange', {
                detail: {
                    id: this.chartIds.trains,
                    indices: []
                }
            }))
        },

        selectedMaterialNumber: function () {
			// console.log('WO page watch selectedMaterialNumber')
            if (this.selectedMaterialNumber === null) {
                return
            }

            // find the material number belonging to the currently selected task
            let taskMaterialNumber = null
            if (this.selectedTaskIds.length > 0) {
                workOrderLoop: for (let workOrderIndex in this.workOrders) {
                    let workOrder = this.workOrders[workOrderIndex]
                    for (let taskIndex in workOrder.tasks) {
                        let task = workOrder.tasks[taskIndex]
                        if (this.selectedTaskIds.indexOf(task.id) !== -1) {
                            taskMaterialNumber = workOrder.materialNumber
                            break workOrderLoop
                        }
                    }
                }
            }

            // when the selected material number differs from the selected tasks
            if (taskMaterialNumber !== this.selectedMaterialNumber) {
                this.selectedTaskIds = []
                this.onSelectedTaskIdsChange({
                    detail: {
                        selectedTaskIds: []
                    }
                })
                this.selectedMechanicId = null
                document.dispatchEvent(new CustomEvent('chartDeselectIndex', {
                    detail: {
                        chartId: this.chartIds.mechanics
                    }
                }))
                document.dispatchEvent(new CustomEvent('chartEmphasizeRowIndicesChange', {
                    detail: {
                        id: this.chartIds.trains,
                        indices: []
                    }
                }))
                document.dispatchEvent(new CustomEvent('chartEmphasizeRowIndicesChange', {
                    detail: {
                        id: this.chartIds.mechanics,
                        indices: []
                    }
                }))
            }
        },
		filteredWO: {
			handler: function (val, oldVal) {
				const index = val.indexOf(this.selectedWorkOrder)
				const oldIndex = oldVal.indexOf(this.selectedWorkOrder)
				if (index !== oldIndex) {
					this.selectedWorkOrder = null
				}
				if (val !== oldVal) {
					setTimeout(() => {
						this.setAllFilteredWorkOrders(this.filteredWO)
					},1)
				}
			},
			deep: true
		},
        offsetHours: function () {
			// console.log('WO page watch offsetHours')
            this.onChangeOffsetHours()
        }
    },

    methods: {
		setActiveWoFilter (num) {
			let woList = _.cloneDeep(this.workOrderFilter)
			if (woList.includes(num)) {
				if (woList.length > 1) {
					woList = woList.filter(item => item !== num)
				}
			}
			else {
				woList.push(num)
			}
			this.workOrderFilter = _.uniq(woList)
			localStorage.setItem('sbWorkOrdersWorkOrderFilter', this.workOrderFilter)
			setTimeout(() => {
				this.setAllFilteredWorkOrders(this.filteredWO)
			},10)
		},
		setScheduleFilter (id) {
			let scheduleList = _.cloneDeep(this.selectedSheduleFilter)
			if (scheduleList.includes(id)) {
				if (scheduleList.length > 1) {
					scheduleList = scheduleList.filter(item => item !== id)
				}
			}
			else {
				scheduleList.push(id)
			}
			this.selectedSheduleFilter = _.uniq(scheduleList)
			setTimeout(() => {
				this.setAllFilteredWorkOrders(this.filteredWO)
			},10)
		},
		setAllFilteredWorkOrders (wo) {
			this.allFilteredWorkOrders = wo
		},
        getChartHeight(id){
            if(id == 'main-chart'){
                if(this.notYetBuitengeplust.length > 0 || this.equipmentChartData.data.length > 0) {
                    const usedHeight = this.notYetBuitengeplust.length * 41 + 45 + 'px'
                    return 'calc(100vh - 385px - ' + usedHeight + ')'
                } else {
                    return 'calc(100vh - 385px)'
                }
            } else {
                return 'auto'
            }
        },
        getLocationIdByLocationNumber(locationNumber){
            return _.find(this.locations, {locationNumber: locationNumber});
        },
        saveAsset(){
            let obj = {
                data: this.materialModels
            }

			const maintenanceLocations = ['MAT', 'TRANS', 'BUIT']
			if (!maintenanceLocations.some(item => item === obj.data.maintenanceLocation)) {
				obj.data.maintenanceLocationObjectId = this.getLocationIdByLocationNumber(parseInt(obj.data.maintenanceLocation)).id;
			}
			if(this.materialModels.reasonMaintenance){
				obj.data.manualReasonMaintenance = true;
			}

			this._api.saveAsset(obj).then(res => {
				this.displayOptionsModal = false;
				this.changeAsset(res);
			})
		},
		getReasonMaintenanceList(){
			this._api.getReasonMaintenancesList().then(res => {
				this.reasonMaintenanceList = res
				this.maintenanceReasons = res
				this.asyncSelect = true
			})
		},
		changeAsset(data){
			// let asset = _.find(this.assets, {'id': data.id});
			// let assetIndex = this.assets.findIndex(x => x.id == data.id);
			// this.assets[assetIndex] = data;
			// this.notYetBuitengeplust = this.assets.filter(asset => asset.notYetBuitengeplust)

			this.updateWorkOrders();
		},
		openOptionsModal(data){
			let maintenanceLocation = data.maintenanceLocation

			if(maintenanceLocation && /^\d+$/.test(maintenanceLocation)){
				maintenanceLocation = parseInt(maintenanceLocation);
			}

			this.materialModels = {
				maintenanceStatus: data.assetStatus,
				reasonMaintenance: data.reasonMaintenance,
				maintenanceLocation: maintenanceLocation,
				memo: data.memo,
				id: data.id
			}

			this.displayOptionsModal = true;
		},
		changeReasonMaintance (e) {
			// console.log('WO page methods changeReasonMaintance')
			const chart = _.cloneDeep(this.chartData)
			const asset = chart.data.find(item => item.id === e.id)
			const index = chart.data.indexOf(asset)
			chart.data[index] = e
			this.chartData = chart
		},
        changeSortingTrainScheduleValue(e){
			// console.log('WO page methods changeSortingTrainScheduleValue')
            this.sortingTrainschedulesValue = e;
        },
		onWorkOrderChange (e) {
			// console.log('WO page methods onWorkOrderChange')
			this._api.createWorkOrder(e).then(res => {
			})
		},
        sortMainChartItems(){
			// console.log('WO page methods sortMainChartItems')
            if(this.sortingTrainschedulesValue == 'Vertrek'){
                this.trainSchedules = this.trainSchedules.sort((a, b) => this.$moment(a.departureDate) - this.$moment(b.departureDate));
            } else {
                this.trainSchedules = this.trainSchedules.sort((a, b) => this.$moment(a.arrivalDate) - this.$moment(b.arrivalDate));
            }
            this.generateTrainMaterials();
        },
        openModalTimespans(data){
			// console.log('WO page methods openModalTimespans')
			this.$root.$emit('openWOTimeSlotsModal', data)
        },
        broadCastScroll(obj){
			// console.log('WO page methods broadCastScroll')
            let mainChart = document.querySelector("#equipment-chart");
            // let mechanicsChart = document.querySelector("#mechanicChart .table-scroll");
            let equipmentChart = document.querySelector("#main-chart");

            // if(mechanicsChart){
            //     mechanicsChart.scrollLeft = obj.left;
            // }
            if(equipmentChart){
                equipmentChart.scrollLeft = obj.left;
            }
            if(mainChart){
                mainChart.scrollLeft = obj.left;
            }

        },
        scrollToMaterial(material){
			// console.log('WO page methods scrollToMaterial')
            let workOrderElement = this.$el.querySelector('#main-chart tr#row-' + material)
            let workOrdersElement = this.$el.querySelector('#main-chart')
            if (!workOrderElement || !workOrdersElement) {
                return
            }
            workOrdersElement.scrollTop = workOrderElement.offsetTop - 40
            this.chartData.options.hightlightMaterial = material;
        },
        openReasonMaintenanceModal(obj){
			// console.log('WO page methods openReasonMaintenanceModal')
			this.$root.$emit('openWOReasonMaintanceModal', obj)
        },
        filterWorkOrdersByMaterialNumber(materialNumber){
			// console.log('WO page methods filterWorkOrdersByMaterialNumber')
            this.selectedMaterialNumber = materialNumber;
        },
        preventPlaningWos(bool){
			// console.log('WO page methods preventPlaningWos')
            this.preventFastButtonClicks = bool;
        },
        checkIfWorkorderMatchesCategory(wo){
			// console.log('WO page methods checkIfWorkorderMatchesCategory')
            if(this.workOrderFilter.includes(0)){
                if(wo.mandatory == true){
                    return true;
                } else {
                    return false;
                }
            } else if(this.workOrderFilter.includes(1)){
                if(wo.isWatched == true){
                    return true;
                } else {
                    return false;
                }
            } else {
                if(wo.isWatched == false && wo.mandatory == false){
                    return true;
                } else {
                    return false;
                }
            }
        },
        getCounts(arr){
			// console.log('WO page methods getCounts')
            let woLength = arr.length;

            for (let i in arr) {
                const wo = arr[i];
                if(this.isWorkOrderSentToMaximo(wo)){
                    woLength--;
                }
            }

            return woLength;
        },
        isWorkOrderSentToMaximo (wo) {
			// console.log('WO page methods isWorkOrderSentToMaximo')
            let result = true

            if (wo.tasks.length > 0) {
                for (let taskIndex in wo.tasks) {
                    let task = wo.tasks[taskIndex]
                    if (task.isSentToMaximo === false) {
                        result = false
                        break
                    }
                }
            } else {
                result = false
            }
            if (wo.isScheduled) {
                result = true
            } else {
                result = false
            }

            return result
        },
        reinitWorkOrders(obj){
			// console.log('WO page methods reinitWorkOrders')
            for(let i = 0; i < this.workOrders.length; i++){
                let current = this.workOrders[i];

                if(current.id == obj.wo.id){
                    this.workOrders[i] = obj.wo;

                }
            }

            let args = {
                detail: {
                    workOrder: obj.wo
                }
            }
            this.onSelectedWorkOrderChange(args);
            this.updateTasksInChart();

            if(obj.task){
                let chartStartDate = $date.toDateObject(this.startDate.substring(0, 13) + ':00:00')
                document.dispatchEvent(new CustomEvent('chartScrollToPosition', {
                    detail: {
                        x: Math.max(((new Date(obj.task.tempStart).getTime() - chartStartDate.getTime()) / 1000 / 60 / 60) - (5 / 60) + this.offsetHours, 0)
                    }
                }))
            }
        },
        getAllMechanics(){
			// console.log('WO page methods getAllMechanics')
            let locationId = parseInt(+this.$store.getters['GET_CURRENT_LOCATION_ID'])
			let locationObj = _.find(this.$store.getters['GET_LOCATIONS'], {'id': locationId})
			// console.log(this.$store.getters['GET_LOCATIONS']);
			let defaultMechanicId = locationObj.defaultAssignmentPersonId

            this._api.getMechanicByPersonId(defaultMechanicId).then(res => {
                this.mechanics = res;
            })
        },
        checkStatusFlag(wo){
			// console.log('WO page methods checkStatusFlag')
            let statusFlag = '';

            if (wo.locationId && wo.workLocationId && wo.workLocationId != wo.locationId){
                statusFlag = 1;
            } else if ((wo.tasks || []).length <= 0){
                statusFlag = 2;
            } else if (wo.locationId && wo.workLocationId && wo.workLocationId != wo.locationId && wo.status != "WGK"){
                statusFlag = 4;
            } else if (wo.locationId && wo.workLocationId && wo.workLocationId == wo.locationId && wo.status == "WOM"){
                statusFlag = 5;
            }

            return statusFlag;
        },
        activateMobileTab(type){
			// console.log('WO page methods activateMobileTab')
            this.activeMobileTab = type;
        },
        /**
         * Whenever the maintenance track changes on a workorder.
         * @param {CustomEvent} eventArgs the event arguments
         */
        onWorkOrderMaintenanceTrackChange (eventArgs) {
			// console.log('WO page methods onWorkOrderMaintenanceTrackChange')
            this.preventPlaningWos(true);
            this.$nextTick(() => {
                if (this.workOrders.filter(x => Number(x.id) === eventArgs.detail.id).length === 0) {
                    return
                }
				this._api.createWorkOrder({
				...this.workOrders.filter(x => Number(x.id) === eventArgs.detail.id)[0],
						maintenanceTrack: eventArgs.detail.maintenanceTrack
				}).then(() => {
                    setTimeout(() => {
                        this.preventPlaningWos(false);
                    }, 1500)
                })
            })
        },
        /**
         * When the params change of the workorders page.
         * @param {CustomEvent} eventArgs the event args
         */
        onWorkOrdersParamsChange (eventArgs) {
			// console.log('WO page methods onWorkOrdersParamsChange')
            setTimeout(() => {
                if (eventArgs.detail.WO) {
                    for (let workOrderIndex in this.workOrders) {
                        let workOrder = this.workOrders[workOrderIndex]
                        if (String(workOrder.WO) !== String(eventArgs.detail.WO)) {
                            continue
                        }
                        document.dispatchEvent(new CustomEvent('workOrderClose'))

                        if (workOrder.mandatory === true) {
                            this.workOrderFilter = [0]
                        }
                        else if (workOrder.isWatched === true) {
                            this.workOrderFilter = [1]
                        }
                        else if (workOrder.mandatory === false && workOrder.isWatched === false) {
                            this.workOrderFilter = [2]
                        }
                        document.dispatchEvent(new CustomEvent('workOrderOpen', {
                            detail: {
                                id: workOrder.id
                            }
                        }))
                        document.dispatchEvent(new CustomEvent('workOrderInitializeOnStart', {
                            detail: {
                                id: workOrder.id
                            }
                        }))

                        this.onSelectedTaskIdsChange({
                            detail: {
                                selectedTaskIds: workOrder.tasks.map(x => Number(x.id))
                            }
                        })
                        setTimeout(() => {
                            this.onWorkOrderInitializeOnStart({
                                detail: {
                                    id: workOrder.id
                                }
                            })
                        })
                        this.$forceUpdate()
                        break
                    }
                }
            })
        },

        /**
         * Updates all of the data
         * @param {Void} callback the callback when all data is initialized
         */
        updateData (callback) {
			// console.log('WO page methods updateData')
            $loader.message = 'Roosters ophalen'
			this.updateWorkOrders(() => {
				$loader.message = 'Werkorders ophalen'
				this.updateTrainSchedules(() => {
					this.updateEquipment(() => {
						this.filterWorkorderByTrainschedules();
						this.getAllMechanics();
					})
				});
			})
        },
        filterWorkorderByTrainschedules(){
			// console.log('WO page methods filterWorkorderByTrainschedules')
            setTimeout(() => {
                this.updateTasksInChart()
                this.calculateMaxRowsPerChart()

                this.onSelectedTaskIdsChange({
                    detail: {
                        selectedTaskIds: this.selectedTaskIds
                    }
                })

				if (this.workOrders.length > 0) {
					if (this.workOrders[0].tasks) {
						for (let taskIndex in this.workOrders[0].tasks) {
							let task = this.workOrders[0].tasks[taskIndex]
							this.updateTaskInChart(this.workOrders[0].materialNumber, task, true)
						}
					}
				}

                this.onWorkOrderInitializeOnStart({
                    detail: {
                        id: this.workOrders[0].id
                    }
                })
                this.$forceUpdate()
                this.watchTimeslots = true;

                let trainScheduleMaterials = [];
                for(let i = 0; i < this.trainSchedules.length; i++){
                    let materialNumber = this.trainSchedules[i].materialNumber;
                    trainScheduleMaterials.push(parseInt(materialNumber));
                }

                trainScheduleMaterials = _.uniq(trainScheduleMaterials)

                let filteredWorkorders = [];
                for(let i in this.workOrders){
                    let woMaterial = parseInt(this.workOrders[i].materialNumber);
                    if(trainScheduleMaterials.includes(woMaterial)){
                        filteredWorkorders.push(this.workOrders[i]);
                    }
                }

                this.workOrders = filteredWorkorders;
            }, 50)
        },

        generateTrainMaterials(){
			// console.log('WO page methods generateTrainMaterials')
            this.trainScheduleMaterials = [];

            for(let g = 0; g < this.trainSchedules.length; g++){
                this.trainScheduleMaterials.push(this.trainSchedules[g].materialNumber);

                let arrivalDate = this.$moment(this.trainSchedules[g].arrivalDate);
                let departureDate = this.$moment(this.trainSchedules[g].departureDate);
                let trainRange = this.$moment().range(arrivalDate, departureDate);

                if(trainRange.contains(this.$moment())){

                    if(
                        this.$moment.duration(this.$moment().diff(arrivalDate)).asHours() + 1 > this.chartData.options.prevTimeHours){

                        this.chartData.options.prevTimeHours = Math.floor(this.$moment.duration(this.$moment().diff(arrivalDate)).asHours());
                        // this.mechanicChartData.options.prevTimeHours = this.chartData.options.prevTimeHours
                        this.equipmentChartData.options.prevTimeHours = this.chartData.options.prevTimeHours
                    }
                    // console.log(arrivalDate.toString());
                }
            }

            if(this.chartData.options.prevTimeHours > 24){
                this.chartData.options.prevTimeHours = 24;
                // this.mechanicChartData.options.prevTimeHours = 24;
                this.equipmentChartData.options.prevTimeHours = 24;
            }

            this.trainScheduleMaterials = _.uniq(this.trainScheduleMaterials);

            let start = this.$moment().subtract('hours', 24);
            let end = this.$moment().add('hours', 24);

            let tempMaterials = []
            for(let i = 0; i < this.trainScheduleMaterials.length; i++){
                let trainScheduleMaterial = this.trainScheduleMaterials[i];
                let trainshedule = _.find(this.trainSchedules, ['materialNumber', trainScheduleMaterial]);

                if  (

                        this.$moment(trainshedule.serviceWindow.serviceWindowStart) >= start &&
                        this.$moment(trainshedule.serviceWindow.serviceWindowStart) <= end ||
                        start >= this.$moment(trainshedule.serviceWindow.serviceWindowStart) &&
                        start <= this.$moment(trainshedule.serviceWindow.serviceWindowEnd)
                        //e1start > e2start && e1start < e2end || e2start > e1start && e2start < e1end
                    ){
                        tempMaterials.push(trainScheduleMaterial);
                    }
            }
            this.trainScheduleMaterials = tempMaterials;
            this.generateChartData(true, true, true, null, this.selectedWorkOrder);
        },
        /**
         * Update the list of train schedules
         * @param {Void} callback the callback to fire when done
         */
        updateTrainSchedules (callback) {
			// console.log('WO page methods updateTrainSchedules')
            let timezoneoffset = ((new Date(new Date().getTime())).getTimezoneOffset())*(60*1000);
            let yesterday = $date.toDateString(new Date(new Date().getTime() + timezoneoffset - 24 * 60 * 60 * 1000)).substring(0, 13) + ':00:00'
            let today = $date.toDateString(new Date(new Date().getTime() + timezoneoffset)).substring(0, 13) + ':00:00'
            let tomorrow = $date.toDateString(new Date(new Date().getTime() + timezoneoffset + 24 * 60 * 60 * 1000)).substring(0, 13) + ':00:00'
            let locationId = +this.$store.getters['GET_CURRENT_LOCATION_ID']
            let cacheKey = locationId + ' - ' + today + ' - ' + tomorrow

			this._api.getTrainScheduleList(+this.$store.getters['GET_CURRENT_LOCATION_ID'], today, tomorrow).then(res => {
                this.trainSchedules = res
                this.sortMainChartItems();
                this.generateTrainMaterials();

                $loader.message = null

                if (callback !== undefined) {
                    callback()
                }
            }).catch(response => {
                $loader.message = null
                $loader.error = true;
            })
        },
        getTimeslotsForWo(materialNumber){
			// console.log('WO page methods getTimeslotsForWo')
            let res = [];
            for(let i = 0; i < this.trainSchedules.length; i++){
                let trainSchedule = this.trainSchedules[i];

                let trainScheduleMaterial = trainSchedule.materialNumber;

                if(materialNumber == trainSchedule.materialNumber){
                    let serviceWindow = trainSchedule.serviceWindow;
                    for(let j = 0; j < serviceWindow.emplacement.length; j++){
                        let emplacement = serviceWindow.emplacement[j];

                        let maintenanceTrack = emplacement.maintenanceTrack;
                        let maintenanceTrackText = '';

                        if(maintenanceTrack){
                            maintenanceTrackText = ' (' + maintenanceTrack + ')';
                        }

                        let item = {
                            ...emplacement,
                            value: this.$moment(emplacement.emplacementStart).format('DD MMM HH:mm') + ' - ' + this.$moment(emplacement.emplacementEnd).format('DD MMM HH:mm') + maintenanceTrackText
                        }

                        res.push(item);
                    }
                }
            }

            return res;
        },
        placeTimeslotOnChart(data){
            let workOrder = _.find(this.workOrders, {'id': data.workOrderId});
            workOrder.serviceWindowEmplacementId = data.emplacementId;

            this.generateChartData(true, true, true, null, this.selectedWorkOrder);
        },

        setVisibleMaterialNumbers(){
			// console.log('WO page methods setVisibleMaterialNumbers')
            const chartStart = this.$moment().subtract('hours', this.chartData.options.prevTimeHours);
            const chartEnd = this.$moment().add('hours', this.chartData.options.rangeHours);

            const chartRange = this.$moment.range(chartStart, chartEnd);

            this.visibleMaterialNumbers = [];

            for(let i in this.chartData.data){
                const row = this.chartData.data[i];

                for(let j in row.timespans){
                    const timespan = row.timespans[j];

                    if(timespan.type == "service-window"){
                        const srStart = this.$moment(timespan.start);
                        const srEnd = this.$moment(timespan.end);
                        const srRange = this.$moment.range(srStart, srEnd);

                        if(srRange.overlaps(chartRange)){
                            this.visibleMaterialNumbers.push(row.id);
                            break;
                        }
                    }
                }
            }
        },
        generateChartData(updateMain, updateSchedules, updateEquipments, woMechanics, selectedWo){
			// console.log('WO page methods generateChartData')
            this.equipmentChartData.data = [];


            //Main chart
            if(updateMain){
                this.chartData.data = [];
                for(let i = 0; i < this.trainScheduleMaterials.length; i++){
                    let row = {
                        id: this.trainScheduleMaterials[i],
                        label: {
                            type: 'materialNumber',
                            value: this.trainScheduleMaterials[i],
                        },
                        timespans: []
                    }
                    this.chartData.data.push(row);
                }
                let filteredTrainschedules = this.trainSchedules.filter((trainschedule) =>
                    this.trainScheduleMaterials.includes(trainschedule.materialNumber))

                for(let i in this.chartData.data){
                    let trainSchedulesByMaterialNumber = this.trainSchedules.filter((trainschedule) =>
                    trainschedule.materialNumber == this.chartData.data[i].id)

                    for(let j in trainSchedulesByMaterialNumber){
                        let trainSchedule = trainSchedulesByMaterialNumber[j];

                        let srstart = this.$moment(trainSchedule.serviceWindow.serviceWindowStart).local();
                        let srend = this.$moment(trainSchedule.serviceWindow.serviceWindowEnd).local();

                        let srLength = parseInt(this.$moment.range(srstart, srend).diff('minutes'));

                        let asset = this.assets.filter((v, i, a) => String(v.serialNumber) === String(trainSchedule.materialNumber))[0]

                        let fleetControlStatus = null
                        let reasonMaintenance = null

						if(asset){
							reasonMaintenance = asset.reasonMaintenance
							this.chartData.data[i].fleetControlStatus = asset.fleetControlStatus || null
							this.chartData.data[i].reasonMaintenance = String(asset.reasonMaintenance && Number(asset.maintenanceLocationObjectId) === Number(+this.$store.getters['GET_CURRENT_LOCATION_ID']) ? asset.reasonMaintenance : '').toUpperCase().trim(),
							this.chartData.data[i].assetId = (asset || {id: null}).id
							this.chartData.data[i].maintenanceLocationObjectId = asset.maintenanceLocationObjectId
						}
						if(srLength >= this.currentLocationData.minOverstandMinutes){
							this.chartData.data[i].timespans.push({
								start: this.$moment(trainSchedule.serviceWindow.serviceWindowStart).subtract(this.currentLocationData.shuntingTime, 'minutes'),
								end: this.$moment(trainSchedule.serviceWindow.serviceWindowEnd).add(this.currentLocationData.shuntingTime, 'minutes'),
								type: 'service-window',
								color: '#e9e9eb',
								id: trainSchedule.serviceWindow.id
							})

                            for(let s = 0; s < trainSchedule.serviceWindow.emplacement.length; s++){
                                let emplacement = trainSchedule.serviceWindow.emplacement[s];

                                this.chartData.data[i].timespans.push({
                                    start: emplacement.emplacementStart,
                                    end: emplacement.emplacementEnd,
                                    type: 'emplacement',
                                    id: emplacement.ids
                                })
                            }

                            let workorderTimespans = _.uniq(this.findWorkorderTimespansByMaterial(trainSchedule.materialNumber));
                            if(workorderTimespans.length > 0){
                                this.chartData.data[i].timespans = this.chartData.data[i].timespans.concat(workorderTimespans);
                            }


                            //remove duplicated task timespans
                            let unique = new Set(this.chartData.data[i].timespans.map(e => JSON.stringify(e)));
                            const res = Array.from(unique).map(e => JSON.parse(e));
                            this.chartData.data[i].timespans = res;
                        }
                    }
                }

                this.setVisibleMaterialNumbers();
            }

			// console.log('selectedWo')
			// console.log(selectedWo)
			// console.log('updateEquipments')
			// console.log(updateEquipments)
            //Equipments chart
            if(!_.isEmpty(selectedWo) && updateEquipments){
				// console.log('generate Equipments chart')
                let equipmentIds = [];

                // console.log(selectedWo);
                const serviceWindowEmplacementId = selectedWo.serviceWindowEmplacementId;

                // find selected emplacement
                let selectedEmplacement;
                for(let i in this.trainSchedules) {
                	for (let j in this.trainSchedules[i].serviceWindow.emplacement) {
                		if (this.trainSchedules[i].serviceWindow.emplacement[j].id == serviceWindowEmplacementId) {
                			selectedEmplacement = this.trainSchedules[i].serviceWindow.emplacement[j];
                			break;
                		}
                	}
                }

                for(let i = 0; i < selectedWo.tasks.length; i++){
                    for(let j = 0; j < selectedWo.tasks[i].equipments.length; j++){
                        equipmentIds.push(selectedWo.tasks[i].equipments[j].equipmentId);
                    }
                }

                equipmentIds = _.uniq(equipmentIds);

                let equipentsArr = [];
                for(let i = 0; i < equipmentIds.length; i++){
                    for(let j = 0; j < selectedWo.tasks.length; j++){
                        let task  = selectedWo.tasks[j];
                        let taskStart = task.tempStart;
                        let taskEnd = this.$moment(task.tempStart).add(task.leadTimeMinutes, 'minutes').toString();

                        for(let s = 0; s < task.equipments.length; s++){
                            if(equipmentIds[i] == task.equipments[s].equipmentId){
                                let row = {
                                    id: task.equipments[s].equipmentId,
                                    label: {
                                        type: 'equipmentName',
                                        value: task.equipments[s].equipment.name
                                    },
                                    timespans: [{
                                        start: task.equipments[s].equipment.startDate,
                                        end: task.equipments[s].equipment.endDate,
                                        type: 'service-window'
                                    }]
                                }

                                if(selectedEmplacement) {
                                	row.timespans.push({
	                                    start: selectedEmplacement.emplacementStart,
	                                    end: selectedEmplacement.emplacementEnd,
	                                    type: 'equipment-task'
	                                });
                                }

                                equipentsArr.push(row);
                            }
                        }
                    }
                }

                let test = [];
                for(let i = 0; i < equipmentIds.length; i++){
                    let item = {
                        id: equipmentIds[i],
                        label: {
                            type: 'equipmentName',
                            value: null
                        },
                        timespans: []
                    }
                    for(let j = 0; j < equipentsArr.length; j++){
                        if(equipmentIds[i] == equipentsArr[j].id){
                            item.label.value = equipentsArr[j].label.value;
                            item.timespans = item.timespans.concat(equipentsArr[j].timespans);

                            let unique = new Set(item.timespans.map(e => JSON.stringify(e)));
                            const res = Array.from(unique).map(e => JSON.parse(e));
                            item.timespans = res;
                            // item.timespans = Array.from(new Set(item.timespans))
                        }
                    }
                    test.push(item);
                }

                this.equipmentChartData.data = test;

                // console.log('Equipment chart data:');
                // console.log(this.equipmentChartData.data);
            }
        },

        findWorkorderTimespansByMaterial(material){
			// console.log('WO page methods findWorkorderTimespansByMaterial')
            let taskTimespans = [];
            for(let i = 0; i < this.workOrders.length; i++){
                if(this.workOrders[i].materialNumber == material){
                    let timeslots = this.getTimeslotsForWo(this.workOrders[i].materialNumber);

                    for(let j = 0; j < timeslots.length; j++){
                        if(timeslots[j].id == this.workOrders[i].serviceWindowEmplacementId){
                            let timeslotData = timeslots[j];
                            let timespan = {
                                start: this.$moment(timeslots[j].emplacementStart).add(1, 'minutes').toJSON(),
                                end: timeslots[j].emplacementEnd,
                                wo: this.workOrders[i].id,
                                type: 'task'
                            }
                            taskTimespans.push(timespan);
                        }
                    }
                }
            }
            return taskTimespans;
        },

        /**
         * Update the list of equipment
         * @param {Void} callback the callback to fire when done
         */
        updateEquipment (callback) {
			// console.log('WO page methods updateEquipment')
            let locationId = +this.$store.getters['GET_CURRENT_LOCATION_ID']


			this._api.getEquipmentList(+this.$store.getters['GET_CURRENT_LOCATION_ID']).then(res => {
                $cache.equipment.getListLocation[locationId] = res
                this.equipment = $cache.equipment.getListLocation[locationId]
                $loader.message = null

                if (callback !== undefined) {
                    callback()
                }
            }).catch(response => {
                $loader.message = null
                $loader.error = true;
            })
        },

        /**
         * Update the list of work orders
         * @param {Void} callback the callback to fire when done
         */
        updateWorkOrders (callback = () => {}) {
			// console.log('WO page methods updateWorkOrders')
            let today = this.$moment().utc().format('YYYY-MM-DD HH:MM:SS').toString().substring(0, 13) + ':00:00'
            let tomorrow = this.$moment().add(1, 'days').utc().format('YYYY-MM-DD HH:MM:SS').toString().substring(0, 13) + ':00:00'

            let materialNumbers = []
            for (let trainLabelIndex in this.labels.trains) {
                let trainLabel = this.labels.trains[trainLabelIndex]
                materialNumbers.push(trainLabel.id)
            }

            let locationId = +this.$store.getters['GET_CURRENT_LOCATION_ID']
            let cacheKey = locationId + materialNumbers.join('-') + today + tomorrow + true

            let params = '';
            this.workOrders = [];

            this._api.getWorkorderSbList2(locationId, today, tomorrow, params).then(res => {
                this.workOrders = res.workOrders
                this.assets = res.assets;

                $loader.message = null
                for (let i = 0; i < this.workOrders.length; i++){
                    let current = this.workOrders[i];
                    if(current.tasks.length > 0){
                        for (let j = 0; j < current.tasks.length; j++){
                            let currentTask = current.tasks[j];
                            if(currentTask.leadTimeMinutes == null){
                                currentTask.leadTimeMinutes = currentTask.importedLeadTime
                            }
                        }
                    }
                }
				// this.notYetBuitengeplust = this.assets.filter(asset => asset.trainOnLocation)
				this.notYetBuitengeplust = this.assets.filter(asset => asset.notYetBuitengeplust)
				callback()
				setTimeout(() => {
					this.setAllFilteredWorkOrders(this.filteredWO)
				},1)
            })
        },


        filterWorkOrdersByQueries(arr){
			// console.log('WO page methods filterWorkOrdersByQueries')
            let res = [];
            for (let i in arr){
                let workOrder = arr[i]

                if (
                    this.visibleMaterialNumbers.includes(workOrder.materialNumber) &&
                    (this.selectedMaterialNumber == workOrder.materialNumber || this.selectedMaterialNumber == null) &&
                    _.includes(workOrder.materialNumber.toLowerCase(), this.materialSearchQuery.toLowerCase()) &&
                    (workOrder.type == this.filterByWorkType || this.filterByWorkType == null)){
                    res.push(workOrder);
                }
            }
            return res;
        },

        /**
         * When the selected work order changes
         * @param {CustomEvent} eventArgs the event arguments
         */
        onSelectedWorkOrderChange (eventArgs) {
			// console.log('WO page methods onSelectedWorkOrderChange')
            this.preventPlaningWos(true);
            this.selectedWorkOrder = eventArgs.detail.workOrder
            this.$nextTick(() => {

				let materialNumberIndices = []
				let mechanicIndices = []
				let mechanicsIds = []
				if (this.selectedWorkOrder) {
					let materialNumberIndex = this.findMaterialNumberIndex(this.selectedWorkOrder.materialNumber)
					if (materialNumberIndex) {
						materialNumberIndices.push(Number(materialNumberIndex))
					}

                    for (let taskIndex in this.selectedWorkOrder.tasks) {
                        let workOrderTask = this.selectedWorkOrder.tasks[taskIndex]
                        mechanicIndices.push(Number(this.findMechanicIndexById(workOrderTask.mechanicId)))
                        mechanicsIds.push(workOrderTask.mechanicId);
                    }
                }
                document.dispatchEvent(new CustomEvent('chartEmphasizeRowIndicesChange', {
                    detail: {
                        id: this.chartIds.trains,
                        indices: materialNumberIndices
                    }
                }))
                document.dispatchEvent(new CustomEvent('chartEmphasizeRowIndicesChange', {
                    detail: {
                        id: this.chartIds.mechanics,
                        indices: mechanicIndices
                    }
                }))

                this.generateChartData(true, true, true, mechanicsIds, this.selectedWorkOrder);

                setTimeout(() => {
                    this.preventPlaningWos(false);
                }, 1500)
            })
        },

        /**
         * When the workorder with the initialize on start property === true has been initialized
         * @param {CustomEvent} eventArgs the event arguments
         */
        onWorkOrderInitializeOnStart (eventArgs) {
			// console.log('WO page methods onWorkOrderInitializeOnStart')
            let workOrderElement = this.$el.querySelector('[data-work-order-id="work-order-' + eventArgs.detail.id + '"]')
            let workOrdersElement = this.$el.querySelector('.work-orders')
            if (!workOrderElement || !workOrdersElement) {
                return
            }
            workOrdersElement.scrollTop = workOrderElement.offsetTop - 15
        },

        /**
         * Open a service request
         * @param {number} serviceRequestId the service request id
         */
        openServiceRequest (serviceRequestId) {
			// console.log('WO page methods openServiceRequest')
            // this.workOrderFilter = 2
            for (let workOrderIndex in this.workOrders) {
                let workOrder = this.workOrders[workOrderIndex]

                if (workOrder.serviceRequest && workOrder.serviceRequest.id === serviceRequestId) {
                    if (workOrder.mandatory === true) {
                        this.workOrderFilter = [0]
                    }
                    else if (workOrder.isWatched === true) {
                        this.workOrderFilter = [1]
                    }
                    else if (workOrder.mandatory === false && workOrder.isWatched === false) {
                        this.workOrderFilter = [2]
                    }

                    this.initializeWorkOrderId = workOrder.id
                    this.selectedTaskIds = []
                    for (let taskIndex in workOrder.tasks) {
                        let task = workOrder.tasks[taskIndex]
                        this.selectedTaskIds.push(task.id)
                    }
                    this.onSelectedTaskIdsChange({
                        detail: {
                            selectedTaskIds: this.selectedTaskIds
                        }
                    })
                    for (let taskIndex in workOrder.tasks) {
                        let task = workOrder.tasks[taskIndex]
                        // console.log(3)
                        this.updateTaskInChart(workOrder.materialNumber, task, true)
                    }
                    this.$forceUpdate()
                    return
                }
            }
        },

        /**
         * Open a workorder
         * @param {number} workOrderId the workorder id
         */
        // TODO maybe need to delete
        openWorkOrder (workOrderId) {
			// console.log('WO page methods openWorkOrder')
            setTimeout(() => {
                // this.workOrderFilter = 2
                document.dispatchEvent(new CustomEvent('workOrderClose'))
                this.chartData.options.hightlightMaterial = workOrderId;
                for (let workOrderIndex in this.workOrders) {
                    let workOrder = this.workOrders[workOrderIndex]
                    if (workOrder.id === workOrderId) {
                        this.initializeWorkOrderId = workOrder.id
                        this.selectedTaskIds = []
                        for (let taskIndex in workOrder.tasks) {
                            let task = workOrder.tasks[taskIndex]
                            this.selectedTaskIds.push(task.id)
                        }
                        document.dispatchEvent(new CustomEvent('workOrderOpen', {
                            detail: {
                                id: workOrder.id
                            }
                        }))
                        document.dispatchEvent(new CustomEvent('workOrderInitializeOnStart', {
                            detail: {
                                id: workOrder.id
                            }
                        }))

                        this.$forceUpdate()
                        return
                    }
                }
            })
        },

        /**
         * Generate the offset hours in the charts
         */
        generateOffsetHours () {
			// console.log('WO page methods generateOffsetHours')
            let startDate = $date.toDateObject(this.startDate.substring(0, 13) + ':00:00')
            let firstArrivalDatePriorToStartDate = 0

            for (let trainScheduleIndex in this.trainSchedules) {
                let trainSchedule = this.trainSchedules[trainScheduleIndex]

                if (!trainSchedule.arrivalDate || !trainSchedule.departureDate || new Date(trainSchedule.departureDate).getTime() < startDate.getTime()) {
                    continue
                }

                let deltaHours = (startDate.getTime() - new Date(trainSchedule.arrivalDate).getTime()) / 1000 / 60 / 60
                if (deltaHours >= this.displayHours) {
                    this.offsetHours = Math.ceil(this.displayHours)
                    return
                }

                if (deltaHours > firstArrivalDatePriorToStartDate) {
                    firstArrivalDatePriorToStartDate = deltaHours
                }
            }
            this.offsetHours = Math.ceil(firstArrivalDatePriorToStartDate)
        },

        /**
         * Generate the list of material numbers based on the list of train schedules
         * Aterr
         */
        generateMaterialNumbers () {
			// console.log('WO page methods generateMaterialNumbers')
            // console.log(this.trainSchedules);
            this.labels.trains = []
            for (let trainScheduleIndex in this.trainSchedules) {
                let trainSchedule = this.trainSchedules[trainScheduleIndex]
                if(trainSchedule.serviceWindow){


                    //Get difference beetween train arrival time and departure time
                    let trainArrival = new Date(trainSchedule.arrivalDate);
                    let trainDeparture = new Date(trainSchedule.departureDate);
                    //Train time length
                    let trainTimeDiff = Math.abs(trainDeparture.getTime() - trainArrival.getTime());
                    trainTimeDiff = new Date(trainTimeDiff).toISOString().slice(11, -1).split(":");

                    let trainHoursMinutes = trainTimeDiff[0] + ':' + trainTimeDiff[1];

                    //Get difference beetween serviceWindow arrival time and end time
                    let serviceWindowStart = new Date(trainSchedule.serviceWindow.serviceWindowStart);
                    let serviceWindowEnd = new Date(trainSchedule.serviceWindow.serviceWindowEnd);
                    //service window length
                    let serviceWindowTimeDiff = Math.abs(serviceWindowEnd.getTime() - serviceWindowStart.getTime());
                    serviceWindowTimeDiff = new Date(serviceWindowTimeDiff).toISOString().slice(11, -1).split(":");

                    let serviceWindowHoursMinutes = serviceWindowTimeDiff[0] + ':' + serviceWindowTimeDiff[1];

                    let trainSeconds = (+trainTimeDiff[0]) * 60 * 60 + (+trainTimeDiff[1]) * 60;
                    let serviceWindowSeconds = (+serviceWindowTimeDiff[0]) * 60 * 60 + (+serviceWindowTimeDiff[1]) * 60;
                    let serviceWindowMinutes = Math.floor(serviceWindowSeconds / 60);
                    let trainMinutes = Math.floor(trainSeconds / 60);

                    let diff = trainMinutes - serviceWindowMinutes

                    // console.log(diff);

                    let obj = {
                        id: trainSchedule.materialNumber,
                        value: trainSchedule.materialNumber
                    }


                    if (this.labels.trains.filter(a => a.id === trainSchedule.materialNumber).length === 0) {
                        let assets = this.assets.filter((v, i, a) => String(v.serialNumber) === String(trainSchedule.materialNumber))
                        let fleetControlStatus = null
                        let reasonMaintenance = null
                        if (assets.length > 0) {
                            let assetFleetControlStatus = (assets[0].fleetControlStatus || '').replace(' ', '').toLowerCase()
                            switch (assetFleetControlStatus) {
                                case 'nietinzetbaar':
                                    fleetControlStatus = 1
                                break
                                case 'onderbewaking':
                                    fleetControlStatus = 2
                                break
                                case 'inzetbaar':
                                    fleetControlStatus = 3
                                break
                            }
                            reasonMaintenance = assets[0].reasonMaintenance

                            obj.fleetControlStatus = fleetControlStatus;
                            obj.reasonMaintenance = String(assets[0].reasonMaintenance && Number(assets[0].maintenanceLocationObjectId) === Number(+this.$store.getters['GET_CURRENT_LOCATION_ID']) ? assets[0].reasonMaintenance : '').toUpperCase().trim(),
                            obj.assetId = (assets[0] || {id: null}).id
                        }
                    }

                    this.labels.trains.push(obj)
                }

            }
        },

        /**
         * When the user clicks on an overlay in a chart component
         * @param {CustomEvent} eventArgs the event arguments
         */
        onChartClickOverlay (eventArgs) {
			// console.log('WO page methods onChartClickOverlay')
            if (['task', 'mechanic-task', 'equipment-task'].indexOf(eventArgs.detail.type) !== -1) {
                let taskId = eventArgs.detail.object.id
                let focus = this.selectedTaskIds.length !== 1 || this.selectedTaskIds.indexOf(taskId) === -1
                this.selectedTaskIds = focus ? [taskId] : []

                workOrderLoop: for (let workOrderIndex in this.workOrders) {
                    let workOrder = this.workOrders[workOrderIndex]

                    for (let taskIndex in workOrder.tasks) {
                        let task = workOrder.tasks[taskIndex]
                        if (task.id === taskId) {
                            document.dispatchEvent(new CustomEvent('workOrderClose'))
                            if (focus) {
                                if (workOrder.mandatory === true) {
                                    this.workOrderFilter = [0]
                                }
                                else if (workOrder.isWatched === true) {
                                    this.workOrderFilter = [1]
                                }
                                else if (workOrder.mandatory === false && workOrder.isWatched === false) {
                                    this.workOrderFilter = [2]
                                }
                                document.dispatchEvent(new CustomEvent('workOrderOpen', {
                                    detail: {
                                        id: workOrder.id
                                    }
                                }))
                                document.dispatchEvent(new CustomEvent('workOrderInitializeOnStart', {
                                    detail: {
                                        id: workOrder.id
                                    }
                                }))
                            }
                            this.onSelectedTaskIdsChange({
                                detail: {
                                    selectedTaskIds: this.selectedTaskIds
                                }
                            })
                            // console.log(4)
                            this.updateTaskInChart(workOrder.materialNumber, task, true)
                            this.$forceUpdate()
                            break workOrderLoop
                        }
                    }
                }
            }
        },

        /**
         * Whenever the task changes in a work order
         * @param {CustomEvent} eventArgs the event arguments
         */
        onChangeWorkOrderTask (eventArgs) {
			// console.log('WO page methods onChangeWorkOrderTask')
            // this.$emit('preventPlaning', true);
            this.preventPlaningWos(true);
            this.$nextTick(() => {
                let update = false
                let task = Object.assign({}, eventArgs.detail.task)
                let taskStartCoordinate = null

                // Remove the mechanic property, because it seems to overrule the task.mechanicId when sent to back-end
                task.mechanic = undefined

                // Skip when the workorder is not found in the list
                let workOrdersWithId = this.workOrders.filter(x => x.tasks.filter(x => x.id === task.id).length === 1)
                if (workOrdersWithId.length !== 1) {
                    return
                }

                // Collect all of the mechanic chart label indices to emphasize
                let filteredWorkOrders = this.workOrders.filter(x => x.tasks.filter(y => y.id === eventArgs.detail.task.id).length === 1)
                let mechanicIndices = []
                for (let workOrderIndex in filteredWorkOrders) {
                    for (let taskIndex in filteredWorkOrders[workOrderIndex].tasks) {
                        let workOrderTask = filteredWorkOrders[workOrderIndex].tasks[taskIndex]
                        mechanicIndices.push(Number(this.findMechanicIndexById(workOrderTask.mechanicId)))
                    }
                }

                // Emphasize the mechanics that are working on the
                document.dispatchEvent(new CustomEvent('chartEmphasizeRowIndicesChange', {
                    detail: {
                        id: this.chartIds.mechanics,
                        indices: mechanicIndices
                    }
                }))

                // When the starttime of a task goes from null to a value:
                // set chart time to first found service window or to the current time if not found
                // set the tempWorkLocationId to the currently selected location (localstorage 'locationId')
                if (eventArgs.detail.wasNull) {
                    task.tempWorkLocationId = Number(+this.$store.getters['GET_CURRENT_LOCATION_ID'] || 0)

                    let chartStartDate = $date.toDateObject(this.startDate.substring(0, 13) + ':00:00')
                    let firstServiceWindowCoordinate = 0
                    let serviceWindowFound = false

                    let materialNumberIndex = this.findMaterialNumberIndex(workOrdersWithId[0].materialNumber)
                    for (let overlayIndex in this.overlays.trains[materialNumberIndex].filter(x => x.type === 'service-window')) {
                        let overlay = this.overlays.trains[materialNumberIndex][overlayIndex]
                        let taskLength = task.leadTimeMinutes / 60
                        let serviceWindowLength = overlay.length - (overlay.shuntingTimeMinutes / 60 * 2) / 2
                        let serviceWindowLengthInPresent = overlay.start - overlay.shuntingTimeMinutes / 60 + overlay.length

                        if (serviceWindowLength >= taskLength && serviceWindowLengthInPresent >= taskLength) {
                            firstServiceWindowCoordinate = Math.max(overlay.start + overlay.shuntingTimeMinutes / 60, 0)
                            taskStartCoordinate = firstServiceWindowCoordinate
                            serviceWindowFound = true
                            break
                        }
                    }

                    if (!serviceWindowFound) {
                        let currentDate = new Date()
                        firstServiceWindowCoordinate = (currentDate.getTime() - chartStartDate.getTime()) / 1000 / 60 / 60
                        taskStartCoordinate = firstServiceWindowCoordinate
                    }
                    task.tempStart = new Date(chartStartDate.getTime() + 1000 * 60 * 60 * firstServiceWindowCoordinate).toJSON()

                    document.dispatchEvent(new CustomEvent('chartScrollToPosition', {
                        detail: {
                            x: Math.max(((new Date(task.tempStart).getTime() - chartStartDate.getTime()) / 1000 / 60 / 60) - (5 / 60) + this.offsetHours, 0)
                        }
                    }))

                    update = true
                }

                // When the starttime of a task goes to null from a value
                else if (!task.tempStart) {
                    task.tempWorkLocationId = null
                }

                // Update the task the task had a value and now is null in order to remove the task from chart when removing the starttime
                if (!task.tempStart && !eventArgs.detail.wasNull) {
                    update = true
                }

                // Set tempEnd variable
                if (task.tempStart) {
                    task.tempEnd = new Date(task.tempStart)
                    task.tempEnd.setTime(new Date(task.tempStart).getTime() + task.leadTimeMinutes * 60 * 1000)
                    task.tempEnd = task.tempEnd.toJSON()
                }

                // Keep track of the amount of rivisions for each task
                if (!task.revisionCount || isNaN(task.revisionCount)) {
                    task.revisionCount = 1
                }
                else {
                    task.revisionCount++
                }
                $cache.revisionCountByTaskId[task.id] = task.revisionCount

                // If the value of the starttime was null; update the starttime in the WorkOrder component's starttime Picker
                if (eventArgs.detail.wasNull) {
                    document.dispatchEvent(new CustomEvent('workOrderChangeStartTime', {
                        detail: {
                            id: workOrdersWithId[0].id,
                            workOrder: workOrdersWithId[0],
                            task
                        }
                    }))
                }

                // Update the task in the chart
                this.updateTaskInChart(workOrdersWithId[0].materialNumber, task, false)

                // Update the mechanics chart
                this.onChangeMechanics()

                // Update everything
                this.$forceUpdate()

				// Make the call to save the task
                if(task.mechanicId == undefined){
                    task.mechanicId = null;
                }
                task.serviceWindowEmplacementId = null;
                // console.log(task);
                this._api.saveTask(task)

                // Change the temp work location of workorder
                workOrdersWithId[0].tempWorkLocationId = Number(+this.$store.getters['GET_CURRENT_LOCATION_ID'])
                workOrdersWithId[0].tempRepairLocationId = Number(+this.$store.getters['GET_CURRENT_LOCATION_ID'])
			    this._api.createWorkOrder(workOrdersWithId[0])
                setTimeout(() => {
                    this.preventPlaningWos(false);
                }, 1500)
            })
        },

        /**
         * When the list of equipment changes for the task
         */
        onWorkOrderTaskEquipmentChange (eventArgs) {
			// console.log('WO page methods onWorkOrderTaskEquipmentChange')
            this.updateAfterSocketUpdatePerTaskId[eventArgs.detail.task.id] = 'equipment'
            this.$nextTick(() => {
                let taskId = eventArgs.detail.task.id

                for (let addedEquipmentIdIndex in eventArgs.detail.addedEquipmentIds) {
                    let addedEquipmentId = eventArgs.detail.addedEquipmentIds[addedEquipmentIdIndex]
                    this._api.createTaskEquipment({
                        equipmentId: addedEquipmentId,
                        taskId
                    })
                }

                for (let deletedEquipmentIdIndex in eventArgs.detail.deletedEquipmentIds) {
                    let deletedEquipmentId = eventArgs.detail.deletedEquipmentIds[deletedEquipmentIdIndex]

                    for (let taskEquipmentIndex = eventArgs.detail.task.equipments.length - 1; taskEquipmentIndex >= 0; taskEquipmentIndex--) {
                        let taskEquipment = eventArgs.detail.task.equipments[taskEquipmentIndex]

                        if (taskEquipment.equipment.id === deletedEquipmentId) {
                            this._api.deleteTaskEquipment(taskEquipment.id)
                        }
                    }
                }
            })
        },

        /**
         * Update all the tasks in the train chart
         */
        updateTasksInChart () {
			// console.log('WO page methods updateTasksInChart')
            for (let rowIndex in this.overlays.trains) {
                this.overlays.trains[rowIndex] = this.overlays.trains[rowIndex].filter(x => x.type !== 'task')
            }

            for (let workOrderIndex in this.workOrders) {
                let workOrder = this.workOrders[workOrderIndex]
                let tasks = workOrder.tasks || []

                for (let taskIndex in tasks) {
                    this.updateTaskInChart(workOrder.materialNumber, tasks[taskIndex], false)
                }
            }
        },

        /**
         * Update a single task in the train chart
         * @param {string} materialNumber the material number
         * @param {object} task the task object
         * @param {boolean} emphasizeMaterialNumberInTrainChart emphasize the material number in the train chart
         */
        updateTaskInChart (materialNumber, task, emphasizeMaterialNumberInTrainChart) {
			// console.log('WO page methods updateTaskInChart')
            // Remove all tasks from train chart
            for (let materialNumberIndex in this.overlays.trains) {
                let overlays = this.overlays.trains[materialNumberIndex]
                for (let overlayIndex in overlays) {
                    let overlay = overlays[overlayIndex]
                    if (overlay.type === 'task' && Number(overlay.id) === Number(task.id)) {
                        delete this.overlays.trains[materialNumberIndex][overlayIndex]
                    }
                }
            }

            // Remove all task impact from mechanic chart
            for (let mechanicIndex in this.overlays.mechanics) {
                let overlays = this.overlays.mechanics[mechanicIndex]
                for (let overlayIndex in overlays) {
                    let overlay = overlays[overlayIndex]
                    if (overlay.type === 'mechanic-task' && Number(overlay.id) === Number(task.id)) {
                        delete this.overlays.mechanics[mechanicIndex][overlayIndex]
                    }
                }
            }

            // Remove all task impact from equipment chart
            for (let equipmentIndex in this.overlays.equipment) {
                let overlays = this.overlays.equipment[equipmentIndex]
                for (let overlayIndex in overlays) {
                    let overlay = overlays[overlayIndex]
                    if (overlay.type === 'equipment-task' && Number(overlay.id) === Number(task.id)) {
                        delete this.overlays.equipment[equipmentIndex][overlayIndex]
                    }
                }
            }

            // Check if the material number exists in the data
            let materialNumberIndex = this.findMaterialNumberIndex(materialNumber)
            if (materialNumberIndex === -1) {
                return
            }

            if (this.overlays.trains[materialNumberIndex] === undefined) {
                this.overlays.trains[materialNumberIndex] = []
            }

            // Return:
            // If the task has no start time
            // If there is already an overlay with the task id
            if (!task.tempStart || this.findTaskInOverlays(task.id) !== null) {
                return
            }

            // Return if the xCoordinate is outside the charts boundaries
            let xCoordinate = this.convertDateToCoordinate(new Date(task.tempStart))
            let length = task.leadTimeMinutes / 60
            if (xCoordinate + length < -this.displayHours) {
                return
            }
            if (xCoordinate > this.displayHours) {
                return
            }

            // Add the task in the chart
            this.overlays.trains[materialNumberIndex].push({
                id: task.id,
                object: task,
                type: 'task',
                start: xCoordinate,
                length,
                margin: 15
            })

            // Update the impact of the task in the equipment/mechanic charts.
            this.updateTaskImpactInMechanicChart(task, xCoordinate)
            this.updateTaskImpactInEquipmentChart(task)

            // Emphasize the material number in train chart
            if (emphasizeMaterialNumberInTrainChart) {
                let materialNumberIndex = this.findMaterialNumberIndex(materialNumber)
                document.dispatchEvent(new CustomEvent('chartEmphasizeRowIndicesChange', {
                    detail: {
                        indices: [materialNumberIndex],
                        id: this.chartIds.trains
                    }
                }))
            }
        },

        /**
         * Update the task impact in the chart of mechanics
         * @param {Object} task the task object
         * @param {number} xCoordinate the x-coordinate at which the task starts in the chart
         */
        updateTaskImpactInMechanicChart (task, xCoordinate) {
			// console.log('WO page methods updateTaskImpactInMechanicChart')
            let update = false
            // console.debug('update task impact in mechanic chart.')

            for (let rowIndex in this.overlays.mechanics) {
                let overlays = this.overlays.mechanics[rowIndex]
                for (let overlayIndex in overlays) {
                    let overlay = overlays[overlayIndex]
                    if (overlay.type === 'mechanic-task' && overlay.object.id === task.id) {
                        delete this.overlays.mechanics[rowIndex][overlayIndex]
                        update = true
                    }
                }
            }

            if (task.mechanicId === null) {
                if (update) {
                    this.$forceUpdate()
                }
                return
            }

            for (let mechanicIndex in this.mechanics) {
                let mechanic = this.mechanics[mechanicIndex]
                if (mechanic.id === task.mechanicId) {
                    let mechanicRowIndex = this.findMechanicIndexById(mechanic.id)

                    if (mechanicRowIndex !== -1) {
                        this.overlays.mechanics[mechanicRowIndex].push({
                            id: task.id,
                            object: task,
                            type: 'mechanic-task',
                            start: xCoordinate,
                            length: Number(task.leadTimeMinutes || 0) / 60,
                            margin: 15
                        })
                    }
                    this.$forceUpdate()
                    return
                }
            }
        },

        /**
         * Update the task impact in the chart of equipment
         * @param {Object} task the task object
         */
        updateTaskImpactInEquipmentChart (task, length) {
			// console.log('WO page methods updateTaskImpactInEquipmentChart')
            // console.debug('update task impact in equipment chart')
            let shouldUpdate = false
            for (let rowIndex in this.overlays.equipment) {
                let overlays = this.overlays.equipment
                for (let overlayIndex in overlays) {
                    let overlay = overlays[overlayIndex]
                    if (['equipment-task', 'equipment'].indexOf(overlay.type) !== -1 && overlay.object.id === task.id) {
                        delete this.overlays.equipment[rowIndex][overlayIndex]
                        shouldUpdate = true
                    }
                }
            }

            for (let workOrderIndex in this.workOrders) {
                for (let taskIndex in this.workOrders[workOrderIndex].tasks) {
                    let workOrderTask = this.workOrders[workOrderIndex].tasks[taskIndex]
                    if (!workOrderTask.tempStart) {
                        continue
                    }
                    for (let taskEquipmentIndex in workOrderTask.equipments) {
                        let taskEquipment = workOrderTask.equipments[taskEquipmentIndex]
                        if (task.equipments.map(x => x.equipment.id).indexOf(taskEquipment.equipment.id) === -1) {
                            continue
                        }

                        let rowIndex = this.findEquipmentNameIndex(taskEquipment.equipment.id)
                        if (rowIndex === -1) {
                            continue
                        }

                        if (this.overlays.equipment[rowIndex].filter(x => x.type === 'equipment-task' && x.object.id === workOrderTask.id && x.equipment.id === taskEquipment.id).length !== 0) {
                            continue
                        }

                        this.overlays.equipment[rowIndex].push({
                            id: workOrderTask.id,
                            object: workOrderTask,
                            type: 'equipment-task',
                            start: (new Date(workOrderTask.tempStart).getTime() - $date.toDateObject(this.startDate.substring(0, 13) + ':00:00').getTime()) / 1000 / 60 / 60,
                            length: (workOrderTask.leadTimeMinutes || 0) / 60,
                            margin: 15,
                            equipment: taskEquipment.equipment
                        })

                        shouldUpdate = true
                    }
                }
            }

            if (shouldUpdate) {
                this.$forceUpdate()
            }
        },

        /**
         * Find the material number index in the labels
         * @param {string} materialNumber the material number
         */
        findElementInLabels (id, arg) {
			// console.log('WO page methods findElementInLabels')
			for (let labelIndex in this.labels[arg]) {
				let label = this.labels[arg][labelIndex]
				if (label.id === id || String(label.id) === String(id)) {
					return labelIndex
				}
			}
			return -1
		},
        findMaterialNumberIndex (materialNumber) {
			// console.log('WO page methods findMaterialNumberIndex')
			return this.findElementInLabels(materialNumber,'trains')
        },
        /**
         * Find the index for the mechanic name
         * @param {string} mechanicId the id of the mechanic
         */
        findMechanicIndexById (mechanicId) {
			// console.log('WO page methods findMechanicIndexById')
			return this.findElementInLabels(mechanicId,'mechanics')
        },
        /**
         * Find the index for the equipment name
         * @param {string} id the id of the equipment
         */
        findEquipmentNameIndex (equipmentId) {
			// console.log('WO page methods findEquipmentNameIndex')
			return this.findElementInLabels(equipmentId,'equipment')
        },

        /**
         * Find a task in the train overlays
         * @param {number} taskId the task id
         */
        findTaskInOverlays (taskId) {
			// console.log('WO page methods findTaskInOverlays')
            for (let materialNumberIndex in this.overlays.trains) {
                let overlays = this.overlays.trains[materialNumberIndex]
                for (let overlayIndex in overlays) {
                    let overlay = overlays[overlayIndex]
                    if (overlay.type === 'task' && Number(overlay.id) === Number(taskId)) {
                        return overlay
                    }
                }
            }
            return null
        },

        /**
         * Updates the equipment chart for the selected task ids
         */
        updateEquipmentChartForSelectedTaskIds () {
			// console.log('WO page methods updateEquipmentChartForSelectedTaskIds')
            this.overlays.equipment = this.overlays.equipment.map(row => row.filter(overlay => overlay.type !== 'equipment'))
            for (let workOrderIndex in this.workOrders) {
                let workOrder = this.workOrders[workOrderIndex]

                for (let workOrderTaskIndex in workOrder.tasks) {
                    let workOrderTask = workOrder.tasks[workOrderTaskIndex]

                    if (this.selectedTaskIds.indexOf(workOrderTask.id) !== -1) {
                        for (let taskEquipmentIndex in workOrderTask.equipments) {
                            let taskEquipment = workOrderTask.equipments[taskEquipmentIndex]
                            let rowIndex = this.findEquipmentNameIndex(taskEquipment.equipment.id)

                            if (rowIndex === -1) {
                                this.labels.equipment.push({id: taskEquipment.equipment.id, value: taskEquipment.equipment.name})
                                rowIndex = this.labels.equipment.length - 1
                            }

                            if (this.overlays.equipment[rowIndex] === undefined) {
                                this.overlays.equipment[rowIndex] = []
                            }

                            this.overlays.equipment[rowIndex].push({
                                id: workOrderTask.id,
                                object: workOrderTask,
                                type: 'equipment',
                                start: -24,
                                length: 48,
                                margin: 15
                            })
                        }
                    }
                }
            }
        },

        /**
         * When the selected task ids change
         * @param {CustomEvent} eventArgs the event arguments
         */
        onSelectedTaskIdsChange (eventArgs) {
			// console.log('WO page methods onSelectedTaskIdsChange')
            this.selectedTaskIds = eventArgs.detail.selectedTaskIds
            this.labels.equipment = []
            this.overlays.equipment = []
            let tasks = []

            this.updateEquipmentChartForSelectedTaskIds()

            for (let workOrderIndex in this.workOrders) {
                for (let taskIndex in this.workOrders[workOrderIndex].tasks) {
                    let task = this.workOrders[workOrderIndex].tasks[taskIndex]
                    if (this.selectedTaskIds.indexOf(task.id) === -1) {
                        continue
                    }
                    tasks.push(task)
                }
            }
            for (let taskIndex in tasks) {
                let task = tasks[taskIndex]
                this.updateTaskInChart(eventArgs.detail.materialNumber, task, true)
            }

            this.onChangeMechanics()
            this.calculateMaxRowsPerChart()
            this.$nextTick(() => {
                let indices = []
                if (this.selectedTaskIds.length > 0) {
                    for (let workOrderIndex in this.workOrders) {
                        let workOrder = this.workOrders[workOrderIndex]
                        for (let taskIndex in workOrder.tasks) {
                            let task = workOrder.tasks[taskIndex]
                            if (this.selectedTaskIds.indexOf(task.id) !== -1) {
                                if (task.mechanicId) {
                                    indices.push(Number(this.findMechanicIndexById(task.mechanicId)))
                                }
                            }
                        }
                    }
                }
                document.dispatchEvent(new CustomEvent('chartEmphasizeRowIndicesChange', {
                    detail: {
                        indices,
                        id: this.chartIds.mechanics
                    }
                }))

                this.$forceUpdate()
            })
        },

        /**
         * Whenever the list of mechanics changes
         */
        onChangeMechanics () {
			// console.log('WO page methods onChangeMechanics')
            // console.log(this.startDate);
            // this.labels.mechanics = []
            let totalMechanics = []

            if (this.selectedTaskIds.length === 0) {
                totalMechanics = []
                mechanicLoop: for (let mechanicIndex in this.mechanics) {
                    let mechanic = this.mechanics[mechanicIndex]
					let mechanicId = mechanic ? mechanic.id : null
                    let mechanicSchedules = this.mechanicSchedules.filter(x => x.mechanicId === mechanicId)
                    let mechanicShiftInChartTimeFrame = false
                    for (let mechanicScheduleIndex in mechanicSchedules) {
                        let mechanicSchedule = mechanicSchedules[mechanicScheduleIndex]
                        let shift = mechanicSchedule
                        let currentDateChart = $date.toDateObject(this.startDate.substring(0, 13) + ':00:00')
                        let endDateChart = new Date(currentDateChart.getTime() + 1 * this.displayHours * 60 * 60 * 1000)
                        if (
                            (
                                (   new Date(shift.startDate).getTime() < endDateChart.getTime()
                                    && new Date(shift.startDate).getTime() >= currentDateChart.getTime()
                                ) ||
                                (
                                    new Date(shift.endDate).getTime() < endDateChart.getTime()
                                    && new Date(shift.endDate).getTime() >= currentDateChart.getTime()
                                )
                            )
                            && shift.active === true) {
                            mechanicShiftInChartTimeFrame = true
                            break
                        }
                    }
                    if (!mechanicShiftInChartTimeFrame) {
                        continue mechanicLoop
                    }
                    if (mechanic) {
						totalMechanics.push(mechanic)
					}
                }
            }
            else {
                for (let taskIdIndex in this.selectedTaskIds) {
                    let taskId = this.selectedTaskIds[taskIdIndex]
                    let workOrders = this.workOrders.filter(x => x.tasks.filter(y => y.id === taskId).length === 1)
                    for (let workOrderIndex in workOrders) {
                        let workOrder = workOrders[workOrderIndex]
                        for (let taskIndex in workOrder.tasks) {
                            let task = workOrder.tasks[taskIndex]
                            if (task.id !== taskId) {
                                continue
                            }
                            let mechanics = this.mechanics;
                            mechanicLoop: for (let mechanicIndex in mechanics) {
                                let mechanic = mechanics[mechanicIndex]
                                let mechanicSchedules = this.mechanicSchedules.filter(x => x.mechanicId === mechanic.id)
                                let mechanicShiftInChartTimeFrame = false
                                for (let mechanicScheduleIndex in mechanicSchedules) {
                                    let mechanicSchedule = mechanicSchedules[mechanicScheduleIndex]
                                    let shift = mechanicSchedule
                                    let currentDateChart = $date.toDateObject(this.startDate.substring(0, 13) + ':00:00')
                                    let endDateChart = new Date(currentDateChart.getTime() + 1 * this.displayHours * 60 * 60 * 1000)
                                    if (
                                        (
                                            (   new Date(shift.startDate).getTime() < endDateChart.getTime()
                                                && new Date(shift.startDate).getTime() >= currentDateChart.getTime()
                                            ) ||
                                            (
                                                new Date(shift.endDate).getTime() < endDateChart.getTime()
                                                && new Date(shift.endDate).getTime() >= currentDateChart.getTime()
                                            )
                                        )
                                        && shift.active === true) {
                                        mechanicShiftInChartTimeFrame = true
                                        break
                                    }
                                }
                                if (!mechanicShiftInChartTimeFrame) {
                                    continue mechanicLoop
                                }
                                totalMechanics.push(mechanic)
                            }
                        }
                    }
                }
            }
            for (let mechanicId in totalMechanics) {
                let mechanic = totalMechanics[mechanicId]
                this.labels.mechanics.push({
                    id: mechanic.id,
                    value: mechanic.name
                })
            }

            // Update mechanic chart (19sep)
            // this.clearMechanicChart()
            // this.updateShiftOverlaysInMechanicChart()
            for (let workOrderIndex in this.workOrders) {
                let workOrder = this.workOrders[workOrderIndex]
                for (let taskIndex in workOrder.tasks) {
                    let task = workOrder.tasks[taskIndex]
                    if (this.selectedTaskIds.length === 0 || this.selectedTaskIds.indexOf(task.id) !== -1 || totalMechanics.filter(x => x.id === task.mechanicId).length !== 0) {
                        this.updateTaskInChart(workOrder.materialNumber, task, false)
                    }
                }
            }
        },

        /**
         * Clear the mechanic chart
         */
        clearMechanicChart () {
			// console.log('WO page methods clearMechanicChart')
            this.overlays.mechanics = []
        },

        /**
         * Update the shift overlays in the mechanic chart
         */
        updateShiftOverlaysInMechanicChart () {
			// console.log('WO page methods updateShiftOverlaysInMechanicChart')
            // Clear all shifts
            this.overlays.mechanics = this.overlays.mechanics.map(row => row.filter(overlay => overlay.type !== 'shift'))

            // Fill all shifts
            for (let mechanicScheduleIndex in this.mechanicSchedules) {
                let mechanicSchedule = this.mechanicSchedules[mechanicScheduleIndex]
				let mechanicId = mechanicSchedule.mechanic ? mechanicSchedule.mechanic.id : null
                let shift = mechanicSchedule
                let start = this.convertDateToCoordinate(new Date(shift.startDate))
                let length = this.convertDateToCoordinate(new Date(shift.endDate)) - start
                let rowIndex = this.findMechanicIndexById(mechanicId)

                if (rowIndex === -1) {
                    continue
                }

                if (this.overlays.mechanics[rowIndex] === undefined) {
                    this.overlays.mechanics[rowIndex] = []
                }

                if (start >= this.displayHours) {
                    continue
                }

                if (start + length < -this.offsetHours) {
                    continue
                }

                if (mechanicSchedule.active !== true) {
                    continue
                }

                this.overlays.mechanics[rowIndex].push({
                    type: 'shift',
                    start,
                    length,
                    object: mechanicSchedule,
                    margin: 15
                })
            }
        },

        /**
         * When the list of train schedules has updated
         */
        onChangeTrainSchedules () {
			// console.log('WO page methods onChangeTrainSchedules')
            this.generateMaterialNumbers();
            let shuntingTimeMinutes = this.currentLocationData.shuntingTime;

            for (let trainScheduleIndex in this.trainSchedules) {
                let trainSchedule = this.trainSchedules[trainScheduleIndex]
                let materialNumberIndex = this.findMaterialNumberIndex(trainSchedule.materialNumber)
                if (materialNumberIndex === -1) {
                    continue
                }

                if (this.overlays.trains[materialNumberIndex] === undefined) {
                    this.overlays.trains[materialNumberIndex] = []
                }

				if (trainSchedule.serviceWindow === undefined) {
				/**	let shuntingTimeMinutes = 0
				*	let netStartCoordinate = this.convertDateToCoordinate(new Date(trainSchedule.arrivalDate))
				*	let netEndCoordinate = this.convertDateToCoordinate(new Date(trainSchedule.departureDate))
				*/
					continue
				}

				// let shuntingTimeMinutes = ((new Date(trainSchedule.serviceWindow.serviceWindowStart)).getTime() - (new Date(trainSchedule.arrivalDate)).getTime()) / 1000 / 60
				let xCoordinate = this.convertDateToCoordinate(new Date(trainSchedule.serviceWindow.serviceWindowStart))
				let length = this.convertDateToCoordinate(new Date(trainSchedule.serviceWindow.serviceWindowEnd)) - xCoordinate
				let netStartCoordinate = xCoordinate - shuntingTimeMinutes / 60
				let netEndCoordinate = length + xCoordinate + shuntingTimeMinutes / 60
				// console.log(length);

                if (netEndCoordinate < -24) {
                    continue
                }

                if (netStartCoordinate > 24) {
                    continue
                }

                if(length * 60 >= this.currentLocationData.minOverstandMinutes){
                    this.overlays.trains[materialNumberIndex].push({
                        type: 'service-window',
                        start: netStartCoordinate,
                        length: netEndCoordinate - netStartCoordinate,
                        object: trainSchedule.serviceWindow,
                        materialNumber: trainSchedule.materialNumber,
                        margin: 15,
                        shuntingTimeMinutes
                    })

                }
            }
            this.generateOffsetHours();
            // console.log(this.overlays.trains.length);
            this.removeLabels();
        },
        removeLabels(){
			// console.log('WO page methods removeLabels')
            this.overlays.trains =  _.reject(this.overlays.trains, _.isEmpty);

            let allowedMaterials = [];
            for(let i = 0; i < this.overlays.trains.length; i++){
                for(let s = 0; s < this.overlays.trains[i].length; s++){
                    let materialNumber = this.overlays.trains[i][s].materialNumber;
                    allowedMaterials.push(materialNumber);
                }
            }

            let temp = [];
            for(let j = 0; j < this.labels.trains.length; j++){
                let materialNumber = this.labels.trains[j].id;

                if(allowedMaterials.includes(materialNumber)){
                    temp.push(this.labels.trains[j]);
                }
            }

            this.labels.trains = temp;
        },
        /**
         * Whenever the selected label id changes in the chart
         * @param {CustomEvent} eventArgs the event arguments
         */
        onChartSelectLabel (eventArgs) {
			// console.log('WO page methods onChartSelectLabel')
            this.$nextTick(() => {
                if (eventArgs.detail.context === 'material-number') {
                    switch (eventArgs.detail.chartId) {
                        case this.chartIds.trains:
                            this.selectedMaterialNumber = eventArgs.detail.id
                        break
                        case this.chartIds.mechanics:
                            this.selectedMechanicId = eventArgs.detail.id
                        break
                    }
                }
                else if (eventArgs.detail.context === 'reason-maintenance') {
                    let reasonMaintenance = null
                    let reasonMaintenanceAsset = null
                    for (let assetIndex in this.assets) {
                        let asset = this.assets[assetIndex]
                        if (String(asset.serialNumber) === String(eventArgs.detail.id)) {
                            reasonMaintenance = asset.reasonMaintenance
                            reasonMaintenanceAsset = asset
                            break
                        }
                    }

                    this.reasonMaintenanceModal = {
                        ...this.reasonMaintenanceModal,
                        enabled: true,
                        materialNumber: eventArgs.detail.id,
                        reasonMaintenance,
                        asset: reasonMaintenanceAsset
                    }
                }
            })
        },

        /**
         * Whenever the offset hours changes in the charts
         */
        onChangeOffsetHours () {
			// console.log('WO page methods onChangeOffsetHours')
            this.$forceUpdate()
            this.$nextTick(() => {
                document.dispatchEvent(new CustomEvent('chartRegenerateHours', {
                    detail: {
                        x: this.offsetHours,
                        y: 0
                    }
                }))
            })
        },

        /**
         * Whenever the displayed amount of hours has changed
         */
        changeDisplayHours (displayHours) {
			// console.log('WO page methods changeDisplayHours')
            this.displayHours = displayHours;
            this.chartData.options.rangeHours = displayHours;
            // this.mechanicChartData.options.rangeHours = displayHours;
            this.equipmentChartData.options.rangeHours = displayHours;
            this.generateChartData(true, false, true, null, this.selectedWorkOrder);
            this.onChangeMechanics()
            // this.generateOffsetHours()
        },

        /**
         * Sets the max height for the list of work orders
         */
        setWorkOrdersMaxHeight () {
			// console.log('WO page methods setWorkOrdersMaxHeight')
            let windowHeight = window.innerHeight
            let navigationHeight = document.querySelector('#navigation').offsetHeight
            let bottomHeight = 125
            let verticalPaddingAndMargin = 135

            this.$el.querySelector('.work-orders').style.maxHeight = (windowHeight - navigationHeight - verticalPaddingAndMargin - bottomHeight) + 'px'
        },

        /**
         * Set the min height for the right section of the page
         */
        setRightSectionHeight () {
			// console.log('WO page methods setRightSectionHeight')
            let windowHeight = window.innerHeight
            let navigationHeight = document.querySelector('#navigation').offsetHeight

            this.$el.querySelector('.right').style.minHeight = (windowHeight - navigationHeight)
            this.$el.querySelector('.right').style.maxHeight = (windowHeight - navigationHeight)
        },

        /**
         * Calculates the maximum amount of rows renderable per chart based on the screen resolution
         */
        calculateMaxRowsPerChart () {
			// console.log('WO page methods calculateMaxRowsPerChart')
            let equipmentChartVisible = this.isEquipmentChartVisible()
            let rowRatio = equipmentChartVisible ? {
                trains: 2,
                mechanics: 1,
                equipment: 1
            } : {
                trains: 2,
                mechanics: 1,
                equipment: 0
            }
            let chartMargins = (equipmentChartVisible ? 3 : 2) * 30 + // padding-top on all charts
                (equipmentChartVisible ? 3 : 2) * 30 + // padding-bottom on all charts
                2 * 15 + // the margins inbetween the charts in this component
                40 + 20 // the height taken by the time labels in the first chart
            let filterButtonsHeight = 100
            let pageContentPaddingBottom = 10
            let navigationHeight = document.querySelector('#navigation').offsetHeight
            let bottomBarHeight = 125
            let cellHeight = 50
            let availableHeight = window.innerHeight - chartMargins - filterButtonsHeight - pageContentPaddingBottom - navigationHeight - bottomBarHeight
            let rowsAvailable = (availableHeight / cellHeight)
            let rowsPerRatio = rowRatio.trains + rowRatio.mechanics + rowRatio.equipment
            let ratiosAvailable = Math.floor(rowsAvailable / rowsPerRatio)

            this.maxRows = {
                trains: rowRatio.trains * ratiosAvailable,
                mechanics: rowRatio.mechanics * ratiosAvailable,
                equipment: rowRatio.equipment * ratiosAvailable
            }
            rowsAvailable -= ratiosAvailable * rowsPerRatio

            // check if each chart has atleast two rows (or the length of the labels applicable if it is less than 2)
            for (let index in rowRatio) {
                let chartMaxRows = this.maxRows[index]
                if (rowRatio[index] === 0) {
                    continue
                }
                if (chartMaxRows < Math.min(2, this.labels[index].length)) {
                    this.maxRows[index] = Math.min(2, this.labels[index].length)
                }
            }

            // check if the amount of labels is not lower than the max. amount of rows
            for (let index in rowRatio) {
                let chartMaxRows = this.maxRows[index]
                if (rowRatio[index] === 0) {
                    continue
                }
                if (chartMaxRows > this.labels[index].length) {
                    let delta = this.labels[index].length - chartMaxRows
                    chartMaxRows -= delta
                    rowsAvailable += delta
                }
            }

            // if theres too many rows visualized reduce them from the first chart
            let totalAmountOfRows = this.maxRows.trains + this.maxRows.mechanics + this.maxRows.equipment
            let delta = Math.floor(availableHeight / cellHeight) - totalAmountOfRows
            if (delta < 0) {
                this.maxRows.trains += delta
            }

            // add the remaining rows to charts with left over labels
            rowsAvailable = Math.floor(availableHeight / cellHeight) - (this.maxRows.trains + this.maxRows.mechanics + this.maxRows.equipment)
            while (rowsAvailable > 0 && this.labels.trains.length + this.labels.mechanics.length + this.labels.equipment.length !== this.maxRows.trains + this.maxRows.mechanics + this.maxRows.equipment) {
                let success = false
                for (let index in rowRatio) {
                    let chartMaxRows = this.maxRows[index]
                    if (chartMaxRows >= this.labels[index].length) {
                        continue
                    }

                    if (rowsAvailable >= 1 && this.maxRows[index] < this.labels[index].length && rowRatio[index] !== 0) {
                        this.maxRows[index]++
                        rowsAvailable--
                        success = true
                    }
                }
                if (!success) {
                    break
                }
            }

            // check if there are no decimals in the count of max rows
            for (let index in rowRatio) {
                let chartMaxRows = this.maxRows[index]
                if (Math.round(chartMaxRows) !== chartMaxRows) {
                    this.maxRows[index] = Math.round(this.maxRows[index])
                }
            }
        },

        /**
         * Checks if a work order is selected based on its material number or selected task
         * @param {object} workOrder the work order
         */
        isWorkOrderSelected (workOrder) {
			// console.log('WO page methods isWorkOrderSelected')
            if (String(workOrder.materialNumber) === String(this.labels.trains[this.selectedMaterialNumber])) {
                return true
            }
            return false
        },

        /**
         * Converts a time to a coordinate in the chart component
         * @param {Date} date the date
         */
        convertDateToCoordinate (date) {
			// console.log('WO page methods convertDateToCoordinate')
            return (date.getTime() - $date.toDateObject(this.startDate.substring(0, 13) + ':00:00').getTime()) / 1000 / 60 / 60
        },

        /**
         * Select a task id
         * @param {number} taskId the task id
         */
        selectTaskId (taskId) {
			// console.log('WO page methods selectTaskId')
            if (this.selectedTaskIds.indexOf(taskId) === -1) {
                this.selectedTaskIds.push(taskId)
            }
            else {
                this.selectedTaskIds.splice(this.selectedTaskIds.indexOf(taskId), 1)
            }
            this.onSelectedTaskIdsChange({
                detail: {
                    selectedTaskIds: this.selectedTaskIds
                }
            })
        },

        /**
         * Checks if the equipment chart should be visible
         */
        isEquipmentChartVisible () {
			// console.log('WO page methods isEquipmentChartVisible')
            return this.selectedTaskIds.length > 0
        },

        /**
         * TODO: wait until eugene changes endpoint to not contain a list of workorders
         * Confirms the plan and sends it to Maximo
         */
        async confirmPlan () {
			// console.log('WO page methods confirmPlan')
            let workOrderIds = []
            for (let workOrderIndex in this.workOrders) {
                let workOrder = this.workOrders[workOrderIndex]
                let allTasksSentToMaximo = workOrder.tasks.filter(x => x.isSentToMaximo === false).length === 0

                if (!allTasksSentToMaximo) {
                    workOrderIds.push(workOrder.id)
                }
            }
            if (this.displayConflictsModal !== true) {
                let conflictIds = []
                for (let workOrderIndex in this.workOrders.filter(x => workOrderIds.indexOf(x.id) !== -1)) {
                    let workOrder = this.workOrders[workOrderIndex]
                    if (workOrder.tasks.filter(x => x.tempStart !== null && x.isSentToMaximo !== true && (x.conflictServiceWindow === true || x.conflictMechanic === true)).length !== 0) {
                        conflictIds.push(workOrder.id)
                    }
                }

                this.amountOfConflicts = conflictIds.length
                if (this.amountOfConflicts > 0) {
					this.$root.$emit('openWOConflictModal', this.amountOfConflicts)
                    return
                }
            }
            if (workOrderIds.length > 0) {
                this.displayConflictsModal = false
                $loader.message = 'Plan bevestigen'
                await this._api.planSelectionWorkorder(workOrderIds, Number(+this.$store.getters['GET_CURRENT_LOCATION_ID']))
                    .then(res => {
                        $loader.message = null
                        $snackbar.add('Selectie ingepland.')
                        setTimeout(() => {
                            window.location.reload();
                        }, 500);
                    })
                        .catch(response => {
                            $snackbar.addWarning('Er is een fout opgetreden in de server, probeert u het later nogmaals.')
                            $loader.message = null
                            $loader.error = true;
                            this.updateData()
                        })
            }
        },
    }
}
</script>

<template>
	<div id="trains" class="workorders-page">
		<div class="content">
			<div class="content-left-md">
				<div class="content-child content-child-left scrollable-y content-footered">
					<ul class="schedule-filter">
						<li
							class="schedule-filter-item schedule-filter-item-red"
							:class="{'active': selectedSheduleFilter.includes(0)}"
							@click="setScheduleFilter(0)"
						>
							<i class="mdi mdi-playlist-edit"/>
							<span class="schedule-filter-item-text">Ongepland</span>
						</li>
						<li
							class="schedule-filter-item schedule-filter-item-green"
							:class="{'active': selectedSheduleFilter.includes(1)}"
							@click="setScheduleFilter(1)"
						>
							<i class="mdi mdi-playlist-check"/>
							<span class="schedule-filter-item-text">Gepland</span>
						</li>
						<li
							class="schedule-filter-item schedule-filter-item-blue"
							:class="{'active': filterByWorkType}"
						>
							<TreeSelect
								:borderless="true"
								:unselected="true"
								class="treeselect-hovered"
								v-model="filterByWorkType"
								:options="workTypes"
								options-label="name"
								options-id="name"
								label="Werk type"
								:selectSize="28"
							/>
						</li>
					</ul>
					<div class="workorder-list">
						<DynamicScroller
							class="scroller scrollable-y"
							:items="allFilteredWorkOrders"
							:min-item-size="50"
							:buffer="100">
							<template v-slot="{ item, index, active }">
								<DynamicScrollerItem
									:item="item"
									:active="active"
									:data-index="index"
									:key-field="index + workOrderFilter.toString()"
								>
									<work-orders-wo
										:defaultMechanic="defaultmechanic"
										:initializeOnStart="initializeWorkOrderId === item.id"
										:tasksSelectable="true"
										:canEditTask="true"
										:canEditEquipment="true"
										:canEditLeadTime="true"
										:equipmentList="equipment"
										:selectTaskId="selectTaskId"
										:selectedTaskIds="selectedTaskIds"
										:startDateChart="startDate"
										:displayHoursChart="displayHours"
										:item="item"
										:active="selectedWorkOrder && (item.id === selectedWorkOrder.id)"
										:mechanics="mechanics"
										:statusFlag="checkStatusFlag(item)"
										:listenSentToMaximo="listenSentToMaximo"
										:locations="locations"
										@reinitWorkOrders="reinitWorkOrders"
										@selectedWorkOrderChange="onSelectedWorkOrderChange"
										@preventPlaning="preventPlaningWos"
										@scrollToMaterial="scrollToMaterial"
										@placeTimeslotOnChart="placeTimeslotOnChart"
										@workOrderTaskChange="onChangeWorkOrderTask"
										@workOrderMaintenanceTrackChange="onWorkOrderMaintenanceTrackChange"
										:availableTimeslots="getTimeslotsForWo(item.materialNumber)"
										:watchTimeslots="watchTimeslots"
										:class="{'selected': isWorkOrderSelected(item), 'first': filteredWorkOrderIds[0] === item.id}"
										:key="index+item.id.toString()"
									/>
								</DynamicScrollerItem>
							</template>
						</DynamicScroller>

					</div>
				</div>
				<div class="content-child content-child-right scrollable-y content-footered">
					<div class="filters">
						<div class="filters-left filters-sm">
							<div class="filter-button big" :class="{'selected': workOrderFilter.includes(0)}" @click="setActiveWoFilter(0)">
								Belemmerend
								<badge  :value="workOrdersObstructive.length"/>
							</div>
							<div class="filter-button big" :class="{'selected': workOrderFilter.includes(1)}" @click="setActiveWoFilter(1)">
								Waarschuwing
								<badge :value="workOrdersWarning.length"/>
							</div>
							<div class="filter-button big" :class="{'selected': workOrderFilter.includes(2)}" @click="setActiveWoFilter(2)">
								Overig
								<badge :value="workOrdersOther.length"/>
							</div>
						</div>
						<div class="filters-right">
							<TreeSelect
								v-model="sortingTrainschedulesValue"
								:options="sortingTrainschedulesOptions"
								:clearable="false"
								options-label="name"
								options-id="name"
								label="Werk type"
								:borderless="false"
								:selectSize="38"
								:selectWidth="180"
							/>
							<div class="filter-button" :class="{'selected': displayHours === 8}" @click="changeDisplayHours(8)">
								<span>8</span><span> uur</span>
							</div>
							<div class="filter-button" :class="{'selected': displayHours === 16}" @click="changeDisplayHours(16)">
								<span>16</span> <span> uur</span>
							</div>
							<div class="filter-button" :class="{'selected': displayHours === 24}" @click="changeDisplayHours(24)">
								<span>24</span> <span> uur</span>
							</div>
						</div>
					</div>
					<div class="train-warnings content-bg-white" v-if="notYetBuitengeplust.length">
						<icon name="alert" size="75" color="#DC0000"/>
						<ul>
							<li v-for="asset in notYetBuitengeplust">
								<span>
									Treinstel <b>{{asset.serialNumber}}</b> is niet buiten geplust.
									Vlootregie status is <b>{{asset.currentFleetControlStatus}}</b>
								</span>
								<button @click="openOptionsModal(asset)">
									Handmatig aanpassen
								</button>
							</li>
						</ul>
					</div>
					<gantt
						class="content-bg-white"
						:id="'main-chart'"
						:chartData="chartData"
						header="Overstanden"
						v-if="chartData.data.length > 0"
						:class="{'max-height': equipmentChartData.data.length == 0}"
						:materialSearchQuery="materialSearchQuery.toLowerCase()"
						@filterWorkOrdersByMaterialNumber="filterWorkOrdersByMaterialNumber"
						@openWorkOrder="openWorkOrder"
						@openReasonMaintenanceModal="openReasonMaintenanceModal"
						@broadCastScroll="broadCastScroll"
						@openModalTimespans="openModalTimespans"
						:height="getChartHeight('main-chart')"
					/>
					<gantt
						class="content-bg-white"
						:id="'equipment-chart'"
						:chartData="equipmentChartData"
						header="Outillage"
						v-if="equipmentChartData.data.length > 0"
						@openWorkOrder="openWorkOrder"
						@broadCastScroll="broadCastScroll"
					/>
				</div>
			</div>
		</div>
		<div class="footer">
			<div class="flex-wrap flex-left">
				<div class="flex-item">
					<TextInput
						:paddingless="false"
						:borderless ="false"
						placeholder="Zoek naar stel/stam"
						v-model="materialSearchQuery"
						class="search-box"
						radius="sm"
						width="610"
						:searchable="true"
						:clearable="false"
						ref="searchInput"
					/>
				</div>
			</div>
		</div>
		<WorkOrdersEquipmentModal
			:equipmentList="equipment"
			:canEditEquipment="true"
		/>
		<WorkOrdersLeadTimeModal
			@onWorkOrderChange="onWorkOrderChange"
		/>
		<WorkOrdersDeclineReasonModal/>
		<WorkOrdersQualificationsModal/>
		<WorkOrdersReasonMaintanceModal
			:assets="assets"
			:chartData="chartData"
			:maintenanceReasons="maintenanceReasons"
		/>
		<WorkOrdersConflictsModal/>
		<WorkOrdersTimeSlotsModal
			:currentLocationData="currentLocationData"
			:trainSchedules="trainSchedules"
		/>

		<modal class="modal-assign-sr" v-model="displayOptionsModal" title="Materieel verplaatsen">
			<div slot="content">
				<TreeSelect
					:options="maintenanceStatuses"
					v-model="materialModels.maintenanceStatus"
					options-label="title"
					options-id="title"
					title="Status"
					label="Status"
					:selectSize="52"
				/>
				<TreeSelect
					:options="locations"
					v-model="materialModels.maintenanceLocation"
					options-label="name"
					options-id="locationNumber"
					label="Locatie"
					additionalSearch="station"
					title="Locatie"
					:selectSize="52"
				/>
				<TreeSelect
					v-if="asyncSelect"
					:options="reasonMaintenanceList"
					v-model="materialModels.reasonMaintenance"
					options-label="reason"
					options-id="code"
					title="Reden binnenkomst"
					label="Reden binnenkomst"
					:selectSize="52"
				/>
				<label>Memo</label>
				<TextInput placeholder="Memo" v-model="materialModels.memo" class="wrapper-paddingless"/>
			</div>
			<div slot="buttons">
				<div class="button right" @click="saveAsset()">Opslaan</div>
			</div>
		</modal>
	</div>
</template>

<style lang="scss" scoped src="../../assets/scss/pages/workorders.scss" />

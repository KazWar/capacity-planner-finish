<script>
	import { mapGetters } from 'vuex'
	import $date from '@/modules/date-module'
	import $cache from '@/modules/cache-module'
	import $loader from '@/modules/loader-module'
	import _ from 'lodash'
	export default {
		components: {
			WorkOrdersLeadTimeModal: () => import('@/components/modals/WorkOrdersLeadTimeModal.vue'),
			WorkOrdersQualificationsModal: () => import('@/components/modals/WorkOrdersQualificationsModal.vue'),
			WorkOrdersLocationTypeModal: () => import('@/components/modals/WorkOrdersLocationTypeModal.vue'),
			WorkOrdersTrainNumberModal: () => import('@/components/modals/WorkOrdersTrainNumberModal.vue'),
			WorkOrdersEquipmentsTypesModal: () => import('@/components/modals/WorkOrdersEquipmentsTypesModal.vue'),
			workOrderMbn: () => import('@/components/WorkOrders/WorkOrderMbn.vue'),
		},
	    data: function () {
	        return {
				dates: {
					todayStart: this.$moment().set({hour: 2, minute: 0, second: 0, millisecond: 0}).format('YYYY-MM-DD HH:mm:ss'),
					todayEnd: this.$moment().set({hour: 2, minute: 0, second: 0, millisecond: 0}).add(1, 'days').format('YYYY-MM-DD HH:mm:ss'),
					weekEnd: this.$moment().set({hour: 2, minute: 0, second: 0, millisecond: 0}).add(1, 'weeks').format('YYYY-MM-DD HH:mm:ss')
				},
				selectedDateFilter: [0, 1, 2],
				filteredWorkOrders: [],
	            showSecondChart: false,
	            workOrders: [],

	            equipment: [],
	            equipmentTypes: [],

	            qualifications: [],

	            filteredLocationIds: [],

	            kpis: [],

	            startDate: $date.toDateString(new Date()),

	            selectedWorkOrder: {},

	            feasibleServiceWindowIds: [],

	            locationsFeasibility: [],

	            chartIds: {
	                locationCapacity: 1,
	                generalCapacity: 2
	            },

	            maxRows:{
	                locationCapacity: 5,
	                generalCapacity: 3
	            },

	            labels: {
	                locationCapacity: [],
	                generalCapacity: []
	            },

	            overlays: {
	                locationCapacity: [],
	                generalCapacity: []
	            },

	            offsetHours: 0,

	            displayHours: 96,

	            selectedServiceWindow: null,

	            selectedLocationId: null,

	            materialSearchQuery: '',

	            listenSentToMaximo: false,

	            serviceWindows: [],
	            feasibleServiceWindows: [],
	            ntLocationTypes: [],

	            chartStatus: true,
	            workOrdersToBottom: [],

	            equipmentChartData: {
	                data: [],
	                options: {
	                    type: 'equipment',
	                    id: 'equipmentChart',
	                    visualizeCurrentHour: false,
	                    startFromCurrentHour: true, //visualizeCurrentHour must be set to true
	                    prevTimeHours: 0,
	                    rangeHours:  96, //from current hour
	                    hourStep: 8,
	                    cellWidth: 120,
	                    labelsWidth: 240,
	                    visualizeEachHour: false,
	                    labelsClickable: false,
	                    hideOutOfRange: false,
	                    tasksClickable: true,
	                    hightlightMaterial: null,
	                    hideTopLabels: false,
	                    broadcastScrollEvents: true
	                }
	            },
	        }
	    },

	    created: function () {
			// console.log('MBN page created')
	        document.addEventListener('workOrderTaskChange', this.onWorkOrderTaskChange)
	        document.addEventListener('workOrderTaskEquipmentChange', this.onWorkOrderTaskEquipmentChange)
	        document.addEventListener('workOrderTaskQualificationsChange', this.onWorkOrderTaskQualificationsChange)
	        document.addEventListener('selectedWorkOrderChange', this.onSelectedWorkOrderChange)
	        document.addEventListener('trainScheduleSelectServiceWindow', this.onTrainScheduleSelectServiceWindow)
	        document.addEventListener('chartClickLocationCapacity', this.onChartClickLocationCapacity)
	    },

	    watch: {
	        selectedWorkOrder: function(){
				// console.log('MBN page watch selectedWorkOrder')
	            setTimeout(() => {
	                if(_.isEmpty(this.selectedWorkOrder)){
	                    this.showSecondChart = false;
	                } else {
	                    this.showSecondChart = true;
	                    let args = {
	                        detail: {
	                            arrivalDate: this.selectedWorkOrder.arrivalDate,
	                            locationId: this.selectedWorkOrder.tempRepairLocationId
	                        }
	                    }
	                    this.onTrainScheduleSelectServiceWindow(args);
	                }
	            }, 1000)
	        },
	    },

	    mounted: function () {
			// console.log('MBN page mounted ')
	        this.updateData();
	        setTimeout(() => {
	            if(this._.isEmpty(this.selectedWorkOrder)){
	                setTimeout(() => {
	                    if(this.selectedWorkOrder.arrivalDate && this.selectedWorkOrder.tempRepairLocationId){
	                        this.showSecondChart = true;
	                        let args = {
	                            detail: {
	                                arrivalDate: this.selectedWorkOrder.arrivalDate,
	                                locationId: this.selectedWorkOrder.tempRepairLocationId
	                            }
	                        }
	                        this.onTrainScheduleSelectServiceWindow(args);
	                    } else {
	                        this.showSecondChart = false;
	                    }
	                }, 1000);
	            }
	        }, 3000)
	    },

	    beforeDestroy: function () {
			// console.log('MBN page beforeDestroy ')
	        document.removeEventListener('workOrderTaskChange', this.onWorkOrderTaskChange)
	        document.removeEventListener('workOrderTaskEquipmentChange', this.onWorkOrderTaskEquipmentChange)
	        document.removeEventListener('workOrderTaskQualificationsChange', this.onWorkOrderTaskQualificationsChange)
	        document.removeEventListener('selectedWorkOrderChange', this.onSelectedWorkOrderChange)
	        document.removeEventListener('trainScheduleSelectServiceWindow', this.onTrainScheduleSelectServiceWindow)
	        document.removeEventListener('chartClickLocationCapacity', this.onChartClickLocationCapacity)
	    },
		computed: {
			...mapGetters([
				'GET_LOCATIONS'
				]),

			locations () {
				return this.GET_LOCATIONS
			},

			filteredWorkOrdersByDate () {
				// console.log('MBN page computed filteredWorkOrdersByDate')
				let res = [];

				if(this.selectedDateFilter.length > 0) {
					if (this.selectedDateFilter.includes(0)) {
						res = [...res, ...this.todayWorkOrders]
					}
					if (this.selectedDateFilter.includes(1)) {
						res = [...res, ...this.weeksWorkOrders]
					}
					if (this.selectedDateFilter.includes(2)) {
						res = [...res, ...this.futureWorkOrders]
					}
				} else {
					res = this.workOrders;
				}

				return res;
			},
			todayWorkOrders () {
				// console.log('MBN page computed todayWorkOrders')
				const wo = this.workOrders.filter(item => {
					if (this.$moment(item.dueDate).isBefore(this.dates.todayEnd) && (item.materialNumber.includes(this.materialSearchQuery) || this.materialSearchQuery == '')) {
						return item.dueDate
					}
				})
				return wo || []
			},
			weeksWorkOrders () {
				// console.log('MBN page computed weeksWorkOrders')
				const wo = this.workOrders.filter(item => {
					if (this.$moment(item.dueDate).isSameOrAfter(this.dates.todayEnd) && this.$moment(item.dueDate).isBefore(this.dates.weekEnd) && (item.materialNumber.includes(this.materialSearchQuery) || this.materialSearchQuery == '')) {
						return item.dueDate
					}
				})
				return wo || []
			},
			futureWorkOrders () {
				// console.log('MBN page computed futureWorkOrders')
				const wo = this.workOrders.filter(item => {
					if (this.$moment(item.dueDate).isSameOrAfter(this.dates.weekEnd) && (item.materialNumber.includes(this.materialSearchQuery) || this.materialSearchQuery == '')) {
						return item.dueDate
					}
				})
				return wo || []
			}
		},
	    methods: {
			planningWO (id) {
				// console.log('planned')
				const index = this.workOrders.indexOf(this.workOrders.find(item => item.id === id))
				if (index > -1) {
					this.workOrders.splice(index, 1);
					this.selectedWorkOrder = this.filteredWorkOrders[index] ? this.filteredWorkOrders[index] : this.filteredWorkOrders[0]
				}
			},
			broadCastScroll(obj){
				let equipmentChart = document.querySelector("#equipment-chart");
				let locationsChart = document.querySelector("#locations-chart");

				if(equipmentChart){
					equipmentChart.scrollLeft = obj.left;
				}
				if(locationsChart){
					locationsChart.scrollLeft = obj.left;
				}

			},
			filteringWorkOrders () {
				// console.log('MBN page methods filteringWorkOrders')
				this.filteredWorkOrders = []
				this.selectedWorkOrder = {}
				setTimeout(() => {
					this.filteredWorkOrders = this.filteredWorkOrdersByDate
					console.log(this.filteredWorkOrders);
					console.log(this.selectedDateFilter);
				}, 10)
			},
			changeDateFilter (n) {
				// console.log('MBN page methods changeDateFilter')
				// this.selectedDateFilter = this.selectedDateFilter === n ? null : n

				let woList = _.cloneDeep(this.selectedDateFilter)
				if (woList.includes(n)) {
					if (woList.length > 1) {
						woList = woList.filter(item => item !== n)
					}
				}
				else {
					woList.push(n)
				}
				this.selectedDateFilter = _.uniq(woList)

				this.filteringWorkOrders()
				this.feasibleServiceWindowIds = []

				this.locationsFeasibility = []

				this.chartIds = {
					locationCapacity: 1,
					generalCapacity: 2
				}

				this.maxRows = {
					locationCapacity: 5,
					generalCapacity: 3
				}

				this.labels = {
					locationCapacity: [],
					generalCapacity: []
				}

				this.overlays = {
					locationCapacity: [],
					generalCapacity: []
				}
			},
	        setSelectedLocationId(id){
				// console.log('MBN page methods setSelectedLocationId')
	            this.selectedLocationId = id;
	        },
	        checkWOLinked(wo){
				// console.log('MBN page methods checkWOLinked')
	            if(wo){
	                this.chartStatus = false;
	            } else {
	                this.chartStatus = true;
	            }
	        },
	         getNtLocationTypes () {
				 //console.log('MBN page methods getNtLocationTypes')

				 this._api.getLocationTypeList()
					.then(res => {
						this.ntLocationTypes = res
						$loader.message = null
					})
					.catch(err => {
						$loader.error = true
					})
	        },
	        hideCharts(){
				// console.log('MBN page methods hideCharts')
	            this.selectedWorkOrder = {};
	        },
	        retrieveServiceWindows(arr){
				// console.log('MBN page methods retrieveServiceWindows')
	            this.serviceWindows = [];
	            this.serviceWindows = arr
	        },
	        /**
	         * When the user clicks the location capacity grid in the chart
	         * @param {CustomEvent} eventArgs
	         */
	        onChartClickLocationCapacity (eventArgs) {
				// console.log('MBN page methods onChartClickLocationCapacity')
	            this.$nextTick(() => {
					if (_.isEmpty(this.selectedWorkOrder.tempWorkLocationId)) {
						this.selectedWorkOrder.tempWorkLocationId = eventArgs.detail.locationId
					}
	                if (_.isEmpty(this.selectedWorkOrder)) {
	                    return
	                }
	                document.dispatchEvent(new CustomEvent('trainScheduleSelectServiceWindow', {
	                    detail: {
	                        locationId: eventArgs.detail.locationId,
	                        arrivalDate: eventArgs.detail.date
	                    }
	                }))
	            })
	        },
	        convertDateToCoordinate (date) {
					// console.log('MBN page methods convertDateToCoordinate')
	            return (date.getTime() - $date.toDateObject(this.startDate.substring(0, 13) + ':00:00').getTime()) / 1000 / 60 / 60
	        },
	        /**
	         * When the selected service window changes in the train schedule
	         * @param {CustomEvent} eventArgs the event arguments
	         */
	        onTrainScheduleSelectServiceWindow (eventArgs) {
					// console.log('MBN page methods onTrainScheduleSelectServiceWindow')
	            this.selectedServiceWindow = eventArgs.detail

	            this.selectedLocationId = eventArgs.detail.locationId
	            this.labels.generalCapacity = []
	            this.overlays.generalCapacity = []

	            // calculate the start date of the general capacity chart
	            let startDate = new Date(this.startDate)
	            let iterator = 0
	            while ([7, 15, 23].indexOf(Number($date.toDateString(startDate).substring(11, 13))) === -1
	                || (iterator === 0 && $date.toDateString(startDate).substring(13, 19) > ':00:00')) {
	                startDate.setTime(startDate.getTime() - 1000 * 60 * 60)
	                iterator++
	            }
	            startDate = $date.toDateObject($date.toDateString(startDate).substring(0, 13) + ':00:00')
	            let endDate = new Date(startDate.getTime() + (8*1000*60*60))
	            let workOrderId = this.selectedWorkOrder.id;


	            startDate = $date.toDateString(startDate);
	            endDate = $date.toDateString(endDate);

	            let queryStr = '?workOrderId=' + workOrderId + '&start=' + startDate + '&end=' + endDate;

	            let test;


				this._api.getLocationEquipmentFeasibility(queryStr)
					.then(res => {
	                //
						test = res

	            }).catch(err => {
	                console.log(err);
	                $loader.error = true;
	            });

	            this.$nextTick(() => {

	                for (let locationIndex in this.locationsFeasibility) {
	                    let location = this.locationsFeasibility[locationIndex]
	                    if (location.id !== eventArgs.detail.locationId) {
	                        continue
	                    }

	                    // fill the capacity charts
	                    for (let workBlockIndex in location.workBlocks) {
	                        let workBlock = location.workBlocks[workBlockIndex]
	                        for (let qualificationIndex in workBlock.qualifications) {
	                            let qualification = workBlock.qualifications[qualificationIndex]
	                            if (this.labels.generalCapacity.filter(x => x.id === qualification.id && x.type === 'qualification').length === 0) {
	                                this.labels.generalCapacity.push({
	                                    id: qualification.id,
	                                    value: qualification.name,
	                                    type: 'qualification'
	                                })
	                            }
	                            for (let labelIndex in this.labels.generalCapacity) {
	                                let label = this.labels.generalCapacity[labelIndex]
	                                if (label.type !== 'qualification' || label.id !== qualification.id) {
	                                    continue
	                                }

	                                if (!this.overlays.generalCapacity[labelIndex]) {
	                                    this.overlays.generalCapacity[labelIndex] = [{
	                                        id: qualification.id,
	                                        object: qualification,
	                                        type: 'qualification-available',
	                                        start: 0,
	                                        length: 100
	                                    }]
	                                }

	                                for (let timeFrameIndex in qualification.timeFrames) {
	                                    let timeFrame = qualification.timeFrames[timeFrameIndex]
	                                    this.overlays.generalCapacity[labelIndex].push({
	                                        id: qualification.id,
	                                        object: qualification,
	                                        workBlock,
	                                        type: 'qualification-used',
	                                        start: (new Date(timeFrame.start).getTime() - startDate.getTime()) / 1000 / 60 / 60,
	                                        length: (new Date(timeFrame.end).getTime() - new Date(timeFrame.start).getTime()) / 1000 / 60 / 60
	                                    })
	                                }


	                                break
	                            }
	                        }


	                    }
	                }

	                this.calculateEquipmentChart();
	            })
	        },

	        calculateEquipmentChart(){
				// console.log('MBN page methods calculateEquipmentChart')
	            let equipmentTypesIds = this.selectedWorkOrder.equipmentTypesIds

	            //console.log(equipmentTypesIds);

	            this.labels.generalCapacity = [];
	            this.overlays.generalCapacity = [];
	            this.equipmentChartData.data = [];

	            for(let i in this.equipment) {
	                let item = this.equipment[i]
	                //console.log(item)
	                if(equipmentTypesIds == null || equipmentTypesIds.length == 0) {
	                    //
	                } else if (
	                	item &&
	                	equipmentTypesIds.includes(item.equipmentTypeId)
						&& this.selectedWorkOrder.tempWorkLocationId == item.locationId
						&& item.available
					) {
						if(this.$moment(item.startDate) <= this.$moment() && this.$moment(item.endDate) >= this.$moment().add('96', 'hours')) {
	                    	//
	                    } else {
		                    let row = {
		                        id: item.name,
		                        locationId: item.locationId,
		                        label: {
		                            type: 'equipmentName',
		                            value: item.name
		                        },
		                        timespans: [{
		                            "start": item.startDate,
		                            "end": item.endDate,
		                            "type": "service-window"
		                        }]
		                    }
		                    this.equipmentChartData.data.push(row);
	                    }
	                }
	            }
	        },

	        /**
	         * Update all of the data for this page
	         */
	        updateData (callback) {
					// console.log('MBN page methods updateData')
	            this.updateEquipmentTypes();
	            this.getNtLocationTypes();
	            $loader.message = 'Bezig met laden'
	                this.updateWorkOrders(() => {
	                    this.updateEquipment(() => {
	                        this.updateQualifications(() => {
	                            this.updateForecastWithdrawals(() => {
	                                $loader.message = null;
	                                if (callback) {
	                                    callback()
	                                }

	                            })
	                        })
	                    })
	                })
	        },

	         updateEquipmentTypes(){
					// console.log('MBN page methods updateEquipmentTypes')
	             this._api.getEquipmentTypesList()
					.then(res => {
						this.equipmentTypes = res
						$loader.message = null
					})
					.catch(err => {
						console.log(err)
						$loader.error = true;
					})
	        },
			updateWorkOrder (workOrder) {
					// console.log('MBN page methods updateWorkOrder')
				const indexedWO = this.workOrders.indexOf(this.workOrders.find(item => item.id === workOrder.id))
				const workOrders = this.workOrders
				workOrders[indexedWO].qualificationIds = workOrder.qualificationIds
				workOrders[indexedWO].equipmentTypesIds = workOrder.equipmentTypesIds
				workOrders[indexedWO].ntLocationType = workOrder.ntLocationType
				workOrders[indexedWO].waitingForWO = workOrder.waitingForWO
				workOrders[indexedWO].totalLeadTimeMinutes = workOrder.totalLeadTimeMinutes
				this.workOrders = workOrders
			},
	        /**
	         * Updates all of the workorders
	         * @param {Void} callback the callback on success
	         */
	         updateWorkOrders (callback) {
					// console.log('MBN page methods updateWorkOrders')
				this._api.geWorkorderstListServiceRequestsMBN2().then(res => {
	                this.workOrders = res

					this.filterWorkordersByLinked()
	                this.filteredWorkOrders = this.workOrders
					if (this._.isEmpty(this.selectedWorkOrder) && !_.isEmpty(this.workOrders) && this.$route.params.hasOwnProperty('serviceRequestId')) {
	                    for (let workOrderIndex in this.workOrders) {
	                        let workOrder = this.workOrders[workOrderIndex]
	                        if (workOrder.serviceRequest.id == this.$route.params.serviceRequestId) {
	                            this.selectedWorkOrder = workOrder
	                            this.openServiceRequest(workOrder.serviceRequest.id)
	                            setTimeout(() => {
	                                let offset = document.querySelectorAll("[data-work-order-id='work-order-" + workOrder.id + "']")[0].offsetTop;
	                                document.getElementsByClassName("work-orders")[0].scrollTop = offset - 200;
	                            }, 300)

	                            break
	                        }
	                    }
	                }
	                else if (this._.isEmpty(this.selectedWorkOrder) && this.workOrders.length > 0) {
	                    this.selectedWorkOrder = this.workOrders[0]
	                    this.openServiceRequest(this.workOrders[0].serviceRequest.id)
	                }
					// TODO can replace by .filter()
	                for(let i = 0; i < this.workOrders.length; i++){
	                    let wo = this.workOrders[i];

	                    if(wo.waitingForWO !== null){
	                        this.workOrdersToBottom.push(wo.WO);
	                    }
	                }

	                // this.filterWorkOrders();

	                if (callback) {
	                    callback()
	                }
	            }).catch(err => {
					console.log(err)
	                $loader.error = true;
	            })
	        },
	        filterWorkordersByLinked(){
					// console.log('MBN page methods filterWorkordersByLinked')
	            let nonLinkedWorkorders = [];
	            let linkedWorkorders = [];

	            for(let i = 0; i < this.workOrders.length; i++){
	                let wo = this.workOrders[i];

	                if(wo.waitingForWO !== null || _.includes(this.workOrdersToBottom, wo.WO)){
	                    linkedWorkorders.push(wo);
	                } else {
	                    nonLinkedWorkorders.push(wo);
	                }
	            }
	            this.workOrders = []
	            this.workOrders = [...nonLinkedWorkorders, ...linkedWorkorders]
	        },
	        workOrderToBottom(wo){
					// console.log('MBN page methods workOrderToBottom')
	            this.workOrdersToBottom.push(wo);
	            this.filterWorkordersByLinked();

	        },
	        removeWorkorderFromBottom(wo){
					// console.log('MBN page methods removeWorkorderFromBottom')
	            let woIndex = this.workOrdersToBottom.indexOf(wo);
	            if (woIndex !== -1) this.workOrdersToBottom.splice(woIndex, 1);
	            this.filterWorkordersByLinked();
	            this.filterWorkordersByLinked();
	        },

	        /**
	         * Update the list of equipment
	         * @param {Void} callback the callback to do on success
	         */
	         updateEquipment (callback = () => {}) {
				// console.log('MBN page methods updateEquipment')
				 this._api.getEquipmentList()
					.then(res => {
						this.equipment = res
						$loader.message = null
						callback()
					})
					.catch(err => {
						console.log(err)
						$loader.error = true;
					})
	        },

	        /**
	         * Update the list of qualifications
	         * @param {Void} callback the callback on success
	         */
	         updateQualifications (callback = () => {}) {
				// console.log('MBN page methods updateQualifications')
				const cacheLocations = $cache.qualifications.getList['default']
				if (cacheLocations) {
					this.qualifications = cacheLocations
					callback()
				} else {
					 this._api.getQualificationList()
						.then(res => {
							this.qualifications = res
							$cache.qualifications.getList['default'] = this.qualifications
							callback()
						}).catch(err => {
							console.log(err)
							$loader.error = true;
						})
				}
	        },

	        /**
	         * Updates the list of forecast withdrawals for the KPI's
	         * @param {Void} callback the callback on success
	         */
	         updateForecastWithdrawals (callback = () => {}) {
				// console.log('MBN page methods updateForecastWithdrawals')
				 this._api.forecastCalculate()
					.then(res => {
						this.kpis = res
						$loader.message = null
						callback()
					}).catch(err => {
						console.log(err)
						$loader.error = true
					})
	        },

	        updateLocationsChart(wo){
				// console.log('MBN page methods updateLocationsChart')
	            let eventArgs = {
	                detail: {
	                    workOrder: wo
	                }
	            }
	            setTimeout(() => {
	                this.onSelectedWorkOrderChange(eventArgs);
	            }, 1000)

	        },

			getFeasibleServiceWindow () {
				// console.log('MBN page methods getFeasibleServiceWindow')
				this.feasibleServiceWindowIds = []
				this.feasibleServiceWindows = []
				this._api.getLocationServiceWindowFeasibility(this.selectedWorkOrder.id)
					.then(res => {
						this.feasibleServiceWindows = res
							.filter(item => !!item.feasibleServiceWindow && this.feasibleServiceWindowIds.indexOf(+item.serviceWindowId) === -1)
						this.feasibleServiceWindowIds = this.feasibleServiceWindows.map(item => +item.serviceWindowId)
						this.feasibleServiceWindows =  _.sortBy(this.feasibleServiceWindows,
							(dateObj) => new Date(dateObj.arrivalDate))
					})
			},

	        onSelectedWorkOrderChange (eventArgs, callback) {
				// console.log('MBN page methods onSelectedWorkOrderChange')
	            this.$nextTick( () => {
	                if (eventArgs.detail.workOrder === null) {
	                    this.selectedWorkOrder = {}
	                }
	                this.selectedWorkOrder = eventArgs.detail.workOrder

	                if (_.isEmpty(this.selectedWorkOrder)) {
	                    return
	                }

	                // calculate the start date of the chart
	                let startDate = $date.toDateObject(this.startDate)
	                let startHour = Number(this.startDate.substring(11, 13))
	                if (startHour >= 23 || startHour < 7) {
	                    startDate = $date.toDateObject(this.startDate.substring(0, 10) + ' 23:00:00')
	                    if (startHour < 7) {
	                        startDate.setTime(startDate.getTime() - 24 * 60 * 60 * 1000)
	                    }
	                }
	                else if (startHour >= 7 && startHour < 15) {
	                    startDate = $date.toDateObject(this.startDate.substring(0, 10) + ' 07:00:00')
	                }
	                else if (startHour >= 15) {
	                    startDate = $date.toDateObject(this.startDate.substring(0, 10) + ' 15:00:00')
	                }
					this.getFeasibleServiceWindow()
					this._api.getLocationFeasibilityNew(this.selectedWorkOrder.id)
						.then(res => {
							this.labels.generalCapacity = []
							this.labels.locationCapacity = []
							this.overlays.locationCapacity = []
							this.overlays.generalCapacity = []
							this.locationsFeasibility = res

							for (let locationIndex in this.locationsFeasibility) {
								let location = this.locationsFeasibility[locationIndex]
								this.overlays.locationCapacity.push([])

								for (let workBlockIndex in location) {
									let workBlock = location[workBlockIndex]
									// fill the labels of chart
									if (this.labels.locationCapacity.filter(x => x.id === workBlock.locationid).length === 0) {
										this.labels.locationCapacity.push({
											id: workBlock.locationid,
											value: workBlock.locationname
										})
									}

									let coordinate = ((new Date(workBlock.startdate).getTime() - 1000 * 60 * 60 * 2) - startDate.getTime()) / 1000 / 60 / 60 / 8
									let length = 1
									let height = Number(workBlock.totalminutes) === 0 ? 0 : 1 - Number(workBlock.utilizedminutes) / Number(workBlock.totalminutes);
									if (this.overlays.locationCapacity[this.overlays.locationCapacity.length - 1]) {
										this.overlays.locationCapacity[this.overlays.locationCapacity.length - 1].push({
											id: workBlock.locationid,
											type: 'location-capacity',
											start: Math.round(coordinate),
											length,
											margin: 0,
											height: height,
											locationName: workBlock.locationname,
											locationId: workBlock.locationid
										})
									}
								}
							}
							// Add the remaining locations to the labels
							for (let locationIndex in this.locations) {
								let location = this.locations[locationIndex]
								let temp = []

								for(let l of this.labels.locationCapacity) {
									if (l.id != null && l.value != null){
										temp.push(l)
									}
								}

								location = temp;

								if (this.labels.locationCapacity.filter(x => x.id === location.id).length === 0) {
									this.labels.locationCapacity.push({
										id: location.id,
										value: location.name
									})
								}
							}
							this.labels.locationCapacity = _.without(this.labels.locationCapacity, undefined)
							this.getFilteredList()
						})
	            })
	        },

	        getFilteredList(){
				// console.log('MBN page methods getFilteredList')
	            let serviceWindowsLocations = [];
	            let mainList = [];
	            this.labels.locationCapacity = []
	            for(let i in this.feasibleServiceWindows){
	                let current = this.feasibleServiceWindows[i];

	                let feasible = false;
	                if(new Date(current.departureDate).getTime() > new Date().getTime()){
	                    feasible = true
	                }

	                if(feasible){
	                    serviceWindowsLocations.push({
	                        id: current.location.id,
	                        value: current.location.name,
	                    });
	                }
	            }

	            serviceWindowsLocations = _.uniqBy(serviceWindowsLocations, 'id');
	            serviceWindowsLocations = _.reverse(serviceWindowsLocations);

	            this.filteredLocationIds = null;

	            if(this.selectedWorkOrder.equipmentTypesIds && this.selectedWorkOrder.equipmentTypesIds.length > 0){
	                let equipmentsArr = _.without(this.selectedWorkOrder.equipmentTypesIds, undefined, null);


	                this._api.getLocationFilteredList(equipmentsArr).then(response => {
	                    this.filteredLocationIds = response;
	                    this.labels.locationCapacity = []
	                    this.fillLabels(response, serviceWindowsLocations);
	                });
	            } else {
	                this._api.getLocationFilteredList([]).then(response => {
	                    this.filteredLocationIds = response;
	                    this.labels.locationCapacity = []
	                    this.fillLabels(response, serviceWindowsLocations);
	                });
	            }
	        },
	        fillLabels(arr, serviceWindowsLocations){
				// console.log('MBN page methods fillLabels')
	            if(arr.length > 0){
	                for(let i in arr){
	                    this.labels.locationCapacity.push({
	                        id: arr[i].id,
	                        value: arr[i].name,
	                    })
	                }
	            }
	            this.compareSrLocations(serviceWindowsLocations);
	        },
	        compareSrLocations(serviceWindowsLocations){
				// console.log('MBN page methods compareSrLocations')
	            for(let i in serviceWindowsLocations){
	                let serviceWindowsLocation = serviceWindowsLocations[i];

	                for(let j in this.overlays.locationCapacity){
	                    let currentOverlay = this.overlays.locationCapacity[j];
	                    let currentLabel = this.labels.locationCapacity[j];
	                    if(serviceWindowsLocation.id == currentOverlay[0].id){
	                        this.overlays.locationCapacity.splice(j, 1);
	                        this.overlays.locationCapacity.unshift(currentOverlay);

	                        this.labels.locationCapacity.splice(j, 1);
	                        this.labels.locationCapacity.unshift(currentLabel);
	                    }
	                }
	            }

	            this.labels.locationCapacity = _.uniq(this.labels.locationCapacity)
	            this.overlays.locationCapacity = _.uniq(this.overlays.locationCapacity)
	            this.checkEquipmentAvailability();

	            // this.filterChartByNtLocationType();

	            // let ntLocationType = this.getNtLocationTypeByLocationId(workBlock.locationid).locationType;
	        },

	        checkEquipmentAvailability(){
	        	let nonParsedStartDate = this.$moment();
	        	let startDate, endDate;

	        	if(nonParsedStartDate.hour() >= 7 && nonParsedStartDate.hour() < 15){
	                startDate = this.$moment(nonParsedStartDate).clone().set({h: 7, m: 0})
	            } else if(nonParsedStartDate.hour() >= 15 && nonParsedStartDate.hour() < 23){
	                startDate = this.$moment(nonParsedStartDate).clone().set({h: 15, m: 0})
	            } else {
	                startDate = this.$moment(nonParsedStartDate).clone().set({h: 23, m: 0})
	            }
	            endDate = startDate.clone().add(96, 'hours');

	            if(this.selectedWorkOrder.equipmentTypesIds.length > 0){
	            	for(let i in this.labels.locationCapacity){
		        		let location = this.labels.locationCapacity[i];
		        		let visible = false;

		        		for(let j in this.equipment){
		        			let equipment = this.equipment[j];
		        			if(location && equipment.locationId == location.id && equipment.available){
		        				if(equipment.startDate && equipment.endDate){
		        					let equipmentUnavailableFrom = this.$moment(equipment.startDate);
			        				let equipmentUnavailableTo = this.$moment(equipment.endDate);
			        				if(equipmentUnavailableFrom > startDate && equipmentUnavailableTo < endDate){
			        					visible = true
			        					break;
			        				}
		        				} else {
		        					visible = true
		        					break;
		        				}
		        			}
		        		}

		        		if(!visible) {
		        			this.overlays.locationCapacity.splice(i, 1);
	                        this.labels.locationCapacity.splice(i, 1);
		        		}
		        	}
	            }
	        },

	        filterChartByNtLocationType(){
				// console.log('MBN page methods filterChartByNtLocationType')
	            for(let i in this.labels.locationCapacity){
	                let item = this.labels.locationCapacity[i];

	                let locationType = this.getNtLocationTypeByLocationId(item.id).locationType;

	                if(this.selectedWorkOrder.ntLocationType == 'SB'){
	                    if( locationType !== 'SB' || locationType !== 'GSL' || locationType !== 'TC' ){
	                        this.labels.locationCapacity.splice(i, 1);
	                    }
	                } else if (this.selectedWorkOrder.ntLocationType == 'GSL'){
	                    if( locationType !== 'GSL' || locationType !== 'TC' ){
	                        this.labels.locationCapacity.splice(i, 1);
	                    }
	                }
	            }
	        },

	        /**
	         * When a work order changes.
	         * @param {CustomEvent} eventArgs the event arguments
	         */
	         onWorkOrderChange (workOrder) {
				// console.log('MBN page methods onWorkOrderChange')
				 this._api.createWorkOrder(workOrder)
					.then(res => {
						// console.log('MBN page methods onWorkOrderChange res')
						if(!_.isEmpty(this.selectedWorkOrder)){
							this.selectedWorkOrder.arrivalDate = workOrder.arrivalDate;
							this.selectedWorkOrder.tempRepairLocationId = workOrder.tempRepairLocationId;
							this.selectedWorkOrder.tempWorkLocationId = workOrder.tempWorkLocationId;
							this.calculateEquipmentChart();
							setTimeout(() => {
								if(this.selectedWorkOrder.arrivalDate && this.selectedWorkOrder.tempRepairLocationId){
									this.showSecondChart = true;
									let args = {
										detail: {
											arrivalDate: this.selectedWorkOrder.arrivalDate,
											locationId: this.selectedWorkOrder.tempRepairLocationId
										}
									}
									this.onTrainScheduleSelectServiceWindow(args);
								} else {
									this.showSecondChart = false;
								}
								// this.onSelectedWorkOrderChange(eventArgs);
							}, 1000);
						}
					})

	        },

	        /**
	         * When the task within a work order changes.
	         * @param {CustomEvent} eventArgs the event arguments
	         */
	         onWorkOrderTaskChange (eventArgs) {
				// console.log('MBN page methods onWorkOrderTaskChange')
	            let task = Object.assign({}, eventArgs.detail.task)
	            task.mechanic = undefined

	            if (task.arrivalDate && task.arrivalDate.indexOf('T') === -1) {
	                task.arrivalDate = $date.toDateObject(task.arrivalDate).toJSON()
	            }
	            if (task.tempStart) {
	                task.tempEnd = new Date(task.tempStart)
	                task.tempEnd.setTime(new Date(task.tempStart).getTime() + task.leadTimeMinutes * 60 * 1000)
	                task.tempEnd = task.tempEnd.toJSON()
	            }

	            if (!task.revisionCount || isNaN(task.revisionCount)) {
	                task.revisionCount = 1
	            }
	            else {
	                task.revisionCount++
	            }
	             this._api.saveTask(task)
	        },

	        /**
	         * Whenever the equipment changes within a task of a workorder
	         * @param {CustomEvent} eventArgs the event arguments
	         */
	        onWorkOrderTaskEquipmentChange (eventArgs) {
				// console.log('MBN page methods onWorkOrderTaskEquipmentChange')
	        	// TODO test this part, don't know how
	            let taskId = eventArgs.detail.task.id
	            let promises = []
	            for (let addedEquipmentIdIndex in eventArgs.detail.addedEquipmentIds) {
	                let addedEquipmentId = eventArgs.detail.addedEquipmentIds[addedEquipmentIdIndex]
	                promises.push(this._api.createTaskEquipment({
	                    equipmentId: addedEquipmentId,
	                    taskId
	                }))
	            }

	            for (let deletedEquipmentIdIndex in eventArgs.detail.deletedEquipmentIds) {
	                let deletedEquipmentId = eventArgs.detail.deletedEquipmentIds[deletedEquipmentIdIndex]

	                for (let taskEquipmentIndex = eventArgs.detail.task.equipments.length - 1; taskEquipmentIndex >= 0; taskEquipmentIndex--) {
	                    let taskEquipment = eventArgs.detail.task.equipments[taskEquipmentIndex]

	                    if (taskEquipment.equipment.id === deletedEquipmentId) {
	                        promises.push(this._api.deleteTaskEquipment(taskEquipment.id))
	                    }
	                }
	            }

	            // Update the task in the workorder
	            for (let workOrderIndex in this.workOrders) {
	                let workOrder = this.workOrders[workOrderIndex]
	                if ((workOrder.tasks || []).filter(x => x.id === taskId).length > 0) {
	                    workOrder.tasks = workOrder.tasks.map(task => {
	                        if (task.id === taskId) {
	                            return eventArgs.detail.task
	                        }
	                        return task
	                    })
	                    break
	                }
	            }

	            // After all alterations
	            Promise.all(promises).then(values => {
	                // Update the feasibility based on new data
	                this.onSelectedWorkOrderChange({
	                    detail: {
	                        workOrder: this.selectedWorkOrder
	                    }
	                }, () => {

	                    // Update the chart after feasibility is set
	                    this.onTrainScheduleSelectServiceWindow({
	                        detail: {
	                            serviceWindow: this.selectedServiceWindow,
	                            locationId: this.selectedLocationId
	                        }
	                    })
	                })
	            })
	        },

	        /**
	         * Whenever the qualifications changes within a task of a workorder
	         * @param {CustomEvent} eventArgs the event arguments
	         */
	        onWorkOrderTaskQualificationsChange (eventArgs) {
				// console.log('MBN page methods onWorkOrderTaskQualificationsChange')
	            let taskId = eventArgs.detail.task.id
	            let promises = []
	            for (let addedQualificationIdIndex in eventArgs.detail.addedQualificationIds) {
	                let addedQualificationId = eventArgs.detail.addedQualificationIds[addedQualificationIdIndex]
	                promises.push(this._api.createTaskQualification({
	                    qualificationId: addedQualificationId,
	                    taskId
	                }))
	            }

	            for (let deletedQualificationIdIndex in eventArgs.detail.deletedQualificationIds) {
	                let deletedQualificationId = eventArgs.detail.deletedQualificationIds[deletedQualificationIdIndex]

	                for (let taskQualificationIndex = eventArgs.detail.task.qualifications.length - 1; taskQualificationIndex >= 0; taskQualificationIndex--) {
	                    let taskQualification = eventArgs.detail.task.qualifications[taskQualificationIndex]

	                    if (taskQualification.qualification.id === deletedQualificationId) {
	                        promises.push(this._api.deleteTaskQualification(taskQualification.id))
	                    }
	                }
	            }

	            // Update the task in the workorder
	            for (let workOrderIndex in this.workOrders) {
	                let workOrder = this.workOrders[workOrderIndex]
	                if ((workOrder.tasks || []).filter(x => x.id === taskId).length > 0) {
	                    workOrder.tasks = workOrder.tasks.map(task => {
	                        if (task.id === taskId) {
	                            return eventArgs.detail.task
	                        }
	                        return task
	                    })
	                    break
	                }
	            }

	            // After all alterations
	            Promise.all(promises).then(values => {
	                // Update the feasibility based on new data
	                this.onSelectedWorkOrderChange({
	                    detail: {
	                        workOrder: this.selectedWorkOrder
	                    }
	                }, () => {
	                    // Update the chart after feasibility is set
	                    this.onTrainScheduleSelectServiceWindow({
	                        detail: {
	                            serviceWindow: this.selectedServiceWindow,
	                            locationId: this.selectedLocationId
	                        }
	                    })
	                })
	            })
	        },

	        /**
	         * Opens the workorder component containing the service request
	         * @param {number} serviceRequestId the service request id
	         */
	        openServiceRequest (serviceRequestId) {
				// console.log('MBN page methods openServiceRequest')
	            for (let workOrderIndex in this.workOrders) {
	                let workOrder = this.workOrders[workOrderIndex]
	                if (workOrder.serviceRequest && workOrder.serviceRequest.id === serviceRequestId) {
	                    this.selectedWorkOrder = workOrder
	                    return
	                }
	            }
	        },

	        /**
	         * Calculate the width of a scrollbar in the application
	         * TODO: refactor to other file to share this same function with WorkOrders.vue, DUPLICATE CODE!
	         */
	        calculateScrollBarWidth () {
				// console.log('MBN page methods calculateScrollBarWidth')
	            var scrollDiv = document.createElement('div')
	            scrollDiv.style.width = '100px'
	            scrollDiv.style.height = '100px'
	            scrollDiv.style.overflow = 'scroll'
	            scrollDiv.style.position = 'absolute'
	            scrollDiv.style.top = '-9999px'
	            document.body.appendChild(scrollDiv)
	            var scrollBarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth
	            document.body.removeChild(scrollDiv)
	            return scrollBarWidth
	        }
	    }
	}
</script>

<template>
	<div id="service-requests" class="service-request-mbn">
		<div class="content">
			<div class="content-left-md">
				<div class="content-child content-child-left scrollable-y content-footered">
					<div class="search-wrapper">
						<TextInput
							:paddingless="false"
							placeholder="Zoek naar stel/stam"
							v-model="materialSearchQuery"
							class="search-box"
							:searchable="true"
							:clearable="false"
						/>
					</div>
					<div class="work-orders">
						<div class="work-order-container">
							<v-expansion-panels>
								<template
									v-for="(workOrder, index) in filteredWorkOrders"
								>
									<work-order-mbn
										v-if="_.includes(workOrder.materialNumber.toLowerCase(), materialSearchQuery.toLowerCase())"
										:key="'mbn-sr-' + index + filteredWorkOrders.length"
										type="service-request-mbn"
										:visible="selectedWorkOrder.id === workOrder.id"
										:canEditTask="true"
										:canEditEquipment="true"
										:canEditLeadTime="true"
										:canEditQualification="true"
										:equipmentList="equipment"
										:equipmentTypes="equipmentTypes"
										:qualificationList="qualifications"
										:tasksSelectable="false"
										:startDateChart="startDate"
										:displayHoursChart="displayHours"
										:item="workOrder"
										:mechanics="mechanics"
										:locations="locations"
										:locationTypes="ntLocationTypes"
										:serviceWindows="serviceWindows"
										:listenSentToMaximo="listenSentToMaximo"
										@hideCharts="hideCharts"
										@checkWOLinked="checkWOLinked"
										@planningWO="planningWO"
										@removeWorkorderFromBottom="removeWorkorderFromBottom"
										@workOrderToBottom="workOrderToBottom"
										@updateLocationsChart="updateLocationsChart"
									/>
								</template>
							</v-expansion-panels>
						</div>
					</div>
				</div>
				<div class="content-child content-child-right scrollable-y content-footered">
					<div class="right-content">
						<div class="filters">
							<div class="filters-left">
								<div class="filter-button big" :class="{'selected': selectedDateFilter.includes(0)}" @click="changeDateFilter(0)">
									Q vandaag
									<badge  :value="todayWorkOrders.length"/>
								</div>
								<div class="filter-button big" :class="{'selected': selectedDateFilter.includes(1)}" @click="changeDateFilter(1)">
									Q binnen 1 week
									<badge :value="weeksWorkOrders.length"/>
								</div>
								<div class="filter-button big" :class="{'selected': selectedDateFilter.includes(2)}" @click="changeDateFilter(2)">
									Overig
									<badge :value="futureWorkOrders.length"/>
								</div>
							</div>
						</div>
						<train-schedule
							title="Overstanden"
							v-if="!_.isEmpty(selectedWorkOrder)"
							:workOrder="selectedWorkOrder"
							:feasibleServiceWindowIds="feasibleServiceWindowIds"
							:feasibleServiceWindows="feasibleServiceWindows"
							:filteredLocationIds="filteredLocationIds"
							@sendSelectedLocationId="setSelectedLocationId"
							@retrieveServiceWindows="retrieveServiceWindows"/>

						<chart
							title="Beschikbare locaties"
							id="locations-chart"
							:selectable="true"
							:maxRows="maxRows.locationCapacity"
							:labels="labels.locationCapacity"
							:overlays="overlays.locationCapacity"
							:hideHours="false"
							:displayHours="displayHours"
							:startDate="startDate"
							:offsetHours="offsetHours"
							:hoursPerCoordinate="8"
							:clickableGrid="true"
							v-if="selectedWorkOrder"
							:broadcastScrollEvents="true"
							@broadCastScroll="broadCastScroll"
							:workOrderTasks="selectedWorkOrder.tasks"
							:locationFeasibility="locationsFeasibility"
							:equipmentTypes="equipmentTypes"
							:filteredLocationIds="filteredLocationIds"
							:selectedLocationId="selectedLocationId"
							chartClass="MBNLocationChart"
							:chartStatus="chartStatus"
							:ntLocationType="selectedWorkOrder.ntLocationType"
							:locations="locations"
						/>

						<gantt
							id="equipment-chart"
							v-if="equipmentChartData.data.length > 0"
							:chartData="equipmentChartData"
							header="Outillage"
							@openWorkOrder="openWorkOrder"
							@broadCastScroll="broadCastScroll"
						/>
					</div>
				</div>
			</div>
		</div>
		<div class="footer">
			<kpi v-for="(kpi, kpiIndex) in kpis" :kpi="kpi" :key="kpiIndex" />
		</div>
		<WorkOrdersLeadTimeModal
			@onWorkOrderChange="onWorkOrderChange"
			@updateWorkOrder="updateWorkOrder"
		/>
		<WorkOrdersQualificationsModal
			:qualificationList="qualifications"
			:canEditQualification="true"
			@updateWorkOrder="updateWorkOrder"
		/>
		<WorkOrdersEquipmentsTypesModal
			:equipmentList="equipmentTypes"
			:canEditEquipment="true"
			@updateWorkOrder="updateWorkOrder"
			@onSelectedWorkOrderChange="onSelectedWorkOrderChange"
		/>
		<WorkOrdersLocationTypeModal
			:locationTypes="ntLocationTypes"
			:canEditEquipment="true"
			@updateWorkOrder="updateWorkOrder"
		/>
		<WorkOrdersTrainNumberModal
			:locationTypes="ntLocationTypes"
			:canEditEquipment="true"
			@updateWorkOrder="updateWorkOrder"
		/>
	</div>
</template>

<style lang="scss" scoped src="../../assets/scss/pages/mbn.scss" />

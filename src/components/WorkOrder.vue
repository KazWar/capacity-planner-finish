<script>
import $date from '@/modules/date-module'
import $loader from '@/modules/loader-module'
import $snackbar from '@/modules/snackbar-module'
import _ from 'lodash'
import env from '@/env'

export default {
    props: ['initializeOnStart', 'type', 'workOrder', 'mechanics', 'forceContentVisible', 'startDateChart', 'displayHoursChart', 'selectedTaskIds', 'selectTaskId', 'equipmentList', 'equipmentTypes', 'qualificationList', 'canEditTask', 'canEditEquipment', 'canEditQualification', 'canEditLeadTime', 'tasksSelectable', 'locations', 'getQualifiedMechanicsForTask', 'materialDuplicates', 'hideHeaders', 'serviceWindows', 'warningsOnly', 'locationTypes', 'availableTimeslots', 'watchTimeslots', 'assetStatuses', 'reasonMaintenanceList'],

    data: function () {
        return {
			key: Date.now(),
            showDuplicateInfo: false,
            duplicatesData: [],
            backgroundRequestsProcessing: false,
            timeslot: null,
            isHidden: false,
            addedEquipmentIds: [],

            deletedEquipmentIds: [],

            addedQualificationIds: [],

            deletedQualificationIds: [],

            contentVisible: false,

            startTime: null,

            leadTimeMinutes: 0,

            cloned: {},

            tasks: [],

            startTimes: [],

            mechanicIds: [],

            timeslotTasks: [],

            mechanicId: null,

            qualifications: [],

            equipment: [],

            displayModalLocationType: false,

            displayModalLeadTime: false,

            displayModalQualifications: false,

            displayModalEquipment: false,

            displayModalDeclineServiceRequest: false,

            displayModalAssignServiceRequest: false,

            displaySameTrainNumberModal: false,

            taskIndex: null,

            newEquipment: null,

            newQualification: null,

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

            declineReasonServiceRequest: null,

            assignReasonsServiceRequest: [
                {
                    id: 'ADMIN',
                    name: 'Alle verrijkingen op de herstelregeling'
                },
                {
                    id: 'BIJSTUUR',
                    name: 'Bijsturing vervoerder'
                },
                {
                    id: 'DIAGNOSE',
                    name: 'Diagnose laten uitvoeren'
                },
                {
                    id: 'GEW_WVB',
                    name: 'Geweigerd door werkvoorbereiding'
                },
                {
                    id: 'NIET GEDAAN',
                    name: 'Na orderacceptatie niet uitgevoerd'
                },
                {
                    id: 'ODH',
                    name: 'Gepland onderhoud'
                },
                {
                    id: 'PRIO',
                    name: 'Niet kunnen uitvoeren door MBN prioritering'
                },
                {
                    id: 'TOEWIJZING',
                    name: 'Eerste of vervolgtoewijzing'
                },
                {
                    id: 'WELKOM',
                    name: 'WOA-->B'
                }
            ],

            assignReasonServiceRequest: null,

            isContentInitialized: false,

            workOrderInitialized: false,

            tempWorkLocationId: null,

            tempRepairLocationId: null,

            arrivalDate: null,

            defectOnLocation: null,

            selectedEquipmentTypeId: null,

            maintenanceTrack: null,

            matchedLocationBool: false,
            showMatchedLocationModal: false,

            mbnEquipmentModels: [],
            mbnEquipmentOptions: [],

            assetWorkOrders: [],
            todayDate: this.$moment(),

            easyPlanLocations: [],

            taskSelectedEquipmentList: [],
            startWatchingTasks: false,

            selectedQualifications: [],

            showAssignedLocations: false,
            // isScheduled: this.workOrder.isScheduled

            mobileTeamEasyPlan: false,

            locationsData: this.locations,

            ntLocationType: this.workOrder.ntLocationType,

            mobileTeamLocationsForWo: [],

            sameTrainNumbers: [],
            // sameTrainNumber: this.workOrder.waitingForWO
            sameTrainNumber: null,
            displayOptionsModal: false,

            maintenanceStatus: null,
            reasonMaintenance: null,
            maintenanceLocation: null,

            parsedTimeslots: []
        }
    },

    computed: {
        // Declined locations
        checkAssignedLocations () {
            if (this.workOrder.serviceRequest.assignedLocations !== null) {
                if (this.workOrder.serviceRequest.assignedLocations.length > 0) {
                    return this.workOrder.serviceRequest.assignedLocations.length
                } else {
                    return 0
                }
            }
        },
        /**
         * The formatted due date of a workorder
         */
        dueDate () {
            if (!this.workOrder || !this.workOrder.dueDate) {
                return ''
            }
            return $date.formatDayMonthTimeStamp(new Date(this.workOrder.dueDate))
        },

        /**
         * The total list of task equipment
         */
        totalTaskEquipment () {
            let taskEquipment = []

            for (let taskIndex in this.tasks) {
                if (Number(taskIndex) === Number(this.taskIndex) || this.taskIndex === null) {
                    for (let taskEquipmentIndex in this.tasks[taskIndex].equipments) {
                        let taskEquipmentObject = this.tasks[taskIndex].equipments[taskEquipmentIndex]
                        taskEquipment.push(taskEquipmentObject)
                    }

                    for (let addedEquipmentIdIndex in this.addedEquipmentIds) {
                        let addedEquipmentId = this.addedEquipmentIds[addedEquipmentIdIndex]
                        let equipmentObject = null
                        for (let equipmentIndex in this.equipmentList) {
                            let equipment = this.equipmentList[equipmentIndex]
                            if (equipment.id === addedEquipmentId) {
                                equipmentObject = equipment
                                break
                            }
                        }
                        taskEquipment.push({
                            equipmentId: addedEquipmentId,
                            equipment: equipmentObject
                        })
                    }

                    for (let deletedEquipmentIdIndex = this.deletedEquipmentIds.length - 1; deletedEquipmentIdIndex >= 0; deletedEquipmentIdIndex--) {
                        let deletedEquipmentId = this.deletedEquipmentIds[deletedEquipmentIdIndex]

                        for (let equipmentIndex = taskEquipment.length - 1; equipmentIndex >= 0; equipmentIndex--) {
                            let equipment = taskEquipment[equipmentIndex]
                            if (equipment.equipmentId === deletedEquipmentId) {
                                taskEquipment.splice(equipmentIndex, 1)
                            }
                        }
                    }
                }
            }

            let filteredTaskEquipment = []
            for (let taskEquipmentIndex in taskEquipment) {
                let taskEquipmentObject = taskEquipment[taskEquipmentIndex]
                if (filteredTaskEquipment.filter(x =>
                    {
                    return x.equipmentId === taskEquipmentObject.equipmentId }).length !== 0) {
                    continue
                }
                filteredTaskEquipment.push(taskEquipmentObject)
            }

            return filteredTaskEquipment
        },

        /**
         * The total list of task qualifications
         */
        totalTaskQualifications () {
            let taskQualifications = []
            for (let taskIndex in this.tasks) {
                if (Number(taskIndex) === Number(this.taskIndex) || this.taskIndex === null) {
                    for (let taskQualificationIndex in this.tasks[taskIndex].qualifications) {
                        let taskQualificationObject = this.tasks[taskIndex].qualifications[taskQualificationIndex]
                        taskQualifications.push(taskQualificationObject)
                    }

                    for (let addedQualificationIdIndex in this.addedQualificationIds) {
                        let addedQualificationId = this.addedQualificationIds[addedQualificationIdIndex]
                        let qualificationObject = null
                        for (let qualificationIndex in this.qualificationList) {
                            let qualification = this.qualificationList[qualificationIndex]
                            if (qualification.id === addedQualificationId) {
                                qualificationObject = qualification
                                break
                            }
                        }
                        taskQualifications.push({
                            qualificationId: addedQualificationId,
                            qualification: qualificationObject
                        })
                    }

                    for (let deletedQualificationIdIndex = this.deletedQualificationIds.length - 1; deletedQualificationIdIndex >= 0; deletedQualificationIdIndex--) {
                        let deletedQualificationId = this.deletedQualificationIds[deletedQualificationIdIndex]

                        for (let qualificationIndex = taskQualifications.length - 1; qualificationIndex >= 0; qualificationIndex--) {
                            let qualification = taskQualifications[qualificationIndex]
                            if (qualification.qualificationId === deletedQualificationId) {
                                taskQualifications.splice(qualificationIndex, 1)
                            }
                        }
                    }
                }
            }

            let filteredTaskQualifications = []
            for (let taskQualificationIndex in taskQualifications) {
                let taskQualification = taskQualifications[taskQualificationIndex]
                if (filteredTaskQualifications.filter(x => x.qualification.id === taskQualification.qualification.id).length !== 0) {
                    continue
                }
                filteredTaskQualifications.push(taskQualification)
            }

            return filteredTaskQualifications.sort((x, y) =>
                Number(x.externalId) > Number(y.externalId)
                ? 1
                : (
                    Number(y.externalId) > Number(x.externalId)
                    ? -1
                    : 0
                )
            )
        },

        /**
         * The filtered list of equipments to display in the equipment select picker
         */
        filteredEquipmentList: function () {
            let filteredEquipmentList = []
            let totalTaskEquipment = this.totalTaskEquipment

            addEquipmentsToFilteredList: for (let equipmentIndex in this.equipmentList) {
                let equipment = this.equipmentList[equipmentIndex]

                for (let taskEquipmentIndex in totalTaskEquipment) {
                    let taskEquipment = totalTaskEquipment[taskEquipmentIndex]
                    if (taskEquipment.equipment.id === equipment.id) {
                        continue addEquipmentsToFilteredList
                    }
                }

                filteredEquipmentList.push(equipment)
            }
            return filteredEquipmentList
        },

        /**
         * The filtered list of equipment types to display in the equipment type select picker
         */
        filteredEquipmentTypeList: function () {
            let filteredEquipmentTypeList = []
            let equipmentTypes = []

            for (let equipmentIndex in this.equipmentList) {
                let equipment = this.equipmentList[equipmentIndex]
                let equipmentType = equipment.equipmentType

                if (equipmentType && equipmentTypes) {
					if (equipmentTypes.filter(x => x.id === equipmentType.id).length > 0) {
						continue
					}
				}

                equipmentTypes.push(equipmentType)
            }

            return equipmentTypes
        },

        /**
         * The filtered list of qualifications to display in the qualifications select picker
         */
        filteredQualificationList () {
            return this.qualificationList.filter(item => !this.totalTaskQualifications.find(total => total.qualificationId === item.id))
		}
    },

    watch: {
        timeslot: function () {
            if (this.watchTimeslots) {
                this.setTimeslotOnWoLevel()
            }
        },

        warningsOnly: function () {
            if (this.warningsOnly && this.type == 'mbn-monitor-assigned') {
                if (this.workOrder.serviceRequestWarning || this.workOrder.notCompletedWarning) {
                    this.isHidden = false
                } else {
                    this.isHidden = true
                }
            } else {
                this.isHidden = false
            }
        },
        locations: {
            handler: function () {
                // console.log(this.locations.len);
                this.locationsData = this.locations
                if (this.workOrder.asset) {
                    this.maintenanceLocation = this.getMaintanceLocationName(this.workOrder.asset.maintenanceLocation)
                } else {
                    this.maintenanceLocation = this.getMaintanceLocationName(this.workOrder.maintenanceLocation)
                }

                // console.log(this.locationsData.length);
            },
            deep: true
        },
        tasks: {
            handler: function () {
                if (this.startWatchingTasks) {
                    for (let taskIndex in this.tasks) {
                        let task = this.tasks[taskIndex]
                        // console.log(task.isSentToMaximo);
                        task.isSentToMaximo = false
                        // if (task.isSentToMaximo === false) {
                        //     result = false
                        //     break
                        // }
                    }
                    // console.log('asd')
                }
            },
            deep: true
        },
        startTimes: {
            handler: function () {

                this.onChangeStartTime()
                // console.log('test')
            },
            deep: true
        },

        mechanicIds: {
            handler: function () {
                if (this.type == 'mobile-teams') {
                    if (this.workOrderInitialized) {
                        this.onChangeWorkOrder()
                    }
                } else {
                    this.onChangeMechanic()
                }

                // console.log('test')
            },
            deep: true
        },

        mechanicId: function () {
            this.mobileTeamEasyPlancheck()
        },

        selectedEquipmentTypeId: function () {
            if (this.newEquipment !== null) {
                this.addedEquipmentIds.push(this.newEquipment)
                this.newEquipment = null
            }

            // console.log(this.selectedEquipmentTypeId);
        },

        newQualification: function () {
            if (this.newQualification !== null && this.newQualification !== undefined) {
                // console.log(this.newQualification)
                if (this.type == 'service-request-mbn' || this.type == 'mbn-monitor-unassigned') {
                    if (this.workOrder.tasks && this.workOrder.tasks.length > 0) {
                        this.addedQualificationIds.push(this.newQualification)
                    } else {
                        // this.workOrder.qualificationIds.push(this.newQualification)
                        this.addedQualificationIds.push(this.newQualification)
                    }
                } else {
                    this.addedQualificationIds.push(this.newQualification)
                }
                this.getSelectedQualifications()
				// this.newQualification = null
				const self = this
				setTimeout(function () {
					self.newQualification = null
				},1)
            }
        },

        tempRepairLocationId: function (newVal, oldVal) {
            if (this.workOrderInitialized) {
                this.onChangeWorkOrder()
                this.mobileTeamEasyPlancheck()
                if (this.type == 'pitstop') {
                    if (newVal == null) {
                        this.workOrder.tempRepairLocationId = newVal
                        this.workOrder.isScheduled = false
                        this.workOrder.isPitstopPlanned = false
						this._api.saveWorkOrder(this.workOrder)
                    }
                }
            }

            // console.log(newVal);
        },

        tempWorkLocationId: function (newVal, oldVal) {
            // console.log(oldVal);
            if (this.workOrderInitialized) {
                this.onChangeWorkOrder()
                this.mobileTeamEasyPlancheck()
                if (this.type == 'pitstop' && newVal == null) {
                    this.workOrder.tempWorkLocationId = newVal
                    this.workOrder.isScheduled = false
                    this.workOrder.isPitstopPlanned = false
					this._api.saveWorkOrder(this.workOrder)
                }
            }

            // console.log(newVal);
        },

        arrivalDate: function (newVal, oldVal) {
            // console.log(oldVal);
            if (this.type !== 'service-request-mbn') {
                if (this.workOrderInitialized) {
                    // console.log(123);
                    this.onChangeWorkOrder()
                    if (this.type == 'pitstop' && newVal == null) {
                        this.workOrder.arrivalDate = newVal
                        this.workOrder.isScheduled = false
                        this.workOrder.isPitstopPlanned = false
						this._api.saveWorkOrder(this.workOrder)
                    }
                }
            }

            // console.log(newVal);
        },

        defectOnLocation: function (newVal, oldVal) {
            if (this.workOrderInitialized) {
                this.onChangeWorkOrder()
            }

            // console.log(newVal);
        },

        maintenanceTrack: function (newVal, oldVal) {
            if (this.workOrderInitialized) {
                document.dispatchEvent(new CustomEvent('workOrderMaintenanceTrackChange', {
                    detail: {
                        id: this.workOrder.id,
                        maintenanceTrack: this.maintenanceTrack
                    }
                }))
            }

            // console.log(newVal);
        }
    },

    created: function () {
        document.addEventListener('workOrderClose', this.onCloseWorkOrder)
        document.addEventListener('workOrderOpen', this.onOpenWorkOrder)
        document.addEventListener('trainScheduleSelectServiceWindow', this.onTrainScheduleSelectServiceWindow)
        document.addEventListener('chartSelectLabel', this.onChartSelectLabel)
        document.addEventListener('workOrderChangeStartTime', this.onWorkOrderChangeStartTime)
    },

    mounted: function () {
        this.initializeWorkOrder()

        // this.initEquipmentTypeIdModalValue();
        // this.generateMdnEquipmentModels();
        if (this.workOrder.equipmentTypesIds == null) {
            this.workOrder.equipmentTypesIds = []
        }
        if (this.initializeOnStart === true) {
            // console.log(this.WorkOrder);
            this.isContentInitialized = true

            this.toggleContentVisibility()
            document.dispatchEvent(new CustomEvent('workOrderInitializeOnStart', {
                detail: {
                    id: this.workOrder.id,
                    workOrder: this.workOrder
                }
            }))
        }

        if (this.type == 'service-request-mbn') {
            this.generateEasyPlanLocations()
        }

        if (this.type == 'pitstop') {
            this.maintenanceLocation = this.getMaintanceLocationName(this.workOrder.asset.maintenanceLocation)
            if (this.workOrder.tempWorkLocationId == null) {
                // this.tempWorkLocationId = this.workOrder.tempWorkLocationId;
                // this.tempRepairLocationId = this.workOrder.tempRepairLocationId;
                this.tempWorkLocationId = this.workOrder.asset.planningLocationId
            } else {
                this.tempWorkLocationId = this.workOrder.tempWorkLocationId
                // this.tempRepairLocationId = this.workOrder.tempRepairLocationId;
            }

            if (this.workOrder.tempRepairLocationId == null) {
                this.tempRepairLocationId = this.workOrder.asset.planningLocationId
            } else {
                // this.tempWorkLocationId = this.workOrder.tempWorkLocationId;
                this.tempRepairLocationId = this.workOrder.tempRepairLocationId
            }
        }

        if (['mbn-monitor-assigned', 'mbn-monitor-declined', 'mbn-monitor-logistic'].indexOf(this.type) !== -1) {
            // this.arrivalDate = this.monthDateTimeFormat(workOrder.arrivalDate);
            this.workOrder.arrivalDate = $date.toDateString(new Date(this.workOrder.arrivalDate))

            // console.log($date.toDateString(new Date(this.workOrder.arrivalDate)))
        }

        if (this.type == 'service-request-mbn') {
            this.maintenanceLocation = this.getMaintanceLocationName(this.workOrder.asset.maintenanceLocation)
        }

        if (this.type == 'mobile-teams') {
            this.getMobileTeamLocations()
        }

        setTimeout(() => {
            this.startWatchingTasks = true
        }, 1500)
    },

    beforeDestroy: function () {
        document.removeEventListener('workOrderClose', this.onCloseWorkOrder)
        document.removeEventListener('workOrderOpen', this.onOpenWorkOrder)
        document.removeEventListener('trainScheduleSelectServiceWindow', this.onTrainScheduleSelectServiceWindow)
        document.removeEventListener('chartSelectLabel', this.onChartSelectLabel)
        document.removeEventListener('workOrderChangeStartTime', this.onWorkOrderChangeStartTime)
    },

    methods: {
        replaceNbsps(str) {
            var re = new RegExp(String.fromCharCode(160), "g");
            return str.replace(re, " ");
        },
        getDuplicatesData(){
            let ids = [this.workOrder.serviceRequest.workOrderId];
            // let ids = [41830].toString();

            if(ids.length > 0){
				this._api.getWorkordersByIds(ids).then(res => {
                    this.duplicatesData = res
                })
            }
        },
        openOptionsModal(){
            this.displayOptionsModal = true;
            this.maintenanceStatus = this.workOrder.maintenanceStatus
            this.reasonMaintenance = this.workOrder.reasonMaintenance
            this.maintenanceLocation = this.workOrder.maintenanceLocation
        },
        saveOptions () {
            let data = {
                reasonMaintenance: this.reasonMaintenance,
                maintenanceLocation: this.maintenanceLocation,
                maintenanceStatus: this.maintenanceStatus,
                id: this.workOrder.id
            }

			this._api.saveAsset(data).then((response) => {
                this.displayOptionsModal = false
                this.$emit('changeAsset', data)
            })
        },
        checkTaskStatus () {
            if (this.workOrder.type !== 'PREIN') {
                if (this.workOrder.tasks && this.workOrder.tasks.length > 0) {
                    return true
                } else {
                    return false
                }
            } else {
                return true
            }
        },
        setTimeslotOnWoLevel () {
            if(!this.isContentInitialized){
                return;
            }
            this.backgroundRequestsProcessing = true
            let data
            console.log(this.timeslot);
            if (this.timeslot) {
                data = {
                    workOrderId: this.workOrder.id,
                    emplacementId: this.timeslot,
                    type: 'wo'
                }
            } else {
                data = {
                    workOrderId: this.workOrder.id,
                    type: 'wo'
                }
            }

            if (data.emplacementId !== null) {
				this._api.setEmplacementForWorkOrder(data).then((response) => {
                    let timeslotData = _.find(this.availableTimeslots, {'id': this.timeslot})

                    if (!data.emplacementId) {
                        data.emplacementId = null
                        this.workOrder.earliestPossibleStart = null
                        this.workOrder.lastFeasibleFinish = null
                    } else {
                        this.workOrder.earliestPossibleStart = timeslotData.emplacementStart
                        this.workOrder.lastFeasibleFinish = timeslotData.emplacementEnd
                        this.workOrder.maintenanceTrack = timeslotData.maintenanceTrack
                    }

                    if (this.workOrder.tasks) {
                        for (let i in this.workOrder.tasks) {
                            let task = this.workOrder.tasks[i]
                            let taskData = {
                                taskId: task.id,
                                emplacementId: data.emplacementId
                            }
                            task.serviceWindowEmplacementId = data.emplacementId

							this._api.setEmplacementForTask(taskData).then((response) => {
                                //
                            })
                        }
                    }

                    this.$emit('placeTimeslotOnChart', data)
                    this.onChangeWorkOrder()

                    setTimeout(() => {
                        this.backgroundRequestsProcessing = false
                    }, 1000)
                })
            } else {

            }
        },
        setTimeOnTaskLevel (data) {
			this._api.setEmplacementForTask(data).then((response) => {
                let timeslotData = _.find(this.availableTimeslots, {'id': data.emplacementId})

                let dataMerged = {
                    ...timeslotData,
                    ...data
                }

                let tasks = this.workOrder.tasks
                let task = _.find(tasks, {'id': data.taskId})

                task.tempStart = timeslotData.emplacementStart
                task.tempEnd = timeslotData.emplacementEnd

                this.$emit('placeTimeslotOnChart', dataMerged)
                this.onChangeWorkOrder()
            })
        },
        getMobileTeamLocations () {
            let arr = []
            for (let i = 0; i < this.locations.length; i++) {
                let currentLocation = this.locations[i]

                for (let j = 0; j < this.workOrder.trainSchedule.length; j++) {
                    if (currentLocation.id == this.workOrder.trainSchedule[j].location.id) {
                        arr.push(currentLocation)
                    }
                }
            }

            arr = _.uniq(arr)

            this.mobileTeamLocationsForWo = arr
        },
        saveLocationType () {
            this.displayModalLocationType = false
            // console.log(this.ntLocationType);

            this.workOrder.ntLocationType = this.ntLocationType
            // let workOrder = Object.assign({}, this.workOrder);

            let obj = {
                workOrderId: this.workOrder.id,
                ntLocationType: this.workOrder.ntLocationType
            }

			this._api.changeNtLocationType(obj).then(res => {
                this.checkNtLocationType()
            })
            // document.dispatchEvent(new CustomEvent('workOrderChange', {
            //     detail: {
            //         id: this.workOrder.id,
            //         workOrder
            //     }
            // }))
        },
        checkNtLocationType () {
            if (this.type == 'service-request-mbn') {
                if (this.workOrder.ntLocationType !== 'SB' && this.workOrder.ntLocationType !== 'GSL') {
                    this.isHidden = true
                    this.$emit('hideCharts')
                }
            } else if (this.type == 'pitstop') {
                if (this.workOrder.ntLocationType !== 'OB') {
                    this.isHidden = true
                    this.$emit('hideCharts')
                }
            } else if (this.type == 'mobile-teams') {
                if (this.workOrder.ntLocationType.substring(0, 3) !== 'KT-' || this.workOrder.ntLocationType.substring(0, 3) !== 'AUT') {
                    this.isHidden = true
                    this.$emit('hideCharts')
                }
            }
        },
        getEquipmentTypeName (id) {
            for (let i = 0; i < this.equipmentList.length; i++) {
                let currentId = this.equipmentList[i].id
                if (currentId == id) {
                    return this.equipmentList[i].name
                }
            }
        },
        checkIfPlanPitstopDisabled () {
            if (this.tempRepairLocationId !== null && this.tempWorkLocationId !== null && this.arrivalDate !== null) {
                return false
            } else {
                return true
            }
        },
        confirmPitstopPlan () {
            $loader.message = 'Plan bevestigen'
            this.onChangeWorkOrder(true)

            this.workOrder.arrivalDate = this.arrivalDate
            this.workOrder.tempWorkLocationId = this.tempWorkLocationId
            this.workOrder.tempRepairLocationId = this.tempRepairLocationId
            this.workOrder.isScheduled = true
            this.workOrder.isPitstopPlanned = true

            let obj = {
                wo: this.workOrder,
                plan: 'true'
            }
            this.$emit('putWorkOrder', obj)
            this.$emit('updateWorkOrder', this.workOrder)
        },
        mobileTeamEasyPlancheck () {
            if (this.workOrder.tasks && this.workOrder.tasks.length > 0) {
                if (this.tempWorkLocationId !== null && this.tempRepairLocationId !== null && this.mechanicId !== null) {
                    this.mobileTeamEasyPlan = true
                    this.$emit('addToPlan', this.workOrder.id)
                } else {
                    this.mobileTeamEasyPlan = false
                    this.$emit('removeFromPlan', this.workOrder.id)
                }
            } else {
                if (this.tempWorkLocationId !== null && this.tempRepairLocationId !== null) {
                    this.mobileTeamEasyPlan = true
                    this.$emit('addToPlan', this.workOrder.id)
                } else {
                    this.mobileTeamEasyPlan = false
                    this.$emit('removeFromPlan', this.workOrder.id)
                }
            }
        },
        getFullDeclinedReasonDescription (declinedReasonId) {
            let foundName = false
            for (let i = 0; i < this.declineReasonsServiceRequest.length; i++) {
                let current = this.declineReasonsServiceRequest[i]

                if (declinedReasonId && current.id == declinedReasonId) {
                    foundName = true
                    return current.name
                }
            }
            if (!foundName && declinedReasonId) {
                return declinedReasonId
            }
        },
        getMaintanceLocationName (maintenanceLocation) {
            let result
            if (maintenanceLocation == 'MAT') {
                result = 'MAT'
            } else if (maintenanceLocation == 'TRANS') {
                result = 'TRANS'
            } else {
                for (let i = 0; i < this.locations.length; i++) {
                    // console.log(maintenanceLocation, this.locations[i].locationNumber);
                    if (this.locations[i].id) {
                        if (parseInt(maintenanceLocation) == this.locations[i].locationNumber) {
                            result = this.locations[i].name

                            break
                        }
                    }
                }
            }

            // console.log(result, maintenanceLocation);
            return result
        },
        approveWo (woId, locationId) {
            let obj = {
                id: woId.toString(),
                locationId: localStorage.getItem('locationId')
            }
			this._api.approveWO(obj).then(res => {
                this.workOrder.isScheduled = true
            })
        },
        findLocationbyId(id){
            let locationName = _.find(this.locations, {id: id});
            if(locationName){
                return locationName;
            } else {
                return {
                    // name: "No location found. Location Id: " + id
                    name: ""
                }
            }
        },
        deleteWoQualification(id){
            for(let i = 0; i < this.workOrder.qualificationIds.length; i++){
                let currId = this.workOrder.qualificationIds[i];
                if(currId == id){
                    this.workOrder.qualificationIds.splice(i, 1);
                    this.addedQualificationIds.splice(i, 1);
                    break;
                }
            }
            this.getSelectedQualifications()
            // $workOrder.put(this.workOrder)
        },
        getSelectedQualifications () {
            // this.workOrder.qualificationIds = [5251, 5252];
            this.selectedQualifications = []

            if (this.workOrder.qualificationIds) {
                // this.workOrder.qualificationIds = [...this.selectedQualifications];
                this.addedQualificationIds = _.uniq([...this.workOrder.qualificationIds, ...this.addedQualificationIds])
            }

            // if(this.workOrder.qualificationIds == null){
            //     this.workOrder.qualificationIds = [];
            // }

            // console.log(this.addedQualificationIds);

            for (let i = 0; i < this.addedQualificationIds.length; i++) {
                let selectedQualificationId = this.addedQualificationIds[i]
                for (let j = 0; j < this.qualificationList.length; j++) {
                    if (selectedQualificationId == this.qualificationList[j].id) {
                        this.workOrder.qualificationIds.push(this.qualificationList[j].id)
                        this.selectedQualifications.push(this.qualificationList[j])
                    }
                }
            }

            this.workOrder.qualificationIds = _.uniq(this.workOrder.qualificationIds)

            // this.newQualification = null

            // console.log(this.selectedQualifications);
        },
        planAndRevert () {
            this.planServiceRequest()
            this.revertServiceRequest()
        },
        checkStatusAndBool (bool) {
            if (bool) {
                if (this.workOrder.status == 'GGK' || this.workOrder.status == 'INUITV') {
                    return false
                } else {
                    return true
                }
            } else {
                return false
            }
        },
        getMechanicsOfTask (task) {
            let mechanicsFound = this.getQualifiedMechanicsForTask(task)
            if (!mechanicsFound || mechanicsFound.length == 0) {
                return this.mechanics
            } else {
                return mechanicsFound
            }
        },
        getTaskSelectedEquipmentList (taskIndex) {
            // this.taskSelectedEquipmentList = [];

            let taskSelectedEquipments = this.tasks[taskIndex].equipments

            // console.log(this.tasks[taskIndex].equipments);

            for (let i = 0; i < taskSelectedEquipments.length; i++) {
                // console.log(taskSelectedEquipments[i].equipmentId);

                let selectedEquipmentId = taskSelectedEquipments[i].equipmentId

                for (let j = 0; j < this.equipmentList.length; j++) {
                    let currentId = this.equipmentList[j].id
                    if (currentId == selectedEquipmentId) {
                        this.taskSelectedEquipmentList.push(selectedEquipmentId)
                    }
                }
            }

            this.taskSelectedEquipmentList = _.uniq(this.taskSelectedEquipmentList);
        },
        placeSelectedEquipmentForTask(id){
            this.taskSelectedEquipmentList.push(id);
            this.taskSelectedEquipmentList = _.uniq(this.taskSelectedEquipmentList);

            // console.log(this.taskSelectedEquipmentList.length);
        },
        generateEasyPlanLocations(){
            // let easyPlanLocationsIds = this.workOrder.quickWinLocations;

            //TEST
            // this.workOrder.quickWinLocations = [3405, 3416];
            let easyPlanLocationsIds;
            if(this.workOrder.quickWinLocations !== null){
                easyPlanLocationsIds = Array.from(new Set(this.workOrder.quickWinLocations.map((x) => x.locationId)));
            } else {
                easyPlanLocationsIds = []
            }


            // console.log(this.locations.length);
            // TEST END
            if (this.locations) {
                for (let i = 0; i < this.locations.length; i++) {
                    let locationId = this.locations[i].id

                    if (_.includes(easyPlanLocationsIds, locationId)) {
                        this.easyPlanLocations.push(this.locations[i])
                    }
                }
            }
        },
        openAsset (event, id) {
            let startDate = this.$moment(this.todayDate)
            let endDateNext = this.$moment(this.todayDate).add(72, 'hours')
            let endDatePrev = this.$moment(this.todayDate).subtract(72, 'hours')
            let rangeNext = this.$moment().range(startDate, endDateNext)
            let rangePrev = this.$moment().range(endDatePrev, startDate)

			this._api.getWorkOrdersAsset(id).then(res => {
                this.assetWorkOrders = []
                let result = res

                for (let i = 0; i < result.length; i++) {
                    let currentWo = result[i]
                    this.assetWorkOrders.push(currentWo)
                }
                this.toggleContentVisibility(event)
            })
        },
        removeSelectedMbnEquipmentsFromList (arr, index) {
			return this.equipmentTypes.filter(item => !this.mbnEquipmentModels.find((model, ind) => model === item.id && index !== ind))
        },
        clearEmptyMbnEquipments () {
            let temp = []
            for (let i = 0; i < this.mbnEquipmentModels.length; i++) {
                if (this.mbnEquipmentModels[i] !== '' && this.mbnEquipmentModels[i] !== null) {
                    temp.push(this.mbnEquipmentModels[i])
                }
            }

            return temp
        },
        ifEquipmentIsFilled (index) {
            if (index > 0) {
                if (this.mbnEquipmentModels[index] !== '' && this.mbnEquipmentModels[index] !== null) {
                    return true
                } else if (this.mbnEquipmentModels[index - 1] !== '' && this.mbnEquipmentModels[index - 1] !== null) {
                    return true
                } else {
                    return false
                }
            } else {
                return true
            }
        },
        generateMdnEquipmentModels () {
            this.mbnEquipmentModels = []
            for (let i = 0; i < this.equipmentTypes.length; i++) {
                let model = ''
                var id = this.equipmentTypes[i].id
                var name = this.equipmentTypes[i].name

                // fill equipment models
                if (this.workOrder.equipmentTypesIds) {
                    for (let j = 0; j < this.workOrder.equipmentTypesIds.length; j++) {
                        if (this.workOrder.equipmentTypesIds[j] == id) {
                            model = id
                        }
                    }
                }

                this.mbnEquipmentModels.push(model)
            }
            this.mbnEquipmentModels = this.mbnEquipmentModels.sort(function (a, b) {
                if (a === '' || a === null) return 1
                if (b === '' || b === null) return -1
                if (a === b) return 0
                return a < b ? -1 : 1
            })
        },
        initEquipmentTypeIdModalValue () {
            if (this.workOrder.equipmentTypesIds !== null) {
                this.selectedEquipmentTypeId = this.workOrder.equipmentTypesIds[0]
            }
        },
        monthDateTimeFormat (date) {
            // formatDayMonthTimeStamp
            // console.log(date);
            if (date == null) {
                return 'Nog onbekend'
            } else {
                return $date.getDateDayMonthTimeNumbers(new Date(date))
            }

            // return date;
        },
        getMatchedLocationId (bool) {
            this.matchedLocationBool = bool
        },
        checkSubmitMBN () {
            this.onChangeWorkOrder(false, true)
        },
        /**
         * When the task in the workorder should change its start time in this component
         * @param {CustomEvent} eventArgs the event arguments
         */
        onWorkOrderChangeStartTime (eventArgs) {
            this.$nextTick(() => {
                if (this.type !== 'work-order') {
                    return
                }
                if (eventArgs.detail.id === this.workOrder.id) {
                    for (let index in this.tasks) {
                        let task = this.tasks[index]
                        if (task.id !== eventArgs.detail.task.id) {
                            continue
                        }
                        if (!eventArgs.detail.task.tempStart) {
                            this.startTimes[index] = null
                        }
                        else {
                            this.startTimes[index] = this.calculateStartTime(eventArgs.detail.task)
                        }
                        this.$forceUpdate()
                        return
                    }
                }
            })
        },

        /**
         * When the selected id changes in the chart
         * @param {CustomEvent} eventArgs the event arguments
         */
        onChartSelectLabel (eventArgs) {
            this.$nextTick(() => {
                if (eventArgs.detail.context !== 'material-number' || this.type !== 'service-request-mbn' || !this.contentVisible) {
                    return
                }
                this.tempWorkLocationId = eventArgs.detail.id
                this.tempRepairLocationId = eventArgs.detail.id
            })
        },

        /**
         * When the user selects a service window in the train schedule chart
         * @param {CustomEvent} eventArgs the event arguments
         */
        onTrainScheduleSelectServiceWindow (eventArgs) {
            this.$nextTick(() => {
                if (this.type !== 'service-request-mbn' || !this.contentVisible) {
                    return
                }
                this.tempWorkLocationId = eventArgs.detail.locationId
                this.tempRepairLocationId = eventArgs.detail.locationId
                this.arrivalDate = eventArgs.detail.arrivalDate
            })
        },

        /**
         * Whenever a work order changes
         */
        onChangeWorkOrder: _.debounce(
        function (test, saveMbn) {
            let workOrder = Object.assign({}, this.workOrder)

            workOrder.tempWorkLocationId = this.tempWorkLocationId

            workOrder.tempRepairLocationId = this.tempRepairLocationId

            if (this.arrivalDate == null) {
                workOrder.arrivalDate = null
            } else {
                workOrder.arrivalDate = $date.toDateObject(this.arrivalDate).toJSON()
            }

            // TODO should remove it later, when backend is ready.
            delete workOrder.tempRepairLocation
            delete workOrder.tempWorkLocation

            document.dispatchEvent(new CustomEvent('workOrderChange', {
                detail: {
                    id: this.workOrder.id,
                    workOrder
                }
            }))

            if (saveMbn) {
                if (this.matchedLocationBool) {
                    this.showMatchedLocationModal = true
                } else {
                    setTimeout(() => {
                        this.saveModalAssignServiceRequest()
                    }, 3000)
                }
            }

            this.$emit('generateChartData')
        }, 500),
        checkTimeslotsNNB () {
            let temp = this.availableTimeslots

            for (let i in temp) {
                let timeslot = temp[i]

                let start = this.$moment(timeslot.emplacementStart)
                let end = this.$moment(timeslot.emplacementEnd)
                if (end.diff(start, 'years', false) > 0) {
                    let value = this.$moment(start).format('DD MMM HH:mm') + ' - ' + 'nnb'

                    timeslot.value = value
                }
            }

            this.parsedTimeslots = temp
        },

        /**
         * Toggle the visibility of the content within the work order pane
         * @param {Event} event the event associated with the function call.
         */
        toggleContentVisibility (event) {
			console.log(1234)
            if (this.type == 'pitstop') {
                let contentVisible = this.contentVisible
                document.dispatchEvent(new CustomEvent('workOrderClose'))

                if (!this.isContentInitialized) {
                    this.isContentInitialized = true
                    this.getLinkedWorkorderList(this.workOrder.materialNumber, this.workOrder.waitingForWO)
                }

                if (contentVisible === false) {
                    this.contentVisible = true
                }
            } else {
                let contentVisible = this.contentVisible
                document.dispatchEvent(new CustomEvent('workOrderClose'))

                if (!this.isContentInitialized) {
                    this.isContentInitialized = true
                }

                if (contentVisible === false) {
                    this.contentVisible = true
                    this.checkTimeslotsNNB()
                    let taskIds = []
                    if (this.tasksSelectable) {
                        for (let taskIndex in this.tasks) {
                            let task = this.tasks[taskIndex]
                            taskIds.push(task.id)
                        }
                    }
                    document.dispatchEvent(new CustomEvent('selectedWorkOrderChange', {
                        detail: {
                            workOrder: this.workOrder
                        }
                    }))
                    document.dispatchEvent(new CustomEvent('selectedTaskIdsChange', {
                        detail: {
                            materialNumber: this.workOrder.materialNumber,
                            selectedTaskIds: taskIds
                        }
                    }))
                    if (this.type === 'service-request' && !this.workOrder.isSeen) {
                        let workOrder = Object.assign({}, this.workOrder)
                        workOrder.isSeen = true
						this._api.saveWorkOrder(workOrder)
                    }

                    if(this.type == 'service-request-mbn'){
                        this.getLinkedWorkorderList(this.workOrder.materialNumber, this.workOrder.waitingForWO);
                        this.getDuplicatesData();
                    }

                    // document.dispatchEvent(new CustomEvent('workOrderChange', {
                    //     detail: {
                    //         workOrder: this.workOrder
                    //     }
                    // }))
                }
                else {
                    document.dispatchEvent(new CustomEvent('selectedWorkOrderChange', {
                        detail: {
                            workOrder: null
                        }
                    }))
                    document.dispatchEvent(new CustomEvent('selectedTaskIdsChange', {
                        detail: {
                            materialNumber: this.workOrder.materialNumber,
                            selectedTaskIds: []
                        }
                    }))


                }
            }

            if (this.type == 'work-order') {
                this.$emit('scrollToMaterial', this.workOrder.materialNumber)
            }
        },

        /**
         * Close the work order components' menu's.
         */
        onCloseWorkOrder () {
            this.contentVisible = false
        },

        /**
         * Open the work order components' menu's.
         * @param {CustomEvent} eventArgs the event arguments
         */
        onOpenWorkOrder (eventArgs) {
            if (this.workOrder.id !== eventArgs.detail.id) {
                return
            }
            if (!this.isContentInitialized) {
                this.isContentInitialized = true
            }

            this.contentVisible = true
        },

        getLinkedWorkorderList (materialNumber, waitingForWO) {
            this.sameTrainNumbers = []
            this.sameTrainNumber = waitingForWO
            this.$emit('checkWOLinked', this.sameTrainNumber)
			this._api.getWoByMaterialNumber(materialNumber).then(res => {
                for (let i = 0; i < res.length; i++) {
                    let item = {
                        name: res[i].WO + ` (` + res[i].description + ')',
                        id: res[i].WO,
                        description: res[i].description
                    }

                    if (res[i].WO !== this.workOrder.WO) {
                        this.sameTrainNumbers.push(item)
                    }
                }
            })
        },

        getSameTrainNumbers (materialNumber, waitingForWO) {
            this.openSameTrainNumberModal(null)
        },

        getDependentInfo (woNumber) {
            let obj = null

            for (let i = 0; i < this.sameTrainNumbers.length; i++) {
                if (this.sameTrainNumbers[i].id == woNumber) {
                    obj = {
                        name: this.sameTrainNumbers[i].id,
                        description: this.sameTrainNumbers[i].description
                    }

                    break
                }
            }

            return obj
        },

        saveModalSameTrainNumber () {
            this.displaySameTrainNumberModal = false

            if (this.sameTrainNumber) {
                let obj = {
                    WO: this.workOrder.WO,
                    waitingForWO: this.sameTrainNumber
                }

                this._api.linkWorkorder(obj).then(response => {
                    this.workOrder.waitingForWO = this.sameTrainNumber
                    this.$emit('checkWOLinked', this.sameTrainNumber)
                    this.$emit('workOrderToBottom', this.workOrder.WO)
                    document.dispatchEvent(new CustomEvent('workOrderClose'))
                })
            } else {
                let obj = {
                    WO: this.workOrder.WO
                }

				this._api.unLinkWorkorder(obj).then(response => {
                    this.workOrder.waitingForWO = null
                    this.$emit('checkWOLinked', this.sameTrainNumber)
                    this.$emit('removeWorkorderFromBottom', this.workOrder.WO)
                    document.dispatchEvent(new CustomEvent('workOrderClose'))
                })
            }


        },

        /**
         * When the mechanic of a task has changed
         */
        onChangeMechanic () {
            for (let taskIndex in this.tasks) {
                let task = this.tasks[taskIndex]
                let mechanicId = this.mechanicIds[taskIndex]
                if (mechanicId !== task.mechanicId) {
                    task.mechanicId = mechanicId
                    document.dispatchEvent(new CustomEvent('workOrderTaskChange', {
                        detail: {
                            materialNumber: this.workOrder.materialNumber,
                            task,
                            workOrderId: this.workOrder.id
                        }
                    }))
                }
            }
        },

        /**
         * When the start time of a task has changed
         */
        onChangeStartTime () {
            for (let taskIndex in this.tasks) {
                let task = this.tasks[taskIndex]
                let startTime = this.startTimes[taskIndex]
                let wasNull = !task.tempStart
                if (startTime !== this.calculateStartTime(task)) {
                    let date = $date.toDateObject($date.toDateString(new Date(this.startDateChart.substring(0, 13) + ':00:00')).substring(0, 11) + startTime)
                    let taskStartXCoordinate = (date.getTime() - $date.toDateObject(this.startDateChart.substring(0, 13) + ':00:00').getTime()) / 60 / 60 / 1000
                    if (taskStartXCoordinate < 0) {
                        date.setTime(date.getTime() + 24 * 60 * 60 * 1000)
                    }
                    task.tempStart = date.toJSON()
                    document.dispatchEvent(new CustomEvent('workOrderTaskChange', {
                        detail: {
                            materialNumber: this.workOrder.materialNumber,
                            task,
                            workOrderId: this.workOrder.id,
                            wasNull

                        }
                    }))

                    let taskIds = []
                    if (this.tasksSelectable) {
                        for (let taskIndex in this.tasks) {
                            let task = this.tasks[taskIndex]
                            taskIds.push(task.id)
                        }
                    }
                    document.dispatchEvent(new CustomEvent('selectedWorkOrderChange', {
                        detail: {
                            workOrder: this.workOrder
                        }
                    }))
                    document.dispatchEvent(new CustomEvent('selectedTaskIdsChange', {
                        detail: {
                            materialNumber: this.workOrder.materialNumber,
                            selectedTaskIds: taskIds
                        }
                    }))
                }
            }
        },

        getTasksTimeslots (tasks) {
            let arr = []
            for (let index in tasks) {
                let task = tasks[index]

                arr.push(task.serviceWindowEmplacementId)
            }

            return arr
        },

        getDefaultMechanic () {
            let locationId = parseInt(localStorage.getItem('locationId'))
            let locationObj = _.find(this.locations, {'id': locationId})
            let defaultMechanicId = locationObj.defaultAssignmentPersonId
            // let mechanic = _.find(this.mechanics, {'personId': defaultMechanicId});
            let mechanic = this.mechanics.find(obj => {
                if (obj) {
                    return obj.personId == defaultMechanicId
                }
            })

            if (mechanic) {
                return mechanic.id
            } else {
                return null
            }
        },

        /**
         * Initialize the work order
         */
        initializeWorkOrder () {
            this.tasks = this.workOrder.tasks || []

            if (this.type === 'work-order') {
                this.maintenanceTrack = this.workOrder.maintenanceTrack
                this.timeslot = this.workOrder.serviceWindowEmplacementId
                if (this.workOrder.tasks) {
                    this.timeslotTasks = this.getTasksTimeslots(this.workOrder.tasks)
                }
            }
            for (let index in this.tasks) {
                let task = this.tasks[index]
                if (this.type === 'work-order') {
                    if (!task.tempStart) {
                        this.startTimes[index] = null
                    }
                    else {
                        this.startTimes[index] = this.calculateStartTime(task)
                    }
                }

                if (this.type === 'work-order') {
                    if (this.mechanicIds[index] == null) {
                        this.mechanicIds[index] = this.getDefaultMechanic()
                    } else {
                        this.mechanicIds[index] = task.mechanicId
                    }
                }
            }

            if (['service-request-mbn', 'mbn-monitor-unassigned', 'mobile-teams', 'pitstop'].indexOf(this.type) !== -1) {
                this.arrivalDate = this.workOrder.arrivalDate ? $date.toDateString(new Date(this.workOrder.arrivalDate)) : null
                this.defectOnLocation = this.workOrder.defectOnLocation || null
                this.tempWorkLocationId = this.workOrder.tempWorkLocationId || null
                this.tempRepairLocationId = this.workOrder.tempRepairLocationId || null
            } else if (['mbn-monitor-assigned', 'mbn-monitor-declined', 'mbn-monitor-logistic'].indexOf(this.type) !== -1) {
                this.arrivalDate = this.workOrder.arrivalDate ? $date.toDateString(new Date(this.workOrder.arrivalDate)) : null
                this.defectOnLocation = this.workOrder.defectOnLocation || null
                this.tempWorkLocationId = this.workOrder.workLocationId || null
                this.tempRepairLocationId = this.workOrder.repairLocationId || null
            }
            //prevent watchers fire ton init.
            setTimeout(() => {
                this.workOrderInitialized = true
            }, 500)
        },

        /**
         * Calculate the start time for a task
         * @param {object} task the task
         */
        calculateStartTime (task) {
            let taskStartXCoordinate = ((new Date(task.tempStart)).getTime() - $date.toDateObject(this.startDateChart.substring(0, 13) + ':00:00').getTime()) / 60 / 60 / 1000
            let lengthTask = task.leadTimeMinutes / 60
            if (taskStartXCoordinate + lengthTask >= 0 && taskStartXCoordinate < 24) {
                return $date.toDateString(new Date(task.tempStart)).substring(11, 16)
            }
            return null
        },

        /**
         * Open lead time minutes modal
         */
        openLeadTimeMinutesModal (taskIndex) {
            this.taskIndex = taskIndex
            if (taskIndex !== null) {
                this.leadTimeMinutes = this.tasks[this.taskIndex].importedLeadTime
            }
            else {
                this.leadTimeMinutes = this.workOrder.totalLeadTimeMinutes
            }

            this.displayModalLeadTime = true
        },

        // Open matched location modal
        openMatchedLocation () {
            this.showMatchedLocationModal = true
        },
        /**
         * Save the lead time minutes
         */
        saveLeadTimeMinutes () {
            // console.log(this.tasks[this.taskIndex]);
            this.workOrder.leadTimeManual = true
            if (this.taskIndex !== null) {
                this.tasks[this.taskIndex].leadTimeMinutes = this.leadTimeMinutes
                this.tasks[this.taskIndex].manualLeadTime = this.leadTimeMinutes
                this.tasks[this.taskIndex].importedLeadTime = this.leadTimeMinutes

                let totalLeadTimeMinutes = 0

                for (let i = 0; i < this.workOrder.tasks.length; i++) {
                    let current = this.workOrder.tasks[i]

                    let taskLeadTime
                    current.leadTimeMinutes = current.importedLeadTime
                    if (current.leadTimeMinutes == null) {
                        taskLeadTime = 0
                    } else {
                        taskLeadTime = parseInt(current.leadTimeMinutes)
                    }

                    totalLeadTimeMinutes = parseInt(totalLeadTimeMinutes) + parseInt(taskLeadTime)
                }

                this.workOrder.totalLeadTimeMinutes = totalLeadTimeMinutes

                let obj = {
                    wo: this.workOrder,
                    task: this.tasks[this.taskIndex]
                }

                this.$emit('reinitWorkOrders', obj)

                document.dispatchEvent(new CustomEvent('workOrderTaskChange', {
                    detail: {
                        materialNumber: this.workOrder.materialNumber,
                        task: this.tasks[this.taskIndex],
                        workOrderId: this.workOrder.id
                    }
                }))
            } else if (this.tasks.length > 0) {
                let remainder = this.leadTimeMinutes % this.tasks.length
                for (let taskIndex in this.tasks) {
                    let task = this.tasks[taskIndex]
                    task.leadTimeMinutes = Math.floor(this.leadTimeMinutes / this.tasks.length)
                    task.manualLeadTime = Math.floor(this.leadTimeMinutes / this.tasks.length)
                    if (remainder > 0) {
                        task.leadTimeMinutes++
                        task.manualLeadTime++
                        remainder--
                    }
                    document.dispatchEvent(new CustomEvent('workOrderTaskChange', {
                        detail: {
                            materialNumber: this.workOrder.materialNumber,
                            task: this.tasks[taskIndex],
                            workOrderId: this.workOrder.id
                        }
                    }))
                }
            } // else {}

            this.workOrder.totalLeadTimeMinutes = this.leadTimeMinutes
            let workOrder = Object.assign({}, this.workOrder)
            document.dispatchEvent(new CustomEvent('workOrderChange', {
                detail: {
                    id: this.workOrder.id,
                    workOrder
                }
            }))

            this.displayModalLeadTime = false
        },

        /**
         * Open equipment modal
         */
        openEquipmentModal (taskIndex) {
            this.taskIndex = taskIndex
            this.addedEquipmentIds = []
            this.deletedEquipmentIds = []
            this.displayModalEquipment = true

            if (taskIndex !== null) {
                this.equipment = this.tasks[this.taskIndex].equipments || []
            }
            else {
                this.equipment = []
                for (let taskIndex in this.tasks) {
                    let task = this.tasks[taskIndex]
                    this.equipment = this.equipment.concat(task.equipments)
                }
            }
            if (this.type == 'service-request-mbn' || this.type == 'mbn-monitor-unassigned') {
                this.generateMdnEquipmentModels()
            } else if (this.type == 'work-order') {
                this.getTaskSelectedEquipmentList(taskIndex)
            } else if (this.type == 'mobile-teams') {
                this.generateMdnEquipmentModels()
                this.getTaskSelectedEquipmentList(taskIndex)
            }
        },

        /**
         * Save the equipment
         */
        saveEquipment (taskIndex) {
            this.displayModalEquipment = false
            this.$emit('preventPlaning', true)
            this.workOrder.equipmentTypeManual = true
            // this.workOrder.equipmentTypesIds = [];
            ///
            if (this.type == 'service-request-mbn' || this.type == 'mbn-monitor-unassigned') {
                this.workOrder.equipmentTypesIds = this.clearEmptyMbnEquipments()
                // console.log(this.clearEmptyMbnEquipments())

                this.workOrder.equipmentTypesIds = this.clearEmptyMbnEquipments()

                this.onChangeWorkOrder()

                this.$emit('updateLocationsChart', this.workOrder)
            }

            if (this.type == 'work-order') {
                let taskId = this.tasks[this.taskIndex].id
                for (let i = 0; i < this.taskSelectedEquipmentList.length; i++) {
                    let equipmentId = this.taskSelectedEquipmentList[i]
                    this._api.createTaskEquipment({
                        taskId: taskId,
                        equipmentId: equipmentId
                    }).then(res => {
                        setTimeout(() => {
                            this.$emit('preventPlaning', false)
                        }, 1500)
                    })
                }
            }
        },
        openLocationTypeModal () {
            this.displayModalLocationType = true
        },

        openSameTrainNumberModal () {
            this.displaySameTrainNumberModal = true
        },
        /**
         * Open qualifications modal
         */
        openQualificationsModal (taskIndex) {
            // console.log(this.workOrder.id);
            this.taskIndex = taskIndex
            if (this.type == 'service-request-mbn' || this.type == 'mbn-monitor-unassigned') {
                this.getSelectedQualifications()
            } else {
                if (taskIndex) {
                    this.qualifications = this.tasks[taskIndex].qualifications || []
                }
                else {
                    this.qualifications = []
                    for (let taskIndex in this.tasks) {
                        let task = this.tasks[taskIndex]
                        this.qualifications = this.qualifications.concat(task.qualifications)
                    }
                }
            }

            this.displayModalQualifications = true
        },

        /**
         * Save the qualification modal
         */
        saveQualifications () {
            this.displayModalQualifications = false

            this.workOrder.qualificationManual = true

            if (this.tasks && this.tasks.length > 0) {
                // let taskIndices = this.taskIndex === null ? this.tasks.map((x, i) => i) : [this.taskIndex]
                let obj = {
                    id: this.tasks[0].id,
                    qualificationIds: []
                }
                // console.log(this.totalTaskQualifications);
                for (let i = 0; i < this.totalTaskQualifications.length; i++) {
                    obj.qualificationIds.push(this.totalTaskQualifications[i].qualificationId)
                }
                // console.log(obj)

                this._api.saveQualificationTask(obj)
                this.onChangeWorkOrder()
            } else {
                let arr = []
                for (let i = 0; i < this.selectedQualifications.length; i++) {
                    arr.push(this.selectedQualifications[i].id)
                }

                this.workOrder.qualificationIds = arr
                this.onChangeWorkOrder()
                // console.log(arr)
            }

            let workOrder = Object.assign({}, this.workOrder)
            document.dispatchEvent(new CustomEvent('workOrderChange', {
                detail: {
                    id: this.workOrder.id,
                    workOrder
                }
            }))
        },

        /**
         * Open the decline service request modal
         */
        openDeclineServiceRequestModal () {
            this.displayModalDeclineServiceRequest = true
        },

        /**
         * Decline the service request
         */
        saveModalDeclineServiceRequest () {
            if (!this.declineReasonServiceRequest || this.declineReasonsServiceRequest.filter(x => x.id === this.declineReasonServiceRequest).length === 0) {
                $snackbar.addWarning('Gelieve een reden op te geven.')
                return
            }

            this.displayModalDeclineServiceRequest = false
            $loader.message = 'Service aanvraag weigeren'
            this._api.declineStatus(this.workOrder.serviceRequest.id, this.declineReasonServiceRequest).then(res => {
                $loader.message = null
                $snackbar.add('Service aanvraag geweigerd.')
                this.isHidden = true
            }).catch(response => {
                $loader.message = null
                $snackbar.addWarning('De service aanvraag kon niet worden geweigerd, gelieve het later nogmaals te proberen.')
            })
        },

        /**
         * Open the decline service request modal
         */
        openAssignServiceRequestModal () {
            this.displayModalAssignServiceRequest = true
        },

        /**
         * Decline the service request
         */
        saveModalAssignServiceRequest () {
            $loader.message = 'Service aanvraag toewijzen'
            this.hideWoAfterAssign = true
            this.$emit('hideCharts')

            this.displayModalAssignServiceRequest = false
            this._api.assignSR(this.workOrder.id, 'TOEWIJZING').then(response => {
                $loader.message = null
                $snackbar.add('Service aanvraag toegewezen.')

                this.isHidden = true
            }).catch(response => {
                $loader.message = null
                $snackbar.addWarning('De service aanvraag kon niet worden geweigerd, gelieve het later nogmaals te proberen.')
            })
        },

        /**
         * Plan a service request
         */
        planServiceRequest () {
            if (this.$route.name === 'ServiceRequestsSB') {
                this.$router.push({
                    name: 'WorkOrders',
                    params: {
                        serviceRequestId: this.workOrder.serviceRequest.id
                    }
                })
            }
            else if (this.$route.name === 'Monitor') {
                setTimeout(() => {
                    this.$router.push({
                        name: 'ServiceRequestsMBN',
                        params: {
                            serviceRequestId: this.workOrder.serviceRequest.id
                        }
                    })
                }, 1000)
            }
        },

        /**
         * Get the color for the calendar icon
         *
         * should be green if
         *      - All tasks are planned
         *      - No tasks have conflicts with the service window
         *
         * should be red if
         *      - Any task is planned but has a conflict with the service window
         *
         * should be none if
         *      - Not all tasks are planned and there is no conflicts with the service window
         */
        getCalendarIconColor () {
            if (this.tasks.length > 0) {
                let allTasksPlanned = true
                let conflictServiceWindow = false

                for (let taskIndex in this.tasks) {
                    let task = this.tasks[taskIndex]
                    if (task.tempStart !== null) {
                        if (task.conflictServiceWindow === true) {
                            conflictServiceWindow = true
                        }
                    }
                    else {
                        allTasksPlanned = false
                    }
                }

                if (!allTasksPlanned && this.isWorkOrderSentToMaximo()) {
                    return 'none'
                }
                else if (allTasksPlanned && this.isWorkOrderSentToMaximo()) {
                    return '#C5C5CB'
                }
                else if (allTasksPlanned && !conflictServiceWindow) {
                    return '#0B9126'
                }
                else if (conflictServiceWindow) {
                    return '#DC0000'
                }
                return 'none'
            } else {
                return 'none'
            }
        },
        getCalendarIconTitle () {
            if (this.tasks.length > 0) {
                let allTasksPlanned = true
                let conflictServiceWindow = false

                for (let taskIndex in this.tasks) {
                    let task = this.tasks[taskIndex]
                    if (task.tempStart !== null) {
                        if (task.conflictServiceWindow === true) {
                            conflictServiceWindow = true
                        }
                    }
                    else {
                        allTasksPlanned = false
                    }
                }

                if (!allTasksPlanned && this.isWorkOrderSentToMaximo()) {
                    return ''
                }
                else if (allTasksPlanned && this.isWorkOrderSentToMaximo()) {
                    return ''
                }
                else if (allTasksPlanned && !conflictServiceWindow) {
                    return 'Alle taken passen binnen service window'
                }
                else if (conflictServiceWindow) {
                    return 'Let op: er staan taken gepland buiten service window'
                }
                return ''
            } else {
                return ''
            }
        },

        /**
         * Get the color for the check mark icon
         *
         * should be green if
         *      - All tasks are planned
         *      - No tasks have conflicts with the mechanic
         *
         * should be red if
         *      - Any task is planned but has a conflict with the mechanic
         *
         * should be none if
         *      - Not all tasks are planned and there is no conflicts with the mechanic
         */
        getCheckMarkIconColor () {
            if (this.tasks.length > 0) {
                let allTasksPlanned = true
                let conflictMechanic = false

                for (let taskIndex in this.tasks) {
                    let taskObject = this.tasks[taskIndex]
                    if (taskObject.tempStart !== null && taskObject.mechanicId !== null) {
                        if (taskObject.conflictMechanic === true) {
                            conflictMechanic = true
                        }
                    }
                    else {
                        allTasksPlanned = false
                    }
                }

                if (!allTasksPlanned && this.isWorkOrderSentToMaximo()) {
                    return 'none'
                }
                else if (allTasksPlanned && this.isWorkOrderSentToMaximo()) {
                    return '#C5C5CB'
                }
                else if (allTasksPlanned && !conflictMechanic) {
                    return '#0B9126'
                }
                else if (conflictMechanic) {
                    return '#DC0000'
                }
                return 'none'
            } else {
                return 'none'
            }
        },
        getCheckMarkIconTitle () {
            if (this.tasks.length > 0) {
                let allTasksPlanned = true
                let conflictMechanic = false

                for (let taskIndex in this.tasks) {
                    let taskObject = this.tasks[taskIndex]
                    if (taskObject.tempStart !== null && taskObject.mechanicId !== null) {
                        if (taskObject.conflictMechanic === true) {
                            conflictMechanic = true
                        }
                    }
                    else {
                        allTasksPlanned = false
                    }
                }

                if (!allTasksPlanned && this.isWorkOrderSentToMaximo()) {
                    return ''
                }
                else if (allTasksPlanned && this.isWorkOrderSentToMaximo()) {
                    return ''
                }
                else if (allTasksPlanned && !conflictMechanic) {
                    return 'Alle taken zijn correct toegewezen'
                }
                else if (conflictMechanic) {
                    return 'Let op: er zijn taken niet correct toegewezen'
                }
                return ''
            } else {
                return ''
            }
        },

        /**
         * Delete a task equipment
         * @param {object} taskEquipment the task equipment object
         */
        deleteTaskEquipment (taskEquipment) {
            // console.log(taskEquipment);
            // console.log(this.taskIndex);

            let idsForDelete = []

            for (let i = 0; i < this.tasks[this.taskIndex].equipments.length; i++) {
                let item = this.tasks[this.taskIndex].equipments[i]
                let equipmentId = item.equipmentId

                if (equipmentId == taskEquipment.id) {
                    idsForDelete.push(item.id)
                    this.tasks[this.taskIndex].equipments.splice(i, 1)
                }
            }

            for (let i = 0; i < this.taskSelectedEquipmentList.length; i++) {
                let currentEquipmentId = this.taskSelectedEquipmentList[i]

                // console.log(currentEquipmentId, taskEquipment.id);
                if (currentEquipmentId == taskEquipment.id) {
                    this.taskSelectedEquipmentList.splice(i, 1)
                }
            }

            for (let i = 0; i < idsForDelete.length; i++) {
                let id = idsForDelete[i]
				this._api.deleteTaskEquipment(id)
            }
        },

        /**
         * Delete a task qualification
         * @param {object} taskQualification the task qualification object
         */
        deleteTaskQualification (taskQualification) {
            if (this.addedQualificationIds.indexOf(taskQualification.qualification.id) !== -1) {
                this.addedQualificationIds.splice(this.addedQualificationIds.indexOf(taskQualification.qualification.id), 1)
            }
            else {
                this.deletedQualificationIds.push(taskQualification.qualification.id)
            }

            let taskIndices = this.taskIndex === null ? this.tasks.map((x, i) => i) : [this.taskIndex]

            for (let taskIndicesIndex in taskIndices) {
                let taskIndex = taskIndices[taskIndicesIndex]
                document.dispatchEvent(new CustomEvent('workOrderTaskQualificationsChange', {
                    detail: {
                        materialNumber: this.workOrder.materialNumber,
                        task: this.tasks[taskIndex],
                        deletedQualificationIds: this.deletedQualificationIds
                    }
                }))
            }
        },

        checkIfTasksContainsSR () {
            // console.log(this.tasks);
            let result = false
            for (let taskIndex in this.tasks) {
                let task = this.tasks[taskIndex]
                // console.log(task.isSentToMaximo);
                if (task.isServiceRequest === true) {
                    result = true
                    break
                }
            }
            return result
        },

        /**
         * Check if all the tasks within the workorder are sent to maximo
         */
        isWorkOrderSentToMaximo () {
            let result = true
            if (this.tasks.length > 0) {
                for (let taskIndex in this.tasks) {
                    let task = this.tasks[taskIndex]
                    // console.log(task.isSentToMaximo);
                    if (task.isSentToMaximo === false) {
                        result = false
                        break
                    }
                }
            } else {
                result = false
            }
            if (this.workOrder.isScheduled && this.type !== 'service-request-mbn') {
                result = true
            } else {
                result = false
            }
            return result
        },
        /**
         * Toggle the B-regeling
         */
        toggleBRegeling () {
            if (this.type !== 'service-request-mbn' && this.type !== 'pitstop') {
                return
            }


            this.workOrder.bRegeling = !this.workOrder.bRegeling
            let workOrder = Object.assign({}, this.workOrder)

            // workOrder.bRegeling = !workOrder.bRegeling;
            // this.workOrder.bRegeling = !workOrder.bRegeling;

            let NTKENMERK1 = this.workOrder.NTKENMERK1 || ''
            if (this.workOrder.bRegeling === true && NTKENMERK1.indexOf('B') === -1) {
                NTKENMERK1 += 'B'
            }
            else if (this.workOrder.bRegeling === false && NTKENMERK1.indexOf('B') !== -1) {
                NTKENMERK1 = NTKENMERK1.replace('B', '')
            }

            this.workOrder.NTKENMERK1 = NTKENMERK1

			this._api.createWorkOrder(workOrder)
        },

        /**
         * Reverts the service request
         */
        revertServiceRequest () {
            if (this.workOrder.bRegeling) {
                this.workOrder.bRegeling = false
            }

            document.dispatchEvent(new CustomEvent('revertServiceRequest', {
                detail: {
                    workOrder: this.workOrder
                }
            }))
        },

        /**
         * Format the date for the MBN monitor page
         */
        formatDateMBNMonitor () {
            if (!this.workOrder.dueDate) {
                return 'N/A'
            }
            let date = new Date(this.workOrder.dueDate)
            return date.getDate() + ' ' + $date.monthNamesShort[date.getMonth()]
        },

        /**
         * Get the taskIds belonging to an equipment
         * @param {number} equipmentId the id of the equipment
         */
        getTaskIdsForEquipment (equipmentId) {
            let returnString = ''
            if (this.taskIndex === null) {
                taskLoop: for (let taskIndex in this.tasks) {
                    let task = this.tasks[taskIndex]
                    for (let taskEquipmentIndex in task.equipments) {
                        let taskEquipment = task.equipments[taskEquipmentIndex]
                        if (taskEquipment.equipment.id === equipmentId) {
                            returnString += task.taskOrder + ', '
                            continue taskLoop
                        }
                    }
                }
            }
            return returnString.length > 0 ? '(' + returnString.substring(0, returnString.length - 2) + ')' : returnString
        },

        /**
         * Get the taskIds belonging to an qualification
         * @param {number} qualificationId the id of the qualification
         */
        getTaskIdsForQualification (qualificationId) {
            let returnString = ''
            if (this.taskIndex === null) {
                taskLoop: for (let taskIndex in this.tasks) {
                    let task = this.tasks[taskIndex]
                    for (let taskQualificationIndex in task.qualifications) {
                        let taskQualification = task.qualifications[taskQualificationIndex]
                        if (taskQualification.qualification.id === qualificationId) {
                            returnString += task.taskOrder + ', '
                            continue taskLoop
                        }
                    }
                }
            }
            return returnString.length > 0 ? '(' + returnString.substring(0, returnString.length - 2) + ')' : returnString
        },

        /**
         * Open the workorder in maximo
         */
        openWorkOrderInMaximo (event) {
            window.open(env.maximoURL + this.workOrder.WO, '_blank')
        },
        openAssetWorkOrderInMaximo (wo) {
            window.open(env.maximoURL + wo, '_blank')
        }
    }
}
</script>

<template>
	<div class="work-order-container" :data-work-order-id="this.workOrder && this.workOrder.id ? 'work-order-' + this.workOrder.id : null" v-if="!isHidden">
		<template v-if="type === 'service-request-mbn'">
			<div class="work-order" :class="{'show': this.forceContentVisible !== undefined ? this.forceContentVisible : this.contentVisible}">
				<div class="work-order-top"
					 :class="{'sent-to-maximo': isWorkOrderSentToMaximo() || this.workOrder.waitingForWO !== null}"
				>
					<div class="col href" @click="openWorkOrderInMaximo(event)">{{workOrder.WO}}</div>
					<div class="col" title="Stel/stam nummer" @click="toggleContentVisibility($event)"><icon name="trein" size="30" style="margin-top: -5px;" :color="isWorkOrderSentToMaximo() || this.workOrder.waitingForWO !== null ? '#c5c5cb' : '#3a3b3c'"/>{{workOrder.materialNumber}}</div>
					<div class="col" @click="toggleContentVisibility($event)">{{ monthDateTimeFormat(workOrder.dueDate) }}</div>

					<div class="col description" :title="workOrder.description">
						{{workOrder.description}}
					</div>

					<div class="col easy-plan" title="Werkorder is gemakkelijk te plannen" v-if="workOrder.quickWinLocations !== null && workOrder.quickWinLocations.length > 0 ">
						<div class="icon">
							<icon name="vinkje" size="30" color="rgb(0, 121, 211)" transition="all 0.3s ease"/>
						</div>

						<div class="easy-plan-locations">
							<ul>
								<li v-for="item in easyPlanLocations">
									{{item.name}}
								</li>
							</ul>
						</div>
					</div>
					<div class="col right" @click="toggleContentVisibility($event)">

						<div class="icons">
							<icon name="chevron-neerwaarts" size="60" color="rgb(0, 121, 211)" transition="all 0.3s ease"/>
						</div>
					</div>
				</div>

				<div class="work-order-content" v-if="isContentInitialized" v-show="forceContentVisible !== undefined ? forceContentVisible : contentVisible">

					<div class="task">
						<div class="task-title">
							<div class="square" title="Taakstatus">
								{{workOrder.ntLocationType}}
							</div>
							<div class="description">
								<div class="col" title="Doorlooptijd werkorder" @click="toggleContentVisibility($event)"><icon name="klok" size="33" style="margin-top: -6.5px;" :color="isWorkOrderSentToMaximo() ? '#C5C5CB' : '#3A3B3C'"/>{{workOrder.totalLeadTimeMinutes || 0}} min</div>
							</div>
						</div>
						<div class="task-content">
							<TreeSelect
								:disabled="this.workOrder.waitingForWO !== null"
								v-model="tempWorkLocationId"
								:options="locationsData"
								options-label="name"
								additionalSearch="station"
								icon="lokatie_W"
								label="Kies werklocatie"
								class="picker-container"
								:always-open="true"
							/>
							<TreeSelect
								:disabled="this.workOrder.waitingForWO !== null"
								v-model="tempRepairLocationId"
								:options="locationsData"
								options-label="name"
								additionalSearch="station"
								icon="lokatie_R"
								label="Kies reparatielocatie"
								class="picker-container"
								:always-open="true"
							/>
							<DateTimePicker label="Kies aankomsttijd" :disabled="this.workOrder.waitingForWO !== null" :icon="true" v-model="arrivalDate" class="picker-container" />
							<!-- <picker disabled="true" icon="alert" label="Defect op locatie" v-model="defectOnLocation" type="text" /> -->

							<TextInput  :disabled="true" icon="lokatie" placeholder="Maintenance location" v-model="maintenanceLocation" class="picker-container" />
						</div>
						<div class="buttons">
							<div class="button" @click="openLeadTimeMinutesModal(null)" v-if="canEditLeadTime" :class="{'disabled': workOrder.waitingForWO !== null}">
								<icon name="klok" size="40" title="Doorlooptijd taak" :color="this.workOrder.waitingForWO !== null ? '#3A3B3C' : '#0079D3'"/>
							</div>
							<div class="button" @click="openQualificationsModal(null)" :class="{'disabled': workOrder.waitingForWO !== null}">
								<icon name="kwalificatie":color="this.workOrder.waitingForWO !== null ? '#3A3B3C' : '#0079D3'" size="40" title="Kwalificaties"/>
							</div>
							<div class="button" @click="openEquipmentModal(null)" :class="{'disabled': workOrder.waitingForWO !== null}">
								<icon name="ladder" :color="this.workOrder.waitingForWO !== null ? '#3A3B3C' : '#0079D3'" size="40" title="Outillage" />
							</div>
							<div class="button" @click="openLocationTypeModal(null)" title="Klus type" :class="{'disabled': workOrder.waitingForWO !== null}">
								<icon name="wrench" :color="this.workOrder.waitingForWO !== null ? '#3A3B3C' : '#0079D3'" size="40"/>
							</div>

							<div class="button" @click="getSameTrainNumbers(workOrder.materialNumber, workOrder.waitingForWO)" title="In te plannen na:">
								<icon name="link" color="#0079D3" size="40"/>
							</div>

							<div class="work-order-content-bottom">
								<div class="button warning" v-if="workOrder.serviceRequest !== null && workOrder.serviceRequest.assignedLocations !== null && getDependentInfo(sameTrainNumber) == null" @mouseover="showAssignedLocations = true" @mouseleave="showAssignedLocations = false">
									<icon class="warning" name="lokatie" color="#DC0000" size="40" transition="none" />
									<span>{{checkAssignedLocations}}</span>
									<!-- <p class="tip">Service aanvraag is eerder geweigerd.</p> -->
								</div>

								<div class="button" v-if="materialDuplicates > 0" :class="{'disabled': workOrder.waitingForWO !== null}"
									 @click="showDuplicateInfo = !showDuplicateInfo">
									<icon class="inactive" name="docs-empty" :colors="{default: '#0079D3', hover: '#0079D3'}" size="40" transition="none"/>
									<span>{{materialDuplicates + duplicatesData.length}}</span>
									<!-- <p class="tip">Er zijn meerdere Service Aanvragen voor deze trein.</p> -->
								</div>

								<div class="button warning" @click="toggleBRegeling()" v-if="workOrder.bRegeling" :class="{'disabled': workOrder.waitingForWO !== null}">
									<icon name="alert_BR" color="#DC0000" size="40"/>
								</div>
								<div class="button warning-hover" @click="toggleBRegeling()" v-if="!workOrder.bRegeling" :class="{'disabled': workOrder.waitingForWO !== null}">
									<icon class="inactive" name="alert_BR" :colors="{default: '#CCCCCC', hover: '#DC0000'}" size="40" transition="none" title="Let op: er is een B-regeling van toepassing"/>
								</div>
								<div class="service-request-buttons">
									<button class="blue" @click="checkSubmitMBN();" :class="{'disabled': workOrder.waitingForWO !== null}">Toewijzen</button>
								</div>

							</div>
						</div>
						<div class="sub-bottom" v-if="getDependentInfo(sameTrainNumber)">
							<div class="dependend-list">
								<ul>
									<li>
										<div class="push-left">
                                            <span>
                                                <strong>{{getDependentInfo(sameTrainNumber).name}}</strong>
                                            </span>

											<span>
                                                {{getDependentInfo(sameTrainNumber).description}}
                                            </span>
										</div>
										<!-- <div class="push-right">
											<div class="button" @click="getSameTrainNumbers(getDependentInfo(sameTrainNumber).name)" title="In te plannen na:">
												<icon name="trein" color="#0079D3" size="33"/>
											</div>
										</div> -->
									</li>
								</ul>
							</div>
						</div>
					</div>

					<div class="tip big active" v-if="showAssignedLocations">
						<table>
							<tbody>
							<tr v-for="item in workOrder.serviceRequest.assignedLocations">
								<td>{{findLocationbyId(item.locationId).name}}</td>
								<td>{{$moment(item.timestamp).format('DD-MM-YYYY HH:MM')}}</td>
								<td>{{getFullDeclinedReasonDescription(item.declinedReason)}}</td>
							</tr>
							</tbody>
						</table>
					</div>

					<div class="tip big active" v-if="showDuplicateInfo && duplicatesData.length > 0">
						<span class="close" @click="showDuplicateInfo = !showDuplicateInfo">+</span>
						<table>
							<tbody>
							<tr v-for="wo in duplicatesData">
								<td>{{replaceNbsps(wo.description)}}</td>
								<td>{{$moment(wo.dueDate).format('DD-MM-YYYY HH:MM')}}</td>
								<td>{{findLocationbyId(wo.repairLocationId).name}}</td>
							</tr>
							</tbody>
						</table>
					</div>
				</div>
			</div>
		</template>

		<template v-if="type === 'mobile-teams'">
			<div class="work-order" :class="{'show': this.forceContentVisible !== undefined ? this.forceContentVisible : this.contentVisible}">
				<div class="work-order-top"
					 :class="{'sent-to-maximo': isWorkOrderSentToMaximo()}"
				>
					<div class="col href" @click="openWorkOrderInMaximo(event)">{{workOrder.WO}}</div>
					<div class="col" title="Stel/stam nummer" @click="toggleContentVisibility($event)"><icon name="trein" size="30" style="margin-top: -5px;" :color="isWorkOrderSentToMaximo() ? '#C5C5CB' : '#3A3B3C'"/>{{workOrder.materialNumber}}</div>
					<div class="col" @click="toggleContentVisibility($event)">{{ monthDateTimeFormat(workOrder.dueDate) }}</div>
					<div class="col" title="Type werk" @click="toggleContentVisibility($event)"><icon name="werkzaamheden" size="30" style="margin-top: -5px;" :color="isWorkOrderSentToMaximo() ? '#C5C5CB' : '#3A3B3C'"/>{{workOrder.type}}</div>
					<div class="col" title="Doorlooptijd werkorder" @click="toggleContentVisibility($event)"><icon name="klok" size="33" style="margin-top: -6.5px;" :color="isWorkOrderSentToMaximo() ? '#C5C5CB' : '#3A3B3C'"/>{{workOrder.totalLeadTimeMinutes || 0}} min</div>

					<div class="col right" @click="toggleContentVisibility($event)">
						<!-- <div class="icons">
							<icon name="kalender" size="33" style="margin-right: 13.5px; margin-top: 13.5px" :color="getCalendarIconColor()"/>
						</div> -->
						<div class="icons">
							<icon name="vinkje" size="33" style="margin-right: 13.5px; margin-top: 13.5px" color="#0B9126" v-if="mobileTeamEasyPlan"/>
						</div>

						<div class="icons">
							<icon name="chevron-neerwaarts" size="60" color="rgb(0, 121, 211)" transition="all 0.3s ease"/>
						</div>
					</div>
				</div>

				<div class="work-order-content" v-if="isContentInitialized" v-show="forceContentVisible !== undefined ? forceContentVisible : contentVisible">
					<div class="task">
						<div class="task-title">
							<div class="square" title="Taakstatus">
								{{workOrder.status}}
							</div>
							<div class="description">
								{{workOrder.description}}
							</div>
						</div>
						<div class="task-content">
							<TreeSelect
								:disabled="!canEditTask"
								v-model="tempWorkLocationId"
								:options="locationsData"
								options-label="name"
								additionalSearch="station"
								icon="lokatie_W"
								label="Kies werklocatie"
								class="picker-container"
							/>
							<TreeSelect
								:disabled="!canEditTask"
								v-model="tempRepairLocationId"
								:options="locationsData"
								options-label="name"
								additionalSearch="station"
								icon="lokatie_R"
								label="Kies reparatielocatie"
								class="picker-container"
							/>
							<TreeSelect
								v-if="workOrder.tasks && workOrder.tasks.length > 0"
								v-model="mechanicId"
								:options="mechanics"
								options-label="name"
								icon="drukte-3"
								label="Kies monteur"
								class="picker-container"
							/>

							<TextInput  :disabled="true" icon="alert" placeholder="Defect op locatie" v-model="defectOnLocation" class="picker-container" />
						</div>
						<div class="buttons">
							<div class="button" @click="openLeadTimeMinutesModal(null)" v-if="canEditLeadTime">
								<icon name="klok" color="#0079D3" size="40" title="Doorlooptijd taak"/>
							</div>
							<div class="button" @click="openQualificationsModal(null)">
								<icon name="kwalificatie" color="#0079D3" size="40" title="Kwalificaties"/>
							</div>
							<div class="button" @click="openEquipmentModal(null)">
								<icon name="ladder" color="#0079D3" size="40" title="Outillage"/>
							</div>
							<div class="button" @click="openLocationTypeModal(null)" title="Klus type">
								<icon name="wrench" color="#0079D3" size="40"/>
							</div>
						</div>
					</div>
				</div>
			</div>
		</template>

		<template v-else-if="type === 'work-order'">
			<div class="work-order" :class="{'show': this.forceContentVisible !== undefined ? this.forceContentVisible : this.contentVisible}">
				<div class="work-order-top" :class="{'sent-to-maximo': isWorkOrderSentToMaximo(), 'scheduled': workOrder.isScheduled}">
					<div class="col href" @click="openWorkOrderInMaximo(event)">{{workOrder.WO}}</div>

					<div class="col" title="Stel/stam nummer" @click="toggleContentVisibility($event)"><icon name="trein" size="30" style="margin-top: -5px;" :color="isWorkOrderSentToMaximo() ? '#C5C5CB' : '#3A3B3C'"/>{{workOrder.materialNumber}}</div>

					<div class="col">{{workOrder.seriesCode}}</div>

					<div class="col" title="Type werk" @click="toggleContentVisibility($event)"><icon name="werkzaamheden" size="30" style="margin-top: -5px;" :color="isWorkOrderSentToMaximo() ? '#C5C5CB' : '#3A3B3C'"/>{{workOrder.type}}</div>

					<div class="col">
						<icon name="kalender" size="30" style="margin-top: -5px;" :color="isWorkOrderSentToMaximo() ? '#C5C5CB' : '#3A3B3C'"/>
						{{ monthDateTimeFormat(workOrder.dueDate) }}
					</div>

					<div class="col right" @click="toggleContentVisibility($event)">
						<div class="icons">
							<icon name="kalender" size="33" style="margin-right: 13.5px; margin-top: 13.5px" :color="getCalendarIconColor()" :title="getCalendarIconTitle()"/>
						</div>
						<div class="icons">
							<icon name="vinkje" size="33" style="margin-right: 13.5px; margin-top: 13.5px" :color="getCheckMarkIconColor()" :title="getCheckMarkIconTitle()"/>
						</div>
						<div class="icons toggle">
							<icon name="chevron-neerwaarts" size="60" color="rgb(0, 121, 211)" transition="all 0.3s ease"/>
						</div>
					</div>
				</div>

				<div class="work-order-content" v-if="isContentInitialized" v-show="forceContentVisible !== undefined ? forceContentVisible : contentVisible">
					<div class="task">
						<div class="task-title" v-if="workOrder.type == 'PREIN'">
							<div class="description">
								{{workOrder.description}}
							</div>
						</div>
						<div class="task-content" v-if="checkTaskStatus()">
							<TreeSelect
								:disabled="!canEditTask"
								v-model="timeslot"
								:options="parsedTimeslots"
								options-label="value"
								icon="kalender"
								label="Kies een opstelling"
								class="picker-container"
							/>
						</div>
					</div>
					<template v-if="workOrder.type !== 'PREIN'">
						<div class="task" v-if="statusFlag !== '' && statusFlag > 0 && statusFlag < 6">
							<div class="task-title">
								<div class="description warning" v-if="statusFlag == 1">Werklocatie incorrect.</div>
								<div class="description warning" v-else-if="statusFlag == 2">Taak ontbreekt.</div>
								<div class="description warning" v-else-if="statusFlag == 3">Toewijzing ontbreekt</div>
								<div class="description warning" v-else-if="statusFlag == 4">Werklocatie en taak incorrect.</div>
								<div class="description warning" v-else-if="statusFlag ===5">Status is WOM</div>
							</div>
							<div class="task-content">
								<div class="target-date">
									<icon name="kalender" size="40" color="#0079D3"/>
									<div class="content">Streefdatum einde</div>
									<div class="content">{{dueDate}}</div>
								</div>
							</div>
						</div>
						<div class="task" v-else-if="tasks.length === 0">
							<div class="task-title">
								<div class="description warning">Taak ontbreekt</div>
							</div>
							<div class="task-content">
								<div class="target-date">
									<icon name="kalender" size="40" color="#0079D3"/>
									<div class="content">Streefdatum einde</div>
									<div class="content">{{dueDate}}</div>
								</div>
							</div>
							<div class="buttons">
								<icon class="button" name="klok" color="#0079D3" size="40" v-if="canEditLeadTime"/>
								<icon class="button" name="document" color="#0079D3" size="40"/>
								<icon class="button" name="alert" color="#0079D3" size="40"/>
							</div>
						</div>
						<div class="task" v-for="(task, index) in tasks" :key="index" v-else>
							<div class="task-title">
								<div class="square task-id" :class="{'selected': tasksSelectable && selectedTaskIds.indexOf(task.id) !== -1}" @click="selectTaskId !== undefined ? selectTaskId(task.id) : () => {}" title="Taaknummer">
									{{task.taskOrder}}
								</div><div class="square" title="Taakstatus">
								{{task.status}}
							</div><div class="square wide" title="Taak doorlooptijd">
								<icon name="klok" size="30" :color="isWorkOrderSentToMaximo() ? '#C5C5CB' : '#3A3B3C'"/>
								{{task.leadTimeMinutes || 0}} min
							</div><div class="description">
								{{task.description}}
							</div>
							</div>
							<div class="task-content" v-if="canEditTask">
								<!-- <picker icon="kalender" label="Kies een starttijd" v-model="startTimes[index]" type="time" :step="{'minute': 5, 'hour': 1}" /> -->
								<!-- <picker icon="kalender" label="Kies een opstelling" v-model="timeslotTasks[index]" :values="availableTimeslots" type="select" selectIdProperty="id" selectValueProperty="value" @setTimeOnTaskLevel="setTimeOnTaskLevel" :taskId="task.id" :workOrderId="workOrder.id"/> -->

								<TreeSelect
									v-model="mechanicIds[index]"
									:options="getMechanicsOfTask(task)"
									options-label="name"
									icon="drukte-3"
									label="Kies monteur"
									class="picker-container"
								/>

								<!-- <picker icon="spoor" label="Kies werkspoor" v-model="maintenanceTrack" type="text" v-if="index === tasks.length - 1" /> -->
							</div>
							<div class="buttons">
								<div class="button" @click="openLeadTimeMinutesModal(index)" v-if="canEditLeadTime">
									<icon name="klok" color="#0079D3" size="40" title="Doorlooptijd taak"/>
								</div>
								<div class="button" @click="openQualificationsModal(index)">
									<icon name="kwalificatie" color="#0079D3" size="40" title="Kwalificaties"/>
								</div>
								<div class="button" @click="openEquipmentModal(index)">
									<icon name="ladder" color="#0079D3" size="40" title="Outillage"/>
								</div>

								<div class="work-order-content-bottom">
									<div class="service-request-buttons" v-if="checkIfTasksContainsSR()">
										<button @click="openDeclineServiceRequestModal()" class="red">
											Weiger
										</button><button v-if="type === 'service-request'" @click="planServiceRequest(workOrder.serviceRequest.id)" class="blue">
										Plan
									</button>
									</div>
									<icon class="button warning" name="alert_SA" color="#DC0000" size="40" v-if="checkIfTasksContainsSR()"/>
									<div class="button warning" @click="toggleBRegeling()" v-if="workOrder.bRegeling">
										<icon name="alert_BR" color="#DC0000" size="40"/>
									</div>
								</div>
							</div>

						</div>
					</template>
					<template v-else>
						<div class="task">

							<!-- <div class="task-content">
								<picker icon="kalender" label="Kies een opstelling" v-model="timeslot" :values="availableTimeslots" type="select" selectIdProperty="id" selectValueProperty="value"/>
							</div> -->
							<div class="buttons">

							</div>
							<div class="work-order-content-bottom">

								<div class="service-request-buttons">
									<button class="blue" :class="{'disabled': backgroundRequestsProcessing}" @click="approveWo(workOrder.id, workOrder.locationId)">
										Goedkeuren
									</button>
								</div>

							</div>
						</div>

					</template>

				</div>
			</div>
		</template>

		<template v-if="type === 'pitstop'">
			<div class="work-order" :class="{'show': this.forceContentVisible !== undefined ? this.forceContentVisible : this.contentVisible}">
				<div    class="work-order-top"
						:class="{'sent-to-maximo': this.workOrder.waitingForWO !== null}" >
					<div class="col href" @click="openWorkOrderInMaximo(event)">{{workOrder.WO}}</div>

					<div class="col" title="Stel/stam nummer" @click="toggleContentVisibility($event)">
						<icon name="trein" size="30" style="margin-top: -5px;" :color="this.workOrder.waitingForWO !== null ? '#C5C5CB' : '#3A3B3C'"/>
						{{workOrder.materialNumber}}
					</div>

					<div class="col">
						<icon name="kalender" size="33" style="margin-top: -6.5px;" :color="this.workOrder.waitingForWO !== null ? '#C5C5CB' : '#3A3B3C'"/>
						{{ monthDateTimeFormat(workOrder.dueDate) }}
					</div>

					<div class="col" title="Type werk" @click="toggleContentVisibility($event)">
						<icon name="werkzaamheden" size="30" style="margin-top: -5px;" :color="this.workOrder.waitingForWO !== null ? '#C5C5CB' : '#3A3B3C'"/>
						{{workOrder.type}}
					</div>

					<div class="col" title="Doorlooptijd werkorder" @click="toggleContentVisibility($event)">
						<icon name="klok" size="33" style="margin-top: -6.5px;" :color="this.workOrder.waitingForWO !== null ? '#C5C5CB' : '#3A3B3C'"/>
						{{workOrder.totalLeadTimeMinutes || 0}} min
					</div>

					<div class="col right" @click="toggleContentVisibility($event)">

						<div class="icons">
							<icon name="chevron-neerwaarts" size="60" color="rgb(0, 121, 211)" transition="all 0.3s ease"/>
						</div>
					</div>
				</div>
				<div class="work-order-content" v-if="isContentInitialized" v-show="forceContentVisible !== undefined ? forceContentVisible : contentVisible">
					<div class="task">
						<div class="task-title">
							<div class="square" title="Taakstatus">
								{{workOrder.status}}
							</div>
							<div class="description">
								{{workOrder.description}}
							</div>
						</div>
						<div class="task-content">
							<TreeSelect
								:disabled="this.workOrder.waitingForWO !== null"
								v-model="tempWorkLocationId"
								:options="locationsData"
								options-label="name"
								additionalSearch="station"
								icon="lokatie_W"
								label="Kies werklocatie"
								class="picker-container"
							/>
							<TreeSelect
								:disabled="this.workOrder.waitingForWO !== null"
								v-model="tempRepairLocationId"
								:options="locationsData"
								options-label="name"
								additionalSearch="station"
								icon="lokatie_R"
								label="Kies reparatielocatie"
								class="picker-container"
							/>
							<DateTimePicker label="Kies aankomsttijd" :disabled="this.workOrder.waitingForWO !== null" :icon="true" v-model="arrivalDate" class="picker-container" />
							<TextInput
								:nopadding="true"
								:disabled="true"
								icon="lokatie"
								placeholder="Maintenance location"
								v-model="maintenanceLocation"
								class="picker-container"
							/>
						</div>
						<div class="buttons">
							<div class="button" @click="openLeadTimeMinutesModal(null)" :class="{'disabled': workOrder.waitingForWO !== null}">
								<icon name="klok" color="#0079D3" size="40" title="Doorlooptijd taak" :color="this.workOrder.waitingForWO !== null ? '#3A3B3C' : '#0079D3'"/>
							</div>
							<div class="button" @click="openLocationTypeModal(null)" title="Klus type" :class="{'disabled': workOrder.waitingForWO !== null}">
								<icon name="wrench" color="#0079D3" size="40" :color="this.workOrder.waitingForWO !== null ? '#3A3B3C' : '#0079D3'"/>
							</div>

							<div class="button" @click="getSameTrainNumbers(workOrder.materialNumber, workOrder.waitingForWO)" title="In te plannen na:">
								<icon name="link" color="#0079D3" size="40"/>
							</div>

							<div class="work-order-content-bottom no-margin">

								<div class="service-request-buttons">
									<div class="button b-regeling" @click="toggleBRegeling()" :class="{'warning': workOrder.bRegeling}">
										<icon name="alert_BR" color="#DC0000" size="40" v-if="workOrder.bRegeling"/>
										<icon name="alert_BR" :colors="{default: '#CCCCCC', hover: '#DC0000'}" size="40" v-else/>
									</div>

									<button :style="{'top': '6px'}" @click="confirmPitstopPlan()" class="button blue" :class="{'disabled': checkIfPlanPitstopDisabled()}">
										Plan
									</button>
								</div>

							</div>
						</div>

					</div>
					<div class="sub-bottom" v-if="getDependentInfo(sameTrainNumber)">
						<div class="dependend-list">
							<ul>
								<li>
									<div class="push-left">
                                        <span>
                                            <strong>{{getDependentInfo(sameTrainNumber).name}}</strong>
                                        </span>

										<span>
                                            {{getDependentInfo(sameTrainNumber).description}}
                                        </span>
									</div>
									<!-- <div class="push-right">
										<div class="button" @click="getSameTrainNumbers(getDependentInfo(sameTrainNumber).name)" title="In te plannen na:">
											<icon name="trein" color="#0079D3" size="33"/>
										</div>
									</div> -->
								</li>
							</ul>
						</div>
					</div>
				</div>
			</div>
		</template>

		<modal class="modal-leadtime" v-model="displayModalLeadTime" title="Doorlooptijd aanpassen" v-if="this.forceContentVisible !== undefined ? this.forceContentVisible : this.contentVisible && displayModalLeadTime">
			<div slot="content">
				<TextInput
					icon="klok"
					:paddingless="true"
					:number="true"
					suffix="min"
					:step="5"
					placeholder="Kies een doorlooptijd"
					v-model="leadTimeMinutes"
					minValue="0"
				/>
			</div>
			<div slot="buttons">
				<div class="button right" @click="saveLeadTimeMinutes()">Opslaan</div>
			</div>
		</modal>

		<modal class="modal-qualifications" v-model="displayModalQualifications" title="Benodigde kwalificaties" v-if="this.forceContentVisible !== undefined ? this.forceContentVisible : this.contentVisible && displayModalQualifications">
			<div slot="content" v-if="(qualifications.length === 0 && !canEditQualification && type !== 'mbn-monitor-unassigned')">
				Er zijn nog geen kwalificaties toegewezen aan deze taak/werkorder.
			</div>
			<div slot="content">
				<template v-if="type == 'service-request-mbn' || type == 'mbn-monitor-unassigned'">
					<!-- <template v-if="workOrder.tasks && workOrder.tasks.length > 0">
						<div class="item" v-for="(taskQualification, taskQualificationIndex) in totalTaskQualifications" :key="taskQualificationIndex" :qualificationId="taskQualification.qualificationId">
							<div class="col" style="height: 40px; line-height: 40px;">{{taskQualification.qualification.externalId}}</div>
							<div class="col" style="height: 40px; line-height: 40px;">{{taskQualification.qualification.name}}</div>
							<div class="col" style="height: 40px; line-height: 40px;">{{taskQualification.qualification.materialSeries}}<span v-if="taskIndex === null" style="position: absolute; right: 100px;">{{getTaskIdsForQualification(taskQualification.qualification.id)}}</span></div>
							<div class="col icon" @click="deleteTaskQualification(taskQualification)" v-if="canEditQualification">
								<icon name="sluiten" :size="40" :colors="{'default': '#0079D3', 'hover': '#003082'}"/>
							</div>
						</div>
						<picker icon="ladder" label="Kwalificatie toevoegen" :values="filteredQualificationList" v-model="newQualification" selectValueProperty="name" selectIdProperty="id" v-if="canEditQualification"/>
					</template>
					<template v-else>
						<div class="selected-qualifications">
							<div class="item" v-for="item in selectedQualifications">
								<span class="label">
									{{item.name}}
									<span>({{item.externalId}})</span>
								</span>
								<div class="col icon" @click="deleteWoQualification(item.id)" v-if="canEditQualification">
									<icon name="sluiten" :size="40" :colors="{'default': '#C5C5CB', 'hover': '#0079D3'}"/>
								</div>
							</div>
						</div>

						<picker icon="ladder" label="Kwalificatie toevoegen" :values="filteredQualificationList" v-model="newQualification" selectValueProperty="name" selectIdProperty="id" v-if="canEditQualification"/>
					</template> -->
					<div class="selected-qualifications">
						<div class="item" v-for="item in selectedQualifications">
                            <span class="label">
                                {{item.name}}
                            <span>({{item.externalId}})</span>
                            </span>
							<!-- <b class="remove" @click="deleteWoQualification(item.id)"></b> -->
							<div class="col icon" @click="deleteWoQualification(item.id)" v-if="canEditQualification">
								<icon name="sluiten" :size="40" :colors="{'default': '#C5C5CB', 'hover': '#0079D3'}"/>
							</div>
						</div>
					</div>
					<TreeSelect
						v-if="canEditQualification"
						v-model="newQualification"
						:options="filteredQualificationList"
						icon="kwalificatie"
						options-id="id"
						options-label="name"
						cleareAfterSelect="true"
						label="Kwalificatie toevoegen"
					/>
				</template>

				<template v-else-if="['mbn-monitor-assigned', 'mbn-monitor-declined', 'mbn-monitor-logistic'].indexOf(type) !== -1">
					<div v-for="task in workOrder.tasks">
						<template v-for="item in task.qualifications">
							<div class="item">
								<div class="col" style="height: 40px; line-height: 40px;">{{item.qualification.externalId}}</div>
								<div class="col" style="height: 40px; line-height: 40px;">{{item.qualification.name}}</div>
								<div class="col" style="height: 40px; line-height: 40px;">{{item.qualification.materialSeries}}
									<span v-if="taskIndex === null" style="position: absolute; right: 100px;">{{getTaskIdsForQualification(item.qualification.id)}}
                                    </span>
								</div>
							</div>
						</template>
					</div>
				</template>

				<template v-else>
					<div class="item" v-for="(taskQualification, taskQualificationIndex) in totalTaskQualifications" :key="taskQualificationIndex" :qualificationId="taskQualification.qualificationId">
						<div class="col" style="height: 40px; line-height: 40px;">{{taskQualification.qualification.externalId}}</div>
						<div class="col" style="height: 40px; line-height: 40px;">{{taskQualification.qualification.name}}</div>
						<div class="col" style="height: 40px; line-height: 40px;">{{taskQualification.qualification.materialSeries}}<span v-if="taskIndex === null" style="position: absolute; right: 100px;">{{getTaskIdsForQualification(taskQualification.qualification.id)}}</span></div>
						<div class="col icon" @click="deleteTaskQualification(taskQualification)" v-if="canEditQualification">
							<icon name="sluiten" :size="40" :colors="{'default': '#0079D3', 'hover': '#003082'}"/>
						</div>
					</div>
					<TreeSelect
						v-if="canEditQualification"
						v-model="newQualification"
						:options="filteredQualificationList"
						icon="kwalificatie"
						options-id="id"
						options-label="name"
						label="Kwalificatie toevoegen"
					/>
				</template>
			</div>
			<div slot="buttons">
				<div class="button right" v-if="canEditQualification" @click="saveQualifications()">Opslaan</div>
				<div class="button right" @click="displayModalQualifications = false" v-else>OK</div>
			</div>
		</modal>

		<modal class="modal-equipment" v-model="displayModalEquipment" title="Benodigde outillage" v-if="this.forceContentVisible !== undefined ? this.forceContentVisible : this.contentVisible && displayModalEquipment">
			<div slot="content" v-if="totalTaskEquipment.length === 0 && !this.canEditEquipment && ['mbn-monitor-assigned', 'mbn-monitor-declined', 'mbn-monitor-logistic'].includes(type) == false">
				Er is nog geen outillage toegewezen aan deze taak/werkorder.
			</div>
			<div slot="content" v-else>
				<template v-if="type == 'service-request-mbn' && canEditEquipment || type == 'mobile-teams' && canEditEquipment || type == 'mbn-monitor-unassigned' && canEditEquipment">
					<template
						v-for="(item, index) in mbnEquipmentModels"
					>
						<TreeSelect
							:key="'equipmentType' + index"
							v-if="ifEquipmentIsFilled(index)"
							v-model="mbnEquipmentModels[index]"
							:options="removeSelectedMbnEquipmentsFromList(equipmentTypes, index)"
							options-label="name"
							options-id="id"
							icon="ladder"
							label="Kies outillage type"
							class="picker-container"
						/>
					</template>
				</template>

				<template v-else-if="['mbn-monitor-unassigned', 'mbn-monitor-assigned', 'mbn-monitor-declined', 'mbn-monitor-logistic'].indexOf(type) !== -1">
					<template v-if="workOrder.equipmentTypesIds !== null && workOrder.equipmentTypesIds.length > 0">
						<div
							class="item"
							:style="{'margin-top': index === 0 ? '25px' : 0}"
							v-for="(equipment, index) in workOrder.equipmentTypesIds" :key="index">

							<div class="col" style="height: 40px; line-height: 40px;">
								{{getEquipmentTypeName(equipment)}}
							</div>
						</div>
					</template>
					<template v-else>
						Er is nog geen outillage toegewezen aan deze taak/werkorder.
					</template>

				</template>

				<template v-else>
					<div
						class="item"
						:style="{'margin-top': index === 0 ? '25px' : 0}"
						v-if="taskSelectedEquipmentList.includes(taskEquipment.id)"
						v-for="(taskEquipment, index) in equipmentList" :key="index">

						<div class="col" style="height: 40px; line-height: 40px;">
							{{taskEquipment.name}}
							<span style="position: absolute; right: 100px;">
                                {{getTaskIdsForEquipment(taskEquipment.id)}}
                            </span>
						</div>

						<div class="col icon" @click="deleteTaskEquipment(taskEquipment)" v-if="canEditEquipment">
							<icon name="sluiten" :size="40" :colors="{'default': '#0079D3', 'hover': '#003082'}"/>
						</div>
					</div>

					<TreeSelect
						:options="equipmentList"
						options-label="name"
						options-id="id"
						icon="ladder"
						label="Kies outillage type"
						class="picker-container"
					/>
				</template>

			</div>
			<div slot="buttons">
				<div class="button right" @click="saveEquipment()" v-if="canEditEquipment">Opslaan</div>
				<div class="button right" @click="displayModalEquipment = false" v-else>OK</div>
			</div>
		</modal>

		<modal class="modal-decline-sr" v-model="displayModalDeclineServiceRequest" title="Service aanvraag weigeren" v-if="this.forceContentVisible !== undefined ? this.forceContentVisible : this.contentVisible && displayModalDeclineServiceRequest">
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
				<div class="button right" @click="saveModalDeclineServiceRequest()">Opslaan</div>
			</div>
		</modal>

		<modal class="modal-assign-sr" v-model="displayModalAssignServiceRequest" title="Service aanvraag toewijzen" v-if="this.forceContentVisible !== undefined ? this.forceContentVisible : this.contentVisible && displayModalAssignServiceRequest">
			<div slot="content">
				<TreeSelect
					v-model="assignReasonServiceRequest"
					:options="assignReasonsServiceRequest"
					options-label="name"
					options-id="id"
					icon="info"
					label="Selecteer reden"
					class="picker-container"
				/>
			</div>
			<div slot="buttons">
				<div class="button right" @click="saveModalAssignServiceRequest()">Opslaan</div>
			</div>
		</modal>

		<modal class="modal-assign-sr" v-model="showMatchedLocationModal" title="" v-if="this.forceContentVisible !== undefined ? this.forceContentVisible : this.contentVisible && showMatchedLocationModal">

			<div slot="content">
				Let op: deze service aanvraag is al eerder toegewezen aan deze locatie.<br/>Wilt u de service aanvraag alsnog toewijzen?
			</div>
			<div slot="buttons">
				<div class="button right" @click="saveModalAssignServiceRequest()">Toewijzen</div>
				<div class="button right blue" @click="showMatchedLocationModal = !showMatchedLocationModal">Annuleren</div>
			</div>
		</modal>

		<modal class="modal-location-type" v-model="displayModalLocationType" title="Klus type" v-if="this.forceContentVisible !== undefined ? this.forceContentVisible : this.contentVisible && displayModalLocationType">
			<div slot="content">
				<!-- <div>
					<div class="item">
						<span class="label" v-if="ntLocationType">
							{{ntLocationType}}
						</span>
						<span class="label" v-else>
							Er is nog geen klus type toegewezen aan deze taak/werkorder.
						</span>
					</div>
				</div> -->
				<template v-if="['mbn-monitor-assigned', 'mbn-monitor-declined', 'mbn-monitor-logistic'].indexOf(type) !== -1">
					<div>
						<div class="item">
                            <span class="label" v-if="ntLocationType">
                                {{ntLocationType}}
                            </span>
							<span class="label" v-else>
                                Er is nog geen klus type toegewezen aan deze taak/werkorder.
                            </span>
						</div>
					</div>
				</template>
				<template v-else>
					<TreeSelect
						v-model="ntLocationType"
						:options="locationTypes"
						options-label="name"
						options-id="name"
						icon="wrench"
						label="Geen type"
						class="picker-container"
					/>
				</template>
			</div>
			<div slot="buttons">
				<div class="button right" @click="saveLocationType()">Opslaan</div>
			</div>
		</modal>

		<modal class="modal-assign-sr" v-model="displaySameTrainNumberModal" title="In te plannen na:" v-if="this.forceContentVisible !== undefined ? this.forceContentVisible : this.contentVisible && displaySameTrainNumberModal">
			<div slot="content">
				<TreeSelect
					v-model="sameTrainNumber"
					:options="sameTrainNumbers"
					options-label="name"
					options-id="id"
					icon="info"
					label="Selecteer werkorder"
					class="picker-container"
				/>
			</div>
			<div slot="buttons">
				<div class="button right" @click="saveModalSameTrainNumber()">Opslaan</div>
			</div>
		</modal>

		<modal class="modal-assign-sr" v-model="displayOptionsModal" title="Materieel verplaatsen" v-if="displayOptionsModal">
			<div slot="content">
				<!-- assetStatus, maintenanceLocation, reasonMaintenance -->
				<TreeSelect
					v-model="maintenanceStatus"
					:options="assetStatuses"
					options-label="title"
					options-id="title"
					label="Selecteer werkorder"
					title="Status"
					class="picker-container"
				/>

				<TreeSelect
					v-model="maintenanceLocation"
					:options="locations"
					options-label="name"
					options-id="locationNumber"
					label="Selecteer werkorder"
					title="Locatie"
					class="picker-container"
				/>
				<TreeSelect
					v-model="reasonMaintenance"
					:options="reasonMaintenanceList"
					options-label="reason"
					options-id="code"
					label="Selecteer werkorder"
					title="Reden binnenkomst"
					class="picker-container"
				/>
			</div>
			<div slot="buttons">
				<div class="button right" @click="saveOptions()">Opslaan</div>
			</div>
		</modal>
	</div>
</template>

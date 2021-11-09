<script>
import $date from '@/modules/date-module'
import $loader from '@/modules/loader-module'
import $snackbar from '@/modules/snackbar-module'
import DeclinedServiceReasons from '@/data/decline-service-request-reasons.json'
import AssignServiceReasons from '@/data/assign-reasons-service-requests.json'

import _ from 'lodash'
import env from '@/env'

export default {
    props: [
    	'visible',
		'type',
		'item',
		'mechanics',
		'forceContentVisible',
		'startDateChart',
		'displayHoursChart',
		'selectedTaskIds',
		'selectTaskId',
		'equipmentList',
		'equipmentTypes',
		'qualificationList',
		'canEditTask',
		'canEditEquipment',
		'canEditQualification',
		'canEditLeadTime',
		'tasksSelectable',
		'locations',
		'getQualifiedMechanicsForTask',
		'hideHeaders',
		'serviceWindows',
		'warningsOnly',
		'locationTypes',
		'availableTimeslots',
		'watchTimeslots',
		'assetStatuses',
		'reasonMaintenanceList'
	],

    data: function () {
        return {
			workOrder: this.$props.item,
			env: env,
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

            declineReasonsServiceRequest: DeclinedServiceReasons,

            declineReasonServiceRequest: null,

            assignReasonsServiceRequest: AssignServiceReasons ,

            assignReasonServiceRequest: null,

            isContentInitialized: false,

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

            locationsData: this.locations,

            mobileTeamLocationsForWo: [],

            sameTrainNumbers: [],
            sameTrainNumber: null,
            displayOptionsModal: false,

            maintenanceStatus: null,
            reasonMaintenance: null,
            maintenanceLocation: null,

            parsedTimeslots: [],
        }
    },

    computed: {
        // Declined locations
        checkAssignedLocations () {
			// console.log('computed checkAssignedLocations')
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
			// console.log('computed dueDate')
            if (!this.workOrder || !this.workOrder.dueDate) {
                return ''
            }
            return $date.formatDayMonthTimeStamp(new Date(this.workOrder.dueDate))
        },

        /**
         * The total list of task equipment
         */
        totalTaskEquipment () {
			// console.log('computed totalTaskEquipment')
            let taskEquipment = []

            for (let taskIndex in this.workOrder.tasks) {
                if (Number(taskIndex) === Number(this.taskIndex) || this.taskIndex === null) {
                    for (let taskEquipmentIndex in this.workOrder.tasks[taskIndex].equipments) {
                        let taskEquipmentObject = this.workOrder.tasks[taskIndex].equipments[taskEquipmentIndex]
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
			// console.log('computed totalTaskQualifications')
            let taskQualifications = []
            for (let taskIndex in this.workOrder.tasks) {
                if (Number(taskIndex) === Number(this.taskIndex) || this.taskIndex === null) {
                    for (let taskQualificationIndex in this.workOrder.tasks[taskIndex].qualifications) {
                        let taskQualificationObject = this.workOrder.tasks[taskIndex].qualifications[taskQualificationIndex]
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
			// console.log('computed filteredEquipmentList')
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
			// console.log('computed filteredEquipmentTypeList')
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
			// console.log('computed filteredQualificationList')
            return this.qualificationList.filter(item => !this.totalTaskQualifications.find(total => total.qualificationId === item.id))
		}
    },

    watch: {
        timeslot: function () {
			// console.log('watch timeslot')
            if (this.watchTimeslots) {
                this.setTimeslotOnWoLevel()
            }
        },

        warningsOnly: function () {
			// console.log('watch warningsOnly')
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
				// console.log('watch locations')
                // console.log(this.locations.len);
                this.locationsData = this.locations
                if (this.workOrder.asset) {
                    this.maintenanceLocation = this.getMaintanceLocationName(this.workOrder.asset.maintenanceLocation)
                } else {
                    this.maintenanceLocation = this.getMaintanceLocationName(this.workOrder.maintenanceLocation)
                }
            },
            deep: true
        },
        tasks: {
            handler: function () {
				// console.log('watch tasks')
                if (this.startWatchingTasks) {
                    for (let taskIndex in this.workOrder.tasks) {
                        let task = this.workOrder.tasks[taskIndex]
                        task.isSentToMaximo = false
                    }
                }
            },
            deep: true
        },
        startTimes: {
            handler: function () {
				// console.log('watch startTimes')

                this.onChangeStartTime()
                // console.log('test')
            },
            deep: true
        },

        mechanicIds: {
            handler: function () {
				// console.log('watch mechanicIds')
				this.onChangeMechanic()
            },
            deep: true
        },

        mechanicId: function () {
			// console.log('watch mechanicId')
        },

        selectedEquipmentTypeId: function () {
			// console.log('watch selectedEquipmentTypeId')
            if (this.newEquipment !== null) {
                this.addedEquipmentIds.push(this.newEquipment)
                this.newEquipment = null
            }

            // console.log(this.selectedEquipmentTypeId);
        },

        newQualification: function () {
			// console.log('watch newQualification')
            if (this.newQualification !== null && this.newQualification !== undefined) {
                // console.log(this.newQualification)
                if (this.type == 'service-request-mbn') {
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

        maintenanceTrack: function (newVal, oldVal) {
			// console.log('watch maintenanceTrack')
                document.dispatchEvent(new CustomEvent('workOrderMaintenanceTrackChange', {
                    detail: {
                        id: this.workOrder.id,
                        maintenanceTrack: this.maintenanceTrack
                    }
                }))

            // console.log(newVal);
        }
    },

    created: function () {
		// console.log('created')
        document.addEventListener('workOrderClose', this.onCloseWorkOrder)
        document.addEventListener('workOrderOpen', this.onOpenWorkOrder)
        document.addEventListener('trainScheduleSelectServiceWindow', this.onTrainScheduleSelectServiceWindow)
        document.addEventListener('chartSelectLabel', this.onChartSelectLabel)
        document.addEventListener('workOrderChangeStartTime', this.onWorkOrderChangeStartTime)
    },

    mounted: function () {
		// console.log('mounted')
        if (this.workOrder.equipmentTypesIds == null) {
            this.workOrder.equipmentTypesIds = []
        }
        if (this.visible === true) {
            // // console.log(this.WorkOrder);
            this.isContentInitialized = true

            this.toggleContentVisibility()
            document.dispatchEvent(new CustomEvent('workOrderInitializeOnStart', {
                detail: {
                    id: this.workOrder.id,
                    workOrder: this.workOrder
                }
            }))
        }

		this.generateEasyPlanLocations()
		this.maintenanceLocation = this.getMaintanceLocationName(this.workOrder.asset.maintenanceLocation)
        setTimeout(() => {
            this.startWatchingTasks = true
        }, 1500)
    },

    beforeDestroy: function () {
		// console.log('beforeDestroy')
        document.removeEventListener('workOrderClose', this.onCloseWorkOrder)
        document.removeEventListener('workOrderOpen', this.onOpenWorkOrder)
        document.removeEventListener('trainScheduleSelectServiceWindow', this.onTrainScheduleSelectServiceWindow)
        document.removeEventListener('chartSelectLabel', this.onChartSelectLabel)
        document.removeEventListener('workOrderChangeStartTime', this.onWorkOrderChangeStartTime)
    },

    methods: {
        formatMechanicMessage(message) {
            let formatted = message.replaceAll(`[woeq`, `<br><br>[woeq`).replaceAll(`-`, `\n`).replaceAll(`—`, ` `).replace(/[\r\n]{2,}/g, "<br>");

            return formatted;
        },
        /**
         * Decline the service request
         */
        saveModalAssignServiceRequest () {
			// console.log('woMBN methods saveModalAssignServiceRequest')
            $loader.message = 'Service aanvraag toewijzen'
            // this.hideWoAfterAssign = true
            this.$emit('hideCharts')

            this.displayModalAssignServiceRequest = false
            this._api.assignSR(this.workOrder.id, 'TOEWIJZING').then(response => {
                $loader.message = null
                $snackbar.add('Service aanvraag toegewezen.')
				this.$emit('planningWO', this.workOrder.id)
            }).catch(response => {
                $loader.message = null
                $snackbar.addWarning('De service aanvraag kon niet worden geweigerd, gelieve het later nogmaals te proberen.')
            })
        },
        replaceNbsps(str) {
			// console.log('methods replaceNbsps')
            var re = new RegExp(String.fromCharCode(160), "g");
            return str.replace(re, " ");
        },
        getDuplicatesData(){
            this._api.getWorkordersByInRollingStock(this.workOrder.inRollingStock).then(res => {
                this.duplicatesData = res

                for(let i in this.duplicatesData){
                    if(this.duplicatesData[i].WO == this.workOrder.WO){
                        this.duplicatesData.splice(i, 1);
                        break;
                    }
                }
            })
        },
        openOptionsModal(){
			// console.log('methods openOptionsModal')
            this.displayOptionsModal = true;
            this.maintenanceStatus = this.workOrder.maintenanceStatus
            this.reasonMaintenance = this.workOrder.reasonMaintenance
            this.maintenanceLocation = this.workOrder.maintenanceLocation
        },
        saveOptions () {
			// console.log('methods saveOptions')
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
			// console.log('methods checkTaskStatus')
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
			// console.log('methods setTimeslotOnWoLevel')
            if(!this.isContentInitialized){
                return;
            }
            this.backgroundRequestsProcessing = true
            let data
            // console.log(this.timeslot);
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
			// console.log('methods setTimeOnTaskLevel')
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
			// console.log('methods getMobileTeamLocations')
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
			// console.log('methods saveLocationType')
            this.displayModalLocationType = false
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
			// console.log('methods checkNtLocationType')
                if (this.workOrder.ntLocationType !== 'SB' && this.workOrder.ntLocationType !== 'GSL') {
                    this.isHidden = true
                    this.$emit('hideCharts')
                }
        },
        getEquipmentTypeName (id) {
			// console.log('methods getEquipmentTypeName')
            for (let i = 0; i < this.equipmentList.length; i++) {
                let currentId = this.equipmentList[i].id
                if (currentId == id) {
                    return this.equipmentList[i].name
                }
            }
        },
        checkIfPlanPitstopDisabled () {
			// console.log('methods checkIfPlanPitstopDisabled')
            if (this.workOrder.tempRepairLocationId !== null && this.workOrder.tempWorkLocationId !== null && this.workOrder.arrivalDate !== null) {
                return false
            } else {
                return true
            }
        },
        confirmPitstopPlan () {
        	// TO DO WATCH THIS
			// console.log('methods confirmPitstopPlan')
            $loader.message = 'Plan bevestigen'
            this.onChangeWorkOrder(true)

            this.workOrder.isScheduled = true
            this.workOrder.isPitstopPlanned = true

            let obj = {
                wo: this.workOrder,
                plan: 'true'
            }
            this.$emit('putWorkOrder', obj)
            this.$emit('updateWorkOrder', this.workOrder)
        },
        getFullDeclinedReasonDescription (declinedReasonId) {
			// console.log('methods getFullDeclinedReasonDescription')
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
			// console.log('methods getMaintanceLocationName')
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
			// console.log('methods approveWo')
            let obj = {
                id: woId.toString(),
                locationId: localStorage.getItem('locationId')
            }
			this._api.approveWO(obj).then(res => {
                this.workOrder.isScheduled = true
            })
        },
        findLocationbyId(id){
			// console.log('methods findLocationbyId')
            let locationName = _.find(this.$store.getters['GET_LOCATIONS'], {id: id});
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
			// console.log('methods deleteWoQualification')
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
			// console.log('methods getSelectedQualifications')
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
			// console.log('methods planAndRevert')
            this.planServiceRequest()
            this.revertServiceRequest()
        },
        checkStatusAndBool (bool) {
			// console.log('methods checkStatusAndBool')
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
			// console.log('methods getMechanicsOfTask')
            let mechanicsFound = this.getQualifiedMechanicsForTask(task)
            if (!mechanicsFound || mechanicsFound.length == 0) {
                return this.mechanics
            } else {
                return mechanicsFound
            }
        },
        getTaskSelectedEquipmentList (taskIndex) {
			// console.log('methods getTaskSelectedEquipmentList')
            // this.taskSelectedEquipmentList = [];

            let taskSelectedEquipments = this.workOrder.tasks[taskIndex].equipments

            // console.log(this.workOrder.tasks[taskIndex].equipments);

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
			// console.log('methods placeSelectedEquipmentForTask')
            this.taskSelectedEquipmentList.push(id);
            this.taskSelectedEquipmentList = _.uniq(this.taskSelectedEquipmentList);

            // console.log(this.taskSelectedEquipmentList.length);
        },
        generateEasyPlanLocations(){
			// console.log('methods generateEasyPlanLocations')
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
			// console.log('methods openAsset')
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
			// console.log('methods removeSelectedMbnEquipmentsFromList')
			return this.equipmentTypes.filter(item => !this.mbnEquipmentModels.find((model, ind) => model === item.id && index !== ind))
        },
        clearEmptyMbnEquipments () {
			// console.log('methods clearEmptyMbnEquipments')
            let temp = []
            for (let i = 0; i < this.mbnEquipmentModels.length; i++) {
                if (this.mbnEquipmentModels[i] !== '' && this.mbnEquipmentModels[i] !== null) {
                    temp.push(this.mbnEquipmentModels[i])
                }
            }

            return temp
        },
        ifEquipmentIsFilled (index) {
			// console.log('methods ifEquipmentIsFilled')
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
			// console.log('methods generateMdnEquipmentModels')
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
			// console.log('methods initEquipmentTypeIdModalValue')
            if (this.workOrder.equipmentTypesIds !== null) {
                this.selectedEquipmentTypeId = this.workOrder.equipmentTypesIds[0]
            }
        },
        getMatchedLocationId (bool) {
			// console.log('methods getMatchedLocationId')
            this.matchedLocationBool = bool
        },
        checkSubmitMBN () {
			// console.log('methods checkSubmitMBN')
            this.onChangeWorkOrder(false, true)
        },
        /**
         * When the task in the workorder should change its start time in this component
         * @param {CustomEvent} eventArgs the event arguments
         */
        onWorkOrderChangeStartTime (eventArgs) {
			// console.log('methods onWorkOrderChangeStartTime')
            this.$nextTick(() => {
                if (this.type !== 'work-order') {
                    return
                }
                if (eventArgs.detail.id === this.workOrder.id) {
                    for (let index in this.workOrder.tasks) {
                        let task = this.workOrder.tasks[index]
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
			// console.log('methods onChartSelectLabel')
            this.$nextTick(() => {
                if (eventArgs.detail.context !== 'material-number' || this.type !== 'service-request-mbn' || !this.contentVisible) {
                    return
                }
                this.workOrder.tempWorkLocationId = eventArgs.detail.id
                this.workOrder.tempRepairLocationId = eventArgs.detail.id
            })
        },

        /**
         * When the user selects a service window in the train schedule chart
         * @param {CustomEvent} eventArgs the event arguments
         */
        onTrainScheduleSelectServiceWindow (eventArgs) {
			// TO DO WATCH THIS WHEN SELECT CHART
			// console.log('methods onTrainScheduleSelectServiceWindow')
            this.$nextTick(() => {
                if (this.type !== 'service-request-mbn' || !this.contentVisible) {
                    return
                }
                this.workOrder.tempWorkLocationId = eventArgs.detail.locationId
                this.workOrder.tempRepairLocationId = eventArgs.detail.locationId
                this.workOrder.arrivalDate = eventArgs.detail.arrivalDate
            })
        },

        /**
         * Whenever a work order changes
         */
        onChangeWorkOrder: _.debounce(

			// TO DO WATCH THIS arrivalDate
        function (test, saveMbn) {
			// console.log('methods onChangeWorkOrder')
            // TODO should remove it later, when backend is ready.
            delete this.workOrder.tempRepairLocation
            delete this.workOrder.tempWorkLocation

			this._api.saveWorkOrder(this.workOrder)
				.then(res => {
					this.$emit('updateWorkOrder', res)
				})

            this.workOrder.arrivalDate = this.$moment(this.workOrder.arrivalDate).local()
			this.$emit('workOrderChange', {
				detail: {
					id: this.workOrder.id,
					workOrder: this.workOrder
				}
			})
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
			// console.log('methods checkTimeslotsNNB')
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
			// console.log('methods toggleContentVisibility')
			// console.log(1234)
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
                        for (let taskIndex in this.workOrder.tasks) {
                            let task = this.workOrder.tasks[taskIndex]
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
					this.getLinkedWorkorderList(this.workOrder.materialNumber, this.workOrder.waitingForWO);
					this.getDuplicatesData();

                    // document.dispatchEvent(new CustomEvent('workOrderChange', {
                    //     detail: {
                    //         workOrder: this.workOrder
                    //     }
                    // }))
                }
                else {
                    document.dispatchEvent(new CustomEvent('selectedWorkOrderChange', {
                        detail: {
                            workOrder: {}
                        }
                    }))
                    document.dispatchEvent(new CustomEvent('selectedTaskIdsChange', {
                        detail: {
                            materialNumber: this.workOrder.materialNumber,
                            selectedTaskIds: []
                        }
                    }))


                }
        },

        /**
         * Close the work order components' menu's.
         */
        onCloseWorkOrder () {
			// console.log('methods onCloseWorkOrder')
            this.contentVisible = false
        },

        /**
         * Open the work order components' menu's.
         * @param {CustomEvent} eventArgs the event arguments
         */
        onOpenWorkOrder (eventArgs) {
			// console.log('methods onOpenWorkOrder')
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
			// console.log('methods getSameTrainNumbers')
            this.openSameTrainNumberModal(null)
        },

        getDependentInfo (woNumber) {
			// console.log('methods getDependentInfo')
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
			// console.log('methods saveModalSameTrainNumber')
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
			// console.log('methods onChangeMechanic')
            for (let taskIndex in this.workOrder.tasks) {
                let task = this.workOrder.tasks[taskIndex]
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
			// console.log('methods onChangeStartTime')
            for (let taskIndex in this.workOrder.tasks) {
                let task = this.workOrder.tasks[taskIndex]
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
                        for (let taskIndex in this.workOrder.tasks) {
                            let task = this.workOrder.tasks[taskIndex]
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
			// console.log('methods getTasksTimeslots')
            let arr = []
            for (let index in tasks) {
                let task = tasks[index]

                arr.push(task.serviceWindowEmplacementId)
            }

            return arr
        },

        getDefaultMechanic () {
			// console.log('methods getTasksTimeslots')
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
         * Calculate the start time for a task
         * @param {object} task the task
         */
        calculateStartTime (task) {
			// console.log('methods calculateStartTime')
            let taskStartXCoordinate = ((new Date(task.tempStart)).getTime() - $date.toDateObject(this.startDateChart.substring(0, 13) + ':00:00').getTime()) / 60 / 60 / 1000
            let lengthTask = task.leadTimeMinutes / 60
            if (taskStartXCoordinate + lengthTask >= 0 && taskStartXCoordinate < 24) {
                return $date.toDateString(new Date(task.tempStart)).substring(11, 16)
            }
            return null
        },

		openLeadTimeMinutesModal () {
			// console.log('methods openLeadTimeMinutesModal')
			this.$root.$emit('openWOLeadTimeModal', {
				index: null,
				workOrder: this._.cloneDeep(this.workOrder)
			})
		},
		openWOEquipmentTypeModal (taskIndex) {
			// console.log('methods openWOEquipmentTypeModal')
			this.$root.$emit('openWOEquipmentTypeModal', {
				index: null,
				workOrder: this._.cloneDeep(this.workOrder)
			})
		},
		openQualificationsModal (taskIndex) {
			// console.log('methods openQualificationsModal')
			this.$root.$emit('openWOQualificationsModal', {
				index: null,
				workOrder: this._.cloneDeep(this.workOrder)
			})
		},
		openLocationTypeModal () {
			// console.log('methods openLocationTypeModal')
			this.$root.$emit('openWOLocationsModal', {
				index: null,
				workOrder: this._.cloneDeep(this.workOrder)
			})
		},
		openSameTrainNumberModal () {
			// console.log('methods openSameTrainNumberModal')
			this.$root.$emit('openWOTrainNumberModal', {
				index: null,
				workOrder: this._.cloneDeep(this.workOrder),
				sameTrainNumbers: this.sameTrainNumbers
			})
		},

        /**
         * Toggle the B-regeling
         */
        toggleBRegeling () {
			// // console.log('methods toggleBRegeling')
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
			// console.log('methods revertServiceRequest')
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
         * Open the workorder in maximo
         */
        openWorkOrderInMaximo (event) {
			// console.log('methods openWorkOrderInMaximo')
            window.open(env.maximoURL + this.workOrder.WO, '_blank')
        },
        openAssetWorkOrderInMaximo (wo) {
			// console.log('methods openAssetWorkOrderInMaximo')
            window.open(env.maximoURL + wo, '_blank')
        }
    }
}
</script>

<template>
	<v-expansion-panel :data-work-order-id="workOrder && workOrder.id ? 'work-order-' + workOrder.id : null" v-if="!isHidden">

      <v-expansion-panel-header class="work-order-mbn-expansion-panel-header" >
        <a class="panel-header-title" target="_blank" :href="env.maximoURL + workOrder.WO">{{workOrder.WO}}</a>

		  <template v-slot:actions>
			  <v-icon>
				  $expand
			  </v-icon>
		  </template>
      </v-expansion-panel-header>

      <v-expansion-panel-content>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
      </v-expansion-panel-content>

	</v-expansion-panel>
</template>


<!--<template>
	<div class="work-order-container" :data-work-order-id="workOrder && workOrder.id ? 'work-order-' + workOrder.id : null" v-if="!isHidden">
		<div class="work-order" :class="{'show': forceContentVisible !== undefined ? forceContentVisible : contentVisible}">
			<div class="work-order-top"
				 :class="{'sent-to-maximo': workOrder.waitingForWO !== null}"
			>

				<div class="col" title="Stel/stam nummer" @click="toggleContentVisibility($event)">
					<icon name="trein" size="30" style="margin-top: -5px;" :color="workOrder.waitingForWO !== null ? '#c5c5cb' : '#3a3b3c'"/>
					{{workOrder.materialNumber}}
				</div>
				<div class="col" @click="toggleContentVisibility($event)">
					{{$moment(workOrder.dueDate).format('D-M HH:mm')}}
				</div>

				<div class="col description" :title="workOrder.description">
					{{workOrder.description}}
				</div>

				<div class="col mechanic-messages" v-if="workOrder.woeq3">
					<span class="icon is-invisible is-medium"><i class="mdi mdi-18px mdi-chat-outline"></i></span>

					<p v-html="formatMechanicMessage(workOrder.woeq3)"></p>
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
							<div class="col" title="Doorlooptijd werkorder" @click="toggleContentVisibility($event)">
								<icon name="klok" size="33" style="margin-top: -6.5px;" :color="'#3A3B3C'"/>
								{{workOrder.totalLeadTimeMinutes || 0}} min
							</div>
						</div>
					</div>
					<div class="task-content">
						<TreeSelect
							:disabled="workOrder.waitingForWO !== null"
							v-model="workOrder.tempWorkLocationId"
							:options="locationsData"
							options-label="name"
							additionalSearch="station"
							icon="lokatie_W"
							label="Kies werklocatie"
							class="picker-container"
							@input="onChangeWorkOrder"
						/>
						<TreeSelect
							:disabled="workOrder.waitingForWO !== null"
							v-model="workOrder.tempRepairLocationId"
							:options="locationsData"
							options-label="name"
							additionalSearch="station"
							icon="lokatie_R"
							label="Kies reparatielocatie"
							class="picker-container"
							@input="onChangeWorkOrder"
						/>
						<DateTimePicker
							label="Kies aankomsttijd"
							:disabled="this.workOrder.waitingForWO !== null"
							:icon="true"
							:paddingless="true"
							:value="workOrder.arrivalDate ? $moment(workOrder.arrivalDate).format('YYYY-MM-DD HH:mm:ss') : null"
							class="picker-container"
							@input="(e) => {workOrder.arrivalDate = e}"
						/>
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
						<div class="button" @click="openLeadTimeMinutesModal(null)" v-if="canEditLeadTime" :class="{'disabled': workOrder.waitingForWO !== null}">
							<icon name="klok" size="40" title="Doorlooptijd taak" :color="workOrder.waitingForWO !== null ? '#3A3B3C' : '#0079D3'"/>
						</div>
						<div class="button" @click="openQualificationsModal(null)" v-if="canEditQualification" :class="{'disabled': workOrder.waitingForWO !== null}">
							<icon name="kwalificatie" :color="workOrder.waitingForWO !== null ? '#3A3B3C' : '#0079D3'" size="40" title="Kwalificaties"/>
						</div>
						<div class="button" @click="openWOEquipmentTypeModal(null)" v-if="canEditEquipment" :class="{'disabled': workOrder.waitingForWO !== null}">
							<icon name="ladder" :color="workOrder.waitingForWO !== null ? '#3A3B3C' : '#0079D3'" size="40" title="Outillage" />
						</div>
						<div class="button" @click="openLocationTypeModal(null)" title="Klus type" :class="{'disabled': workOrder.waitingForWO !== null}">
							<icon name="wrench" :color="workOrder.waitingForWO !== null ? '#3A3B3C' : '#0079D3'" size="40"/>
						</div>

						<div class="button" @click="openSameTrainNumberModal(null)" title="In te plannen na:">
							<icon name="link" color="#0079D3" size="40"/>
						</div>

						<div class="work-order-content-bottom">
							<div class="button warning"
								 v-if="workOrder.serviceRequest !== null
									 && workOrder.serviceRequest.assignedLocations !== null
									 && getDependentInfo(sameTrainNumber) == null"
								 @mouseover="showAssignedLocations = true"
								 @mouseleave="showAssignedLocations = false"
							>
								<icon class="warning" name="lokatie" color="#DC0000" size="40" transition="none" />
								<span>{{checkAssignedLocations}}</span>
								&lt;!&ndash; <p class="tip">Service aanvraag is eerder geweigerd.</p> &ndash;&gt;
							</div>

							<div class="button" v-if="duplicatesData.length > 0" :class="{'disabled': workOrder.waitingForWO !== null}"
								 @mouseover="showDuplicateInfo = true"
								 @mouseleave="showDuplicateInfo = false">
								<icon class="inactive" name="docs-empty" :colors="{default: '#0079D3', hover: '#0079D3'}" size="40" transition="none"/>
								<span>{{duplicatesData.length}}</span>
								&lt;!&ndash; <p class="tip">Er zijn meerdere Service Aanvragen voor deze trein.</p> &ndash;&gt;
							</div>

							<div class="button warning" @click="toggleBRegeling()" v-if="workOrder.bRegeling" :class="{'disabled': workOrder.waitingForWO !== null}">
								<icon name="alert_BR" color="#DC0000" size="40"/>
							</div>
							<div class="button warning-hover" @click="toggleBRegeling()" v-if="!workOrder.bRegeling" :class="{'disabled': workOrder.waitingForWO !== null}">
								<icon class="inactive" name="alert_BR" :colors="{default: '#CCCCCC', hover: '#DC0000'}" size="40" transition="none" title="Let op: er is een B-regeling van toepassing"/>
							</div>
							<div class="service-request-buttons">
								<button class="blue" @click="checkSubmitMBN" :class="{'disabled': workOrder.waitingForWO !== null}">Toewijzen</button>
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
									&lt;!&ndash; <div class="push-right">
										<div class="button" @click="getSameTrainNumbers(getDependentInfo(sameTrainNumber).name)" title="In te plannen na:">
											<icon name="trein" color="#0079D3" size="33"/>
										</div>
									</div> &ndash;&gt;
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

				<div class="tip big active" v-if="showDuplicateInfo">
					<table>
						<thead>
						<tr>
							<th>Omschrijving</th>
							<th>Streefdatum einde:</th>
							<th>Locatie</th>
						</tr>
						</thead>
						<tbody>
						<tr v-for="wo in duplicatesData">
							<td>{{replaceNbsps(wo.description)}}</td>
							<td>{{$moment(wo.dueDate).format('DD-MM-YYYY HH:MM')}}</td>
							<td>{{findLocationbyId(wo.workLocationId).name}}</td>
						</tr>
						</tbody>
					</table>
				</div>
			</div>
		</div>
	</div>
</template>-->

<style lang="scss">

// Maybe extract this to a separate file?
.v-expansion-panel-header__icon {
	padding-right: 15px !important;
}


.work-order-mbn-expansion-panel-header {
	padding: 0;

	a {
		&.panel-header-title {
			padding-left: 15px;
			color: #0e1111;
			text-align: left;
			font-weight: bold;
			text-decoration: none;
		}

		&:hover {
			color: forestgreen !important;
		}
	}
}

.work-order-container {
	&.work-order {
		&.work-order-content {
			&.picker-container {
				&.input-wrapper.wrapper-paddingless {
					padding: 0;
				}
			}
		}
	}
}

</style>

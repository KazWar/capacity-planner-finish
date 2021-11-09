<script>
import $snackbar from '@/modules/snackbar-module'
import $loader from '@/modules/loader-module'
import $cache from '@/modules/cache-module'
import { mapMutations, mapActions, mapState } from 'vuex'
import { Guardian } from '@/common/model'
import features from '@/data/demo/features.json'

export default {
  name: 'app',
  data: function () {
      return {
          snackbar: $snackbar,

          loader: $loader,

          connectionAttempts: 0,

          maxConnectionAttempts: 3,

          connectionAttemptTimeout: 3000,

          cache: $cache,

          lastDay: null,

          interval: null,

          selectedTrainSchedule: {
              materialNumber: '1235',
              locationId: 1767,
              location: {
                  name: 'Utrecht'
              }
          },

          displayMaterialNumberModal: false,

          memoModal: {
              enabled: false,
              notification: null,
              memo: null,
              remarks: null,
              markAsRead: null
          },

          remarks: [
              'Extra binnenkomst',
              'Foutief binnengeplust, materieel staat elders',
              'Geen mogelijkheden voor trein op behandelspoor',
              'Geen outillage of onderdelen',
              'Ingezet door vervoerder zonder medeweten Wvb',
              'Interne erplaatsing SB-OB/TC-SB',
              'In overleg met MBN ingezet',
              'Niet voldoende capaciteit',
              'Onoplosbaar configuratieprobleem'
          ].map((v, i) => ({
              id: i,
              name: v
          }))
      }
  },

	mounted () {
        document.addEventListener('memoOpen', this.onMemoOpen)
        document.addEventListener('httpStatusUnauthorized', this.onHttpStatusUnauthorized)
        document.addEventListener('httpStatusInternalServerError', this.onHttpStatusInternalServerError)
        document.addEventListener('apiNotReachable', this.onApiNotReachable)
  },

  beforeDestroy: function () {
      document.removeEventListener('memoOpen', this.onMemoOpen)
      document.removeEventListener('httpStatusUnauthorized', this.onHttpStatusUnauthorized)
      document.removeEventListener('httpStatusInternalServerError', this.onHttpStatusInternalServerError)
      document.removeEventListener('apiNotReachable', this.onApiNotReachable)
      // document.removeEventListener('appSocketUpdate', this.onSocketUpdate)
      clearInterval(this.interval)
  },

  methods: {
  	...mapMutations([
		'SET_CURRENT_LOCATION_ID'
	]),

	  ...mapActions('users', ['loadUsers']),
	  ...mapActions('user', ['loadUser']),
	  ...mapActions('guardian', ['saveGuardian']),

    /**
     * When the memo modal opens
     * @param {CustomEvent} customEvent the event arguments
     */
    onMemoOpen (customEvent) {
        setTimeout(() => {
            this.memoModal = {
                ...this.memoModal,
                notification: customEvent.detail.notification,
                memo: null,
                remarks: null,
                markAsRead: customEvent.detail.markAsRead
            }
        })
    },

    /**
     * Erase the current planning
     * TODO: wait for notificationId to be known for this issue (CPO-386)
     */
    eraseCurrentPlanning () {
        $loader.message = 'Planning wissen'
        $workOrder.resetWorkOrders(this.selectedTrainSchedule.locationId, this.selectedTrainSchedule.materialNumber).then(response => {
            this.selectedTrainSchedule = null
            this.displayMaterialNumberModal = false
            $loader.message = null
        }).catch(response => {
            $loader.message = null
        })
    },

    /**
     * Whenever the connection is refused by the API after an endpoint-call.
     */
    onApiNotReachable () {
        $snackbar.addWarning('De server is offline, probeert u het later nogmaals.')
    },

    /**
     * When the HTTP-status unauthorized (401) is returned from an API-call.
     */
    onHttpStatusUnauthorized () {
        if (this.$router.history.current.name !== 'Login') {
            localStorage.removeItem('sessionId')
            this.$router.push({
                name: 'Login',
                params: {
                    message: 'Uw sessie is niet (meer) geldig, gelieve opnieuw in te loggen.'
                }
            })
        }
    },

    /**
     * When the HTTP-status forbidden (403) is returned from an API-call.
     */
    onHttpStatusForbidden () {
        $snackbar.addWarning('U heeft onvoldoende rechten om deze aanvraag te kunnen doen.')
    },

    /**
     * When the HTTP-status internal server error (500) is returned from an API-call.
     */
    onHttpStatusInternalServerError () {
        $snackbar.addWarning('Er is een fout opgetreden in de server, probeer het later nogmaals.')
    },

    /**
     * Initialises the socket channels
     */
    initialiseSockets () {
        //
        this.$socket.on('connect', () => {
            this.connectionAttempts = 0;
            // console.log('CON: ' + this.$socket.connected);

        })
        this.$socket.on('disconnect', () => {
            if (this.connectionAttempts++ < this.maxConnectionAttempts) {
                setTimeout(() => {
                    document.dispatchEvent(new CustomEvent('initialiseSocket'))
                }, this.connectionAttemptTimeout)
            }
            // console.log('DIS: ' + this.$socket.disconnected);
        })
        if (localStorage.getItem('sessionId') !== null) {
            this.$socket.emit('authentication', {
                userId: localStorage.getItem('userId'),
                id: localStorage.getItem('sessionId')
            })
        }
        this.$socket.on('authenticated', () => {
            this.initialiseTaskSockets()
            this.initialiseWorkOrderSockets()
            this.initialiseMechanicScheduleSockets()
            this.initialiseTrainScheduleSockets()
            this.initialiseEquipmentSockets()
        })


    },

    /**
     * Initialise all the socket channels for the task entity
     */
    initialiseTaskSockets () {
        this.$options.sockets['Task/PUT'] = (data) => {
            if (!data) {
                return
            }
            let workOrder = null
            for (let workOrderCacheIndex in $cache.workOrders) {
                let workOrderCacheObject = $cache.workOrders[workOrderCacheIndex]
                for (let workOrderCacheDetailIndex in workOrderCacheObject) {
                    let workOrderCacheDetailObject = $cache.workOrders[workOrderCacheIndex][workOrderCacheDetailIndex]

                    for (let workOrderIndex in workOrderCacheDetailObject) {
                        workOrder = workOrderCacheDetailObject[workOrderIndex]
                        for (let taskIndex in workOrder.tasks || []) {
                            let task = workOrder.tasks[taskIndex]
                            if (task.id === data.id) {
                                for (let propertyName in data) {
                                    task[propertyName] = data[propertyName]
                                }
                            }
                        }
                    }
                }
            }
            if (workOrder) {
                this.handleWorkOrderSocket(workOrder)
            }
            document.dispatchEvent(new CustomEvent('appSocketUpdate', {
                detail: {
                    channel: 'Task/PUT',
                    data
                }
            }))
        }

        this.$options.sockets['Task/DELETE'] = (data) => {
            if (!data) {
                return
            }
            let workOrder = null
            for (let workOrderCacheIndex in $cache.workOrders) {
                let workOrderCacheObject = $cache.workOrders[workOrderCacheIndex]
                for (let workOrderCacheDetailIndex in workOrderCacheObject) {
                    let workOrderCacheDetailObject = $cache.workOrders[workOrderCacheIndex][workOrderCacheDetailIndex]

                    for (let workOrderIndex in workOrderCacheDetailObject) {
                        workOrder = workOrderCacheDetailObject[workOrderIndex]
                        for (let taskIndex in workOrder.tasks || []) {
                            let task = workOrder.tasks[taskIndex]
                            if (task.id === data.id) {
                                for (let propertyName in data) {
                                    task.splice(propertyName, 1);
                                }
                            }
                        }
                    }
                }
            }
            if (workOrder) {
                this.handleWorkOrderSocket(workOrder)
            }
            document.dispatchEvent(new CustomEvent('appSocketUpdate', {
                detail: {
                    channel: 'Task/DELETE',
                    data
                }
            }))
        }
    },

    /**
     * Initialise all socket channels for the work order entity.
     */
    initialiseWorkOrderSockets () {
        this.$options.sockets['WorkOrder/PUT'] = (data) => {
            this.handleWorkOrderSocket(data)
        }
    },

    /**
     * Handle the work order socket updates
     * @param {object} data the work order object
     */
    handleWorkOrderSocket (data) {
        if (!data) {
            return
        }
        let newWorkOrder = data

        // replace all existing
        for (let workOrderCacheIndex in $cache.workOrders) {
            let workOrderCacheObject = $cache.workOrders[workOrderCacheIndex]
            for (let workOrderCacheDetailIndex in workOrderCacheObject) {
                let workOrderCacheDetailObject = $cache.workOrders[workOrderCacheIndex][workOrderCacheDetailIndex]

                for (let workOrderIndex in workOrderCacheDetailObject) {
                    let workOrder = workOrderCacheDetailObject[workOrderIndex]
                    if (workOrder.id === data.id) {
                        newWorkOrder = workOrder
                        for (let propertyName in data) {
                            if (propertyName.toLowerCase() === 'tasks') {
                                for (let taskIndex in workOrder.tasks) {
                                    let task = workOrder.tasks[taskIndex]
                                    for (let updatedTaskIndex in data.tasks) {
                                        let updatedTask = data.tasks[updatedTaskIndex]
                                        if (updatedTask.id === task.id) {
                                            for (let updatedTaskPropertyName in updatedTask) {
                                                task[updatedTaskPropertyName] = updatedTask[updatedTaskPropertyName]
                                            }
                                        }
                                    }
                                }
                            }
                            else {
                                workOrder[propertyName] = data[propertyName]
                            }
                        }
                    }
                }
            }
        }

        let shouldBeIn = {
            // no extra filtering needed in Monitor.vue
            mbnMonitor:
                // isServiceRequest === true
                newWorkOrder.serviceRequest

                // checkLocation === true
                && (newWorkOrder.locationPO === 'SB'
                || ['AUT',
                    'AUTFLIRT',
                    'AUTGAR',
                    'AUTSB',
                    'AUTSHU',
                    'GSL',
                    'HAGO',
                    'KT-FLIRT',
                    'KT-NZC',
                    'KT-SLT',
                    'KT-SNG',
                    'SB',
                    'TC'
                ].indexOf(newWorkOrder.ntLocationType) !== -1)

                // applicationType === 'MBN'
                && newWorkOrder.MBN === 1,

            // dynamic filter on arrival and departure in ServiceRequestsMBN
            mbnServiceRequests:
                // locationId === NULL
                !newWorkOrder.locationId

                // isServiceRequest === true
                && newWorkOrder.serviceRequest

                // applicationType === 'MBN'
                && newWorkOrder.MBN === 1

                // checkLocation === true
                && (newWorkOrder.locationPO === 'SB'
                || ['AUT',
                    'AUTFLIRT',
                    'AUTGAR',
                    'AUTSB',
                    'AUTSHU',
                    'GSL',
                    'HAGO',
                    'KT-FLIRT',
                    'KT-NZC',
                    'KT-SLT',
                    'KT-SNG',
                    'SB',
                    'TC'
                ].indexOf(newWorkOrder.ntLocationType) !== -1),

            // dynamic filter in WorkOrders.vue necessary for: materialNumbers, arrivalDate and departureDate
            sbWorkOrders:
                // locationId
                (newWorkOrder.locationId === Number(localStorage.getItem('locationId')) || !newWorkOrder.locationId)

                // checkLocation === true
                && (newWorkOrder.locationPO === 'SB'
                || ['AUT',
                    'AUTFLIRT',
                    'AUTGAR',
                    'AUTSB',
                    'AUTSHU',
                    'GSL',
                    'HAGO',
                    'KT-FLIRT',
                    'KT-NZC',
                    'KT-SLT',
                    'KT-SNG',
                    'SB',
                    'TC'
                ].indexOf(newWorkOrder.ntLocationType) !== -1)

                // applicationType === 'SB'
                && !(newWorkOrder.MBN === 1 && !newWorkOrder.locationId),

            // Filter on arrivalDate in ServiceRequestsSB.vue
            sbServiceRequests: // locationId
                (newWorkOrder.locationId === Number(localStorage.getItem('locationId')) || !newWorkOrder.locationId)

                // isServiceRequest === true
                && newWorkOrder.serviceRequest

                // applicationType === 'SB'
                && !(newWorkOrder.MBN === 1 && !newWorkOrder.locationId)

                // checkLocation === true
                && (newWorkOrder.locationPO === 'SB'
                || ['AUT',
                    'AUTFLIRT',
                    'AUTGAR',
                    'AUTSB',
                    'AUTSHU',
                    'GSL',
                    'HAGO',
                    'KT-FLIRT',
                    'KT-NZC',
                    'KT-SLT',
                    'KT-SNG',
                    'SB',
                    'TC'
                ].indexOf(newWorkOrder.ntLocationType) !== -1)
        }

        let listsMappedByPage = {
            mbnMonitor: $cache.workOrders.getListServiceRequestsMBN,
            mbnServiceRequests: $cache.workOrders.getListServiceRequestsMBNArrivalDeparture,
            sbWorkOrders: $cache.workOrders.getListLocationMaterialNumbersTodayTomorrowPO,
            sbServiceRequests: $cache.workOrders.getListServiceRequestsLocationDate
        }
        for (let pageName in listsMappedByPage) {
            if (shouldBeIn[pageName]) {
                for (let workOrderListIndex in listsMappedByPage[pageName]) {
                    let workOrderList = listsMappedByPage[pageName][workOrderListIndex]
                    if (workOrderList.filter(x => x.id === data.id).length === 0) {
                        workOrderList.push(data)
                    }
                }
            }
            else {
                for (let workOrderListIndex in listsMappedByPage[pageName]) {
                    let workOrderList = listsMappedByPage[pageName][workOrderListIndex]
                    listsMappedByPage[pageName][workOrderListIndex] = listsMappedByPage[pageName][workOrderListIndex].filter(x => x.id !== data.id)
                }
            }
        }

        document.dispatchEvent(new CustomEvent('appSocketUpdate', {
            detail: {
                channel: 'WorkOrder/PUT',
                data
            }
        }))
    },

    /**
     * Initialise all socket channels for the work order entity.
     */
    initialiseMechanicScheduleSockets () {
        this.$options.sockets['Shift/PUT'] = (data) => {
            document.dispatchEvent(new CustomEvent('appSocketUpdate', {
                detail: {
                    channel: 'Shift/PUT',
                    data
                }
            }))
        }
        this.$options.sockets['MechanicSchedule/PUT'] = (data) => {
            if (!data) {
                return
            }
            for (let mechanicScheduleCacheIndex in $cache.mechanicSchedules) {
                let mechanicScheduleCacheObject = $cache.mechanicSchedules[mechanicScheduleCacheIndex]
                for (let mechanicScheduleCacheDetailIndex in mechanicScheduleCacheObject) {
                    let mechanicScheduleCacheDetailObject = mechanicScheduleCacheObject[mechanicScheduleCacheDetailIndex]
                    for (let mechanicScheduleIndex in mechanicScheduleCacheDetailObject) {
                        let mechanicSchedule = mechanicScheduleCacheDetailObject[mechanicScheduleIndex]
                        if (data.id === mechanicSchedule.id) {
                            for (let propertyName in data) {
                                let propertyValue = data[propertyName]
                                mechanicSchedule[propertyName] = propertyValue
                            }
                        }
                    }
                }
            }
            document.dispatchEvent(new CustomEvent('appSocketUpdate', {
                detail: {
                    channel: 'MechanicSchedule/PUT',
                    data
                }
            }))
        }
    },

    /**
     * Initialise all socket channels for the work order entity.
     */
    initialiseTrainScheduleSockets () {
        this.$options.sockets['TrainSchedule/PUT'] = (data) => {
            if (!data) {
                return
            }
            // Find the existing schedule
            let trainSchedule = this.trainSchedules.filter(x => x.id === data.id)
            trainSchedule = trainSchedule.length === 0 ? null : trainSchedule[0]

            // Edit the schedule
            let found = false
            for (let trainScheduleCacheIndex in $cache.trainSchedules) {
                let trainScheduleCacheObject = $cache.trainSchedules[trainScheduleCacheIndex]
                for (let trainScheduleCacheDetailIndex in trainScheduleCacheObject) {
                    let trainScheduleCacheDetailObject = trainScheduleCacheObject[trainScheduleCacheDetailIndex]
                    for (let trainScheduleIndex in trainScheduleCacheDetailObject) {
                        let trainSchedule = trainScheduleCacheDetailObject[trainScheduleIndex]
                        if (data.id === trainSchedule.id) {
                            found = true
                            for (let propertyName in data) {
                                let propertyValue = data[propertyName]
                                trainSchedule[propertyName] = propertyValue
                            }
                        }
                    }
                }
            }

            // Add if necessary
            if (!found && Number(data.locationId) === Number(localStorage.getItem('locationId'))) {
                let cacheKeyPrefix = data.locationId + ' - '
                for (let trainScheduleListName in $cache.trainSchedules) {
                    if (trainScheduleListName.substring(0, cacheKeyPrefix.length) !== cacheKeyPrefix) {
                        continue
                    }
                    let trainScheduleList = $cache.trainSchedules[trainScheduleListName]
                    trainScheduleList.push(data)
                }
            }

            // Delete if necessary
            if (!found && Number(data.locationId) === Number(localStorage.getItem('locationId'))) {
                let cacheKeyPrefix = data.locationId + ' - '
                for (let trainScheduleListName in $cache.trainSchedules) {
                    if (trainScheduleListName.substring(0, cacheKeyPrefix.length) !== cacheKeyPrefix) {
                        continue
                    }
                    let trainScheduleList = $cache.trainSchedules[trainScheduleListName]
                    for (let i = trainScheduleList.length - 1; i >= 0; i--) {
                        let trainSchedule = trainScheduleList[i]
                        if (Number(trainSchedule.locationId) !== Number(data.locationId)) {
                            trainScheduleList.splice(i, 1)
                        }
                    }
                }
            }

            document.dispatchEvent(new CustomEvent('appSocketUpdate', {
                detail: {
                    channel: 'TrainSchedule/PUT',
                    data
                }
            }))
        }
    },

    /**
     * Initialise all socket channels for the work order entity.
     */
    initialiseEquipmentSockets () {
        this.$options.sockets['Equipment/PUT'] = (data) => {
            if (!data) {
                return
            }
            for (let equipmentCacheIndex in $cache.equipments) {
                let equipmentCacheObject = $cache.equipments[equipmentCacheIndex]
                for (let equipmentCacheDetailIndex in equipmentCacheObject) {
                    let equipmentCacheDetailObject = equipmentCacheObject[equipmentCacheDetailIndex]
                    for (let equipmentIndex in equipmentCacheDetailObject) {
                        let equipment = equipmentCacheDetailObject[equipmentIndex]
                        if (data.id === equipment.id) {
                            for (let propertyName in data) {
                                let propertyValue = data[propertyName]
                                equipment[propertyName] = propertyValue
                            }
                        }
                    }
                }
            }
            document.dispatchEvent(new CustomEvent('appSocketUpdate', {
                detail: {
                    channel: 'Equipment/PUT',
                    data
                }
            }))
        }
    },

    /**
     * Save the memo
     */
    saveMemo () {
        if (this.memoModal.memo && this.memoModal.memo.length > 0 && this.memoModal.remarks && this.memoModal.remarks.length > 0) {
            $loader.message = 'Memo opslaan'
            if (!this.memoModal.notification.workOrderId[0]) {
                $snackbar.addWarning('Kon werkorder niet vinden, probeert u het later nogmaals.')
                return
            }
            $workOrder.getDetail(this.memoModal.notification.workOrderId[0]).then(response => {
                let workOrder = JSON.parse(response.data)
                let asset = workOrder.asset
                if (!asset) {
                    $snackbar.addWarning('Er kon geen asset gevonden worden op de werkorder, probeert u het later nogmaals.')
                    $loader.message = null
                }
                else {
                    asset.maintenanceLocation = 'MAT'
                    asset.reasonMaintenance = null
                    asset.memo = this.memoModal.memo
                    asset.remark = this.memoModal.remarks
                    $asset.put(asset).then(response => {
                        $loader.message = null
                        $snackbar.add('Asset aangepast.')
                        this.memoModal.markAsRead()
                        this.memoModal.enabled = false
                    }).catch(response => {
                        $loader.message = null
                    })
                }
            }).catch(response => {
                $snackbar.addWarning('Kon werkorder niet vinden, probeert u het later nogmaals.')
                $loader.message = null
            })
        }
        else {
            $snackbar.addWarning('Gelieve alle velden in te vullen')
        }
    }
  },
	computed:{
		...mapState('user',['current'])
	},

  created () {
	  this.$store.commit("SET_CURRENT_LOCATION_ID")

	  // Loading in the demo data.

	  // Load in all the dummy users.
	  this.loadUsers()

	  // Load in all the dummy accounts used for logging in.
	  this.loadUser()
  }
}
</script>

<template>
	<v-app>
		<navigation v-if="!$route.meta.hideNavigation"/>

		<snackbar :snackbar="snackbar" />

		<loader :message="loader.message"/>

		<modal v-model="displayMaterialNumberModal" :canClose="false" :noPadding="true" :title="null">
			<div slot="content">
				<p>Servicewindow aanpassing:</p>
				<p>Treinstel <span style="font-weight: bold;">{{selectedTrainSchedule.materialNumber}}</span> komt niet naar {{selectedTrainSchedule.location.name}}.</p>
				<p style="margin-top: 10px; position: absolute;">Klik 'OK' om gemaakte planning te wissen.</p>
			</div><div slot="buttons">
			<button class="button orange right" @click="eraseCurrentPlanning()">OK</button>
		</div>
		</modal>

		<modal class="modal-memo" v-model="memoModal.enabled" title="Reden vertrek met ongewenste status">
			<div slot="content">
				<picker label="Reden" v-model="memoModal.remarks" type="select" selectIdProperty="id" selectValueProperty="name" :values="remarks" />
				<picker label="Opmerkingen" v-model="memoModal.memo" type="text" />
			</div><div slot="buttons">
			<div class="button right" @click="saveMemo()">
				Opslaan
			</div>
		</div>
		</modal>

		<router-view class="page-content"/>
		<div class="global-overflow" :class="{'show': loader.message !== null}"></div>
	</v-app>
</template>


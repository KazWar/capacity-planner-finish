<template>
	<div class="work-order-container" :data-work-order-id="workOrder && workOrder.id ? 'work-order-' + workOrder.id : null" v-if="!isHidden">
		<div class="work-order" :class="{'show': active}">
			<div class="work-order-top" :class="{'sent-to-maximo': isWorkOrderSentToMaximo(), 'scheduled': workOrder.isScheduled}"  @click="toggleWorkOrder(workOrder.id)">
				<div class="col href" :title="workOrder.description" @click="openWorkOrderInMaximo(event)">{{workOrder.WO}}</div>

				<div class="col" title="Stel/stam nummer" >
					<icon name="trein" size="30" style="margin-top: -5px;" :color="isWorkOrderSentToMaximo() ? '#C5C5CB' : '#3a3b3c'"/>
					{{workOrder.materialNumber}}
				</div>

				<div class="col">{{workOrder.seriesCode}}</div>

				<div class="col" title="Type werk" >
					<icon name="werkzaamheden" size="30" style="margin-top: -5px;" :color="isWorkOrderSentToMaximo() ? '#C5C5CB' : '#3A3B3C'"/>
					{{workOrder.type}}
				</div>

				<div class="col">
					<icon name="kalender" size="30" style="margin-top: -5px;" :color="isWorkOrderSentToMaximo() ? '#C5C5CB' : '#3A3B3C'"/>
					{{ monthDateTimeFormat(workOrder.dueDate) }}
				</div>

				<div class="col right">
					<div class="icons" v-if="workOrder.fleetControlStatus == 'Niet Inzetbaar'" title="Materieel wordt Niet Inzetbaar voor de volgende overstand">
						<icon name="alert" size="30" :color="isWorkOrderSentToMaximo() ? '#C5C5CB' : '#DC0000'"/>
					</div>
					<div class="icons">
						<icon name="kalender" size="33" :color="getCalendarIconColor()" :title="getCalendarIconTitle()"/>
					</div>
					<div class="icons">
						<icon name="vinkje" size="33" :color="getCheckMarkIconColor()" :title="getCheckMarkIconTitle()"/>
					</div>
					<div class="icons toggle">
						<icon name="chevron-neerwaarts" size="60" color="rgb(0, 121, 211)" transition="all 0.3s ease"/>
					</div>
				</div>
			</div>

			<div class="work-order-content" v-if="active">
				<div class="task">
					<div class="task-title" v-if="workOrder.type == 'PREIN'">
						<div class="description">
							{{workOrder.description}}
						</div>
					</div>
					<div class="task-content" v-if="checkTaskStatus()">
						<TreeSelect
							:disabled="!canEditTask"
							v-model="workOrder.serviceWindowEmplacementId"
							:options="parsedTimeslots"
							options-label="value"
							icon="kalender"
							label="Kies een opstelling"
							class="picker-container"
							noOptionsText="Geen bruikbare opstellingen beschikbaar"
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
					<div class="task" v-else-if="workOrder.tasks.length < 1">
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
					<div class="task" v-for="(task, index) in workOrder.tasks" :key="index" v-else>
						<div class="task-title">
							<div class="square task-id" :class="{'selected': tasksSelectable && selectedTaskIds.indexOf(task.id) !== -1}" @click="selectTaskId !== undefined ? selectTaskId(task.id) : () => {}" title="Taaknummer">
								{{task.taskOrder}}
							</div><div class="square" title="Taakstatus">
							{{task.status}}
						</div><div class="square wide" title="Taak doorlooptijd">
							<icon name="klok" size="30" color="#3A3B3C"/>
							{{task.leadTimeMinutes || 0}} min
						</div><div class="description">
							{{task.description}}
						</div>
						</div>
						<div class="task-content" v-if="canEditTask">
							<TreeSelect
								v-model="task.mechanicId"
								:options="mechanics"
								options-label="name"
								icon="drukte-3"
								label="Kies monteur"
								class="picker-container"
								noOptionsText="Geen monteur beschikbaar"
							/>
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
								<div class="service-request-buttons">
									<button @click="openDeclineServiceRequestModal(index)" class="red" v-if="checkIfTasksContainsSR()">
										Weiger
									</button>
								</div>
								<icon class="button warning" name="alert_SA" color="#DC0000" size="40" v-if="checkIfTasksContainsSR()"/>
								<div class="button warning" v-if="workOrder.bRegeling">
									<icon name="alert_BR" color="#DC0000" size="40"/>
								</div>
							</div>
						</div>
					</div>
				</template>
				<template v-else>
					<div class="task">
						<div class="buttons">
						</div>
					</div>
				</template>
				<div class="work-order-action-buttons">
					<template v-if="workOrder.type !== 'PREIN'">
						<template v-if="workOrder.tasks.length > 0">
							<button class="red"
								:class="{'disabled': backgroundRequestsProcessing}"
								v-if="(workOrder.isScheduled || isWorkOrderSentToMaximo())"
								@click="reseteWo(workOrder.id)">
								Reset
							</button>
							<button class="blue" :class="{'disabled': backgroundRequestsProcessing}" @click="planWo(workOrder.id, workOrder.locationId)" v-else>
								Goedkeuren
							</button>
						</template>
					</template>
					<template v-else>
						<button class="red"
							:class="{'disabled': backgroundRequestsProcessing}"
							v-if="workOrder.isScheduled"
							@click="reseteWo(workOrder.id)">
							Reset
						</button>
						<button class="blue"
							:class="{'disabled': backgroundRequestsProcessing}"
							@click="approveWo(workOrder.id, workOrder.locationId)"
							v-else>
							Goedkeuren
						</button>
					</template>

				</div>
			</div>
		</div>
	</div>
</template>

<script>
import $date from '@/modules/date-module'
import _ from 'lodash'
import env from '@/env'

export default {
	props: ['initializeOnStart', 'active', 'item', 'type', 'mechanics', 'forceContentVisible', 'selectedTaskIds', 'startDateChart', 'selectTaskId', 'equipmentList', 'equipmentTypes', 'canEditTask', 'canEditEquipment', 'canEditLeadTime', 'tasksSelectable', 'locations', 'getQualifiedMechanicsForTask', 'warningsOnly', 'availableTimeslots', 'watchTimeslots'],
	data: function () {
		return {
			workOrder: this.$props.item,
			key: Date.now(),
			backgroundRequestsProcessing: false,
			timeslot: null,
			isHidden: false,
			contentVisible: false,
			startTime: null,
			leadTimeMinutes: 0,
			tasks: [],
			startTimes: [],
			mechanicIds: [],
			timeslotTasks: [],
			mechanicId: null,
			equipment: [],
			displayModalLeadTime: false,
			displayModalDeclineServiceRequest: false,
			taskIndex: null,
			declineReasonServiceRequest: null,
			isContentInitialized: false,
			workOrderInitialized: false,
			tempWorkLocationId: null,
			tempRepairLocationId: null,
			arrivalDate: null,
			defectOnLocation: null,
			maintenanceTrack: null,
			matchedLocationBool: false,
			startWatchingTasks: false,
			locationsData: this.locations,
			// sameTrainNumber: this.workOrder.waitingForWO
			sameTrainNumber: null,
			maintenanceLocation: null,
			parsedTimeslots: []
		}
	},
	computed: {
		/**
		 * The formatted due date of a workorder
		 */
		dueDate () {
			// console.log('WO computed dueDate')
			return !this.workOrder || !this.workOrder.dueDate ? '' : $date.formatDayMonthTimeStamp(new Date(this.workOrder.dueDate))
		},
	},

	watch: {
		'workOrder.serviceWindowEmplacementId': {
			handler: function () {
				// console.log('WO watch workOrder.serviceWindowEmplacementId')
				this.setTimeslotOnWoLevel()
				this.workOrder.isScheduled = false;
			},
			deep: true
		},

		warningsOnly: function () {
			// console.log('WO watch warningsOnly')
				this.isHidden = false
		},
		locations: {
			handler: function () {
				// console.log('WO watch locations')
				this.locationsData = this.locations
				if (this.workOrder.asset) {
					this.maintenanceLocation = this.getMaintanceLocationName(this.workOrder.asset.maintenanceLocation)
				} else {
					this.maintenanceLocation = this.getMaintanceLocationName(this.workOrder.maintenanceLocation)
				}
			},
			deep: true
		},
		startTimes: {
			handler: function () {
				// console.log('WO watch startTimes')
				this.onChangeStartTime()
			},
			deep: true
		},

		'workOrder.tasks': {
			handler: function () {
				// console.log('WO watch workOrder.tasks')
				if (this.startWatchingTasks) {
					for (let taskIndex in this.workOrder.tasks) {
						let task = this.workOrder.tasks[taskIndex]
						task.isSentToMaximo = false
						// if (task.isSentToMaximo === false) {
						//     result = false
						//     break
						// }
					}
					this.onChangeMechanic()
				}
			},
			deep: true
		},

		mechanicIds: {
			handler: function () {
				// console.log('WO watch mechanicIds')
				this.onChangeMechanic()
			},
			deep: true
		},


		tempRepairLocationId: function (newVal, oldVal) {
			// console.log('WO watch tempRepairLocationId')
			if (this.workOrderInitialized) {
				this.onChangeWorkOrder()
			}
		},

		tempWorkLocationId: function (newVal, oldVal) {
			// console.log('WO watch tempWorkLocationId')
			// console.log(oldVal);
			if (this.workOrderInitialized) {
				this.onChangeWorkOrder()
			}
		},

		arrivalDate: function (newVal, oldVal) {
			// console.log('WO watch arrivalDate')
				if (this.workOrderInitialized) {
					this.onChangeWorkOrder()
				}
		},

		defectOnLocation: function (newVal, oldVal) {
			// console.log('WO watch defectOnLocation')
			if (this.workOrderInitialized) {
				this.onChangeWorkOrder()
			}
		},
		maintenanceTrack: function (newVal, oldVal) {
			// console.log('WO watch defectOnLocation')
			if (this.workOrderInitialized) {
				this.$emit('workOrderMaintenanceTrackChange', {
					detail: {
						id: this.workOrder.id,
						maintenanceTrack: this.maintenanceTrack
					}
				})
			}
		}
	},

	created: function () {
		// console.log('WO created')
		document.addEventListener('workOrderChangeStartTime', this.onWorkOrderChangeStartTime)
	},

	mounted: function () {
		// console.log('WO mounted')
		this.$root.$on('closeWorkOrder', this.closeAllWorkOrders)
		this.$root.$on('updateWO', this.updateWO)
		this.initializeWorkOrder()

		// this.initEquipmentTypeIdModalValue()
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
		setTimeout(() => {
			this.startWatchingTasks = true
		}, 1500)
	},

	beforeDestroy: function () {
		// console.log('WO beforeDestroy')
		document.removeEventListener('workOrderChangeStartTime', this.onWorkOrderChangeStartTime)
	},

	methods: {
		checkTaskStatus () {
			// console.log('WO methods checkTaskStatus')
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
			// console.log('WO methods setTimeslotOnWoLevel')
			if(!this.isContentInitialized){
				return;
			}
			this.backgroundRequestsProcessing = true
			let data
			if (this.workOrder.serviceWindowEmplacementId) {
				data = {
					workOrderId: this.workOrder.id,
					emplacementId: this.workOrder.serviceWindowEmplacementId
				}
			} else {
				data = {
					workOrderId: this.workOrder.id
				}
			}

			if (data.emplacementId) {
				this._api.setEmplacementForWorkOrder(data).then((response) => {
					this.processEmplacementsResponses(data);
				})
			} else {
				this._api.unsetEmplacementFromWorkOrder(data).then((response) => {
					this.processEmplacementsResponses(data);
				})
			}
		},
		processEmplacementsResponses(data){
			// console.log('WO methods processEmplacementsResponses')
			let timeslotData = _.find(this.availableTimeslots, {'id': this.workOrder.serviceWindowEmplacementId})

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

					if(taskData.emplacementId !== null){
						this._api.setEmplacementForTask(taskData).then((response) => {
							task.serviceWindowEmplacementId = data.emplacementId
							task.tempStart = response.tempStart;
							task.tempEnd = response.tempEnd;
						})
					} else {
						this._api.unsetEmplacementFromTask(taskData).then((response) => {
							//
						})
					}
				}
			}

			this.$emit('placeTimeslotOnChart', data)

			setTimeout(() => {
				this.backgroundRequestsProcessing = false
			}, 1000)
		},
		getMaintanceLocationName (maintenanceLocation) {
			// console.log('WO methods getMaintanceLocationName')
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
		planWo (woId, locationId) {
			// console.log('WO methods approveWo')
			let obj = {
				ids: [woId],
				locationId: +this.$store.getters['GET_CURRENT_LOCATION_ID']
			}
			this._api.planSelectionWorkorder(obj.ids, obj.locationId).then(res => {
				this.workOrder.isScheduled = true;
			})
		},
		approveWo(woId, locationId) {
			let obj = {
				id: woId.toString(),
				locationId: this.$store.getters['GET_CURRENT_LOCATION_ID']
			}
			this._api.approveWO(obj).then(res => {
				this.workOrder.isScheduled = true;
			})
		},
		reseteWo(woId){
			let obj = {
				id: woId.toString()
			}
			this._api.resetWO(obj).then(res => {
				this.workOrder.isScheduled = false;
			})
		},
		monthDateTimeFormat (date) {
			// console.log('WO methods monthDateTimeFormat')
			if (date == null) {
				return 'Nog onbekend'
			} else {
				return $date.getDateDayMonthTimeNumbers(new Date(date))
			}

			// return date;
		},
		getMatchedLocationId (bool) {
			// console.log('WO methods getMatchedLocationId')
			this.matchedLocationBool = bool
		},
		/**
		 * When the task in the workorder should change its start time in this component
		 * @param {CustomEvent} eventArgs the event arguments
		 */
		onWorkOrderChangeStartTime (eventArgs) {
			// console.log('WO methods onWorkOrderChangeStartTime')
			this.$nextTick(() => {
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
		 * Whenever a work order changes
		 */
		onChangeWorkOrder: _.debounce(
			function (test, saveMbn) {
				// console.log('WO methods onChangeWorkOrder')
				this.workOrder.isScheduled = false;
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

				this.$emit('generateChartData')
			}, 500),
		checkTimeslotsNNB () {
			// console.log('WO methods checkTimeslotsNNB')

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
			// console.log('WO methods toggleContentVisibility')
				let contentVisible = this.contentVisible

				if (contentVisible) {
					// console.log('is visible')
					this.contentVisible = true
					this.checkTimeslotsNNB()
					let taskIds = []
					if (this.workOrder.tasksSelectable) {
						for (let taskIndex in this.workOrder.tasks) {
							let task = this.workOrder.tasks[taskIndex]
							taskIds.push(task.id)
						}
					}
					this.$emit('selectedWorkOrderChange', {
						detail: {
							workOrder: this.workOrder
						}
					})
					this.$emit('selectedTaskIdsChange', {
						detail: {
							materialNumber: this.workOrder.materialNumber,
							selectedTaskIds: taskIds
						}
					})
				}
				else {

					// console.log('isnt visible')
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
			this.$emit('scrollToMaterial', this.workOrder.materialNumber)
		},

		closeAllWorkOrders (id) {
			// console.log('WO methods closeAllWorkOrders')
			if (id !== this.workOrder.id && this.contentVisible && this.isContentInitialized) {
				this.toggleWorkOrder()
			}
		},
		updateWO (wo) {
			// console.log('WO methods updateWO')
			if (this.workOrder.id === wo.id) {
				this.workOrder = wo
				let args = {
					detail: {
						workOrder: wo
					}
				}
				this.$emit('selectedWorkOrderChange', args)
			}
		},
		toggleWorkOrder (id = null) {
			// console.log('WO methods toggleWorkOrder')
			if (id) {
				this.$root.$emit('closeWorkOrder', id)
			}
			this.contentVisible = this.contentVisible || this.active ? false : true
			this.isContentInitialized = !this.isContentInitialized
			this.toggleContentVisibility()
		},
		/**
		 * When the mechanic of a task has changed
		 */
		onChangeMechanic () {
			// console.log('WO methods onChangeMechanic')
			for (let taskIndex in this.workOrder.tasks) {
				let task = this.workOrder.tasks[taskIndex]
				// let mechanicId = task.mechanicId
				this.$emit('workOrderTaskChange', {
					detail: {
						materialNumber: this.workOrder.materialNumber,
						task,
						workOrderId: this.workOrder.id
					}
				})
			}
		},

		/**
		/**
		 * When the start time of a task has changed
		 */
		onChangeStartTime () {
			// console.log('WO methods onChangeStartTime')
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
					this.$emit('workOrderTaskChange', {
						detail: {
							materialNumber: this.workOrder.materialNumber,
							task,
							workOrderId: this.workOrder.id,
							wasNull

						}
					})

					let taskIds = []
					if (this.workOrder.tasksSelectable) {
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
			// console.log('WO methods getTasksTimeslots')
			let arr = []
			for (let index in tasks) {
				let task = tasks[index]

				arr.push(task.serviceWindowEmplacementId)
			}

			return arr
		},

		/**
		 * Initialize the work order
		 */
		initializeWorkOrder () {
			// console.log('WO methods initializeWorkOrder')
			this.workOrder.tasks = this.workOrder.tasks || []

				this.maintenanceTrack = this.workOrder.maintenanceTrack
				this.timeslot = this.workOrder.serviceWindowEmplacementId
				if (this.workOrder.tasks) {
					this.timeslotTasks = this.getTasksTimeslots(this.workOrder.tasks)
				}
			for (let index in this.workOrder.tasks) {
				let task = this.workOrder.tasks[index]
				if (!task.tempStart) {
					this.startTimes[index] = null
				}
				else {
					this.startTimes[index] = this.calculateStartTime(task)
				}
				this.mechanicIds[index] = task.mechanicId
			}
			setTimeout(() => {
				this.workOrderInitialized = true
			}, 500)
		},

		/**
		 * Calculate the start time for a task
		 * @param {object} task the task
		 */
		calculateStartTime (task) {
			// console.log('WO methods calculateStartTime')
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
		// console.log('WO methods openLeadTimeMinutesModal')
			this.$root.$emit('openWOLeadTimeModal', {
				index: taskIndex,
				workOrder: this.workOrder
			})
		},

		openEquipmentModal (taskIndex) {
	// console.log('WO methods openEquipmentModal')
			this.$root.$emit('openWOEquipmentModal', {
				index: taskIndex,
				workOrder: this.workOrder
			})
		},
		openQualificationsModal (taskIndex) {
		// console.log('WO methods openQualificationsModal')
			this.$root.$emit('openWOQualificationsModal', {
				index: taskIndex,
				workOrder: this.workOrder
			})
		},


		/**
		 * Open the decline service request modal
		 */
		openDeclineServiceRequestModal (taskIndex) {
			// console.log('WO methods openDeclineServiceRequestModal')
			this.$root.$emit('openWODeclineReasonModal', {
				index: taskIndex,
				workOrder: this.workOrder
			})
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
			// console.log('WO methods getCalendarIconColor')
			let result = 'none';
			if(this.workOrder.serviceWindowEmplacementId !== null){
				result = '#0B9126'
			}

			if(this.workOrder.tasks.length > 0){
				let allTasksPlanned = true
				let conflictServiceWindow = false

				for (let taskIndex in this.workOrder.tasks) {
					let task = this.workOrder.tasks[taskIndex]
					if (task.serviceWindowEmplacementId !== null) {
						if (task.conflictServiceWindow === true) {
							conflictServiceWindow = true
						}
					}
					else {
						allTasksPlanned = false
					}
				}

				if(conflictServiceWindow){
					result = '#DC0000'
				}
			}

			if(this.workOrder.isScheduled){
				result = '#C5C5CB'
			}

			return result;
		},
		getCalendarIconTitle () {
			// console.log('WO methods getCalendarIconTitle')
			if (this.workOrder.tasks.length > 0) {
				let allTasksPlanned = true
				let conflictServiceWindow = false

				for (let taskIndex in this.workOrder.tasks) {
					let task = this.workOrder.tasks[taskIndex]
					if (task.serviceWindowEmplacementId !== null) {
						if (task.conflictServiceWindow == true) {
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
			// console.log('WO methods getCheckMarkIconColor')
			let result = 'none';

			if(this.workOrder.tasks.length > 0){
				for (let taskIndex in this.workOrder.tasks) {
					let task = this.workOrder.tasks[taskIndex]

					if(task.mechanicId == null){
						result = 'none';
						break;
					} else {
						if(task.conflictServiceWindow == true) {
							result = '#DC0000'
							break;
						} else {
							result = '#0B9126'
						}
					}
				}
			}

			if(this.workOrder.isScheduled){
				result = '#C5C5CB'
			}

			return result;
		},
		getCheckMarkIconTitle () {
			// console.log('WO methods getCheckMarkIconTitle')
			if (_.isEmpty(this.workOrder.tasks)) {
				let allTasksPlanned = true
				let conflictMechanic = false

				for (let taskIndex in this.workOrder.tasks) {
					let taskObject = this.workOrder.tasks[taskIndex]
					if (taskObject.serviceWindowEmplacementId !== null && taskObject.mechanicId !== null) {
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


		checkIfTasksContainsSR () {
			// console.log('WO methods checkIfTasksContainsSR')
			let result = false
			for (let taskIndex in this.workOrder.tasks) {
				let task = this.workOrder.tasks[taskIndex]
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
			// console.log('WO methods isWorkOrderSentToMaximo')
			let result = true
			if (this.workOrder.isScheduled) {
				result = true
			}

			if(this.workOrder.serviceWindowEmplacementId !== null){
				result = true
			}

			if (this.workOrder.tasks.length > 0) {
				for (let taskIndex in this.workOrder.tasks) {
					let task = this.workOrder.tasks[taskIndex]

					if(task.isSentToMaximo || this.workOrder.isScheduled){
						result = true
					} else {
						result = false;
					}
				}
			} else {
				result = false
			}

			return result
		},
		/**
		 * Open the workorder in maximo
		 */
		openWorkOrderInMaximo (event) {
			// console.log('WO methods openWorkOrderInMaximo')
			window.open(env.maximoURL + this.workOrder.WO, '_blank')
		},
	}
}
</script>

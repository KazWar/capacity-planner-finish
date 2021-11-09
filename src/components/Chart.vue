<template>
	<div class="chart-wrap">
		<h1 class="section-heading">{{ title }}</h1>
		<div class="chart" :class="[{'hide-hours': hideHours, 'selectable': selectable, 'disabled': !chartStatus}, chartClass]">
			<!-- The main chart content -->
			<div class="chart-content">
				<!-- Hides the overflow of the label in the chart head -->

				<!-- Left part of the chart -->
				<div class="chart-left">
					<!-- Top left corner of the chart -->
					<div class="chart-top-left"></div>

					<!-- All of the labels -->
					<div class="chart-labels" :style="{'max-height': getMaxHeight()}"> <!-- 15vh was before -->
						<!-- The row indicators -->
						<div
							class="chart-label" v-for="(label, index) in removeDuplicates()" :key="index"
							:class="{'selected': selectedLocationId === label.id,
                            'emphasized': emphasizedRowIndices.indexOf(index) !== -1,
                            'hide-mechanics': checkHideMechanics(index),
                            'wide': label.station}"
							v-if="checkPitStopFilterLocation(label)"> <!-- v-if="filterLocationsByQualifications()" -->
							<span>
                            <div v-if="label.fleetControlStatus" class="fleet-control-status">
                                <div :class="{
                                    purple: i === 2 && label.fleetControlStatus === i,
                                    red: i === 1 && label.fleetControlStatus === i,
                                    green: i === 3 && label.fleetControlStatus === i
                                }" class="circle" v-for="i in 3" :key="i"></div>
                            </div>

                            <div class="reason-of-arrival" @click="selectLabel(label.id, 'reason-maintenance')">
                                {{
									maintenanceReasons.filter(x => x.code === label.reasonMaintenance).length > 0
										? maintenanceReasons.filter(x => x.code === label.reasonMaintenance)[0].reason
										: ''
								}}
                            </div>
                            <span @click="selectLabel(label.id, 'material-number')">
                                {{label.value}}
                            </span>
                            <span v-if="label.station" class="station">
                                {{label.station}}
                            </span>

                        </span>
						</div>
					</div>
				</div>

				<!-- Right part of the chart -->
				<div class="chart-right">
					<!-- The chart header -->
					<div class="chart-head" v-if="hideHours !== true" :style="{'width': '100000px'}">
						<!-- The column indicators -->
						<div class="chart-head-column" v-for="(hour, index) in hours" :key="index">
							<div class="chart-head-column-label" :class="{'date': true}" v-if="Object.prototype.toString.call(hour) === '[object Date]'">
								<div>{{formatDateByDate(hour)}}</div>
								<div>{{formatTimeByDate(hour)}}</div>
							</div>
							<div class="chart-head-column-label" :class="{'current-hour': index === offsetHours && visualizeCurrentHour}" v-else>
								{{hour}}:00
							</div>
							<div class="current-time-overlay" v-if="index === offsetHours && visualizeCurrentHour"></div>
							<div class="current-time" v-if="type == 'pitstop' && formatTimeByDate(hour) == parsedHour && checkIfCurrentDate(hour)" :style="{'height': removeDuplicates().length * 35 + 55 + 'px'}"></div>
						</div>
					</div>

					<!-- The visual part of the chart -->
					<div class="chart-visualization-container">
						<perfect-scrollbar :options="scrollBarOpts" class="chart-visualization" v-dragscroll  @scroll.passive="broadCastScroll($event, header)"  :id="id">
							<div
								class="chart-row"
								v-for="(label, rowIndex) in removeDuplicates()"
								:key="rowIndex"
								:style="{'width': chartWidth + 2 + 'px'}"
								:class="{'selected': selectedId === getLabelIdByRowIndex(rowIndex),
                                'fade': selectedId !== null && selectedId !== getLabelIdByRowIndex(rowIndex),
                                'hide-mechanics': checkHideMechanics(rowIndex)}"
								v-if="checkPitStopFilterLocation(label)"> <!-- v-if="filterLocationsByQualifications()" -->
								<!-- A cell in the chart -->
								<div class="chart-cell"
									 v-for="(hour, columnIndex) in hours"
									 :key="columnIndex"
									 :class="{'first': columnIndex === 0, 'last': columnIndex === hours.length - 1, clickable: clickableGrid}"
									 @click="onClickChartCell(rowIndex, columnIndex)"
									 ref="chartCell">
								</div>

								<!-- An overlay in the chart on row level -->
								<div class="overlay" v-for="(overlay, overlayIndex) in getOverlays(rowIndex)" :key="overlayIndex" :style="overlay.style" v-if="!getClassesForOverlay(overlay).undefined">
									<div class="overlay-content" :class="getClassesForOverlay(overlay)" @click="onClickOverlay(overlay, rowIndex)">
									</div>
								</div>

								<!-- Overlay for the current hour -->
								<div class="overlay current-hour" v-if="visualizeCurrentHour && type !== 'pitstop'" :style="{'background': '#0079d3', 'margin-left': (getCurrentHourCoordinate() * style.chart.cell.width) - (2 / 2) + 'px', 'width': '2px', 'height': style.chart.cell.height + 'px'}">
								</div>
								<!-- <div class="overlay current-hour" v-else-if="visualizeCurrentHour && type == 'pitstop'" :style="{'background': '#0079d3', 'margin-left': (getCurrentHourCoordinate() * style.chart.cell.width) - (2 / 2) + 'px', 'width': '2px', 'height': style.chart.cell.height + 'px'}"> -->
							</div>
						</perfect-scrollbar>
					</div>
				</div>



				<!-- Clear all floats -->
				<br/>
			</div>
		</div>
	</div>
</template>

<script>
import $date from '@/modules/date-module'
export default {
	props: ['displayHours', 'startDate', 'labels', 'hideHours', 'maxRows', 'visualizeCurrentHour', 'title', 'chartClass',
		'selectable', 'overlays', 'selectedTaskIds', 'id', 'offsetHours',
		'hide', 'hoursPerCoordinate', 'broadcastScrollEvents', 'baseHoursOnServiceWindow', 'clickableGrid', 'workOrderTasks', 'locationFeasibility', 'equipmentTypes', 'filteredLocationIds', 'selectedWorkOrder', 'locationsFilter', 'type', 'materialIds', 'chartStatus', 'selectedLocationId', 'ntLocationType', 'locations'],

	data: function () {
		return {
			style: {
				scrollbarWidth: 17,

				chart: {
					padding: 30,

					left: {
						width: 240
					},

					top: {
						labelWidth: this.hoursPerCoordinate ? 70 : 40
					},

					cell: {
						height: 35,

						width: 60
					}
				}
			},

			hours: [],

			selectedId: null,

			selectedServiceWindow: null,

			emphasizedRowIndices: [],

			maintenanceReasons: [
				{
					code: 'AUT',
					reason: 'AUTO'
				},
				{
					code: 'BTS',
					reason: 'SCHADE'
				},
				{
					code: 'EBK',
					reason: 'EBK'
				},
				{
					code: 'GAR',
					reason: 'GARANTIE'
				},
				{
					code: 'LOTT',
					reason: 'LOGISTIEK'
				},
				{
					code: 'ODH',
					reason: 'ONDERHOUD'
				},
				{
					code: 'OPLKLANT',
					reason: 'OPLEIDING'
				},
				{
					code: 'OPLNT',
					reason: 'OPLEIDING NS'
				},
				{
					code: 'PJT',
					reason: 'PROJECT'
				},
				{
					code: 'PJTKL',
					reason: 'PROJECT KLANT'
				},
				{
					code: 'RES',
					reason: 'RESERVE'
				},
				{
					code: 'REV',
					reason: 'REVISIE'
				},
				{
					code: 'SERVICE',
					reason: 'SERVICE'
				},
				{
					code: 'WARM',
					reason: 'WARM'
				}
			],
			currentDate: new Date(),
			parsedHour: ''
		}
	},

	computed: {
		chartWidth () {
			return this.style.chart.cell.width * (this.hours.length - 1) + this.style.chart.top.labelWidth / 2
		}
	},

	mounted: function () {
		this.generateHours();


		if(this.type == 'pitstop'){
			if(this.currentDate.getHours() >= 7 && this.currentDate.getHours() < 15){
				this.parsedHour = '07:00';
			} else if(this.currentDate.getHours() >= 15 && this.currentDate.getHours() < 23){
				this.parsedHour = '15:00';
			} else {
				this.parsedHour = '23:00';
			}

			// chart-visualization
			setTimeout(() => {
				let parent = document.getElementsByClassName("chart-visualization")[0];
				let child = document.getElementsByClassName("current-time")[0];
				this.scrollParentToChild(parent, child);
			}, 3000)

		}

		this.$el.querySelector('.chart-visualization').addEventListener('scroll', this.onScroll)
		this.$el.querySelector('.chart-visualization').addEventListener('touchmove', this.onScroll)
		document.addEventListener('chartGlobalScroll', this.onGlobalScroll)
		document.addEventListener('chartRegenerateHours', this.onRegenerateHours)
		document.addEventListener('chartForceUpdate', this.onChartForceUpdate)
		document.addEventListener('chartDeselectIndex', this.onChartDeselectIndex)
		document.addEventListener('chartScrollToPosition', this.onChartScrollToPosition)
		document.addEventListener('chartRequestScroll', this.onChartRequestScroll)
		document.addEventListener('trainScheduleSelectServiceWindow', this.onTrainScheduleSelectServiceWindow)
		document.addEventListener('chartEmphasizeRowIndicesChange', this.onChartEmphasizeRowIndicesChange)
		document.addEventListener('workOrderChange', this.onWorkOrderChange)
		window.addEventListener('resize', this.onWindowResize);

	},

	updated: function () {
		this.setCellWidth(this.calculateCellWidth())
	},

	beforeDestroy: function () {
		document.removeEventListener('chartGlobalScroll', this.onGlobalScroll)
		document.removeEventListener('chartRegenerateHours', this.onRegenerateHours)
		document.removeEventListener('chartForceUpdate', this.onChartForceUpdate)
		document.removeEventListener('chartDeselectIndex', this.onChartDeselectIndex)
		document.removeEventListener('chartScrollToPosition', this.onChartScrollToPosition)
		document.removeEventListener('chartEmphasizeRowIndicesChange', this.onChartEmphasizeRowIndicesChange)
		document.removeEventListener('chartRequestScroll', this.onChartRequestScroll)
		document.removeEventListener('trainScheduleSelectServiceWindow', this.onTrainScheduleSelectServiceWindow)
		window.removeEventListener('resize', this.onWindowResize)
	},

	watch: {
		labels: {
			handler: function () {
				this.onRegenerateHours()
				if(this.type === 'pitstop'){
					this.generateHours();
					// console.log(this.getCurrentHourCoordinate());
					this.setCellWidth(this.calculateCellWidth())


				}
				this.$forceUpdate()
			},
			deep: true
		},
		hide: function () {
			this.onChangeHide()
		}
	},

	methods: {
		broadCastScroll(e, header){
			// console.log('gant methods broadCastScroll')
			this.$emit('broadCastScroll', {
				left: e.target.scrollLeft,
				header: header
			});
		},

		getNtLocationTypeByLocationId(id){
			return this.locations.find(l => l.id === id)
		},

		filterLabelsByLocationType(arr){
			let labels = [];

			let labelIds = [];

			for(let i in arr){
				let item = arr[i];

				let location = this.getNtLocationTypeByLocationId(item.id);

				let locationType = location.locationType;


				if(this.ntLocationType === 'SB'){
					if( locationType === 'SB' || locationType === 'GSL' || locationType === 'TC' ){
						labels.push(item);
					}
				} else if (this.ntLocationType === 'GSL'){
					if( locationType === 'GSL' || locationType === 'TC' ){
						labels.push(item);
					}
				} else {
					labels.push(item);
				}
			}

			return labels;
		},
		scrollParentToChild(parent, child) {

			// Where is the parent on page
			var parentRect = parent.getBoundingClientRect();
			// What can you see?
			var parentViewableArea = {
				height: parent.clientHeight,
				width: parent.clientWidth
			};

			// Where is the child
			var childRect = child.getBoundingClientRect();
			// Is the child viewable?
			var isViewable = (childRect.left - 500 >= parentRect.left) && (childRect.left <= parentRect.left + parentViewableArea.width);

			// if you can't see the child try to scroll parent
			if (!isViewable) {
				// scroll by offset relative to parent
				parent.scrollLeft = (childRect.left + parent.scrollLeft) - parentRect.left - 35
			}


		},
		checkIfCurrentDate(date){
			let currentYear = this.currentDate.getFullYear();
			let currentMonth = this.currentDate.getMonth();
			let currentDay = this.currentDate.getDate();

			if(date.getFullYear() == currentYear && date.getMonth() == currentMonth && date.getDate() == currentDay){
				return true;
			} else {
				return false;
			}
		},
		getMaxHeight(){
			if(this.type === 'pitstop'){
				return '72vh'
			} else {
				return '25vh'
			}
		},
		checkHideMechanics(index){
			if(this.type === 'mechanics' && this.emphasizedRowIndices.length > 0){
				if(this.emphasizedRowIndices.indexOf(index) !== -1){
					// console.log('hide');
					return false;

				} else {
					return true;
				}
			} else {
				return false;
			}
		},

		checkPitStopFilterLocation(label){
			if(this.type === 'pitstop' || this.type === 'mobileteams'){
				if(this.locationsFilter === label.location || this.locationsFilter == null){
					return true;
				} else {
					return false;
				}
			} else if (this.type === 'mechanics' && this.selectedWorkorder){
				return true;
			} else if (this.materialIds){
				if(this._.includes(this.materialIds, label.value)){
					return true;
				} else {
					return false;
				}
			} else {
				return true;
			}
		},
		onWorkOrderChange(){
			try {
				// console.log(this.selectedWorkOrder.arrivalDate);
				if(this.selectedWorkOrder.arrivalDate !== null && this.selectedWorkOrder.tempRepairLocationId !== null){
					setTimeout(() => {
						this.generateHours(this.selectedWorkOrder.arrivalDate);
					}, 500)

				}
			} catch(err){
				//console.log('err');
			}
		},
		//remove duplicates from charts (mechanic shows twice)
		//if revert, place labels instead of function in list
		removeDuplicates() {
			let prop = 'id';

			if(this.type !== 'pitstop' && this.type !== 'mobileteams' && this.type !== 'equipmentMBN'){
				return this.filterLabelsByLocationType(this.labels.filter((obj, pos, arr) => {
					if(obj && arr){
						return this._.without(arr, undefined).map(mapObj => mapObj[prop]).indexOf(obj[prop]) === pos;
					}
				}));
			} else {
				return this.filterLabelsByLocationType(this.labels);
			}


		},
		/**
		 * When the emphasized row indices change
		 * @param {CustomEvent} eventArgs the event arguments
		 */
		onChartEmphasizeRowIndicesChange (eventArgs) {
			this.$nextTick(() => {
				if (eventArgs.detail.id !== this.id) {
					return
				}
				this.emphasizedRowIndices = eventArgs.detail.indices
				if (this.emphasizedRowIndices.length === 0) {
					return
				}
				document.dispatchEvent(new CustomEvent('chartGlobalScroll', {
					detail: {
						scrollPosition: {
							y: Math.max(this.style.chart.cell.height * this.emphasizedRowIndices[0] - 1, 0)
						},
						broadcastScrollEvents: false,
						id: this.id
					}
				}))
			})
		},

		/**
		 * Whenever the selected service window changes
		 * @param {CustomEvent} eventArgs the event arguments
		 */
		onTrainScheduleSelectServiceWindow (eventArgs) {
			this.selectedServiceWindow = eventArgs.detail.serviceWindow
			this.$nextTick(() => {
				if (this.baseHoursOnServiceWindow) {
					this.generateHours()
					this.setCellWidth(this.calculateCellWidth())
				}
				this.$forceUpdate()
			})
		},

		/**
		 * Whenever the hide property changes of this component
		 */
		onChangeHide () {
			document.dispatchEvent(new CustomEvent('chartRequestScroll', {
				detail: {
					id: 1
				}
			}))
		},

		/**
		 * Scrolls all charts to the same position of the chart with given id in event arguments
		 * @param {CustomEvent} eventArgs the event arguments
		 */
		onChartRequestScroll (eventArgs) {
			if (eventArgs.detail.id !== this.id) {
				return
			}
			this.$nextTick(() => {
				let chartElement = this.$el.querySelector('.chart-visualization')
				document.dispatchEvent(new CustomEvent('chartGlobalScroll', {
					detail: {
						scrollPosition: {
							x: chartElement.scrollLeft,
							y: chartElement.scrollTop
						},
						broadcastScrollEvents: this.broadcastScrollEvents,
						id: this.id
					}
				}))
			})
		},

		/**
		 * When the chart should scroll to a given position
		 * @param {CustomEvent} eventArgs the event arguments
		 */
		onChartScrollToPosition (eventArgs) {
			let position = eventArgs.detail
			let cellWidth = this.style.chart.cell.width
			this.onGlobalScroll({
				detail: {
					scrollPosition: {
						x: position.x !== undefined ? position.x * cellWidth : undefined,
						y: position.y !== undefined ? position.y * cellWidth : undefined
					},
					broadcastScrollEvents: this.broadcastScrollEvents,
					id: this.id
				}
			})
		},

		/**
		 * Deselects the selected label in the given chart
		 */
		onChartDeselectIndex (eventArgs) {
			if (eventArgs && eventArgs.detail.chartId !== this.id) {
				return
			}
			this.selectedId = null
		},

		/**
		 * When the overlays change in the workorders component
		 * @param {CustomEvent} eventArgs the event arguments
		 */
		onChartForceUpdate (eventArgs) {
			this.$nextTick(() => {
				if (eventArgs && eventArgs.detail && eventArgs.detail.selectedId !== undefined) {
					this.selectedId = eventArgs.detail.selectedId
				}
				if (eventArgs && eventArgs.detail && eventArgs.detail.chartId !== this.id) {
					return
				}
				// Check1234
				this.$forceUpdate()
			})
		},

		/**
		 * Get the classes for an overlay element
		 * @param {object} overlay the overlay object
		 */
		getClassesForOverlay (overlay) {
			let classes = {}
			classes[overlay.type] = true
			switch (overlay.type) {
				case 'task':
					// console.log(overlay.object);
					classes.green = overlay.object.conflictServiceWindow === false
					classes.red = !classes.green

					if (this.selectedTaskIds !== undefined && this.selectedTaskIds.indexOf(overlay.object.id) !== -1 || overlay.color) {
						classes.green = false
						classes.red = false
						classes.blue = true
					}
					else if (overlay.object.isSentToMaximo) {
						classes.green = false
						classes.red = false
					}
					break
				case 'mechanic-task':
					classes.green = overlay.object.conflictMechanic === false
					classes.red = !classes.green

					if (this.selectedTaskIds !== undefined && this.selectedTaskIds.indexOf(overlay.object.id) !== -1) {
						classes.green = false
						classes.red = false
						classes.blue = true
					}
					else if (overlay.object.isSentToMaximo) {
						classes.green = false
						classes.red = false
					}
					break
				case 'equipment-task':
					classes.green = overlay.object.conflictEquipment === false
					classes.red = !classes.green

					if (this.selectedTaskIds !== undefined && this.selectedTaskIds.indexOf(overlay.object.id) !== -1) {
						classes.green = false
						classes.red = false
						classes.blue = true
					}
					else if (overlay.object.isSentToMaximo) {
						classes.green = false
						classes.red = false
					}
					break
				case 'location-capacity':
					classes.active = this.isSelectedServiceWindow(overlay)
					break
				case 'other':
				case 'pitstop':
				case 'mobileteams-trains':
					// console.log(overlay.conflict);
					classes.green = false
					classes.red = false
					classes.blue = false
					if(overlay.conflict == '#0B9126'){
						classes.green = true
						classes.red = false
						classes.blue = false
					} else if (overlay.conflict == '#dc0000'){
						classes.green = false
						classes.red = true
						classes.blue = false
					} else {
						classes.green = false
						classes.red = false
						classes.blue = true
					}
					break;
			}

			return classes
		},

		/**
		 * Whenever an overlay has been clicked
		 * @param {object} overlay the overlay object
		 */
		onClickOverlay (overlay, rowIndex) {
			if (overlay.type === 'location-capacity') {
				let startDate = this.startDate
				let startHour = startDate.substring(11, 13)
				let date = $date.toDateObject(startDate.substring(0, 10) + ' 00:00:00')
				if (startHour < 7) {
					date.setTime(date.getTime() - 3600 * 1000)
				}
				else if (startHour >= 7 && startHour < 15) {
					date.setTime(date.getTime() + 7 * 3600 * 1000)
				}
				else if (startHour >= 15 && startHour < 23) {
					date.setTime(date.getTime() + 15 * 3600 * 1000)
				}
				else {
					date.setTime(date.getTime() + 23 * 3600 * 1000)
				}

				document.dispatchEvent(new CustomEvent('chartClickLocationCapacity', {
					detail: {
						date: $date.toDateString(new Date(date.getTime() + overlay.start * 8 * 3600 * 1000)),
						locationId: this.labels[rowIndex].id
					}
				}))
				return
			}
			document.dispatchEvent(new CustomEvent('chartClickOverlay', {
				detail: overlay
			}))
		},

		/**
		 * When the user clicks a chart cell
		 * @param {number} rowIndex the row index
		 * @param {number} columnIndex the column index
		 */
		onClickChartCell (rowIndex, columnIndex) {

			if (!this.clickableGrid) {
				return
			}

			let startDate = this.startDate
			let startHour = startDate.substring(11, 13)
			let date = $date.toDateObject(startDate.substring(0, 10) + ' 00:00:00')
			if (startHour < 7) {
				date.setTime(date.getTime() - 3600 * 1000)
			}
			else if (startHour >= 7 && startHour < 15) {
				date.setTime(date.getTime() + 7 * 3600 * 1000)
			}
			else if (startHour >= 15 && startHour < 23) {
				date.setTime(date.getTime() + 15 * 3600 * 1000)
			}
			else {
				date.setTime(date.getTime() + 23 * 3600 * 1000)
			}

			document.dispatchEvent(new CustomEvent('chartClickLocationCapacity', {
				detail: {
					date: $date.toDateString(new Date(date.getTime() + columnIndex * 8 * 3600 * 1000)),
					locationId: this.filterLabelsByLocationType(this.labels)[rowIndex].id
				}
			}))
			return
		},

		/**
		 * Get all of the overlays by the row index
		 * @param {number} rowIndex the row index
		 */
		getOverlays (rowIndex) {
			let overlays = []
			if (this.overlays[rowIndex]) {
				for (let overlayIndex in this.overlays[rowIndex]) {
					let overlay = this.overlays[rowIndex][overlayIndex]

					let style = {
						left: this.style.chart.cell.width * (overlay.start + (this.offsetHours || 0)) + 'px',
						width: this.style.chart.cell.width * overlay.length + 'px',
						height: this.style.chart.cell.height / 2 + 'px',
						// 'margin-top': (overlay.margin || 9) + 'px'
					}

					let hourMinutesToPixels = (this.style.chart.cell.width / 8) / 60 + 'px';

					switch (overlay.type) {
						case 'service-window':
							let shuntingTime = (this.style.chart.cell.width / 60) * overlay.shuntingTimeMinutes
							style['border-left'] = shuntingTime + 'px solid rgba(197, 197, 203, 0.5)'
							style['border-right'] = shuntingTime + 'px solid rgba(197, 197, 203, 0.5)'
							break;
						case 'location-capacity':
							// Use 40 px from global.scss .chart .chart-content .chart-right .chart-visualization-container .chart-visualization .chart-row .chart-cell
							style['height'] = (overlay.height * 40) + 'px'; //(overlay.height * this.style.chart.cell.height) + 'px';
							style['margin-top'] = ((1 - overlay.height) * 40) + 'px !important'; //((1 - overlay.height) * this.style.chart.cell.height) + 'px !important';
							style['margin-bottom'] = '0px';
							break;
						case 'equipment-type-used':
							style['left'] =  this.style.chart.cell.width * (overlay.start + (this.offsetHours || 0)) / this.displayHours + 'px';
							break;
						case 'other':
							style['left'] =  this.style.chart.cell.width * (overlay.start + (this.offsetHours || 0)) / 8 - 15 + 90 + 'px';
							style['width'] =  this.style.chart.cell.width * overlay.length / 8 + 'px';
							break;
						case 'equipment-type-unavailable':
							style['left'] =  this.style.chart.cell.width * (overlay.start + (this.offsetHours || 0)) / 8 - 15 + 90 + 'px';
							style['width'] =  this.style.chart.cell.width * overlay.length / 8 + 'px';
							break;
						case 'pitstop':
							// let hourMinutesToPixels = (this.style.chart.cell.width / 8) / 60 + 'px';
							// style['left'] =  this.style.chart.cell.width  * overlay.start / 8 - 15 + 90 - 120 + 'px';
							style['left'] =  this.style.chart.cell.width * overlay.start / 8 - 15 + 'px';
							style['width'] =  this.style.chart.cell.width * overlay.length / 8 + 'px';
							break;
						case 'mobileteams-trains':
							// console.log(this.hours.length)
							style['left'] =  120 * (overlay.start + (this.offsetHours || 0)) / this.hours.length + 'px';
							style['width'] =  120 * overlay.length + 'px';
							break;
					}
					overlay.style = style
					overlays.push(overlay)
				}
			}
			return overlays
		},

		/**
		 * Calculates the cell width based on the amount of hours
		 */
		calculateCellWidth () {
			let preferredWidth = 0
			let minimumWidth = this.$el.offsetWidth -
				this.style.chart.left.width -
				this.style.chart.padding -
				this.style.chart.top.labelWidth / 2 -
				1
			let minimumWidthPerCell = minimumWidth / this.displayHours

			if (this.baseHoursOnServiceWindow) {
				minimumWidthPerCell = minimumWidth / (this.hours.length - 1)
				preferredWidth = 120
			}
			else if (this.displayHours === 24) {
				preferredWidth = 60
			}
			else if (this.displayHours === 16) {
				preferredWidth = 80
			}
			else if (this.displayHours === 8 || this.displayHours === 12) {
				preferredWidth = 120
			}
			else if (this.displayHours === 96) {
				minimumWidthPerCell = minimumWidth / 12
				preferredWidth = 120
			} else {
				minimumWidthPerCell = 120;
				preferredWidth = 120;
			}
			return preferredWidth > minimumWidthPerCell ? preferredWidth : minimumWidthPerCell
		},

		/**
		 * Set the cell width
		 * @param {number} cellWidth the cell width in px
		 */
		setCellWidth (cellWidth) {
			this.$el.querySelectorAll('.chart-head-column').forEach((element, columnIndex) => {
				if (columnIndex === this.hours.length - 1) {
					element.style.width = this.style.chart.top.labelWidth / 2 + 'px'
				}
				else {
					element.style.width = cellWidth + 'px'
				}
			})

			this.$el.querySelectorAll('.chart-row').forEach((rowElement, rowIndex) => {
				rowElement.querySelectorAll('.chart-cell').forEach((cellElement, columnIndex) => {
					if (columnIndex === 0) {
						cellElement.style.width = cellWidth + 1 + 'px'
					}
					else if (columnIndex === this.hours.length - 1) {
						cellElement.style.width = this.style.chart.top.labelWidth / 2 + 'px'
					}
					else {
						cellElement.style.width = cellWidth + 'px'
					}
				})
			})

			this.style.chart.cell.width = cellWidth
		},

		/**
		 * Whenever the chart has been scrolled
		 * @param {Event} eventArgs the event arguments
		 */
		onScroll (eventArgs) {
			let chartElement = this.$el.querySelector('.chart-visualization')
			let labelsElement = this.$el.querySelector('.chart-labels')

			let scrollPosition = {
				x: chartElement.scrollLeft,
				y: chartElement.scrollTop
			}

			chartElement.scrollTop = scrollPosition.y
			labelsElement.scrollTop = scrollPosition.y

			document.dispatchEvent(new CustomEvent('chartGlobalScroll', {
				detail: {
					scrollPosition,
					broadcastScrollEvents: this.broadcastScrollEvents,
					id: this.id
				}
			}))
		},

		/**
		 * Whenever there is a global horizontal scroll
		 * @param {CustomEvent} eventArgs the event arguments
		 */
		onGlobalScroll (eventArgs) {
			if (!eventArgs.detail.broadcastScrollEvents && eventArgs.detail.id !== this.id) {
				return
			}

			let chartElement = this.$el.querySelector('.chart-visualization')
			let columnElement = this.$el.querySelector('.chart-head')
			let scrollPosition = eventArgs.detail.scrollPosition

			if (chartElement && scrollPosition.x !== undefined) {
				chartElement.scrollLeft = scrollPosition.x
			}
			if (columnElement && scrollPosition.x !== undefined) {
				columnElement.style.marginLeft = -scrollPosition.x + 'px'
			}
			if (chartElement && scrollPosition.y !== undefined && this.id === eventArgs.detail.id) {
				chartElement.scrollTop = scrollPosition.y
			}
		},

		/**
		 * Whenever the window changes size
		 * @param {Event} eventArgs the event arguments
		 */
		onWindowResize (eventArgs) {
			this.setCellWidth(this.calculateCellWidth())
		},

		/**
		 * Whenever the hours should be regenerated
		 * @param {CustomEvent} eventArgs the event arguments
		 */
		onRegenerateHours (eventArgs) {
			this.$nextTick(() => {
				this.generateHours()

				this.$nextTick(() => {
					this.setCellWidth(this.calculateCellWidth())

					this.$forceUpdate()
					this.$nextTick(() => {
						if (eventArgs && eventArgs.detail) {
							this.onGlobalScroll({
								detail: {
									scrollPosition: {
										x: eventArgs.detail.x * this.style.chart.cell.width,
										y: 0
									},
									broadcastScrollEvents: this.broadcastScrollEvents,
									id: this.id
								}
							})
						}
					})
				})
			})
		},

		/**
		 * Generates all hours for the chart to display
		 */
		generateHours (arrivalDate) {
			// console.log('Offset hours: ' + this.offsetHours);
			this.hours = []
			let startHour = Number(this.startDate.substring(11, 13))

			if (arrivalDate) {
				// console.log(arrivalDate)

				let startDate = new Date(arrivalDate)

				let endDate = new Date(startDate.getTime() + (8*1000*60*60))

				let iterator = 0
				while ([7, 15, 23].indexOf(Number($date.toDateString(startDate).substring(11, 13))) === -1
				|| (iterator === 0 && $date.toDateString(startDate).substring(13, 19) > ':00:00')) {
					startDate.setTime(startDate.getTime() - 1000 * 60 * 60)
					iterator++
				}
				startDate = $date.toDateObject($date.toDateString(startDate).substring(0, 13) + ':00:00')

				iterator = 0
				while ([7, 15, 23].indexOf(Number($date.toDateString(endDate).substring(11, 13))) === -1
				|| (iterator === 0 && $date.toDateString(endDate).substring(13, 19) > ':00:00')) {
					endDate.setTime(endDate.getTime() + 1000 * 60 * 60)
					iterator++
				}
				endDate = $date.toDateObject($date.toDateString(endDate).substring(0, 13) + ':00:00')

				for (let i = startDate.getTime(); i <= endDate.getTime(); i += 1000 * 60 * 60) {
					this.hours.push(new Date(i))
				}


			}
			else if (this.hoursPerCoordinate) {
				// console.log(this.startDate);
				let startDate = $date.toDateObject(this.startDate)
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
				for (var i = 0; i <= this.displayHours + (this.offsetHours || 0); i += this.hoursPerCoordinate || 1) {
					this.hours.push(new Date(startDate.getTime() + i * 60 * 60 * 1000))
				}


			}
			else {

				for (var i = 0; i <= this.displayHours + (this.offsetHours || 0); i++) {
					var hour = startHour - (this.offsetHours || 0) + i
					if (hour >= 24) {
						hour -= 24
					}
					if (hour < 0) {
						hour = 24 + hour
					}

					this.hours.push(hour)
				}
			}

			// setTimeout(() => {

			// }, 1500)

		},

		/**
		 * Select an item
		 * @param {number} id the id of the label
		 * @param {string} context the context
		 */
		selectLabel (id, context) {
			if (this.selectable !== true) {
				return
			}
			if (this.selectedId === id) {
				this.selectedId = null
			}
			else {
				this.selectedId = id
			}
			document.dispatchEvent(new CustomEvent('chartSelectLabel', {
				detail: {
					id: this.selectedId,
					chartId: this.id,
					context
				}
			}))
		},

		/**
		 * Get the label id by row index
		 * @param {number} rowIndex the row index
		 */
		getLabelIdByRowIndex (rowIndex) {
			let label = this.labels[rowIndex]
			if (label && label.id) {
				return label.id
			}
			return -1
		},

		/**
		 * Format the time by the date
		 * @param {Date} date the date
		 */
		formatDateByDate (date) {
			return $date.formatAbbreviatedDayNameDateMonth(date)
		},

		/**
		 * Format the time by the date
		 * @param {Date} date the date
		 */
		formatTimeByDate (date) {
			let dateString = $date.toDateString(date)
			return dateString.substring(11, 16)
		},

		/**
		 * Checks if the given overlay should get the selected-service-window class.
		 * @param {Object} overlay the overlay object
		 */
		isSelectedServiceWindow (overlay) {
			if (!this.selectedServiceWindow) {
				return false
			}
			if (overlay.id !== this.selectedServiceWindow.locationId) {
				return false
			}
			if (this.hours.length < 1) {
				return false
			}
			let chartStart = this.hours[0]
			let startCoordinateServiceWindow = Math.floor((new Date(this.selectedServiceWindow.trainSchedule.arrivalDate).getTime() - chartStart.getTime()) / 1000 / 60 / 60 / 8)
			let endCoordinateServiceWindow = Math.floor((new Date(this.selectedServiceWindow.trainSchedule.departureDate).getTime() - chartStart.getTime()) / 1000 / 60 / 60 / 8)
			let overlayCoordinate = Math.floor(overlay.start)

			return overlayCoordinate === endCoordinateServiceWindow || overlayCoordinate === startCoordinateServiceWindow
		},

		/**
		 * Get the coordinate of the current hour
		 */
		getCurrentHourCoordinate () {
			return this.offsetHours
		}
	}
}
</script>
<style lang="scss" scoped>

.chart {
	background: white;
	overflow: hidden;
	padding-bottom: 15px;
	$padding: 30px;

	$rowHeight: 35px;
	$colWidth: 60px;

	$topSectionFirstRowHeight: 40px;
	$topSectionFirstRowPaddingTop: 20px;
	$topSectionLabelWidth: 70px;

	$leftSectionSize: 240px;

	$labelWidth: 60px;
	$labelIndent: 10px;

	$scrollbarWidth: 17px;

	$fontSize: 12px;

	$wireframeOpacity: 0;

	user-select: none;
	-moz-user-select: none;
	-webkit-user-select: none;
	-o-user-select: none;

	.chart-content {
		position: relative;
		width: 100%;

		.chart-hide-head-label-overflow, .chart-hide-head-grid-overflow {
			@if $wireframeOpacity == 0 {
				background: white;
			}
			@else {
				background: rgba(green, $wireframeOpacity)
			}
		}

		.chart-hide-head-label-overflow {
			position: absolute;
			width: $leftSectionSize - $topSectionLabelWidth / 2;
			height: $topSectionFirstRowPaddingTop + $topSectionFirstRowHeight + $padding + 1;
			margin-right: 20px;
			z-index: 10;
			top: 0;
			left: 0;
		}

		.chart-hide-head-grid-overflow {
			position: absolute;
			width: $leftSectionSize;
			height: $topSectionFirstRowHeight;
			margin-right: 20px;
			z-index: 10;
			top: $topSectionFirstRowPaddingTop + $padding;
			left: 0;
		}

		.chart-left {
			background: rgba(red, $wireframeOpacity);
			position: relative;
			float: left;
			width: $leftSectionSize + 1;
			overflow: hidden;
			z-index: 20;
			// padding-bottom: $padding;

			.chart-top-left {
				position: absolute;
				background: #fff;
				width: calc(100% - 1px);
				height: $topSectionFirstRowPaddingTop + $topSectionFirstRowHeight + $padding + 2px;
				z-index: 35;
				overflow: hidden;
				.icons{
					position: absolute;
					top: -4px;
					left: 0px;
				}
				p{
					width: 100%;
					text-align: left;
					position: absolute;
					top: 10px;
					left: 5px;
					font-size: 10px;
					line-height: 12px;
					padding-left: 30px;
					color: #0079d3;
					opacity: .5;
				}
			}

			.chart-labels {
				margin-top: $topSectionFirstRowPaddingTop + $topSectionFirstRowHeight + $padding;
				background: rgba(white, $wireframeOpacity);
				text-align: right;
				position: relative;
				overflow: hidden;
				&.mobileteams-trains{
					margin-top: 82px!important;

					.chart-label{
						margin-left: 0;
						width: 100%;

						span {
							padding: 0;
							> span{
								width: 50%;
								display: inline-block;
								float: left;
								padding: 0 10px;
								height: 100%;
								position: relative;

								&:nth-child(1){
									border-right: 1px solid #C5C5CB;

									text-align: left;
								}

							}
						}
					}
				}

				.chart-label {
					background: rgba(red, $wireframeOpacity);
					width: $labelWidth;
					margin-left: $leftSectionSize - $labelWidth;
					height: $rowHeight;
					border-bottom: 1px solid #C5C5CB;
					box-sizing: border-box;
					font-size: $fontSize;
					color: #707070;
					&:last-child{
						height: 42px;
						line-height: 42px;
						border-bottom: none;
					}

					>span {
						width: auto;
						position: absolute;
						height: $rowHeight;
						width: 100%;
						right: 0;
						text-align: right;
						line-height: $rowHeight;
						padding-right: $labelIndent;

						.fleet-control-status {
							position: absolute;
							right: 160px;
							top: 50%;
							transform: translate(0, -50%);
							-webkit-transform: translate(0, -50%);
							-o-transform: translate(0, -50%);
							-moz-transform: translate(0, -50%);

							.circle {
								display: inline-block;
								vertical-align: middle;
								width: 12px;
								height: 12px;
								background: #E9E9EB;
								border-radius: 100%;

								&.purple {
									background: #704084;
								}

								&.red {
									background: #DC0000;
								}

								&.green {
									background: #0B9126;
								}

								&:not(:first-child) {
									margin-left: 5px;
								}
							}
						}

						.reason-of-arrival {
							position: absolute;
							right: 60px;
							top: 50%;
							transform: translate(0, -50%);
							-webkit-transform: translate(0, -50%);
							-o-transform: translate(0, -50%);
							-moz-transform: translate(0, -50%);
							width: 80px;
							max-width: 80px;
							text-overflow: ellipsis;
							white-space: nowrap;
							overflow: hidden;
							text-align: left;
						}
					}

					&.emphasized {
						font-weight: bold;
					}

					&.selected {
						color: #0079d3;
					}

					&:first-child {
						border-top: 1px solid #C5C5CB;
					}

					&.wide{
						margin: 0;
						width: 100%;
						> span{
							margin: 0;
							width: 100%;
							> span{
								float: left;
								width: 50%;

								&:first-child{

									text-align: left;
									padding-left: 15px;
								}
								&.station{
									border-left: 1px solid #C5C5CB;
									float: right!important;
								}
							}
						}
					}
				}
			}
		}

		.chart-right {
			position: absolute;
			margin-left: $leftSectionSize;
			padding-top: $padding + $topSectionFirstRowPaddingTop -8px;
			padding-bottom: $topSectionFirstRowHeight + $padding - $scrollbarWidth;
			background: rgba(green, $wireframeOpacity);
			overflow: hidden;
			height: 100%;
			width: 100%;
			box-sizing: border-box;

			.chart-head {
				position: relative;
				background: rgba(cyan, $wireframeOpacity);
				border-right: $padding + $leftSectionSize solid rgba(red, $wireframeOpacity);
				height: $topSectionFirstRowHeight;

				.chart-head-column {
					position: relative;
					height: $topSectionFirstRowHeight;
					//border-left: 1px solid #C5C5CB;
					display: inline-block;
					width: $colWidth;
					&:after{
						position: absolute;
						left: 0;
						bottom: -10px;
						display: block;
						content: '';
						width: 1px;
						height: 100%;
						background: #C5C5CB;
					}
					&:first-child{
						.chart-head-column-label{
							text-align: left;
							transform: translate(0, -100%);
							-o-transform: translate(0, -100%);
							-moz-transform: translate(0, -100%);
							-webkit-transform: translate(0, -100%);
						}
					}

					.chart-head-column-label {
						background: rgba(blue, $wireframeOpacity);
						position: absolute;

						line-height: $fontSize;
						font-size: $fontSize;
						overflow: visible;
						width: $topSectionLabelWidth;
						text-align: center;


						transform: translate(-50%, -100%);
						-o-transform: translate(-50%, -100%);
						-moz-transform: translate(-50%, -100%);
						-webkit-transform: translate(-50%, -100%);

						&.current-hour {
							font-weight: bold;
							color: #0079d3;
						}
					}

					.current-time-overlay {
						position: absolute;
						height: 100%;
						width: 2px;
						margin-left: -1px;
						background: #0079d3;
						z-index: 15;
						bottom: -5px;
					}

					&:last-child {
						width: $topSectionLabelWidth;
					}
				}
			}

			.chart-visualization-container {
				overflow: hidden;
				width: calc(100% - 10px);
				height: calc(100% + 15px);
				padding-right: 152px;

				.chart-visualization {
					background: rgba(yellow, $wireframeOpacity);
					overflow: hidden;
					width: 100%;
					height: 100%;
					padding-bottom: 2px;


					.chart-row {
						height: $rowHeight;
						overflow: hidden;
						position: relative;
						border-bottom: 1px solid #C5C5CB;

						&:last-child{
							height: 42px;

							.chart-cell{
								height: 42px;
								border-bottom: none;
							}
						}

						.chart-cell {
							border-right: 1px solid #c5c5cb;
							border-bottom: 1px solid #c5c5cb;
							display: inline-block;
							height: $rowHeight;
							width: $colWidth;

							&.first {
								width: $colWidth + 1;
								border-left: 1px solid #c5c5cb;
							}

							&.last {
								width: $topSectionLabelWidth / 2;
								border: 0;
								background: white;
								z-index: 10;
								position: absolute;
							}

							&.clickable {
								&:hover {
									cursor: pointer;
									background: #0079d3;
								}
							}
						}

						.overlay {
							position: absolute;
							top: 0;
							left: 0;
							height: 100%;
							overflow: hidden;
							margin-top: 9px!important;
							&.current-hour{
								height: 100%!important;
								margin-top: 0!important;
							}
							.overlay-content {
								position: relative;
								width: calc(100% - 1px);
								left: 1px;
								height: 100%;
								box-sizing: border-box;

								&.location-capacity {
									background-image: url('/static/img/stripes.png');
									// pointer-events: none;
									&.active {
										background: #0079d3;
									}

									&:hover {
										height: 100%;
										background: #0079d3;
										cursor: pointer;
										z-index: 9999;
									}
								}
								&.service-window, &.qualification-available, &.equipment-type-available {
									background: rgba(#C5C5CB, 0.75);
								}
								&.equipment-type-unavailable {
									background: #ffffff;
								}
								&.qualification-used, &.equipment-type-used {
									background: rgba(#707070, 0.5);
								}
								&.task, &.mechanic-task, &.equipment-task, &.other, &.pitstop,  &.mobileteams-trains {
									background: rgba(#707070, 1);
									border-left: 1px solid #222222;
									border-right: 1px solid #222222;
									&.red {
										background: rgba(#DC0000, 0.75);
									}
									&.green {
										background: rgba(#0B9126, 0.75);
									}
									&.blue {
										background: rgba(#0079d3, 0.75);
									}
									&:hover {
										cursor: pointer;
										background: rgba(#707070, 0.75);

										&.red {
											background: rgba(#DC0000, 1);
										}
										&.green {
											background: rgba(#0B9126, 1);
										}
										&.blue {
											background: rgba(#0079d3, 1);
										}
									}
								}
								&.shift, &.equipment {
									background: rgba(#c5c5cb, 0.75);
								}
							}
						}

						&.fade {
							.overlay {
								.overlay-content {
									&.task {
										&.red {
											background: rgba(#DC0000, 0.25);
										}
										&.green {
											background: rgba(#0B9126, 0.25);
										}
									}
								}
							}
						}

						&:first-child {
							height: $rowHeight;

							.chart-cell {
								border-top: 1px solid #C5C5CB;
								height: $rowHeight;

								&.last {
									border-top: 0;
								}
							}
						}

						&:nth-child(2n) {
							background: rgba(white, $wireframeOpacity);
						}
					}
				}
			}
		}

		.chart-hide-vertical-scrollbar, .chart-hide-horizontal-scrollbar {
			@if $wireframeOpacity == 0 {
				background: white;
			}
			@else {
				background: rgba(255, 128, 0, $wireframeOpacity);
			}
		}

		.chart-hide-vertical-scrollbar {
			position: absolute;
			height: 100%;
			right: 0;
			top: 0;
			width: $padding;
			z-index: 30;
		}

		.chart-hide-horizontal-scrollbar {
			position: absolute;
			height: $padding;
			width: 100%;
			bottom: 0;
			left: 0;
			z-index: 30;
			border-bottom: 2px solid #c5c5cb;
		}
	}

	// .chart-top-left{
	//     &.mobileteams-trains{
	//         height: 83px!important;
	//     }
	// }

	&.hide-hours {
		.chart-content {
			.chart-hide-head-label-overflow, .chart-hide-head-grid-overflow {
				display: none;
			}

			.chart-left {
				.chart-top-left {
					height: $padding + 2px;

				}

				.chart-labels {
					margin-top: $padding;
				}
			}

			.chart-right {
				padding-top: $padding;
				padding-bottom: $padding - $scrollbarWidth;
				.chart-row{
					bottom: 8px;
				}
			}
		}
	}

	&.selectable {
		.chart-content {
			.chart-left {
				.chart-labels {
					.chart-label {
						span {
							.reason-of-arrival, span {
								&.selected, &:hover {
									color: #0079d3;
								}
								&:hover {
									cursor: pointer;
								}
							}
						}
					}
				}
			}
		}
	}

	&.hide {
		display: none;
	}

	body .ps__rail-x{
		position: sticky!important;
		left: 0!important;
		top: 0!important;
		z-index: 999;
	}

	&.full-height{
		height: 100%!important;
		.chart-content{
			height: 100%!important;
			.chart-left{
				width: 100px!important;
				.chart-labels{
					.chart-label{
						margin-left: 0;
						width: 100%;
					}
				}
			}
			.chart-right{
				margin-left: 100px;
				.chart-visualization-container{
					padding-right: 15px;
					width: calc(100% - 100px);
					.chart-visualization .chart-row .overlay{
						min-width: 2px;
					}

				}
			}
		}
	}

	&.big{
		.chart-content .chart-right .chart-visualization-container .chart-visualization{
			width: calc(100% - 90px)!important;
		}
	}

	&.MBNLocationChart{
		.chart-content .chart-right .chart-visualization-container{
			width: calc(100% - 95px)!important;
		}

		.overlay-content.location-capacity{
			background: #fff!important;
			&:hover{
				background: #0079d3!important;
			}
		}
		.chart-cell{
			background-image: url('/static/img/stripes.png');
		}
	}

	&#mbn-equipment-chart{
		.chart-row{
			&:before{
				position: absolute;
				left: 0;
				top: 9px;
				width: 100%;
				height: 17px;
				content: '';
				background: rgba(#C5C5CB, 0.75);
				display: block;
			}
		}
	}
}

.hide-mechanics{
	display: none!important;
}

.current-time{
	position: absolute;
	left: -1px;
	top: 0;
	width: 2px;
	background: #0079d3;
	z-index: 999;
}

.chart.disabled{
	.chart-cell, .overlay, .chart-label{
		pointer-events: none;
	}
}


@media only screen and (max-width : 1400px) {
	.chart {
		.chart-content {
			.chart-right {
				margin-left: 140px;
				.chart-visualization-container {
					padding-right: 50px;
				}
			}
			.chart-left {
				width: 140px;
			}
		}
	}
}
</style>

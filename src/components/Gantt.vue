<template>
	<div class="chart-main-wrapper" :id="chartData.options.id" :style="{'height': height}">
	    <div class="chart-header-wrapper">
	      <h1 class="chart-header" v-if="header">{{header}}</h1>
	    </div>
		<div class="chart-main-component">
			<!-- <div class="top-overlay" :style="{'width': chartData.options.labelsWidth + 'px'}" v-if="!chartData.options.hideTopLabels"></div> -->
			<!-- <perfect-scrollbar :options="scrollBarOpts"  class="chart-table-container table-scroll" id="table-scroll" v-dragscroll @ps-scroll-x="broadCastScroll($event, header)"> -->
				<div class="sticky_table chart-table-container table-scroll" id="table-scroll" >
					<table class="main-table" :id="id" v-dragscroll @scroll.passive="broadCastScroll($event, header)">
						<thead v-if="!chartData.options.hideTopLabels">
							<tr>
								<th class='blank' :style="{'width': chartData.options.labelsWidth + 'px'}">&nbsp;</th><th v-for="(topLabel, index) in topLabels" :style="{'width': cellWidth + 'px'}" :class="{'current-hour': checkCurrentHour(index)}" >
									{{$moment(topLabel).format('DD/MM').toString().trim()}}<br/>
									{{$moment(topLabel).format('HH:mm').toString().trim()}}
								</th>
							</tr>
						</thead>
						<tbody id="table-body">
							<tr class="separators" >
								<th :style="{'width': chartData.options.labelsWidth + 'px'}"></th><td v-for="(topLabel, index) in topLabels" :style="{'width': cellWidth + 'px'}">
									<span
										class="hseparator"
										:class="{'current-hour': checkCurrentHour(index)}"
										:style="{'height': separatorHeight}">
									</span>
								</td>
							</tr>
							<template v-for="(item, index) in chartData.data" v-if="checkMaterialSearch(item.label.value)">
								<tr
									v-for="timespan in _.uniqBy(item.timespans, 'label')"
									v-if="checkTimespanVisibility(timespan.label, item.timespans)"
									:id="'row-' + item.label.value"
									:class="{'selected': chartData.options.hightlightMaterial == item.label.value}">
									<th :style="{'width': chartData.options.labelsWidth + 'px'}">
										<div class="label-wrapper">
											<i class="timeslot-icon" v-if="chartData.options.allowTimeslots" @click="openModalTimespans(item.timespans, item.label.value)"><icon name="kalender" size="22" color="#0079D3"/></i>
											<span
												class="main"
												:class="{'clickable': chartData.options.labelsClickable,
												'active': selectedMaterial == item.label.value}"
												:title="item.label.value">
												<b @click="filterWorkOrdersByMaterialNumber(item.label.value)" :class="{'full-width': id !== 'main-chart'}">{{item.label.value}}</b>
											</span>
											<span v-if="timespan.label">{{timespan.label}}</span>
											<div class="additional">
												<template v-if="item.maintenanceLocationObjectId == $store.getters.GET_CURRENT_LOCATION_ID">
													<i class="reason-maintenance" @click="openReasonMaintenanceModal(item)">{{item.reasonMaintenance}}</i>
												</template>
												<fleetstatusdots :status="item.fleetControlStatus" size="lg"  v-if="item.fleetControlStatus" class="align-right"/>
											</div>
										</div>
									</th><td :colspan="topLabels.length" :style="{'width': (cellWidth * topLabels.length) + 'px'}">
										<template v-for="secondTimespan in item.timespans" v-if="placeRangeOnRow(secondTimespan)">
											<span
												class="time-span"
												:style="{
													'left': placeRangeOnRow(secondTimespan).start,
													'width': placeRangeOnRow(secondTimespan).range,
													'background': secondTimespan.color ? secondTimespan.color : ''
												}"
												:class="[
													secondTimespan.type,
													[fitsInSw(item.timespans, secondTimespan) ? 'success' : '', 'error']
												]"
												v-if="secondTimespan.label == timespan.label" @click="selectWorkOrderByTask(secondTimespan)">
													<template v-if="secondTimespan.shuntingTime">
														<i class="shunting-time" :style="{'width': getShuntingTime(secondTimespan.shuntingTime)}"></i>
														<i class="shunting-time" :style="{'width': getShuntingTime(secondTimespan.shuntingTime)}"></i>
													</template>
												</span>
										</template>
									</td>
								</tr>
							</template>
						</tbody>
					</table>
				</div>
			<!-- </perfect-scrollbar> -->
		</div>
	</div>

</template>

<script>
import _ from 'lodash'

	export default {
		props: ['header', 'chartData', 'id', 'materialSearchQuery', 'sortingOptions', 'sortingValue', 'height'],
		data: function () {
		    return {
		        startDate: null,
		        endDate: null,
		        mainRangeInHours: null,
		        chartSteps: 0,
		        cellWidth: this.chartData.options.cellWidth,
		        minuteWidth: 0,
		        topLabels: [],
		        timeZoneOffsetMinutes: 0,
		        mainTableBodyHeight: 0,
		        hideOutOfRange: this.chartData.options.hideOutOfRange,
		        selectedMaterial: null,
		        selectedId: null,
		        separatorHeight: '0px'
		    }
		},
		watch: {
			chartData: {
				handler: function () {
					// console.log('gant watch chartData')
						this.init();
	            },
	            deep: true
			}
		},
		mounted(){
			// console.log('gant mounted')
			this.init();
			if(this.chartData.options.startFromCurrentHour){
				setTimeout(() => {
					let parent = document.getElementsByClassName("main-table")[0];
	                let child = document.getElementsByClassName("current-hour")[0];

	                if(child){ //check if child exists
	                	this.scrollParentToChild(parent, child);
	                }
				}, 50)
			}
		},
		methods: {
			init(){
				// console.log('gant methods init')
				this.topLabels = [];
				this.startDate = null;
				this.endDate = null;
		        this.mainRangeInHours = null;

				this.$moment.tz.setDefault(this.$moment.tz.guess());

				let nonParsedStartDate = this.$moment(this.chartData.options.startDate);

				if(this.chartData.options.prevTimeHours){
	            	nonParsedStartDate.subtract(this.chartData.options.prevTimeHours, 'hours');
	            }

	            //get main time range based on prevTimeHours and rangeHours
	            if(this.chartData.options.hourStep > 1){
	            	if(nonParsedStartDate.hour() >= 7 && nonParsedStartDate.hour() < 15){
		                this.startDate = this.$moment(nonParsedStartDate).clone().set({h: 7, m: 0})
		            } else if(nonParsedStartDate.hour() >= 15 && nonParsedStartDate.hour() < 23){
		                this.startDate = this.$moment(nonParsedStartDate).clone().set({h: 15, m: 0})
		            } else {
		                this.startDate = this.$moment(nonParsedStartDate).clone().set({h: 23, m: 0})
		            }
	            } else {
	            	this.startDate = this.$moment(nonParsedStartDate).clone().set({m: 0})
	            }


				this.endDate = this.$moment(this.startDate).add(this.chartData.options.rangeHours + this.chartData.options.prevTimeHours, 'hours');
				this.minuteWidth = (this.chartData.options.cellWidth / this.chartData.options.hourStep) / 60;
				this.timeZoneOffsetMinutes = this.$moment().utcOffset() / 60
				this.generateTopLabels();

				setTimeout(() => {
					this.separatorHeight = this.getSeparatorHeight();
				}, 50)
			},
			checkMaterialSearch(label){
				// console.log('gant methods checkMaterialSearch')
				if(this.id == 'equipment-chart' || (this.id == 'main-chart' && (this.materialSearchQuery == '' || label.includes(this.materialSearchQuery)))){
					return true;
				} else {
					return false;
				}
			},
			openModalTimespans(timespans, materialNumber){
				// console.log('gant methods openModalTimespans')
				let srIds = [];

				let data = {
					materialNumber: materialNumber,
					srIds: []
				}

				for(let i = 0; i < timespans.length; i++){
					if(timespans[i].type == 'service-window'){
						data.srIds.push(timespans[i].id);
					}
				}

				this.$emit('openModalTimespans', data)
			},
			broadCastScroll(e, header){
				// console.log('gant methods broadCastScroll')
				this.$emit('broadCastScroll', {
					left: e.target.scrollLeft,
					header: header
				});
			},
			openReasonMaintenanceModal(obj){
				// console.log('gant methods openReasonMaintenanceModal')
				this.$emit('openReasonMaintenanceModal', obj);
			},
			selectWorkOrderByTask(timespan){
				// console.log('gant methods selectWorkOrderByTask')
				if(timespan.type == 'task'){
					this.$emit('openWorkOrder', timespan.wo)
				}
			},
			getFleetStatusClass(fleetStatus){
				// console.log('gant methods getFleetStatusClass')
				if(fleetStatus == 1){
					return {
						class: 'redFleet',
						title: 'nietinzetbaar'
					}
				} else if (fleetStatus == 2){
					return {
						class: 'purpleFleet',
						title: 'onderbewaking'
					}
				} else if (fleetStatus == 3){
					return {
						class: 'greenFleet',
						title: 'inzetbaar'
					}
				}
			},
			filterWorkOrdersByMaterialNumber(materialNumber){
				// console.log('gant methods filterWorkOrdersByMaterialNumber')
				if(this.chartData.options.labelsClickable){
					if(this.selectedMaterial !== materialNumber){
						this.selectedMaterial = materialNumber;
						this.$emit('filterWorkOrdersByMaterialNumber', materialNumber)
					} else {
						this.selectedMaterial = null;
						this.$emit('filterWorkOrdersByMaterialNumber', null)
					}

				}
			},
			getShuntingTime(minutes){
				// console.log('gant methods getShuntingTime')
				return (this.chartData.options.cellWidth / 60) * minutes + 'px';
			},
			getSeparatorHeight(){
				// console.log('gant methods getSeparatorHeight')
				let table = document.getElementById(this.id);
				let rows = table.tBodies[0].rows.length;

				return 40 * (rows - 1) + 'px';
				// const visibleAmount = this.chartData.data.filter(obj => {
				// 	if (obj.timespans && obj.timespans.length === 0) return false;
				// 	return true;
				// }).length;
				// return visibleAmount * 40 + 'px'
			},
			fitsInSw(timespans, item){
				// console.log('gant methods fitsInSw')
				if(item.type == 'task'){

					let task = item;

					let taskStart = this.$moment(item.start).add(1, 'minutes');
					let taskEnd = this.$moment(item.end).subtract(1, 'minutes');

					let serviceWindows = _.map(timespans, (el) => {
						if(el.type == 'service-window' && el.label == item.label) {
							return el;
						}
					});

					for(let i = 0; i < serviceWindows.length; i++){
						if(serviceWindows[i]){
							let start = this.$moment(serviceWindows[i].start);
							let end = this.$moment(serviceWindows[i].end);

							if(taskStart.isBetween(start, end) && taskEnd.isBetween(start, end)){
								return true;
								break;
							}
						}
					}
				} else if (item.type == 'equipment-task') {
					let task = item;

					let taskStart = this.$moment(item.start).add(1, 'minutes');
					let taskEnd = this.$moment(item.end).subtract(1, 'minutes');

					const range1 = this.$moment.range(taskStart, taskEnd);

					let serviceWindows = _.map(timespans, (el) => {
						if(el.type == 'service-window' && el.label == item.label) {
							return el;
						}
					});

					for(let i = 0; i < serviceWindows.length; i++){
						if(serviceWindows[i]){
							let start = this.$moment(serviceWindows[i].start);
							let end = this.$moment(serviceWindows[i].end);
							const range2 = this.$moment.range(start, end);
							 // true

							if(range1.overlaps(range2)){
								return false;
								break;
							} else {
								return true;
								break;
							}
						}
					}
				} else {
					return false;
				}
			},
			checkTimespanVisibility(label, timespans){
				// console.log('gant methods checkTimespanVisibility')
				let timespanVisibility = false;

				if(this.hideOutOfRange){
					for(let i = 0; i < timespans.length; i++){
						let timespan = timespans[i];
						if(timespan.label == label){
							let start = this.$moment(timespan.start);
							let end = this.$moment(timespan.end);

							let startPoint = this.$moment(timespan.start).diff(this.startDate, 'minutes') * this.minuteWidth;

							let endPoint = this.$moment(timespan.end).diff(this.startDate, 'minutes') * this.minuteWidth;

							let range = endPoint - startPoint;

							if(start < this.endDate && end > this.startDate){
								timespanVisibility = true
							}
						}
					}
				} else {
					timespanVisibility = true;
				}

				return timespanVisibility;
			},
			scrollParentToChild(parent, child) {
				// console.log('gant methods scrollParentToChild')
				// Where is the parent on page
				var parentRect = parent.getBoundingClientRect();
				// What can you see?
				var parentViewableArea = {
					height: parent.clientHeight,
					width: parent.clientWidth - 300
				};

				// Where is the child
				var childRect = child.getBoundingClientRect();
				// Is the child viewable?
				var isViewable = (childRect.left - 500 >= parentRect.left) && (childRect.left <= parentRect.left + parentViewableArea.width);

				// if you can't see the child try to scroll parent
				if (!isViewable) {
					// scroll by offset relative to parent
					parent.scrollLeft = (childRect.left + parent.scrollLeft) - parentRect.left - this.chartData.options.labelsWidth
				}
			},
			checkCurrentHour(topLabelIndex){
				// console.log('gant methods checkCurrentHour')
				if(this.chartData.options.visualizeCurrentHour){
					let hour = this.$moment(this.topLabels[topLabelIndex]).get('hour');
					let nextHour = this.$moment(this.topLabels[topLabelIndex + 1]).get('hour');

					let day = this.$moment(this.topLabels[topLabelIndex]).date();
					let month = this.$moment(this.topLabels[topLabelIndex]).get('month');

					if(this.$moment().get('hour') >= hour && this.$moment().get('hour') < nextHour){
						if(day == this.$moment().date() && month == this.$moment().get('month')){
							return true;
						}
					}

					return false;
				} else {
					return false;
				}

			},
			generateTopLabels(){
				// console.log('gant methods generateTopLabels')
				for(let i = 0; i < (this.chartData.options.rangeHours + this.chartData.options.prevTimeHours) / this.chartData.options.hourStep; i++){
					this.topLabels.push(this.$moment(this.startDate).clone().add(this.chartData.options.hourStep * i, 'hours'))
				}
			},
			placeRangeOnRow(timespan){
				// console.log('gant methods placeRangeOnRow')
				let start = this.$moment(timespan.start);
				let end = this.$moment(timespan.end);
				let fullrange = false;
				if(this.endDate){
					if(end > this.endDate){
						end = this.endDate;
						fullrange = true;
					}

					//get start point
					let startPoint = start.diff(this.startDate, 'minutes') * this.minuteWidth;

					//get end point
					let endPoint = end.diff(this.startDate, 'minutes') * this.minuteWidth;
					let range = endPoint - startPoint + 'px';

					if(fullrange){
						range = endPoint - startPoint + 'px'; // + 29
					}


					let obj = {
						start: startPoint + 'px', //1px  /* - (this.timeZoneOffsetMinutes * (this.minuteWidth * 60)) */
						range: range
					}

					if(start < this.endDate && end > this.startDate){
						return obj;
					} else {
						return undefined;
					}
				}

			}
		}
	}
</script>

<style lang="scss">
	.chart-header{
		margin-top: 15px;
		font-size: 18px;
		font-weight: 600;
		float: left;
		clear: both;
		width: 100%;
		margin-bottom: 10px;
		color: #0079d3;
		&-wrapper {
			display: flex;
		}
	}
	.content-bg-white {
		.chart-header {
			font-size: 16px;
			font-weight: 400;
		}
	}
	.chart-main-wrapper{
		position: relative;
		overflow: hidden;
		float: left;
		width: 100%;
		margin-bottom: 10px;
	}
	.chart-main-component{
		background: #fff;
		position: relative;
		overflow: hidden;
		float: left;
		width: 100%;
		height: calc(100% - 30px);
		clear: both;
		.top-overlay{
			height: 42px;
			background: #fff;
			left: 0;
			top: 0;
			z-index: 999;
			display: block;
			position: absolute;

			border: 1px solid rgba(0,0,0,.1);
		}

		// .chart-table-container {
		// 	max-width: 100%;
		// 	max-height: 100%;
		// 	overflow: hidden;
		// 	display: block;
		// 	margin: 0 auto;
		// 	.ps__rail-x{
		// 		position: absolute;
		// 		position: sticky;
		// 		left: 0!important;
		// 		bottom: 0!important;
		// 		z-index: 9999;
		// 		// bottom: -15px!important;
		// 		border-radius: 0;
		// 		.ps__thumb-x{
		// 			border-radius: 0;
		// 		}
		// 	}

		// 	.ps__rail-y{
		// 		border-radius: 0;
		// 		.ps__thumb-y{
		// 			border-radius: 0;
		// 		}
		// 	}
		// }

		.table-scroll {
			position: relative;
			width:100%;
			height: 100%;
			z-index: 1;
			margin: auto;
			overflow: hidden;

			table {
				display: block;
			    position: relative;
			    overflow: scroll;
			    width: 100%;
			    height: calc(100% - 2px);
			    border-collapse: collapse;
			    thead, tbody {
			      	display: block;
			      	width: max-content;
			    }
			    th, td {
			      	display: inline-block;
			      	background: #fff;
			      	overflow: hidden;
			    }
				tbody{
					tr{
						td{
							border-top: 1px solid rgba(0, 0, 0, 0.1);
							border-bottom: 1px solid rgba(0, 0, 0, 0.1);
						}
					}
					th {
						position: sticky;
				      	left: 0;
				      	z-index: 4;
				      	line-height: 40px;
				      	vertical-align: middle;
				      	border-bottom: 1px solid rgba(0, 0, 0, 0.1);

					}
				}
				thead {
					position: sticky;
	      			top: 0;
	  				z-index: 5;
	  				th.blank {
				      	position: sticky;
				      	top: 0;
				      	left: 0;
				      	z-index: 1000;
				      	border: 1px solid rgba(0,0,0,.1);
				    }
				}
				&#equipment-chart {
					tbody tr {
						td {
							&:before {
								display: block;
								position: absolute;
								left: 0;
								top: calc(50% - 10px);
								background: #d4d4d8;
								content: '';
								width: 100%;
								height: 20px;
							}
							.time-span.service-window {
								background: #fff;
							}
						}
						&:first-child {
							td {
								&:before {
									display: none;
								}
							}
						}
					}
				}
			}
		}
		.table-wrap {
			position: relative;
		}
		.table-scroll th,
		.table-scroll td {
			// padding: 5px 0;
			width: 120px;
			background: #fff;
			vertical-align: middle;
			height: 40px;
			box-sizing: border-box;
		}
		.table-scroll thead th {
			background: #fff;
			color: #707070;
			position: sticky;
			top: 0;
			z-index: 35;
			text-align: left;
			padding-right: 60px;
			padding-left: 5px;
			border: 1px solid rgba(0,0,0,.1);
			border-right: 0;
			position: relative;
			vertical-align: bottom;
			font-weight: 600;
			border-right: 1px solid rgba(0,0,0,.1);
			border-left: 0;
			text-align: left;
			padding: 0 5px;
			vertical-align: middle;

			span{
				width: calc(100% - 22px);
				float: right;
				text-align: right;
				white-space: nowrap;
				text-overflow: ellipsis;
				overflow: hidden;
				font-size: 12px;
				line-height: 16px;
				text-align: right;
				line-height: 40px;
				vertical-align: middle;
				position: relative;
				&.main{
					font-size: 14px;
					font-weight: 600;
					position: absolute;
					top: 50%;
					transform: translateY(-50%);
					left: 5px;
					width: calc(75% - 5px);
					text-align: left;
					padding-left: 15px;
					overflow: visible;
					.timeslot-icon{
						// display: inline-block;
						// // margin-left: 5px;
						// position: relative;
						// top: 7px;
						position: absolute;
						left: -6px;
						margin-top: 10px;
						// transform: translateY(-50%);
					}
					&.clickable{
						cursor: pointer;
						&:hover, &.active{
							color: #0079d3;
						}
					}
					+ span{
						width: 25%;
					}
				}
			}

			&.current-hour{
				border-left: 2px solid #0079d3;
			}

			&:last-child{
				border-right: 1px solid rgba(0,0,0,.1);
			}
			// &:nth-child(2){
			// 	border-left: 0px solid rgba(0,0,0,.1)
			// }

			span{
				float: left;
				display: inline-block;
				width: 100%;
				clear: both;
			}
		}

		.table-scroll tr.separators{
			display: block;
			width: max-size;
			height: 0px;
			td, th{
				position: relative;
				height: 0px;
				font-size:0;
				margin:0;
				line-height: 0px;
				border: none;
				overflow: visible;
				display: inline-block;
				left: 0;
				padding: 0;
				.hseparator{
					display: block;
					width: 1px;
					position: absolute;
					background: rgba(0,0,0,.1);
					z-index: 4;
					left: -1px;
   					top: -13px;
					&.current-hour{
						background: #0079d3;
						z-index: 4;
						width: 2px;
						left: 0px;
					}
				}
			}
		}

		.table-scroll th {
			// border-bottom: 1px solid rgba(0,0,0,.1);
			// border-left: 1px solid rgba(0,0,0,.1);
			border: 1px solid rgba(0,0,0,.1);
			position: relative;
			background: #fff;
			.label-wrapper{
	      		width: 100%;
	      		height: 100%;
	      		position: relative;
				display: flex;
				justify-content: space-between;
				align-items: center;
	      		.main{
	      			b{
	      				float: left;
	      				cursor: pointer;
	      				white-space: nowrap;
      					overflow: hidden;
      					text-overflow: ellipsis;
	      				&.full-width {
	      					display: block;
	      					width: 100%;

	      				}
	      			}
	      			.timeslot-icon{
	      				float: left;
	      				position: relative;
	      				top: 5px;
	      				width: 30px;
	      				height: 30px;
	      				cursor: pointer;
	      				background: rgba(0,0,0,0);
	      				border-radius: 50%;
	      				&:hover{
	      					background: rgba(0,0,0,0.03);
	      				}
	      				> .icons{
	      					position: absolute;
	      					left: 50%;
	      					top: 50%;
	      					transform: translate(-50%, -50%);
	      					margin: 0;
	      				}
	      			}
	      			&.active{
	      				color: #0079d3;
	      			}
	      		}
				.additional {
					display: flex;
					justify-content: space-between;
					align-items: center;
					width: 50%;
					.align-right {
						margin-left: auto;
					}
					.reason-maintenance{
						line-height: 24px;
						vertical-align: middle;
						font-style: normal;
						cursor: pointer;
						background: rgba(0,0,0,.1);
						padding: 0 5px;
						border-radius: 12px;
						font-size: 11px;
						&:hover{
							background: rgba(0,0,0,.15);
						}
					}
				}
	      	}
			.toggle-nested{
				position: absolute;
				right: 2px;
				top: 50%;
				width: 20px;
				height: 20px;
				line-height: 18px;
				text-align: center;
				font-weight: 600;
				background: #f7f7f7;
				border-radius: 50%;
				font-style: normal;
				border: 1px solid rgba(0,0,0,.1);
				transform: translateY(-50%);
				cursor: pointer;
				font-size: 10px;
				&:hover{
					background: #ccc;
				}
			}
			.current-hour{
				border-left: 2px solid #0079d3;
				height: 200%;
				width: 1px;
				background: red;
				display: block;
				position: absolute;
				bottom: 0;
			}
		}

		.table-scroll td{
			position: relative;
			overflow: visible;
			.time-span{
				position: absolute;
				height: 20px;
				background: #0079d3;
				top: 50%;
				transform: translateY(-50%);
				color: #fff;
				vertical-align: middle;
				font-size:  9px;
				z-index: 2;
				opacity: 1;

				&.service-window{
					background: #d4d4d8;
				}
				&.task, &.equipment-task{
					cursor: pointer;
					border-left: 1px solid rgba(82, 82, 82, 1);
					border-right: 1px solid rgba(82, 82, 82, 1);
					z-index: 3;
					&:hover{
						&:after{
							width: 100%;
						}
						&:before{
							width: 100%;
						}
					}
					&:after, &:before{
						width: 0px;
						height: 1px;
						content: '';
						display: block;
						position: absolute;
						background: rgba(82, 82, 82, 1);
					}
					&:after{
						left: 0;
						top: 0;
					}
					&:before{
						right: 0;
						bottom: 0;
					}
					&.error{
						background: rgba(220, 0, 0, .85);
					}
					&.success{
						background: rgba(11, 145, 38, .85);
					}
				}
				&.emplacement{
					height: 20px;
					border-radius: 0;
					z-index: 5;
					background: #d4d4d8;
					opacity: 1;
					pointer-events: none;
					z-index: 2;
				}
				.shunting-time{
					display: block;
					height: 100%;
					background: rgba(212, 212, 216, .5);
					position: absolute;
					left: 0;
					top: 0;
					transform: translateX(-100%);
					&:nth-child(2){
						right: 0;
						left: auto;
						transform: translateX(100%);
					}
				}
			}
			.service-window{
				z-index: 1;
			}
		}

		.hour-separators{
			position: absolute;
			left: 0;
			top: 0;
			width: 100%;
			height: 100%;
			span{
				position: absolute;
				top: 0;
				width: 1px;
				// background: #ccc;
				border-left: 1px dashed #000;
				display: block;
				height: 100%;
				opacity: .1;
			}
		}
	}


	tr{
		&.selected{
			th{
				&:after{
					content: '';
					display: block;
					position: absolute;
					left: 0;
					top: 0;
					height: 100%;
					width: 2px;
					background: #0079d3;
					opacity: 1;
				}
			}
		}
	}
</style>

<template>
	<div class="train-schedule">
		<h1 class="section-heading">{{ title }}</h1>
		<div class="train-schedule-container" v-if="workOrder" :class="{'disabled': workOrder.waitingForWO !== null}">
			<div class="train-schedule-scroll-content">
				<icon name="chevron-groot" size="40" :colors="{default: '#c5c5cb', hover: '#0079D3'}" class="left" @click.native="scrollLeft()"/>
				<perfect-scrollbar :options="scrollBarOpts" v-dragscroll>
					<div class="train-schedule" v-if="serviceWindows && serviceWindows.length > 0">
						<div
							class="train-schedule-left"
							:class="{'feasible': serviceWindows[0] && serviceWindows[0].feasible }">
							{{materialNumber}}
						</div>
						<div
							class="train-schedule-content"
							:style="{'width': (serviceWindows.length - 1) * calculateLeftPosition(1) + 'px'}">

							<div
								class="service-window-horizontal-line"
								:style="{'width': (serviceWindows.length - 1) * calculateLeftPosition(1) + 'px'}">
							</div>

							<div
								class="service-window-vertical-line" v-for="(serviceWindow, index) in serviceWindows"
								:style="{'left': calculateLeftPosition(index) + 'px'}">
							</div>

							<div
								class="service-window-location-top-label"
								v-for="(serviceWindow, index) in serviceWindows"
								:style="{'left': calculateLeftPosition(index) + 'px'}"
								:class="{'active': serviceWindow.serviceWindowId === selectedServiceWindowId, 'blue': serviceWindow.feasible}">{{serviceWindow.name}}
							</div>

							<div
								class="service-window-location-bottom-label"
								v-for="(serviceWindow, index) in serviceWindows"
								:style="{'left': calculateLeftPosition(index) + 'px'}"
								:class="{'active': serviceWindow.serviceWindowId === selectedServiceWindowId, 'blue': serviceWindow.feasible}">
								<div class="top">
									{{$moment(serviceWindow.arrivalDate).local().format('DD MMMM YYYY')}}
								</div>
								<div class="bottom" >
									<template v-if="!serviceWindow.trainSchedule.noDepartureTime">
										{{serviceWindow.startTime}} - {{serviceWindow.endTime}}
										<span :style="{'font-weight': 'bold'}">{{serviceWindow.durationTime}}</span>
									</template>
									<template v-else>
										{{serviceWindow.startTime}}
									</template>

								</div>
							</div>

							<div
								class="service-window-location-select-circle"
								v-for="(serviceWindow, index) in serviceWindows"
								:class="{
                                'active': serviceWindow.serviceWindowId === selectedServiceWindowId,
                                'disabled': !serviceWindow.allowSelect || !serviceWindow.ntLocationMatch
                            }"

								:style="{'left': calculateLeftPosition(index) + 'px'}"
								v-if="serviceWindow.feasible"
								@click="selectServiceWindow(serviceWindow)">

								<div class="service-window-location-select-circle-inner"></div>
							</div>
						</div>
					</div>
				</perfect-scrollbar>

				<icon name="chevron-groot" size="40" :colors="{default: '#c5c5cb', hover: '#0079D3'}" class="right" @click.native="scrollRight()"/>
			</div>
			<!-- <div class="scrollbar-hider" :style="{'height': calculateScrollBarWidth() + 'px'}" />
			<div class="white-overlay" :style="{'width': 221 - 70 + 'px'}" /> -->
		</div>
	</div>
</template>

<script>
import $date from '@/modules/date-module'
export default {
	props: {
		workOrder: {
			type: Object,
			default: () => {}
		},
		title: {
			type: String,
			default: ''
		},
		feasibleServiceWindowIds: {
			type: Array,
			default: () => []
		},
		feasibleServiceWindows: {
			type: Array,
			default: () => []
		},
		filteredLocationIds: {
			type: Array,
			default: () => []
		},
	},
    data: function () {
        return {
            materialNumber: null,
            selectedServiceWindowId: null,
            serviceWindows: []
        }
    },
    watch: {
        workOrder: {
            handler: function () {
                if (!this.workOrder) {
                    this.selectedServiceWindowId = null
                    return
                }
                this.materialNumber = this.workOrder.materialNumber

                this.generateServiceWindows();
            },
            deep: true
        },

        feasibleServiceWindowIds: {
            handler: function () {
                this.generateServiceWindows()
            },
            deep: true
        },
        filteredLocationIds: {
            handler: function(){
                this.generateServiceWindows();
            },
            deep: true
        }
    },

    methods: {
        // checkServiceWindow(serviceWindow){
        //     //console.log(serviceWindow.arrivalDate, serviceWindow.startTime, serviceWindow.endTime, serviceWindow.durationTime, serviceWindow.name);
        //     if(
        //         serviceWindow.arrivalDate.length > 0 &&
        //         serviceWindow.startTime.length > 0 &&
        //         serviceWindow.endTime.length > 0 &&
        //         serviceWindow.durationTime.length > 0 &&
        //         serviceWindow.name.length > 0
        //     ){
        //         return true;
        //     } else {
        //         return false;
        //     }
        // },
        scrollLeft(){
            document.getElementsByClassName('ps')[0].scrollBy(-240, 0)
        },
        scrollRight(e){
            document.getElementsByClassName('ps')[0].scrollBy(240, 0)
        },
        /**
         * Generate the service windows
         */
        generateServiceWindows () {
            this.serviceWindows = []
            if (!this.workOrder || !this.workOrder.trainSchedule) {
                // console.log("Now we did not find a workorder.")
                return this.serviceWindows
            }
            for (let trainScheduleIndex in this.feasibleServiceWindows) {
                let trainSchedule = this.feasibleServiceWindows[trainScheduleIndex]

                if(trainSchedule.hasOwnProperty("serviceWindow")){
                    // let startTime = $date.toDateString(new Date(trainSchedule.arrivalDate)).substring(11, 16)
                    let startTime = this.$moment(trainSchedule.arrivalDate).local().format('HH:mm')
                    // let endTime = $date.toDateString(new Date(trainSchedule.departureDate)).substring(11, 16)
                    let endTime = this.$moment(trainSchedule.departureDate).local().format('HH:mm')

                    let durationTimeMS = new Date(trainSchedule.serviceWindow.serviceWindowEnd).getTime() - new Date(trainSchedule.serviceWindow.serviceWindowStart).getTime()
                    let durationTimeHours = String(Math.floor(durationTimeMS / 1000 / 60 / 60))
                    let durationTimeMinutes = String(Math.round(((durationTimeMS / 1000 / 60 / 60) - durationTimeHours) * 60))
                    if (durationTimeMinutes.length === 1) {
                        durationTimeMinutes = '0' + durationTimeMinutes
                    }
                    let durationTime = durationTimeHours + ':' + durationTimeMinutes

                    let feasible = false;
                    let ntLocationMatch = false;

                    if(new Date(trainSchedule.departureDate).getTime() > new Date().getTime()) {
                        feasible = this.feasibleServiceWindowIds.indexOf(Number(trainSchedule.serviceWindowId)) !== -1
                    }
                    if(this.workOrder.ntLocationType == 'SB'){

                        if( trainSchedule.location.locationType == 'SB' ||
                            trainSchedule.location.locationType == 'GSL' ||
                            trainSchedule.location.locationType == 'TC' ) {
                            ntLocationMatch = true;

                        }
                    } else if (this.workOrder.ntLocationType == 'GSL'){

                        if( trainSchedule.location.locationType == 'GSL' ||
                            trainSchedule.location.locationType == 'TC' ) {

                            ntLocationMatch = true;

                        }
                    }

                    if(feasible){
                        // console.log(startTime, endTime, durationTime)
                        this.serviceWindows.push({
                            serviceWindowId: trainSchedule.serviceWindowId,
                            locationId: trainSchedule.locationId,
                            name: trainSchedule.location.name,
                            startTime,
                            endTime,
                            durationTime,
                            feasible: feasible,
                            ntLocationMatch: ntLocationMatch,
                            arrivalDate: trainSchedule.arrivalDate,
                            allowSelect: this.checkIfSelectAllowed(trainSchedule.locationId),
                           trainSchedule
                        })
                    } else {
                        // console.log("feasible check failed")
                    }

                }
            }
            this.$emit('retrieveServiceWindows', this.serviceWindows);
        },

        checkIfSelectAllowed(locationId){
            let allowed = false;

            if(this.filteredLocationIds !== null){
                for(let i = 0; i < this.filteredLocationIds.length; i++){
                    // console.log(1);
                    if(this.filteredLocationIds[i].id.toString() == locationId.toString()){
                        allowed = true;
                        // console.log(123);
                        // break;
                    }
                }
            } else {
                allowed = true;
            }


            return allowed;

            // if(this.locationsFeasibility.includes(locationId)){
            //     console.log('found')
            //     return true;
            // } else {
            //     console.log('not found')
            //     return false;
            // }
        },

        /**
         * Calculate the left position of the service window
         */
        calculateLeftPosition (serviceWindowIndex) {
            let minWidth = 240
            let maxWidthLabelComponent = 200
            let componentPadding = 190 + 221 + maxWidthLabelComponent
            let componentWidth = this.$el.offsetWidth
            let availableWidth = componentWidth - componentPadding
            let availableWidthPerComponent = availableWidth / (this.serviceWindows.length - 1)
            return Math.max(minWidth, availableWidthPerComponent) * serviceWindowIndex
        },

        /**
         * TODO: generic
         * Calculate the width of a scrollbar in the application
         */
        calculateScrollBarWidth () {
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
        },

        /**
         * TODO: make generic !
         * Calculate the width used by the text in the content div,
         * this could possibly be reused if necessary in the future.
         * @param {string} text the text to calculate the width for
         */
        calculateTextWidth (text) {
            let dummyElement = document.createElement('div')
            let result = 0

            dummyElement.style.position = 'absolute'
            dummyElement.style.left = '-999999em'
            dummyElement.style.top = '-999999em'
            dummyElement.style.whiteSpace = 'nowrap'
            dummyElement.style.fontFamily = 'Open Sans'
            dummyElement.style.fontSize = '16px'
            dummyElement.innerHTML = text
            dummyElement.style.display = 'table'
            document.body.appendChild(dummyElement)
            result = dummyElement.clientWidth
            document.body.removeChild(dummyElement)

            return result
        },

        /**
         * Select a service window
         * @param {object} serviceWindow the service window
         */
        selectServiceWindow (serviceWindow) {
			// console.log('methods selectServiceWindow')
			// console.log(this.workOrder)
            document.dispatchEvent(new CustomEvent('trainScheduleSelectServiceWindow', {
                detail: {
                    serviceWindowId: serviceWindow.serviceWindowId,
                    locationId: serviceWindow.locationId,
                    arrivalDate: serviceWindow.arrivalDate,
                    serviceWindow
                }
            }))
            this.selectedServiceWindowId = serviceWindow.serviceWindowId
            this.$emit('sendSelectedLocationId', serviceWindow.locationId);
        },

        /**
         * Format the arrival date
         * @param {string} arrivalDate the arrival date string
         */
        formatArrivalDate (arrivalDate) {
            return $date.formatDateMonthYear($date.toDateObject(arrivalDate))
        }
    }
}
</script>
<style lang="scss" scoped>
@import "../assets/scss/variables";
.train-schedule-container {
	position: relative;
	background: white;
	margin-top: 5px;
	margin-bottom: 15px;
	//padding-right: 30px;

	.train-schedule-scroll-content {
		overflow: hidden;
		position: relative;
		height: 100%;
		width: 100%;
		height: 140px;
		// padding: 82px 241px;
		// padding-right: 30px;

		.ps{
			position: relative;
			height: 100%;
			width: calc(100% - 100px);
			left: 50px;
			padding: 0 50px;
			.ps__rail-x{
				height: 15px!important;
				opacity: 1!important;
			}
		}

		.train-schedule {
			position: absolute;
			top: 35%;
			left: 0;
			padding: 0 75px;
			.train-schedule-left{
				position: absolute;
				margin-top: 2px;
				left: -10px;
				transform: translate(-100%, -50%);
				-o-transform: translate(-100%, -50%);
				-moz-transform: translate(-100%, -50%);
				-webkit-transform: translate(-100%, -50%);
				font-size: 12px;
				color: #707070;

				&.feasible {
					left: -20px;
				}
			}

			.train-schedule-content {
				position: relative;
				border-bottom: 5px solid white;

				.service-window-horizontal-line {
					position: absolute;
					background:#c5c5cb;
					height: 5px;
					top: 0;
					left: 0;
				}
				.service-window-vertical-line {
					position: absolute;
					background: #c5c5cb;;
					height: 50px;
					top: -20px;
					width: 1px;
				}
				.service-window-location-top-label {
					position: absolute;
					font-size: 12px;
					top: -26px;
					color: #707070;
					text-overflow:ellipsis;
					overflow: hidden;
					white-space: nowrap;
					transform: translate(-50%, -100%);
					-o-transform: translate(-50%, -100%);
					-moz-transform: translate(-50%, -100%);
					-webkit-transform: translate(-50%, -100%);
					text-align: center;
					max-width: 200px;

					&.blue {
						color: #0079d3;
					}

					&.active {
						font-weight: bold
					}
				}
				.service-window-location-bottom-label {
					position: absolute;
					font-size: 12px;
					top: 36px;
					color: #707070;
					text-overflow:ellipsis;
					overflow: visible;
					width: 150px;
					transform: translate(-50%, 0);
					-o-transform: translate(-50%, 0);
					-moz-transform: translate(-50%, 0);
					-webkit-transform: translate(-50%, 0);
					text-align: center;

					&.blue {
						color: #0079d3;
					}

					&.active {
						font-weight: bold
					}
				}
				.service-window-location-select-circle {
					position: absolute;
					background: white;
					height: 20px;
					width: 20px;
					box-sizing: content-box;
					border: 5px solid #0079D3;
					border-radius: 100%;
					margin-left: 0.5px;
					margin-top: 2.5px;
					transform: translate(-50%, -50%);
					-o-transform: translate(-50%, -50%);
					-moz-transform: translate(-50%, -50%);
					-webkit-transform: translate(-50%, -50%);
					&.disabled{
						pointer-events: none;
						border: 5px solid rgba(0,0,0,.3);
						.service-window-location-select-circle-inner{
							background: rgba(0,0,0,.3);
							display: block;
						}
					}

					.service-window-location-select-circle-inner {
						display: none;
						height: 16px;
						width: 16px;
						border-radius: 100%;
						background: #0079d3;
						margin-left: 2px;
						margin-top: 2px;
					}

					&.active, &:hover {
						.service-window-location-select-circle-inner {
							display: block;
						}
					}

					&:hover {
						cursor: pointer;
					}
				}
			}
		}
	}

	.scrollbar-hider {
		position: absolute;
		background: white;
		bottom: 0;
		left: 0;
		width: 100%;
		transform: translate(0, 0);
		-o-transform: translate(0, 0);
		-moz-transform: translate(0, 0);
		-webkit-transform: translate(0, 0);
		border-bottom: 2px solid #C5C5CB;
	}

	.white-overlay {
		position: absolute;
		background: white;
		left: 0;
		top: 0;
		width: 241px;
		height: 160px;
	}
}
.train-schedule-scroll-content .icons{
	position: absolute;
	top: calc(50% - 20px);
	cursor: pointer;
	&.left{
		left: 0;
		transform: rotate(180deg);
	}
	&.right{
		right: 0;
	}
}

.train-schedule-container.disabled{
	.service-window-location-select-circle{
		pointer-events: none;
		border: 5px solid rgba(58,59,60, .5)!important;
	}
}
</style>

<template>
	<div class="picker-wrapper" :class="[{'wrapper-icconed' : icon}, {'wrapped-time' : onlyTime}]">
		<h3 v-if="title" class="title">{{title}}</h3>
		<div class="picker-flex" :class="{'overlay': overlay}" >
			<VueCtkDateTimePicker v-if="!onlyTime"
				:id="`date-time-picker-${Math.floor(Math.random() * 100001)}`"
				:class="{'field-iconed' : icon}"
				v-model="date"
				:locale="locale"
				:label="label"
				:format="dynamicFormat"
				:formatted="dynamicFormatter"
				:disabled="disabled"
				:minDate="minDate"
				:overlay="false"
				:autoClose="true"
				:noHeader="true"
				:noLabel="true"
				:noClearButton="false"
				:onlyDate="true"
				:onlyTime="onlyTime"
				color="#0079d3"
				@input="handleInput"
			>
			</VueCtkDateTimePicker>
			<div  class="timepicker-field" :class="{'field-iconed': onlyTime && icon}">
				<span type="text" class="placeholder" @click="$emit('input', '00:00')" v-if="onlyTime && !value">{{label}}</span>
				<div class="timepicker-wrapper"  v-if="!onlyDate && value">
					<input
						:disabled="disabled"
						:value="hours"
						@keyup="replaceTime($event,'h')"
						@change="changeTime"
						@blur="changeTime"
						@click="$event.target.select()"
					>
					<span>:</span>
					<input
						:disabled="disabled"
						:value="minutes"
						@keyup="replaceTime($event,'m')"
						@change="changeTime"
						@blur="changeTime"
						@click="$event.target.select()"
					>
					<button
						class="custom-button flex align-center justify-content-center field-clear-button round"
						v-if="value && !disabled"
						@click="$emit('input', null)"
					/>
				</div>
			</div>

		</div>
	</div>
</template>

<script>
export default {
    props: {
		label: {
			type: String,
			default: ''
		},
		title: {
			type: String,
			default: null
		},
		minDate: {
			type: String,
		},
		locale: {
			type: String,
			default: 'nl'
		},
		format: {
			type: String,
			default: null
		},
		formatted: {
			type: String,
			default: null
		},
		icon: {
			type: Boolean,
			default: false
		},
		overlay: {
			type: Boolean,
			default: false
		},
		disabled: {
			type: Boolean,
			default: false
		},
		paddingless: {
			type: Boolean,
			default: false
		},
		onlyDate: {
			type: Boolean,
			default: false
		},
		onlyTime: {
			type: Boolean,
			default: false
		},
		value: {
			type: String,
		}
    },
    data () {
		return {
			date: null,
			time: null,
			hours: null,
			minutes: null,
			formatedTime: null,
			content: this.value,
		}
    },
	computed: {
		dynamicFormat () {
			if (this.format) {
				return this.format
			}
			return this.onlyDate ? 'YYYY-MM-DD' : this.onlyTime ? 'HH:mm' : 'YYYY-MM-DD'
		},
		dynamicFormatter () {
			if (this.formatter) {
				return this.formatter
			}
			return this.onlyDate ? 'DD MMM YYYY' : this.onlyTime ? 'LT' : 'DD MMM YYYY'
		}
	},
	beforeMount () {
		this.separateValues()
	},
	methods: {
		separateValues () {
			this.date = this.value && !this.onlyTime
				? this.onlyDate
					? this.value
					: this.value.split(' ')[0]
				: null
			this.time = this.value && !this.onlyDate
				? this.onlyTime
					? this.value
					: this.value.split(' ')[1]
				: null
			this.hours = this.time
				? this.time.split(':')[0]
				: null
			this.minutes = this.time
				? this.time.split(':')[1]
				: null
		},
		replaceTime (e, type) {
			let { value } = e.target
			const hourReg = /^(0[0-9]|1[0-9]|2[0-3])$/
			const minuteReg = /^[0-5][0-9]$/
			if (type === 'h') {
				this.hours = null
				this.hours = value.length < 2 || value.match(hourReg) ? value : '00'
			}
			if (type === 'm') {
				this.minutes = null
				this.minutes = value.length < 2 || value.match(minuteReg) ? value : '00'
			}
		},
		validateTime (e){
			return e.length < 2 ? '0' + e : e
		},
		handleInput (e) {
			this.date = e
			const date = this.date || this.$moment().format('ll')
			const time = this.time || this.$moment().format('LT')
			this.content = this.onlyTime ? time : date + ' ' + time
			this.$emit('input', this.content)
		},
		changeTime (e) {
			const date = this.date || this.$moment().format('ll')
			let time = this.time || this.$moment().format('LT')
			let timeSplit = time.split(':')
			timeSplit[0] = this.validateTime(timeSplit[0])
			timeSplit[1] = this.validateTime(timeSplit[1])
			this.hours = timeSplit[0]
			this.minutes = timeSplit[1]
			time = timeSplit.join(':')
			this.content = this.onlyTime ? time : date + ' ' + time
			this.$emit('input', this.content)
		}
	},
	watch: {
		value () {
			this.content = this.value
			if(this.minDate) {
				if (this.$moment(this.content).isBefore(this.minDate, 'minutes')) {
					this.content = this.minDate
					this.$emit('input', this.content)
				}
			}
			this.separateValues()
		},
		hours: {
			handler	(newVal, oldVal) {
				if (!!newVal && (oldVal !== newVal && newVal !== null)) {
					const time = this.time.split(':')
					time[0] = newVal.length ? newVal : '00'
					this.time = time.join(':')
				}
			}
		},
		minutes: {
			handler	(newVal, oldVal) {
				if (!!newVal && (oldVal !== newVal && newVal !== null)) {
					const time = this.time.split(':')
					time[1] = newVal.length ? newVal : '00'
					this.time = time.join(':')
				}
			}
		}
	}
}
</script>

<style lang="scss">
@import "../assets/scss/variables";

.picker-wrapper {
	border-bottom: 2px solid map-get($colors, default-grey);
	position: relative;
	cursor: pointer;
	* {
		font-family: 'Open Sans', sans-serif!important;
	}
	.datepicker-day-text {
		font-size: 12px !important;
	}
	.picker-flex {
		display: flex;
		justify-content: flex-start;
		align-items: center;
	}
	.title {
		font-size: 18px;
		color: #003082;
		font-weight: 100;
	}
	.timepicker-wrapper {
		background: #fff;
		display: flex;
		align-items: center;
		span {
			font-size: 12px !important;
		}
		input {
			font-size: 12px !important;
			color: map-get($colors, light-blue);
			border: 0;
			outline: none !important;
			width: 25px;
			text-align: center;
			padding-top: 9px;
		}

		.custom-button {
			background: none;
			content: none;
			right: 8px;
			top: 0px;
			&:hover {
				&:before {
					color: map-get($colors, light-blue);
				}
			}
			&:before {
				content: "";
				position: absolute;
				display: block;
				background-color: map-get($colors, default-grey);
				z-index: 1;
				width: 24px;
				height: 24px;
				-webkit-mask: url(/static/icon/icoon_sluiten.svg) no-repeat 50% 50%;
				mask: url(/static/icon/icoon_sluiten.svg) no-repeat 50% 50%;
				-webkit-mask-size: 40px;
				mask-size: 40px;
			}
			span {
				display: none;
			}
		}
		button {
			right: 12px;
			top: 0;
			bottom: 0;
			margin: auto 0;
			padding: 0 20px;
			background-color: #fff;
			border: 1px solid transparent;
			border-radius: 4px;
			height: 30px;
			font-size: 13px;
			outline: none;
			cursor: pointer;
			-webkit-transition: all .25s cubic-bezier(.645,.045,.355,1);
			color: #fff;
			font-weight: 500;
			display: flex;
			padding: 0;
			width: 24px;
			height: 24px;
			border-radius: 50%;
			&:before {
				width: 24px;
				height: 24px;
			}
		}
	}
	&.wrapper-icconed {
		.timepicker-wrapper {
			left: 140px;
		}
	}
	&.wrapped-time {
		.timepicker-wrapper {
			bottom: 7px;
			width: 100%;
			position: initial;
			left: 0px;
		}
	}
	.timepicker-field {
		width: -webkit-fill-available !important;
		height: 40px;
		display: flex;
		align-items: center;
		.placeholder {
			font-size: 12px !important;
			color: map-get($colors, light-blue);
			width: 100%;
		}
		.timepicker-wrapper {
			width: -webkit-fill-available !important;
			.custom-button{
				margin-left: auto;
				margin-right: 9px;
			}
		}
		&.field-iconed {
			.placeholder {
				padding-left: 40px;
			}
			.timepicker-wrapper {
				padding-left: 35px;
			}
			&:before {
				content: "";
				position: absolute;
				display: block;
				background-color: map-get($colors, light-blue);
				z-index: 1;
				width: 35px;
				height: 40px;
				-webkit-mask: url(/static/icon/icoon_kalender.svg) no-repeat 50% 50%;
				mask: url(/static/icon/icoon_kalender.svg) no-repeat 50% 50%;
				-webkit-mask-size: 40px;
				mask-size: 40px;
			}
		}
	}
	.field {
		input {
			width: 150px !important;
			display: flex;
			padding-right: 0;
		}
		display: flex;
		//width: fit-content;
		width: auto;
		position: relative;
		padding: 0;
		.field-input {
			padding-left: 0px;
			font-weight: 500;
			background: none;
			letter-spacing: 0.4px;
		}
		&.is-disabled {
			.field-input {
				background: #fff !important;
			}
		}
	}
	&:hover {
		border-color: map-get($colors, light-blue) !important;
	}
}
.date-time-picker {
	margin: 0 !important;
	width: auto !important;
	.field {
		.custom-button {
			display: none !important;
		}
	}
	&.field-iconed {
		.field {
			button {
				display: none;
			}
			.field-input {
				padding-left: 45px;
				font-weight: 500;
			}
			&:before {
				content: "";
				position: absolute;
				display: block;
				background-color: map-get($colors, light-blue);
				z-index: 1;
				width: 35px;
				height: 40px;
				-webkit-mask: url(/static/icon/icoon_kalender.svg) no-repeat 50% 50%;
				mask: url(/static/icon/icoon_kalender.svg) no-repeat 50% 50%;
				-webkit-mask-size: 40px;
				mask-size: 40px;
			}
		}
	}
	.field-input {
		font-size: 12px !important;
		font-family: 'Open Sans', sans-serif;
		border: 0 !important;
		color: map-get($colors, light-blue);
		text-transform: capitalize;

		&::-webkit-input-placeholder {
			color: map-get($colors, light-blue);
		}
	}
}
.overlay {
	.date-time-picker {
		.datetimepicker {
			&.slide-leave {
				display: none !important;
				opacity: 0 !important;
				top: 0%!important;
				left: 0%!important;
				transform: translate(-0%, 0%) !important;
			}
			&.slide-leave-active{
				display: none !important;
				opacity: 0 !important;
				top: 0%!important;
				left: 0%!important;
				transform: translate(0%, 0%) !important;
			}
			&.slide-leave-to{
				display: none !important;
				opacity: 0 !important;
				top: 50%!important;
				left: 50%!important;
				transform: translate(50%, 0%) !important;
			}
		}
	}
	.datetimepicker.flex.visible {
		top: 50%!important;
		left: 50%!important;
		bottom: auto !important;
		transform: translate(-50%, -55%) !important;
		position: fixed;
		display: block;
		width: auto;
		.datepicker{
			display: block;
			position: relative;
			bottom: auto;
		}
	}
}
.right-padding {
	.custom-button {
		padding-left: 20px;
	}
}
</style>

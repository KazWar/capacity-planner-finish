<script>
import $date from '@/modules/date-module'

export default {
	props: ['type', 'direction', 'label', 'step', 'icon', 'iconSize', 'iconType', 'value', 'values', 'minValue', 'maxValue', 'suffix', 'selectIdProperty', 'selectValueProperty', 'selectType', 'selectSize', 'disabled', 'topLabel', 'usedLocations', 'hideTime', 'taskId', 'workOrderId', 'afterText', 'objData', 'itemIndex'],

	data: function () {
		return {
			clonedValue: null,

			menuStyle: {},

			defaultType: 'select',

			defaultStep: 1,

			defaultIcon: null,

			defaultIconType: 'svg',

			defaultSelectSize: 52,

			textOverflow: false,

			selectedSpan: 'none',

			showMenu: false,

			isHovered: false,

			months: [
				{
					id: 0,
					name: 'Jan'
				},
				{
					id: 1,
					name: 'Feb'
				},
				{
					id: 2,
					name: 'Mrt'
				},
				{
					id: 3,
					name: 'Apr'
				},
				{
					id: 4,
					name: 'Mei'
				},
				{
					id: 5,
					name: 'Jun'
				},
				{
					id: 6,
					name: 'Jul'
				},
				{
					id: 7,
					name: 'Aug'
				},
				{
					id: 8,
					name: 'Sep'
				},
				{
					id: 9,
					name: 'Okt'
				},
				{
					id: 10,
					name: 'Nov'
				},
				{
					id: 11,
					name: 'Dec'
				}
			],

			searchQuery: ''
		}
	},

	mounted: function () {
		window.addEventListener('resize', this.onResize)
		window.addEventListener('resize', this.calculateMenuStyle)
		document.addEventListener('click', this.onGlobalClick)
		document.addEventListener('keyup', this.onKeyUp)
		document.addEventListener('pickerBlur', this.onBlur)
		this.clonedValue = this.value
		this.onResize()
	},

	beforeDestroy: function () {
		window.removeEventListener('resize', this.onResize)
		window.removeEventListener('resize', this.calculateMenuStyle)
		document.removeEventListener('click', this.onGlobalClick)
		document.removeEventListener('keyup', this.onKeyUp)
		document.removeEventListener('pickerBlur', this.onBlur)
	},

	watch: {
		clonedValue: function (oldVal, newVal) {
			// console.log(this.clonedValue);
			this.$emit('input', this.clonedValue)

			if(this.objData && oldVal){
				this.$emit('saveConstructionType', this.objData)
			}

			this.onResize()
		},

		value: function () {
			try{
				this.clonedValue = JSON.parse(JSON.stringify(this.value))
			} catch(err){
				//
			}

		},

		label: function () {
			this.onResize()
		},

		selectedSpan: function () {
			if (this.clonedValue === null) {
				return
			}

			if ((this.type || this.defaultType) === 'time') {
				let hour = this.clonedValue.substring(0, 2)
				let minute = this.clonedValue.substring(3, 5)
				if (hour > 23) {
					hour = '00'
				}
				if (minute > 59) {
					minute = '00'
				}

				this.clonedValue = hour + ':' + minute
			}
			else if ((this.type || this.defaultType) === 'datetime') {
				let hour = this.clonedValue.substring(11, 13)
				let minute = this.clonedValue.substring(14, 16)
				let second = this.clonedValue.substring(17, 19)
				if (hour > 23) {
					hour = '00'
				}
				if (minute > 59) {
					minute = '00'
				}
				if (second > 59) {
					second = '00'
				}
				this.clonedValue = this.clonedValue.replaceAt(11, 19, hour + ':' + minute + ':' + second)
			}
			else if ((this.type || this.defaultType) === 'number') {
				let value = Number(this.clonedValue)
				if (!isNaN(value)) {
					if (this.minValue && value < this.minValue) {
						this.clonedValue = String(this.minValue)
					}
					else if (this.maxValue && value > this.maxValue) {
						this.clonedValue = String(this.maxValue)
					}
				}
			}
		},
		showMenu: function(val){
			this.searchQuery = '';
		},
		searchQuery: function(val){

		}
	},

	computed: {
		/**
		 * Get the sorted list of select values
		 */
		sortedValues: function () {
			// console.log(this.values.length);
			// console.log(this.values);
			if(this.values){
				let values = JSON.parse(JSON.stringify(this.values))
				return values.sort((a, b) => {
					if (a[this.selectValueProperty] < b[this.selectValueProperty]) {
						return -1
					}
					if (a[this.selectValueProperty] > b[this.selectValueProperty]) {
						return 1
					}
					return 0
				})
			}

		},

		/**
		 * The values of the options, displayed in the date time select list
		 */
		dateTimeSelectValues () {
			switch (this.selectedSpan) {
				case 'day':
					let lastDayOfMonth = $date.toDateObject(this.clonedValue).lastDayOfMonth()
					let days = []
					for (let i = 1; i <= lastDayOfMonth; i++) {
						days.push({
							id: i,
							name: i
						})
					}
					return days
				case 'year':
					let currentYear = Number(this.clonedValue.substring(0, 4))
					let years = []
					for (let i = currentYear - 5; i <= currentYear + 5; i++) {
						years.push({
							id: i,
							name: i
						})
					}
					return years
			}
			return this.months
		}
	},

	methods: {
		checkIfDisabled(bool){
			if(bool){
				return true;
			}
		},
		preventSpecialCharacters(string){
			var format = /[!@#$%^&*_+\=\[\]{};'"\\|<>\/?]/;

			if(format.test(string)){
				return false
			} else {
				return true;
			}
			// return format.test(string);
		},
		/**
		 * Whenever the user clicks anywhere on the page
		 */
		onGlobalClick (event) {
			let outsideOfPicker = true
			for (var index in event.path) {
				var element = event.path[index]
				try{
					if (element.className !== undefined && element.className.indexOf('picker') !== -1) {
						outsideOfPicker = false
						break
					}
				} catch(err){
					//
				}
			}

			if (outsideOfPicker) {
				this.onClickOutsideOfPicker()
			}
		},

		/**
		 * Whenever the user clicks outside of the picker element
		 */
		onClickOutsideOfPicker () {
			document.dispatchEvent(new CustomEvent('pickerBlur'))
		},

		/**
		 * Whenever the user stops focussing on this picker element
		 */
		onBlur () {
			this.selectedSpan = 'none'
			this.showMenu = false

			if (['text', 'password'].indexOf(this.type || this.defaultType) !== -1 && this.value === '') {
				this.clonedValue = null
			}
		},

		/**
		 * When the icon / content has been clicked
		 */
		onClick () {

			if (this.disabled) {
				return
			}
			let type = this.type || this.defaultType
			switch (type) {
				case 'select':
					document.dispatchEvent(new CustomEvent('pickerBlur'))
					setTimeout(() => {
						this.showMenu = !this.showMenu
					}, 1)
					break
				case 'time':
					if (this.clonedValue === null && this.value === null) {
						this.changeSelectedSpan('hour')
					}
					if (this.clonedValue == null) {
						this.clonedValue = this.value
					}
					if (this.value === null) {
						this.clonedValue = '00:00'
					}
					break
				case 'number':
					if (this.clonedValue === null) {
						this.clonedValue = 0
					}
					this.changeSelectedSpan('number')
					break
				case 'text':
					if (this.clonedValue === null) {
						this.clonedValue = ''
					}
					setTimeout(() => {
						this.$el.querySelector('.content input').focus()
					}, 1)
					break
				case 'password':
					if (this.clonedValue === null) {
						this.clonedValue = ''
					}
					setTimeout(() => {
						this.$el.querySelector('.content input').focus()
					}, 1)
					break
				case 'datetime':
					if (this.clonedValue === null) {
						this.clonedValue = $date.toDateString(new Date())
					}
					break
			}
		},

		/**
		 * Whenever the key up event has occurred
		 * @param {Event} event the event
		 */
		onKeyUp (event) {
			let type = this.type || this.defaultType
			switch (type) {
				case 'time':
					if ((event.keyCode >= 48 && event.keyCode <= 57) || (event.keyCode >= 96 && event.keyCode <= 105)) {
						if (this.selectedSpan === 'hour') {
							let hour = this.clonedValue.substring(1, 2) + String(event.keyCode - (event.keyCode > 57 ? 96 : 48))
							this.clonedValue = hour + this.clonedValue.substring(2, 5)
						}
						else if (this.selectedSpan === 'minute') {
							let minute = this.clonedValue.substring(4, 5) + String(event.keyCode - (event.keyCode > 57 ? 96 : 48))
							this.clonedValue = this.clonedValue.substring(0, 3) + minute
						}
					}
					else if (event.keyCode === 13) {
						if (this.selectedSpan === 'hour') {
							this.changeSelectedSpan('minute')
						}
						else if (this.selectedSpan === 'minute') {
							this.changeSelectedSpan('none')
						}
					}
					break
				case 'datetime':
					if ((event.keyCode >= 48 && event.keyCode <= 57) || (event.keyCode >= 96 && event.keyCode <= 105)) {
						if (this.selectedSpan === 'hour') {
							let hour = this.clonedValue.substring(12, 13) + String(event.keyCode - (event.keyCode > 57 ? 96 : 48))
							this.clonedValue = this.clonedValue.replaceAt(11, 13, hour)
						}
						else if (this.selectedSpan === 'minute') {
							let minute = this.clonedValue.substring(15, 16) + String(event.keyCode - (event.keyCode > 57 ? 96 : 48))
							this.clonedValue = this.clonedValue.replaceAt(14, 16, minute)
						}
					}
					else if (event.keyCode === 13) {
						if (this.selectedSpan === 'hour') {
							this.changeSelectedSpan('minute')
						}
						else if (this.selectedSpan === 'minute') {
							this.changeSelectedSpan('none')
						}
					}
					break
				case 'number':
					if ((event.keyCode >= 48 && event.keyCode <= 57) || (event.keyCode >= 96 && event.keyCode <= 105)) {
						if (this.selectedSpan === 'number') {
							this.clonedValue = Number(String(this.clonedValue) + String(event.keyCode - (event.keyCode > 57 ? 96 : 48)))
						}
					}
					else if (event.keyCode === 13) {
						this.changeSelectedSpan('none')
					}
					else if (event.keyCode === 8) {
						if (this.selectedSpan === 'number') {
							if (String(this.clonedValue).length > 1) {
								this.clonedValue = String(this.clonedValue).substring(0, String(this.clonedValue).length - 1)
							}
							else {
								this.clonedValue = 0
							}
						}
					}
					break
			}
		},

		/**
		 * Change the selected time component value
		 */
		changeSelectedSpan (newValue) {
			document.dispatchEvent(new CustomEvent('pickerBlur'))
			this.$nextTick(() => {
				this.selectedSpan = newValue
				if (this.type === 'datetime' && ['year', 'month', 'day'].indexOf(this.selectedSpan) !== -1) {
					this.showMenu = true
				}
			})
		},

		/**
		 * Whenever the component is or has been resized
		 */
		onResize () {
			let maxContentWidth = (this.$el.offsetWidth - 145)

			this.textOverflow = this.calculateTextWidth(this.getDisplayValue()) > maxContentWidth
			let content = this.$el.querySelector('.content')
			if (!content) {
				return
			}
		},

		/**
		 * Whenever the previous icon has been clicked
		 */
		onClickPrevious () {
			let type = this.type || this.defaultType
			let step = this.step && this.selectedSpan && this.step[this.selectedSpan] ? this.step[this.selectedSpan] : (this.step || this.defaultStep)

			switch (type) {
				case 'time':
					if (this.clonedValue !== null) {
						if (this.selectedSpan === 'hour') {
							let hour = Number(this.clonedValue.substring(0, 2))
							hour -= step

							if (hour < 0) {
								hour = 24 + hour
							}
							if (hour < 10) {
								hour = '0' + hour
							}

							this.clonedValue = hour + this.clonedValue.substring(2, 5)
						}
						else if (this.selectedSpan === 'minute') {
							let minute = Number(this.clonedValue.substring(3, 5))
							let hour = this.clonedValue.substring(0, 2)
							minute -= step

							if (minute < 0) {
								minute = 60 + minute
								hour = Number(hour) - 1
								if (hour < 0) {
									hour = 24 + hour
								}
								hour = String(hour)
								if (hour.length === 1) {
									hour = '0' + hour
								}
							}
							if (minute < 10) {
								minute = '0' + minute
							}

							this.clonedValue = hour + ':' + minute
						}
					}
					break
				case 'datetime':
					if(!this.hideTime){
						if (this.clonedValue !== null) {
							if (this.selectedSpan === 'hour') {
								let hour = Number(this.clonedValue.substring(11, 13))
								let date = $date.toDateObject(this.clonedValue.substring(0, 10))
								hour -= step

								if (hour < 0) {
									hour = 24 + hour
									date.setTime(date.getTime() - 1000 * 60 * 60 * 24)
								}
								if (hour < 10) {
									hour = '0' + hour
								}

								this.clonedValue = this.clonedValue.replaceAt(11, 13, hour).replaceAt(0, 10, $date.toDateString(date).substring(0, 10))
							}
							else if (this.selectedSpan === 'minute') {
								let minute = Number(this.clonedValue.substring(14, 16))
								let hour = this.clonedValue.substring(11, 13)
								let date = $date.toDateObject(this.clonedValue.substring(0, 10))

								minute -= step

								if (minute < 0) {
									minute = 60 + minute
									hour = Number(hour) - 1
									if (hour < 0) {
										hour = 24 + hour
										date.setTime(date.getTime() - 1000 * 60 * 60 * 24)
									}
									hour = String(hour)
									if (hour.length === 1) {
										hour = '0' + hour
									}
								}
								if (minute < 10) {
									minute = '0' + minute
								}

								this.clonedValue = this.clonedValue.replaceAt(11, 16, hour + ':' + minute).replaceAt(0, 10, $date.toDateString(date).substring(0, 10))
							}
						}
					} else {
						if(this.clonedValue !== null && this.step == 'day'){
							let date = new Date(this.clonedValue);
							let dateIncrement = date.setDate(date.getDate() - 1);

							// this.clonedValue = $date.toDateString(dateIncrement);

							this.clonedValue = $date.toDateString(date);
						}
					}

					break
				case 'number':
					if (this.clonedValue && !isNaN(Number(this.clonedValue))) {
						this.clonedValue = String(Number(this.clonedValue) - step)
					}
					break
			}
		},

		/**
		 * TODO: refactor together with onClickPrev eventually and also refactor the time and datetime functionality to be reused as they're similar
		 * Whenever the next icon has been clicked
		 */
		onClickNext () {
			let type = this.type || this.defaultType
			let step = this.step && this.selectedSpan && this.step[this.selectedSpan] ? this.step[this.selectedSpan] : (this.step || this.defaultStep)

			switch (type) {
				case 'time':
					if (this.clonedValue !== null) {
						if (this.selectedSpan == 'hour') {
							let hour = Number(this.clonedValue.substring(0, 2))
							hour += step

							if (hour > 23) {
								hour -= 24
							}
							if (hour < 10) {
								hour = '0' + hour
							}

							this.clonedValue = hour + this.clonedValue.substring(2, 5)
						}
						else if (this.selectedSpan == 'minute') {
							let minute = Number(this.clonedValue.substring(3, 5))
							let hour = this.clonedValue.substring(0, 2)
							minute += step

							if (minute > 59) {
								minute -= 60
								hour = Number(hour) + 1
								if (hour > 23) {
									hour -= 24
								}
								hour = String(hour)
								if (hour.length == 1) {
									hour = '0' + hour
								}
							}
							if (minute < 10) {
								minute = '0' + minute
							}

							this.clonedValue = hour + ':' + minute
						}
					}
					break
				case 'datetime':
					if(!this.hideTime){
						if (this.clonedValue !== null) {
							if (this.selectedSpan == 'hour') {
								let hour = Number(this.clonedValue.substring(11, 13))
								let date = $date.toDateObject(this.clonedValue.substring(0, 10))
								hour += step

								if (hour > 23) {
									hour -= 24
									date.setTime(date.getTime() + 1000 * 60 * 60 * 24)
								}
								if (hour < 10) {
									hour = '0' + hour
								}

								this.clonedValue = this.clonedValue.replaceAt(11, 13, hour).replaceAt(0, 10, $date.toDateString(date).substring(0, 10))
							}
							else if (this.selectedSpan == 'minute') {
								let minute = Number(this.clonedValue.substring(14, 16))
								let hour = this.clonedValue.substring(11, 13)
								let date = $date.toDateObject(this.clonedValue.substring(0, 10))
								minute += step

								if (minute > 59) {
									minute -= 60
									hour = Number(hour) + 1
									if (hour > 23) {
										hour -= 24
										date.setTime(date.getTime() + 1000 * 60 * 60 * 24)
									}
									hour = String(hour)
									if (hour.length == 1) {
										hour = '0' + hour
									}
								}
								if (minute < 10) {
									minute = '0' + minute
								}

								this.clonedValue = this.clonedValue.replaceAt(11, 16, hour + ':' + minute).replaceAt(0, 10, $date.toDateString(date).substring(0, 10))
							}
						}
					} else {
						if(this.clonedValue !== null && this.step == 'day'){
							let date = new Date(this.clonedValue);
							let dateIncrement = date.setDate(date.getDate() + 1);

							// this.clonedValue = $date.toDateString(dateIncrement);

							this.clonedValue = $date.toDateString(date);
						}
					}
					break
				case 'number':
					if (this.clonedValue == 0 || (this.clonedValue && !isNaN(Number(this.clonedValue)))) {
						this.clonedValue = String(Number(this.clonedValue) + step)
					}
					break
			}
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
		 * Get the display value
		 */
		getDisplayValue () {
			if ((this.type || this.defaultType) === 'select' && (this.value || this.value === 0)) {
				return this.findValueById(this.value)
			}
			return this.value || this.label
		},

		/**
		 * Checks if the value is in the list of values
		 * @param {string} value the value
		 */
		isValueInList (value) {
			if (value === null) {
				return false
			}
			for (var index in this.values) {
				var val = this.values[index]
				if (val[this.selectIdProperty] === value) {
					return true
				}
			}
			return false
		},

		/**
		 * Find the value in the list of options by its id
		 * @param {number} id the id
		 */
		findValueById (id) {
			for (var index in this.values) {
				var value = this.values[index]
				if (value[this.selectIdProperty] !== null && value[this.selectIdProperty].toString() == id) {
					return value[this.selectValueProperty]
				}
			}
			return ''
		},

		/**
		 * Select an item from the list of options
		 * @param {number} id the id
		 */
		selectItem (id) {
			// console.log(this.usedLocations, id);
			if(this.usedLocations){
				let matched = false;

				for(let i = 0; i < this.usedLocations.length; i++){
					if(id == this.usedLocations[i]){
						matched = true;
						// console.log('matched');
						break;
					}
				}
				this.$emit("matchedLocation", matched);
			}

			this.$emit('placeSelectedEquipmentForTask', id);
			this.$emit('selectEquipment', id);
			this.$emit('selectQualification', id);

			if(this.taskId){
				let timeslotData = {
					emplacementId: id,
					taskId: this.taskId,
					workOrderId: this.workOrderId,
					type: 'task'
				}
				this.$emit('setTimeOnTaskLevel', timeslotData);
			}


			this.clonedValue = id
			this.showMenu = false
			this.$forceUpdate()
		},

		/**
		 * Select a day/month/year in the select of the datetime
		 * @param {number} index the index of the selected item
		 */
		selectDateTimeValue (index) {
			let value = this.dateTimeSelectValues[index].id
			let lastDayOfMonth, day
			switch (this.selectedSpan) {
				case 'day':
					this.clonedValue = this.clonedValue.replaceAt(8, 10, String(value).length === 1 ? '0' + String(value) : String(value))
					break
				case 'month':
					this.clonedValue = this.clonedValue.replaceAt(5, 7, String(Number(value + 1)).length === 1 ? '0' + String(Number(value + 1)) : String(Number(value + 1)))
					day = Number(this.clonedValue.substring(8, 10))
					lastDayOfMonth = $date.toDateObject(this.clonedValue.replaceAt(8, 10, '01')).lastDayOfMonth()
					if (Number(day) > Number(lastDayOfMonth)) {
						this.clonedValue = this.clonedValue.replaceAt(8, 10, lastDayOfMonth)
					}
					break
				case 'year':
					this.clonedValue = this.clonedValue.replaceAt(0, 4, value)
					day = Number(this.clonedValue.substring(8, 10))
					lastDayOfMonth = $date.toDateObject(this.clonedValue.replaceAt(8, 10, '01')).lastDayOfMonth()
					if (Number(day) > Number(lastDayOfMonth)) {
						this.clonedValue = this.clonedValue.replaceAt(8, 10, lastDayOfMonth)
					}
					break
			}
			this.showMenu = false
		},

		/**
		 * Check if the date time value is selected
		 * @param {number} index the index of the date time value
		 */
		isDateTimeValueSelected (index) {
			let value = this.dateTimeSelectValues[index].id
			switch (this.selectedSpan) {
				case 'day':
					return Number(this.clonedValue.substring(8, 10)) === Number(value)
				case 'month':
					return Number(this.clonedValue.substring(5, 7)) - 1 === Number(value)
				case 'year':
					return Number(this.clonedValue.substring(0, 4)) === Number(value)
			}
			return false
		}
	}
}
</script>

<template>
    <div class="picker-container" :class="{'disabled': disabled}">
        <div class="top-label" v-if="topLabel">
            {{topLabel}}
        </div>

        <!-- The default picker -->
        <div
            class="picker-default"
            v-if="type !== 'select' || (!selectType || selectType === 'default')">

            <icon
                :onClick="onClick"
                v-if="icon || defaultIcon"
                :name="icon || defaultIcon"
                :size="iconSize || 40"
                color="#0079D3"/>

            <!-- The content for type 'time' -->
            <div
                @click="onClick()"
                class="content"
                v-if="(type || defaultType) === 'time'">


                <span
                    @click="changeSelectedSpan('hour')"
                    :class="{'selected': selectedSpan === 'hour'}"
                    v-if="value !== null">
                    {{getDisplayValue().substring(0, 2)}}
                </span>
                <span v-if="value !== null">:</span>
                <span @click="changeSelectedSpan('minute')"
                    :class="{'selected': selectedSpan === 'minute'}"
                    v-if="value !== null">
                    {{getDisplayValue().substring(3, 5)}}
                </span>

                <span v-if="value === null">
                    {{getDisplayValue()}}
                </span>
            </div>

            <!-- The content for type 'datetime' -->
            <div
                @click="onClick()"
                class="content"
                v-if="(type || defaultType) === 'datetime'">

                <span
                    class="day"
                    @click="changeSelectedSpan('day')"
                    :class="{'selected': selectedSpan === 'day'}"
                    v-if="value !== null">

                    {{Number(value.substring(8, 10))}}
                </span>

                <span v-if="value !== null">&nbsp;</span>

                <span
                    class="month"
                    @click="changeSelectedSpan('month')"
                    :class="{'selected': selectedSpan === 'month'}"
                    v-if="value !== null">
                    {{months[Number(value.substring(5, 7)) - 1].name}}
                </span>

                <span v-if="value !== null">&nbsp;</span>

                <span
                    class="year"
                    @click="changeSelectedSpan('year')"
                    :class="{'selected': selectedSpan === 'year'}"
                    v-if="value !== null">
                    {{value.substring(0, 4)}}
                </span>

                <span v-if="value !== null">
                    &nbsp;&nbsp;
                </span>

                <span
                    @click="changeSelectedSpan('hour')"
                    :class="{'selected': selectedSpan === 'hour'}"
                    v-if="value !== null && !hideTime">
                    {{value.substring(11, 13)}}
                </span>

                <span v-if="value !== null && !hideTime">:</span>

                <span
                    @click="changeSelectedSpan('minute')"
                    :class="{'selected': selectedSpan === 'minute'}"
                    v-if="value !== null && !hideTime">
                    {{value.substring(14, 16)}}
                </span>

                <span v-if="value === null">
                    {{getDisplayValue()}}
                </span>
            </div>

            <!-- The content for type 'number' -->
            <div
                @click="onClick()"
                class="content"
                v-else-if="(type || defaultType) === 'number'">

                <span
                    @click="changeSelectedSpan('number')"
                    :class="{'selected': selectedSpan === 'number'}"
                    v-if="value !== null">
                    {{clonedValue}}
                </span>

                <span v-if="value != null && suffix !== undefined">
                    &nbsp;{{suffix}}
                </span>

                <span v-if="value === null">{{getDisplayValue()}}</span>
                <span v-if="value !== null" class="after-text">
                    {{afterText}}
                </span>
            </div>

            <!-- The content for type 'select' with selectType 'default' or empty -->
            <div
                @click="onClick()"
                class="content"
                v-else-if="(type || defaultType) === 'select'">
                {{getDisplayValue()}}

                <md-tooltip
                    md-direction="right"
                    style="margin-left: -10px"
                    v-show="textOverflow">

                    {{getDisplayValue()}}
                </md-tooltip>
            </div>

            <!-- The content for type 'text' -->
            <div
                @click="onClick()"
                class="content"
                v-else-if="(type || defaultType) === 'text'">

                <input type="text" v-if="value !== null" v-model="value"/>
                <input
                    type="text"
                    v-if="value === null"
                    class="test"
                    @focus="onClick()"
                    style="overflow: hidden; max-width: 0; max-height: 0;"/>

                <span v-if="value === null">
                    {{getDisplayValue()}}
                </span>
            </div>

            <!-- The content for type 'password' -->
            <div
                @click="onClick()"
                class="content"
                v-else-if="(type || defaultType) === 'password'">
                <input type="password" v-if="value !== null" v-model="value"/>

                <input
                    type="text"
                    v-if="value === null"
                    @focus="onClick()"
                    style="overflow: hidden; max-width: 0; max-height: 0;"/>

                <span v-if="value === null">
                    {{getDisplayValue()}}
                </span>
            </div>

            <!-- The buttons -->
            <div class="buttons" v-if="!disabled">
                <div
                    class="icon-container"
                    @click="onClickPrevious()"
                    v-if="['text', 'password', 'select'].indexOf(type || defaultType) === -1">

                    <icon name="chevron-groot" size="40" :colors="{default: '#c5c5cb', hover: '#0079D3'}" />
                </div>

                <div
                    class="icon-container"
                    @click="onClickNext()"
                    v-if="['text', 'password', 'select'].indexOf(type || defaultType) === -1">

                    <icon name="chevron-groot" size="40" :colors="{default: '#c5c5cb', hover: '#0079D3'}" />
                </div>

                <div
                    class="icon-container"
                    :class="type || defaultType"
                    :style="{'margin-right': (['text', 'password', 'select'].indexOf(type || defaultType) !== -1) ? '9px' : 0}">
                    <icon name="sluiten" size="40" :colors="{default: '#c5c5cb', hover: '#0079D3'}" :onClick="() => {clonedValue = null}" />
                </div>
            </div>
        </div>

        <!-- The rounded picker style -->
        <div
            class="picker-round"
            v-else @click="onClick()"
            @mouseover="() => {isHovered = true}"
            @mouseout="() => {isHovered = false}" :style="{'height': (selectSize || defaultSelectSize) + 'px', 'line-height': (selectSize || defaultSelectSize) + 'px'}">
            <div class="left">
                {{getDisplayValue()}}
                <md-tooltip md-direction="right" :style="{'margin-left': '-10px'}" v-show="textOverflow">{{getDisplayValue()}}</md-tooltip>
            </div>

            <div
                class="right"
                :style="{'margin-top': -5 + ((selectSize || defaultSelectSize) - 30) / 2 + 'px'}">

                <icon name="chevron-groot" :size="40" :colors="{default: '#0079D3', hover: '#00286c'}" :isHovered="isHovered" transition="none"/>
            </div>
        </div>

        <!-- The select menu for type 'select' -->
        <div :class="direction" class="picker-menu-container" v-if="(type || defaultType) === 'select'">
            <div class="picker-menu" v-if="showMenu">
                <div class="search-box">
                    <input type="text" ref="searchField" id="search" v-model="searchQuery" v-focus>
                    <icon name="zoeken" size="40" color="#0079D3"/>
                </div>
                <div @click="selectItem(value)" class="picker-menu-item selected" v-if="isValueInList(value)" :location-id="value">
                    {{findValueById(value)}}
                </div>
                <div
                    @click="selectItem(val[selectIdProperty])"
                    class="picker-menu-item"
                    :class="{'disabled': val.disabled}"
                    v-for="(val, index) in values"
                    :key="index"
                    :location-id="val[selectIdProperty]"
                    v-if="(
                                val[selectValueProperty] !== null &&
                                val[selectIdProperty] !== value &&
                                (
                                    _.includes(val[selectValueProperty].toLowerCase(), searchQuery.toLowerCase()) &&
                                    preventSpecialCharacters(val[selectValueProperty]) ||
                                    (val.station && _.includes(val.station.toLowerCase(), searchQuery.toLowerCase()))
                                )
                            )" >
                    {{val[selectValueProperty]}}
                </div>
            </div>
        </div>

        <!-- The select menu for type 'datetime' -->
        <div class="picker-menu-container picker-menu-container-datetime" v-else-if="(type || defaultType) === 'datetime'" :type="type">
            <div class="picker-menu" v-if="showMenu">
                <div @click="selectDateTimeValue(index)" class="picker-menu-item" :class="{'selected': isDateTimeValueSelected(index)}" v-for="(val, index) in dateTimeSelectValues" :key="index">
                    {{val.name}}
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
@import "../assets/scss/variables";
.search-box{
	margin-bottom: 5px!important;
}
.picker-container {
	position: relative;

	.picker-default {
		padding: 5px 0;
		box-sizing: padding-box;
		border-bottom: 2px solid #C5C5CB;
		font-size: 12px;
		font-family: 'Open Sans', sans-serif;
		color: #0079d3;
		line-height: 40px;
		position: relative;

		> .icons, > .content, > .buttons {
			display: inline-block;
			vertical-align: top;
			height: 40px;
		}

		> .icons {
			$margin: 4px;
			margin-right: $margin;
			margin-left: -$margin;
			+ .content{
				width: calc(100% - 80px)!important;
			}
		}

		.content {
			text-overflow: ellipsis;
			overflow: hidden;
			white-space: nowrap;
			position: relative;
			width: calc(100% - 40px);

			input[type="text"], input[type="password"] {
				border: 0;
				padding: 0;
				margin: 0;
				font-size: 12px;
				color: #0079d3;
				width: 100%;
				&:focus {
					outline: none;
				}
				&:disabled{
					pointer-events: none;
					background: none;
				}
			}

			span {
				display: inline-flex;
				flex-wrap: nowrap;

				&.selected {
					background: #0079d3;
					color: #eee;
				}
			}
		}

		.buttons {
			float: right;
			-webkit-user-select: none;
			-o-user-select: none;
			-moz-user-select: none;
			user-select: none;
			position: absolute;
			right: 0;
			.icon-container {
				display: inline-block;
				vertical-align: top;

				&.text {
					margin-right: 9px;
				}
				&:first-child, &:nth-child(2) {
					width: 20px!important;
					overflow-x: hidden;

					.icons {
						margin-left: -9px;
					}
				}
				&:first-child {
					transform: rotate(180deg);
					-o-transform: rotate(180deg);
					-moz-transform: rotate(180deg);
					-webkit-transform: rotate(180deg);
				}
				&:nth-child(2) {
					margin-right: 10px;
				}
				&:hover {
					cursor: pointer;
				}
			}

			&:hover {
				cursor: pointer;
			}
		}

		&:hover {
			cursor: pointer;
			border-bottom: 2px solid #0079D3;
		}
	}

	.picker-round {
		box-sizing: border-box;
		font-size: 12px;
		font-family: 'Open Sans', sans-serif;
		color: #0079d3;
		position: relative;
		border: 1px solid #0079d3;
		border-radius: 10px;

		.left, .right {
			display: inline-block;
			vertical-align: top;
		}

		.left {
			padding-left: 25px;
			padding-right: 5px;
		}

		.right {
			padding-right: 7.5px;
			padding-left: 5px;
			float: right;

			.icons {
				transform: rotate(90deg);
				-o-transform: rotate(90deg);
				-webkit-transform: rotate(90deg);
				-moz-transform: rotate(90deg);
			}
		}

		&:hover {
			cursor: pointer;
			border: 1px solid #00286c;
			color: #00286c;
		}
	}

	.picker-menu-container {

		> .picker-menu {
			z-index: 100000000;
			position: absolute;
			background: white;
			padding: 7.5px 0 0;
			max-height: 300px;
			overflow-y: auto;
			font-size: 12px;
			-webkit-box-shadow: 0px 0px 5px 0.5px rgba(0,0,0,0.15);
			-moz-box-shadow: 0px 0px 5px 0.5px rgba(0,0,0,0.15);
			-o-box-shadow: 0px 0px 5px 0.5px rgba(0,0,0,0.15);
			box-shadow: 0px 0px 5px 0.5px rgba(0,0,0,0.15);
			transition: all 0.3s ease;
			width: 100%;
			box-sizing: border-box;
			&.hide {
				height: 0;
				overflow-y: hidden;
			}

			.search-box{
				width: 100%;
				border: none;
				border-bottom: 1px solid map-get($colors, light-blue);
				padding: 0 10px;
				position: relative;
				&:after{
					display: none;
				}
				.icons{
					right: 0;
					transform: translateY(calc(-50% - 4px))
				}
			}

			.picker-menu-item {
				padding: 0 5px;
				line-height: 25px;
				vertical-align: middle;
				color: map-get($colors, dark-grey);
				transition: all 0.3s ease;

				&.selected {
					color: #0079D3;
				}

				&:hover {
					cursor: pointer;
					background: #ccc;
				}
				&.disabled{
					display: none;
				}
			}
		}
		&.up {
			> .picker-menu {
				bottom: 2px;
				right: 0;
			}
		}
		&:not(.up) {
			> .picker-menu {
				top: 2px;
				left: 0;
			}
		}
	}

	&.danger {
		.picker-default, .picker-default:hover {
			color: #dc0000;
			border-bottom: 2px solid #dc0000;

			.content {
				input[type="text"], input[type="password"], span.selected {
					color: #dc0000;
				}
			}
		}
	}

	&.reduce{
		width: calc(100% - 55px)!important;
	}

	&.asset-setting{
		.picker-default{
			margin: 0!important;
			border: none!important;
			.after-text{
				float: none;
				display: inline-block;
				margin-left: 5px;
			}
		}
	}
}
.picker-custom{
	float: left;
	width: 175px;
	margin-left: 0;
	position: relative;
	top: -6px;
	right: -15px;
	.picker-round{
		border-radius: 0!important;
		border: none!important;
		color: rgba(0, 0, 0, .65)!important;
		font-size: 13px!important;
		letter-spacing: 0px!important;
		// border-left: 1px solid #0079d3;
		// background: rgba(0,0,0,.03);
		.left{
			padding-left: 5px;
			top: 2px;
			position: relative;
		}
		.right {
			padding: 0;
			float: right;
			> .icons{
				height: 30px!important;
				width: 30px!important;
				position: relative;
				right: 0;
				top: 5px;
			}
		}
	}
}

.hideArrows{
	.buttons{
		.icon-container:not(.time){
			display: none;
		}
	}
	.content{
		width: 100%!important;
	}
}

.after-text{
	float: right;
	padding-right: 5px;
}


</style>

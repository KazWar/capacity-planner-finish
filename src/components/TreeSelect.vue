<template>
	<div class="treeselect-wrap"
		:style="{'width': selectWidth ? `${selectWidth}px` : `100%`}"
 		:class="[
 			`treeselect-${size}`,
 			`${unselected ? 'treeselect-unselected' : ''}`,
 			`${disabled ? 'treeselect-disabled' : ''}`
 			]"
	>
		<h3 v-if="title" class="title">{{title}}</h3>
		<i :class="icon" v-if="icon"></i>
		<span class="prefix" v-if="prefix">{{prefix}}</span>
		<Treeselect
			:ref="'tree'"
			:style="{'min-height':`${selectSize}px`, 'line-height':`${selectSize}px`}"
			:class="[
				{'treeselect-iconed' : icon},
				{'treeselect-borderless' : borderless},
				{'treeselect-border' : !borderless},
				{'treeselect-clearable': clearable},
				{'treeselect-padding': !paddingless},
				{'treeselect-alpha': noBackground}]"
			:options="options"
			:value="content"
			:limit="limit"
			:multiple="multiple"
			:limitText="limitText"
			:normalizer="normalize ? normalizer : () => null"
			:flat="flat"
			:autoSelectDescendants="autoSelectDescendants"
			:autoDeselectDescendants="autoDeselectDescendants"
			:defaultExpandLevel="defaultExpandLevel"
			:placeholder="label"
			:disabled="disabled"
			:clearable="clearable"
			:matchKeys="['id','label','searched']"
			:disable-fuzzy-matching="true"
			:append-to-body="true"
			:searchable="searchable"
			:search-nested="false"
			:backspaceRemoves="false"
			:alwaysOpen="false"
			:disable-branch-nodes="disableBranchNodes"
			:noOptionsText="noOptionsText"
			@input="handleInput"
		>
		</Treeselect>

	</div>
</template>

<script>
	import Treeselect from '@riophae/vue-treeselect'
	import '@riophae/vue-treeselect/dist/vue-treeselect.css'
	export default {
		components: {
			Treeselect: Treeselect
		},
		props: {
			prefix: {
				type: String,
				default: undefined
			},
			noOptionsText: {
				type: String,
				default: 'Niet beschikbaar'
			},
			noBackground: {
				type: Boolean,
				default: false
			},
			disableBranchNodes: {
				type: Boolean,
				default: false
			},
			size: {
				type: String,
				default: 'md'
			},
			selectSize: {
				type: Number,
				default: 42
			},
			selectWidth: {
				type: Number,
				default: null
			},
			limit: {
				type: Number,
				default: 1
			},
			defaultExpandLevel: {
				type: Number,
				default: 1
			},
			options: {
				type: Array,
			},
			value: {
				type: [Array, Object]
			},
			additionalSearch: {
				type: String,
				default: null
			},
			multiple: {
				type: Boolean,
				default: false
			},
			cleareAfterSelect: {
				type: Boolean,
				default: false
			},
			clearable: {
				type: Boolean,
				default: true
			},
			unselected: {
				type: Boolean,
				default: false
			},
			flat: {
				type: Boolean,
				default: false
			},
			autoSelectDescendants: {
				type: Boolean,
				default: false
			},
			autoDeselectDescendants: {
				type: Boolean,
				default: false
			},
			disabled: {
				type: Boolean,
				default: false
			},
			searchable: {
				type: Boolean,
				default: true
			},
			borderless: {
				type: Boolean,
				default: true
			},
			paddingless: {
				type: Boolean,
				default: true
			},
			normalize: {
				type: Boolean,
				default: true
			},
			optionsId: {
				type: String,
				default: 'id'
			},
			limitText: {
				type: String,
				default: 'null'
			},
			optionsLabel: {
				type: String,
				default: 'label'
			},
			label: {
					type: String,
					default: ''
				},
			icon: {
				type: String,
				default: null
			},
			title: {
				type: String,
				default: null
			},
			children: {
				type: Array,
				default: () => []
			},
			hideUnknown: {
				type: Boolean,
				default: false
			},
			replaceValue: {
				type: Boolean,
				default: true
			}
		},
		data () {
			return {
				content: this.valueReplace(),
				normalizer (node) {
					return {
						id: this.$parent.additionalSearch && !this._.isEmpty(this.options) ? `${node[this.$parent.optionsId]}#${node[this.$parent.additionalSearch]}` : node[this.$parent.optionsId],
						label: node[this.$parent.optionsLabel]
					}
				}
			}
		},
		mounted	() {
			if (this.additionalSearch) {
				this.valueReplace()
			}
		},
		methods: {
			handleInput (e) {
				if (this.cleareAfterSelect) {
					this.$refs.tree._data.forest.selectedNodeIds = []
					this.$refs.tree._data.forest.selectedNodeMap = {}
				}
				let val = e
				if (this.additionalSearch && val) {
					if (typeof val === 'object') {
						if(val.length) {
							let newVal = []
							for (let elem in val) {
								let newElem = val[elem]
								newElem = newElem.split('#')[0]
								newElem = +newElem ? +newElem : newElem
								newVal.push(newElem)
							}
							val = newVal
						}
					}
					else {
						val = val.split('#')[0]
						val = +val ? +val : val
					}
				}
				this.$emit('input', val)
			},
			valueReplace () {
				let value;
				if (!this.replaceValue) {
					value = this.value
				} else {
					const isOptionsIncludeValue = typeof this.value === 'object' && !this._.isEmpty(this.value)
						? (this.options.some(item => this.value.find(val => val === item[this.optionsLabel])) ||
							(this.options.some(item => this.value.find(val => item.children && item.children.some(child => child[this.optionsLabel] === val || child[this.optionsId] === val)) ))
						)
						: this.options.find(item => item[this.optionsId] === this.value)
					value = this._.isEmpty(this.options) || !isOptionsIncludeValue || this.value === 'undefined' || this.value === '' || this.value === 'null' ? null : this.value;

					if (this.hideUnknown) {
						value = !this.options.some(e => e.id === this.value) ? null : this.value;
					}

					if (this.additionalSearch && value) {
						if (typeof value === 'object' && value.length) {
							const newVal = []
							value.forEach(elem => {
								elem = typeof elem === 'string' ? elem : elem.toString()
								if (!elem.includes('#') && this.value.length !== 0) {
									const optionate = []
									this.options.forEach(item => {
										if (item.children) {
											optionate.push(...item.children)
										}
									})
									let optionParent = this.options.find(item => item[this.optionsId].toString() === elem)
									let childParent = optionate.find(item => item[this.optionsId].toString() === elem)
									const option = optionParent || childParent
									elem = `${elem}#${option[this.additionalSearch]}`
									newVal.push(elem)
								}
							})
							value = newVal
						}
						else {
							value = typeof value === 'string' ? value : value.toString()
							if (!value.includes('#') &&  this.value.length !== 0) {
								const option = this.options.find(item => item[this.optionsId].toString() === value)
								value = `${value}#${option[this.additionalSearch]}`
							}
						}
					}
				}
				return value
			}
		},
		watch: {
			value: {
				handler (newVal, oldVal) {
					if (newVal !== oldVal) {
						this.content = this.valueReplace()
					}
				}
			},
			options: {
				handler (newVal, oldVal) {
					if (newVal !== oldVal) {
						this.content = this.valueReplace()
					}
				}
			}
		}

	}
</script>
<style lang="scss">
	@import "./src/assets/scss/variables";
	.vue-treeselect__portal-target {
		z-index: 1000000001 !important;
	}
	.treeselect-wrap {
		cursor: pointer;
		&.treeselect-hovered {
			.vue-treeselect__control {
				border-color: map-get($colors, light-blue) !important;
			}
		}
		&.treeselect-unselected {
			&.treeselect-hovered {
				.vue-treeselect__control {
					border: none !important;
				}
			}

		}
		&.treeselect-disabled {
			.vue-treeselect__control {
				.vue-treeselect__control-arrow-container {
					display: none;
				}
			}
		}
		.vue-treeselect__menu--transition {
			&-leave-active {
				transition: transform 100ms;
				transform-origin: top center;
			}
			&-enter,
			&-leave-to {
				transform: scaleY(0);
			}
		}
		position: relative;
		.title {
			font-size: 18px;
			color: #003082;
			font-weight: 100;
		}
		i {
			&.lokatie {
				&_R {
					&:before {
						-webkit-mask: url(/static/icon/icoon_lokatie_R.svg) no-repeat 50% 50%;
						mask: url(/static/icon/icoon_lokatie_R.svg) no-repeat 50% 50%;
						-webkit-mask-size: 40px;
						mask-size: 40px;
					}
				}
				&_W {
					&:before {
						-webkit-mask: url(/static/icon/icoon_lokatie_W.svg) no-repeat 50% 50%;
						mask: url(/static/icon/icoon_lokatie_W.svg) no-repeat 50% 50%;
						-webkit-mask-size: 40px;
						mask-size: 40px;
					}
				}
			}
			&.ladder {
				&:before {
					-webkit-mask: url(/static/icon/icoon_ladder.svg) no-repeat 50% 50%;
					mask: url(/static/icon/icoon_ladder.svg) no-repeat 50% 50%;
					-webkit-mask-size: 40px;
					mask-size: 40px;
				}
			}
			&.ladder {
				&:before {
					-webkit-mask: url(/static/icon/icoon_ladder.svg) no-repeat 50% 50%;
					mask: url(/static/icon/icoon_ladder.svg) no-repeat 50% 50%;
					-webkit-mask-size: 40px;
					mask-size: 40px;
				}
			}
			&.info {
				&:before {
					-webkit-mask: url(/static/icon/icoon_info.svg) no-repeat 50% 50%;
					mask: url(/static/icon/icoon_info.svg) no-repeat 50% 50%;
					-webkit-mask-size: 40px;
					mask-size: 40px;
				}
			}
			&.wrench {
				&:before {
					-webkit-mask: url(/static/icon/icoon_wrench.svg) no-repeat 50% 50%;
					mask: url(/static/icon/icoon_wrench.svg) no-repeat 50% 50%;
					-webkit-mask-size: 40px;
					mask-size: 40px;
				}
			}
			&.kalender {
				&:before {
					-webkit-mask: url(/static/icon/icoon_kalender.svg) no-repeat 50% 50%;
					mask: url(/static/icon/icoon_kalender.svg) no-repeat 50% 50%;
					-webkit-mask-size: 40px;
					mask-size: 40px;
				}
			}
			&.drukte {
				&-3 {
					&:before {
						-webkit-mask: url(/static/icon/icoon_drukte-3.svg) no-repeat 50% 50%;
						mask: url(/static/icon/icoon_drukte-3.svg) no-repeat 50% 50%;
						-webkit-mask-size: 40px;
						mask-size: 40px;
					}
				}
			}
			&.kwalificatie {
				&:before {
					-webkit-mask: url(/static/icon/icoon_kwalificatie.svg) no-repeat 50% 50%;
					mask: url(/static/icon/icoon_kwalificatie.svg) no-repeat 50% 50%;
					-webkit-mask-size: 40px;
					mask-size: 40px;
				}
			}
			&:before {
				content: "";
				position: absolute;
				display: block;
				background-color: map-get($colors, light-blue);
				z-index: 1;
				width: 35px;
				height: 40px;
			}
		}
		.prefix {
			display: inline-block;
			position: absolute;
			left: 0;
			top: 17px;
			z-index: 999;
			font-size: 12px;
			color: #C5C5CB;
			+ .vue-treeselect {
				.vue-treeselect__placeholder,
				.vue-treeselect__single-value,
				.vue-treeselect__input-container input{
					text-indent: 50px;
				}
			}
		}
		.vue-treeselect {
			.vue-treeselect__menu {
				z-index: 9999;
			}
			&--multi {
				.vue-treeselect__input {
					padding-bottom: 0 !important;
					padding-top: 0 !important;
				}
			}
			&.treeselect-clearable {
				.vue-treeselect__control-arrow-container{
					padding-left: 70px;
				}
			}
			.vue-treeselect__multi-value {
				display: flex;
			}
			&.treeselect-padding {
				.vue-treeselect__placeholder,
				.vue-treeselect__single-value,
				.vue-treeselect__multi-value-item-container,
				input{
					cursor: pointer;
					padding-left: 25px;
				}
			}
			&.treeselect-alpha {
				.vue-treeselect__control {
					background: none;
				}

			}
			line-height: inherit;
			.vue-treeselect__placeholder,
			.vue-treeselect__single-value,
			input{
				cursor: pointer;
				font-weight: 500;
				line-height: inherit;
				font-size: 12px;
				color: map-get($colors, light-blue);
				padding-left: 0;
				height: inherit;
			}
			.vue-treeselect__control-arrow-container{
				position: relative;
				width: 40px;
				height: 100%;
				svg{
					display: none;
				}
				&:after{
					content: '';
					position: absolute;
					right: 0;
					top: 50%;
					transform: translate(0, -50%) rotate(90deg);
					display: block;
					width: 40px;
					height: 40px;
					background-color: map-get($colors, light-blue);
					-webkit-mask-image: url(/static/icon/icoon_chevron-groot.svg);
					mask-image: url(/static/icon/icoon_chevron-groot.svg);
					-webkit-mask-size: 40px;
					mask-size: 40px;
				}
			}
			.vue-treeselect__control {
				height: inherit;
				border: 1px solid #0079d3;
				box-shadow: none !important;
				border-radius: 10px;
				padding: 0 0 0 25px !important;
			}
			&.treeselect-borderless {
				position: relative;

				.vue-treeselect__control-arrow-container{
					&:after {
						background-color: map-get($colors, default-grey);
					}
					&:hover {
						&:after {
							background-color: map-get($colors, light-blue);
						}
					}
				}
				.vue-treeselect__control {
					padding: 5px 0 !important;
					border-radius: 0;
					border: none;
					border-bottom: 2px solid map-get($colors, default-grey);
				}
			}
			&.treeselect-iconed {
				.vue-treeselect__control {
					padding: 0 !important;
				}
				.vue-treeselect__placeholder,
				.vue-treeselect__single-value,
				input{
					cursor: pointer;
					padding-left: 45px;
				}
			}
			&--disabled {
				.vue-treeselect__control {
					background: #fff;
				}
			}
			&__control {
				padding: 0;
				min-height: inherit;
			}
			&__input-container {
				padding: 0;
				min-height: inherit;
				height: auto;
				input {
					cursor: pointer;
					display: flex;
					box-sizing: border-box;
					min-height: inherit;
				}
			}
		}

		.vue-treeselect__x-container {
			z-index: 1;
			background: none;
			content: none;
			right: 40px;
			top: 50%;
			-webkit-transform: translate(0, -50%);
			transform: translate(0, -50%);
			position: absolute;
			width: 30px;
			height: 30px;
			line-height: normal;
			&:before {
				content: "";
				position: absolute;
				display: block;
				background-color: map-get($colors, default-grey);
				z-index: 1;
				width: 30px;
				height: 30px;
				-webkit-mask: url(/static/icon/icoon_sluiten.svg) no-repeat 50% 50%;
				mask: url(/static/icon/icoon_sluiten.svg) no-repeat 50% 50%;
				-webkit-mask-size: 40px;
				mask-size: 40px;
			}
			&:hover {
				&:before {
					color: map-get($colors, light-blue);
				}
			}
			svg {
				display: none;
			}
		}
		.vue-treeselect__list {
			&-item {
				.vue-treeselect__option {
					line-height: 32px;
					font-size: 12px;
				}
			}
		}
		.vue-treeselect__list-item {
			.vue-treeselect__list {
				.vue-treeselect__option {
					padding-left: 20px !important;
				}
			}
			&.vue-treeselect__indent-level-0 {
				& > .vue-treeselect__list {
					.vue-treeselect__option {
						padding-left: 5px;
					}
				}

			}
		}
		&:hover {
			.treeselect-borderless {
				.vue-treeselect__control {
					border-color: map-get($colors, light-blue) !important;
				}
			}
		}
		&.treeselect {
			&-md {
				.treeselect-border {
					height: 40px;
					min-height: 40px;
					line-height: 40px;
				}
			}
			&-lg {
				.treeselect-border {
					height: 52px;
					min-height: 52px;
					line-height: 52px;
				}
			}
		}
		.vue-treeselect {
			height: inherit;
			&--multi {
				line-height: inherit !important;
				span.vue-treeselect__icon.vue-treeselect__value-remove {
					height: initial;
					line-height: initial;
				}

				span.vue-treeselect__multi-value-label {
					height: auto;
					line-height: initial;
				}

				.vue-treeselect__limit-tip.vue-treeselect-helper-zoom-effect-off {
					line-height: initial;
					height: initial;
					min-height: initial;
				}

				.vue-treeselect__input-container.vue-treeselect__multi-value-item--transition-enter-to {
					line-height: initial;
					height: initial;
					min-height: initial;
				}
				.vue-treeselect__placeholder {
					position: relative;
				}
				.vue-treeselect__multi-value-item-container {
					height: initial;
					//line-height: initial;
				}
			}
		}
		&.danger {
			.vue-treeselect__control {
				border-color: #dc0000 !important;
				&:hover {
					border-color: #dc0000 !important;
				}
				* {
					color: #dc0000;
				}
			}
		}
	}
	.schedule-filter-item {
		.treeselect-wrap {
			.vue-treeselect{
				.vue-treeselect__control {
					padding-top: 6px !important;
					padding-bottom: 4px !important;
					.vue-treeselect__input-container input, .vue-treeselect__single-value {
						font-size: 13px;
						padding-left: 20px;
					}
					.vue-treeselect__placeholder {
						font-size: 13px;
						color: #C5C5CB;
						padding-left: 20px;
					}
					.vue-treeselect__control-arrow-container {
						&:after {
							width: 30px;
							height: 30px;
							-webkit-mask-size: 30px;
							mask-size: 30px;
							right: 5px;
						}
					}
				}
			}
		}
		&:hover, &.active {
			.vue-treeselect__placeholder {
				color:#0079D3 !important;
			}
		}
	}
</style>

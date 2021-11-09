<template>
    <div
		class="input-wrapper"
		:style="{'width': `${width}px` || 'auto'}"
		:class="[
			{'wrapper-borderless': borderless},
			{'wrapper-paddingless': paddingless},
			{'wrapper-nopadding': nopadding},
			{'wrapper-searchable': searchable},
			{'wrapper-iconed': icon},
			radius ? `radius-${radius}`: ''
			]"
	>
        <div class="title" v-if="title">
            {{title}}
        </div>
        <div class="input-content-wrapper" :class="[`wrapper-${size}`, `icon-${icon}`]">
            <div class="input-container">
				<input
					:style="{'width': minValue && value || maxValue && value ?  ((value.toString().length + 1 ) * 6) + 'px' : '100%'} "
					:type="password ? 'password' : number ? 'number' : 'text'"
					:min="minValue"
					:placeholder="placeholder"
					:value="content"
					@input="updateValue"
                    @focus="$event.target.select()"
					:class="[{'input-number': number}]"
					:disabled="disabled"
                    ref="inputField"
                    :minlength="minCharacters"
				>
				<span class="suffix" v-if="suffix && value">{{suffix}}</span>
			</div>
			<div class="input-buttons">
				<div class="buttons-number"  v-if="number && !disabled">
					<button  class="custom-button button-left" @click="valueMinusStep"/>
					<button  class="custom-button button-right" @click="valuePlusStep"/>
				</div>
				<i class="search" v-if="searchable"/>
				<button  class="custom-button" @click="deleteValue" v-if="clearable && !disabled"/>
				<span class="input-description" v-if="description">{{description}}</span>
			</div>
        </div>
    </div>
</template>

<script>
    export default {
        props: {
            value: {
                type: String,
                default: null
            },
			radius: {
                type: String,
                default: null
            },
			suffix: {
                type: String,
                default: null
            },
            size: {
                type: String,
                default: 'md'
            },
			width: {
                type: String,
                default: null
            },
            placeholder: {
                type: String
            },
            title: {
                type: String
            },
			description: {
                type: String
            },
			icon: {
                type: String
            },
            borderless: {
                type: Boolean,
                default: true
            },
            paddingless: {
                type: Boolean,
                default: false
            },
			nopadding: {
                type: Boolean,
                default: false
            },
            searchable: {
                type: Boolean,
                default: false
            },
            clearable: {
                type: Boolean,
                default: true
            },
			disabled: {
                type: Boolean,
                default: false
            },
            password: {
                type: Boolean,
                default: false
            },
			number: {
                type: Boolean,
                default: false
            },
			step: {
                type: Number,
                default: 1
            },
			minValue: {
                type: Number
            },
			maxValue: {
                type: Number
            },
            minCharacters: {
                type: Number
            }
        },
        data () {
            return {
                content: this.value
            }
        },
        mounted () {
            this.content = this.value
        },
		computed: {
			numberWidth () {
				return this.value.length + 1
			}
		},
        methods: {
            updateValue (e) {
				let val = e.target.value
				if (this.number) {
					val = +val
					if (this.maxValue) {
						val = +this.maxValue < val ? +this.maxValue : val
					}
					if (this.minValue) {
						val = +this.minValue > val ? +this.minValue : val
					}
				}
				this.content = e.target.value = +val
                this.$emit('input', val)
            },
            deleteValue () {
                this.$emit('input', null)
            },
			valuePlusStep () {
                this.$emit('input', +this.content > +this.maxValue || +this.content + this.step > +this.maxValue ? +this.maxValue : +this.content + this.step)
            },
			valueMinusStep () {
				this.$emit('input', +this.content < +this.minValue || +this.content - this.step < +this.minValue ? +this.minValue : +this.content - this.step)
            }
        },
        watch: {
            value: {
                handler	(newVal, oldVal) {
                    if (this.value !== this.content) {
                        this.content = this.value
                    }
                }
            }
        }
    }
</script>

<style lang="scss" scoped>
    @import "../assets/scss/variables";
    .input-wrapper {
        padding: 5px 20px;
        border: 1px solid map-get($colors, default-grey);
        &.wrapper-borderless {
            border: none;
            border-bottom: 2px solid map-get($colors, default-grey);
        }
        &.wrapper-paddingless {
            padding: 6px 0;
        }
        &.wrapper-nopadding {
            padding: 0;
        }
        &.wrapper-searchable {
            border-color: map-get($colors, light-blue);
            input {
                font-size: 12px !important;
                color: map-get($colors, dark-grey) !important;
            }
        }
		&.radius {
			&-sm {
				border-radius: 10px;
			}
		}
		&.wrapper-iconed {
			.input-content-wrapper {
				&.icon-klok {
					&:before {
						-webkit-mask: url(/static/icon/icoon_klok.svg) no-repeat 50% 50%;
						mask: url(/static/icon/icoon_klok.svg) no-repeat 50% 50%;
					}
				}
				&.icon-lokatie {
					&:before {
						-webkit-mask: url(/static/icon/icoon_lokatie.svg) no-repeat 50% 50%;
						mask: url(/static/icon/icoon_lokatie.svg) no-repeat 50% 50%;
					}
				}
				&.icon-ladder {
					&:before {
						-webkit-mask: url(/static/icon/icoon_ladder.svg) no-repeat 50% 50%;
						mask: url(/static/icon/icoon_ladder.svg) no-repeat 50% 50%;
					}
				}
				&.icon-kwalificatie {
					&:before {
						-webkit-mask: url(/static/icon/icoon_kwalificatie.svg) no-repeat 50% 50%;
						mask: url(/static/icon/icoon_kwalificatie.svg) no-repeat 50% 50%;
					}
				}
				&.icon-ankomst {
					&:before {
						-webkit-mask: url(/static/icon/icoon_ankomst.svg) no-repeat 50% 50%;
						mask: url(/static/icon/icoon_ankomst.svg) no-repeat 50% 50%;
						-webkit-mask-size: 40px;
						mask-size: 40px;
					}
				}
				&.icon-vertrek {
					&:before {
						-webkit-mask: url(/static/icon/icoon_vertrek.svg) no-repeat 50% 50%;
						mask: url(/static/icon/icoon_vertrek.svg) no-repeat 50% 50%;
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
					-webkit-mask-size: 40px;
					mask-size: 40px;
				}
				input {
					padding-left: 45px;
				}
			}
		}
        .title {
            font-size: 18px;
            color: #003082;
            font-weight: 100;
        }
		&.small-title {
			.title {
				font-size: 13px !important;
				color: #000 !important;
				font-weight: 500 !important;
			}
		}
        .input-content-wrapper {
            display: flex;
            justify-content: space-between;
            box-sizing: content-box;
            align-items: center;
			.input-container {
				width: 100%;
			}
            &.wrapper {
                &-md {
                    height: 40px;
                }
                &-sm {
                    height: 30px;
                }
            }
			.input-buttons {
				display: flex;
				.buttons-number {
					display: flex;
					button {
						width: 30px;
						&:before {
							content: "";
							content: "";
							display: block;
							background-color: map-get($colors, default-grey);
							z-index: 1;
							width: 15px;
							height: 25px;
							-webkit-mask: url(/static/icon/icoon_chevron-groot.svg) no-repeat 50% 50%;
							mask: url(/static/icon/icoon_chevron-groot.svg) no-repeat 50% 50%;
							-webkit-mask-size: 40px;
							mask-size: 40px;
						}
						&:hover {
							&:before {
								background-color: map-get($colors, light-blue);
							}
						}
						&.button-left {
							&:before {
								transform: rotate(180deg);
							}
						}
						&.button-right {
							&:before {

							}
						}
					}
				}
			}
			.input-description {
				margin-left: 20px;
			}
            input {
                width: 100%;
                font-size: 12px;
                border: none;
                color: map-get($colors, light-blue);
				background: none;
                &:focus {
                    border: none;
                    outline: none;
                    &::-webkit-input-placeholder {
                        opacity: 0;
                    }
                }
                &::-webkit-input-placeholder {
                    color: inherit;
                }
				&.input-number {
					box-sizing: content-box;
					-webkit-appearance: textfield;
					-moz-appearance: textfield;
					appearance: textfield;
					&::-webkit-outer-spin-button,
					&::-webkit-inner-spin-button {
						display: none;
					}
				}
				&.input-iconed {
					position: relative;
				}
            }
			.suffix {
				font-size: 12px;
				color: map-get($colors, light-blue);
				font-weight: 500;
			}
            .custom-button {
                background: none;
                width: 40px;
                display: flex;
                justify-content: center;
                border: none;
                &:hover {
                    &:before {
                        background-color: map-get($colors, light-blue);
                    }
                }
                &:before {
                    content: "";
                    display: block;
                    background-color: map-get($colors, default-grey);
                    z-index: 1;
                    width: 25px;
                    height: 25px;
                    -webkit-mask: url(/static/icon/icoon_sluiten.svg) no-repeat 50% 50%;
                    mask: url(/static/icon/icoon_sluiten.svg) no-repeat 50% 50%;
                    -webkit-mask-size: 40px;
                    mask-size: 40px;
                }
                span {
                    display: none;
                }
            }
            i {
                &.search {
                    &:before {
                      content: "";
                      display: block;
                      background-color: map-get($colors, light-blue);
                      z-index: 1;
                      width: 25px;
                      height: 25px;
                      -webkit-mask: url(/static/icon/icoon_zoeken.svg) no-repeat 50% 50%;
                      mask: url(/static/icon/icoon_zoeken.svg) no-repeat 50% 50%;
                      -webkit-mask-size: 40px;
                      mask-size: 40px;
                    }
                }
            }
        }
        &.danger {
            border-color: map-get($colors, default-red);
            input {
                color: map-get($colors, default-red);
            }
            &:hover {
                border-color: map-get($colors, default-red) !important;
            }
        }
        &:hover {
            border-color: map-get($colors, light-blue);
        }
    }

</style>

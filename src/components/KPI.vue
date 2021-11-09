
<template>
    <div class="kpi-container">
        <div class="kpi">
            <div class="kpi-left">
                {{this.shortNameByNameLowerCase[this.kpi.name.toLowerCase()]}}
            </div><div class="kpi-right">
                {{kpi.stellenWithdrawnToday}}
            </div>

            <div class="kpi-menu">
                <div class="kpi-menu-item">
                    {{kpi.name}}

                    <div class="kpi-menu-item-right">
                        {{kpi.stellenWithdrawnToday}}
                    </div>
                </div><div class="kpi-menu-item" @click="setKlantBehoefte(material.seriesCode, material.isKlantBehoefte === 1 ? 0 : 1, material)" v-for="(material, materialIndex) in this.kpi.materials || []" :key="materialIndex" :class="{
                        'selected': material.isKlantBehoefte === 1
                    }">
                    {{material.seriesCode}}

                    <div class="kpi-menu-item-right">
                        {{material.stellenWithdrawnToday}}
                    </div>
                </div>
            </div>
            <div class="kpi-menu-bottom"></div>
            <div class="kpi-menu-caret-container">
                <div class="kpi-menu-caret"></div>
                <div class="kpi-menu-caret-shadow-hider"></div>
            </div>
        </div>
    </div>
</template>

<script>
import $loader from '@/modules/loader-module'
export default {
    props: ['kpi'],

    data: function () {
        return {
            shortNameByNameLowerCase: {
                'sprinter': 'SPR',
                'intercity': 'IC',
                'international': 'INT'
            }
        }
    },

    methods: {
        /**
         * Sets the klant behoefte
         * @param {string} seriesCode the series code
         * @param {number} isKlantBehoefte the new value of isKlantBehoefte
         * @param {object} material the material object
         */
        setKlantBehoefte (seriesCode, isKlantBehoefte, material) {
            $loader.message = 'Klant behoefte aanpassen'
            this._api.setKlantBehoefte(seriesCode, isKlantBehoefte).then(res => {
                $loader.message = null
                material.isKlantBehoefte = isKlantBehoefte
            }).catch(response => {
                $loader.message = null
            })
        }
    }
}
</script>
<style lang="scss" scoped>
.kpi-container {
	padding-top: 37.5px;
	display: inline-block;
	vertical-align: top;

	.kpi {
		height: 50px;
		background: #FFC917;
		font-family: 'Open Sans', sans-serif;
		font-size: 1.3em;
		color: #3A3B3C;
		font-weight: bold;
		border-radius: 10px;
		position: relative;
		user-select: none;
		-o-user-select: none;
		-moz-user-select: none;
		-webkit-user-select: none;

		>.kpi-left, >.kpi-right {
			display: inline-block;
			vertical-align: top;
			width: 60px;
			text-align: center;
			line-height: 50px;
		}

		>.kpi-left {
			text-align: left;
			padding-left: 20px;
			padding-right: 3px;
		}

		>.kpi-right {
			color: #003082;
			text-align: right;
			padding-right: 20px;
		}

		>.kpi-menu-caret-container {
			position: absolute;
			width: 30px;
			height: 30px;
			left: 50%;
			top: -25px;
			transform: translate(-50%, 0);
			-o-transform: translate(-50%, 0);
			-webkit-transform: translate(-50%, 0);
			-moz-transform: translate(-50%, 0);

			>.kpi-menu-caret {
				position: absolute;
				background: white;
				width: 100%;
				height: 100%;
				transform: rotate(45deg);
				box-shadow: 1px 1px 2px #AAAAAA;
				-o-box-shadow: 1px 1px 2px #AAAAAA;
				-moz-box-shadow: 1px 1px 2px #AAAAAA;
				-webkit-box-shadow: 1px 1px 2px #AAAAAA;
			}
			>.kpi-menu-caret-shadow-hider {
				position: absolute;
				z-index: 100;
				background: white;
				width: 30px;
				height: 30px;
				bottom: 2px;
				transform: rotate(45deg)
			}
			&:hover {
				cursor: default;
			}
		}

		>.kpi-menu-bottom {
			position: absolute;
			background: white;
			width: 188px;
			top: -10px;
			left: -34px;
			transform: translate(0, -100%);
			-o-transform: translate(0, -100%);
			-webkit-transform: translate(0, -100%);
			-moz-transform: translate(0, -100%);
			box-shadow: 1px 1px 2px #AAAAAA;
			-o-box-shadow: 1px 1px 2px #AAAAAA;
			-moz-box-shadow: 1px 1px 2px #AAAAAA;
			-webkit-box-shadow: 1px 1px 2px #AAAAAA;

			&:hover {
				cursor: default;
			}
		}

		>.kpi-menu {
			position: absolute;
			background: white;
			width: 188px;
			top: -10px;
			left: -34px;
			transform: translate(0, -100%);
			-o-transform: translate(0, -100%);
			-webkit-transform: translate(0, -100%);
			-moz-transform: translate(0, -100%);
			box-shadow: 1px 1px 2px #AAAAAA;
			-o-box-shadow: 1px 1px 2px #AAAAAA;
			-moz-box-shadow: 1px 1px 2px #AAAAAA;
			-webkit-box-shadow: 1px 1px 2px #AAAAAA;

			>.kpi-menu-item {
				position: relative;
				padding: 20px;
				padding-right: 60px;
				padding-top: 7px;
				font-size: 0.9em;
				color: #3A3B3C;
				font-weight: normal;

				>.kpi-menu-item-right {
					position: absolute;
					top: 7px;
					left: 134px;
					color: #003082;
					text-decoration: none;
				}

				&.selected {
					text-decoration: underline;
				}

				&:first-child {
					font-weight: bold;
					padding-top: 20px;

					>.kpi-menu-item-right {
						top: 20px;
					}
				}

				&:last-child {
					margin-bottom: 5px;
				}

				&:hover:not(:first-child) {
					cursor: pointer;
					text-decoration: underline;
				}
			}

			&:hover {
				cursor: default;
			}
		}
	}

	&:hover {
		>.kpi {
			cursor: pointer;
			background: darken(rgb(255, 201, 23), 5%);
		}
	}

	&:not(:hover) {
		>.kpi {
			>.kpi-menu-caret-container, >.kpi-menu-bottom, >.kpi-menu {
				display: none;
			}
		}
	}

	&:not(:first-child) {
		margin-left: 20px;
	}
}
</style>

<script>
export default {
	props: ['title', 'value', 'noPadding', 'canClose', 'show', 'scrollable'],

	mounted: function () {
		document.addEventListener('keyup', this.onKeyUp)
	},

	beforeDestroy: function () {
		document.removeEventListener('keyup', this.onKeyUp)
	},

	methods: {
		/**
		 * On key up
		 * @param {Event} event the keyup event arguments
		 */
		onKeyUp (event) {
			if (event.keyCode !== 27 || !this.value) {
				return
			}
			this.closeModal()
		},

		/**
		 * Closes the modal
		 */
		closeModal () {
			this.$emit('input', false)
			this.$emit('closeModal');
		}
	}
}
</script>

<template>
    <div class="overlay" :class="{'show': value || show, 'no-padding': noPadding}">
        <div class="modal" :class="{'show': value || show, 'scrollable': scrollable}">
            <div class="modal-close" @click="closeModal()" v-if="canClose !== false">
                <icon name="sluiten" :size="40" :colors="{'default': '#0079D3', 'hover': '#003082'}"/>
            </div>
            <div class="modal-title" v-if="title">
                {{title}}
            </div>
            <div class="modal-content">
                <slot name="content" />
            </div>
            <div class="modal-buttons">
                <slot name="buttons" />
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.overlay {
	position: fixed;
	top: 0;
	left: 0;
	width: 100vw;
	height: 100vh;
	z-index: 1000000001;
	background: rgba(58, 59, 60, 0.5);
	transition: all 0.3s ease;

	.modal {
		background: white;
		width: 500px;
		box-sizing: border-box;
		padding: 30px;
		position: absolute;

		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		-o-transform: translate(-50%, -50%);
		-moz-transform: translate(-50%, -50%);

		transition: all 0.3s ease;
		max-height: 98vh;
		&.scrollable{
			overflow: auto;
		}
		.modal-close {
			position: absolute;
			top: 10px;
			right: 10px;

			&:hover {
				cursor: pointer;
			}
		}

		.modal-title {
			color: #003082;
			font-family: 'Open Sans';
			font-weight: 100;
			font-size: 22px;
		}

		.modal-content {
			margin-top: 10px;

			font-size: 18px;
			color: #003082;
			font-weight: 100;
			font-family: 'Open Sans';

			.modal-scroll-content {
				max-height: 50vh;
				overflow: auto;
			}

			p {
				&:not(:first-child) {
					margin-top: 5px;
				}
			}

			.shift-details {
				width: 100%;
				margin-top: 15px;
				>.left, >.right {
					display: inline-block;
					vertical-align: top;
					font-size: 14px;
				}
				>.left {
					width: 80px;
					color: #707070;
				}
				>.right {
					position: absolute;
					color: #0079D3;
				}
			}

			.content-left {
				width: 50px;
				position: absolute;
			}

			.content-right {
				margin-left: 50px;
				font-size: 18px;
				color: #003082;
				font-weight: 100;
				font-family: 'Open Sans';

				p {
					&:not(:first-child) {
						margin-top: 5px;
					}
				}
			}

			.item {
				margin-top: 15px;

				.col {
					display: inline-block;
					vertical-align: top;
					font-size: 14px;
					color: #707070;

					&:not(:first-child) {
						margin-left: 20px;
					}

					&.icon {
						&:hover {
							cursor: pointer;
						}
					}
				}

				&:first-child {
					margin-top: 25px;
				}
			}
			label{
				display: inline-block;
				width: 100%;
				margin-top: 10px;
			}
		}

		.modal-buttons {
			margin-top: 15px;
			float: left;
			clear: both;
			width: 100%;
			.button {
				background: #FF7800;
				border: 0;
				border-bottom: 2px solid #8B4404;
				color: white;
				padding: 12px 20px;
				font-size: 16px;
				font-family: 'Open Sans';
				width: auto;
				display: inline-block;

				&.right {
					float: right;
					margin-left: 20px;
				}

				&.orange {
					padding: 5px 20px;
				}

				&.blue {
					background: rgb(0, 121, 211);
					border-bottom: 2px solid rgb(0, 48, 130);

					&:hover {
						background: lighten(rgb(0, 121, 211), 20%);
						border-bottom: 2px solid lighten(rgb(0, 48, 130), 20%);
					}
				}

				&.red {
					background: rgb(220, 0, 0);
					border-bottom: 2px solid rgb(129, 12, 12);

					&:hover {
						background: lighten(rgb(220, 0, 0), 20%);
						border-bottom: 2px solid lighten(rgb(129, 12, 12), 20%);
					}
				}

				&:hover {
					cursor: pointer;
					background: darken(rgb(255, 120, 0), 20%);
				}
			}

			.delete {
				height: 49px;

				.icon-container, .label {
					vertical-align: top;
					display: inline-block;
				}

				.icon-container {
					margin-top: 9.5px;
					position: relative;
					width: 30px;
					height: 30px;
					transform: rotate(-45deg);
					-o-transform: rotate(-45deg);
					-moz-transform: rotate(-45deg);
					-webkit-transform: rotate(-45deg);
				}

				.label {
					line-height: 49px;
					margin-left: 5px;
					color: #dc0000;
				}

				&:hover {
					.label {
						color: lighten(rgb(220, 0, 0), 20%);
						text-decoration: underline;
						cursor: pointer;
					}
				}
			}
		}

		&:not(.show) {
			top: -50%;
		}
	}

	&:not(.show) {
		background: rgba(0, 0, 0, 0);
		z-index: -10000;

		top: -150vh;
	}

	&.no-padding {
		.modal {
			.modal-content {
				width: 100%;
			}
		}
	}
}
</style>

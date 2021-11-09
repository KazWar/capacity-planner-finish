<template>
	<div class="status" :class="`status-${dotStatus} status-${size}`">
		<span v-for="n in 3" :key="n"></span>
	</div>
</template>
<script>
	export default {
		props: {
			status: {
				type: String
			},
			size: {
				type: String,
				default: 'md'
			}
		},
		computed: {
			dotStatus () {
				switch (this.status) {
					case 'Niet Inzetbaar':
						return 'red'
					case 'Onder Bewaking':
						return 'purple'
					case 'Inzetbaar':
						return 'green'
					default:
						return ''
				}
			}
		}
	}
</script>

<style lang="scss" scoped>
.status{
	width: 39px;
	display: flex;
	span{
		border-radius: 50%;
		background-color: #e6e6e9!important;
		position: relative;
		top: calc(50% - 4px);
	}
	&-red {
		span:nth-child(1) {
			background-color: #d20000!important;
		}
	}
	&-purple {
		span:nth-child(2) {
			background-color: #704084!important;
		}
	}
	&-green {
		span:nth-child(3) {
			background-color: #0B9126!important;
		}
	}
	&-md {
		span{
			width: 8px!important;
			height: 8px!important;
			margin-right: 5px;
		}
	}
	&-lg {
		span{
			margin-right: 2px;
			width: 10px!important;
			height: 10px!important;
		}
	}
}
</style>

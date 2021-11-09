<script>
export default {
	name: 'inputTooltipRight',
	props: {
		icon:{
			type:String,
			required:false
		},
		text:{
			type:String,
			required:true
		}
	}
}
</script>

<template>
	<v-tooltip bottom>
		<template v-slot:activator="{ on }">
			<v-icon v-on="on">
				{{ icon ? icon : "mdi-information-outline" }}
			</v-icon>
		</template>
		{{ text }}
	</v-tooltip>
</template>

<style scoped>

</style>

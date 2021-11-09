<script>
export default {
	name: 'localeChanger',
	data () {
		return {
			languages: ['nl', 'en']
		}
	}
}
</script>

<template>
	<div class="locale-changer">
		<select v-model="$i18n.locale">
			<option v-for="(language, i) in languages" :key="`Language${i}`" :value="language">
				{{ language }}
			</option>
		</select>
	</div>
</template>

<style lang="scss" scoped>

</style>

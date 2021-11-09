<script>
	import CompaniesTable from './components/companies-table.vue'

	// JSON schema mapping?
	import companies from './components/companies.json'

	export default {
		name: 'CompanyList',
		data () {
			return {
				companies: companies
			}
		},
		components: { CompaniesTable }
	}
</script>

<template>
	<div class="table">
		<companies-table
			:data="companies"
		></companies-table>
	</div>
</template>

<style lang="scss" scoped>

</style>

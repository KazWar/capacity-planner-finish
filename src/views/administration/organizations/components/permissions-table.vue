<script>
export default {
	name: 'PermissionsTable',
	props:['permissions']
}
</script>

<template>
	<v-simple-table>
		<template v-slot:default>
			<tbody>
			<tr
				v-for="perm in permissions"
				:key="item"
			>
				<td>{{ perm }}</td>
			</tr>
			</tbody>
		</template>
	</v-simple-table>
</template>

<style scoped>

</style>

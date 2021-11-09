<script>
import InputTooltipRight from '@/common/components/input-tooltip-right.vue'

export default {
	name: 'ProfileTabDetails',
	components: { InputTooltipRight },
	props: {
		details:{
			required:true
		}
	},
	data () {
		return {
			defaultSelected: {
				name: 'Administrator',
				icon: 'mdi-account-tie',
				color: '#48C9B0',
			},
			items: [
				{
					name: 'Administrator',
					icon: 'mdi-account-tie',
					color: '#48C9B0',
				},
				{
					name: 'Regular User',
					icon: 'mdi-account',
					color: '#F0B27A',
				},
				{
					name: 'Guest User',
					icon: 'mdi-briefcase-account',
					color: '#C39BD3',
				}
			]
		}
	},
  methods: {
    save () {
      //this.$emit()
    }
  },
  created () {
    //this.profile = clone(this.details)
  }
}
</script>

<template>
	<v-container style="margin: 0">
		<v-row style="margin: 0">
			<v-col cols="2">
				<v-subheader class="user-label">
					Name
				</v-subheader>
			</v-col>
			<v-col cols="4">
				<v-text-field
					filled
					dense
					:value="$route.params.id"
					hide-details="true"
				>
				</v-text-field>
			</v-col>
			<v-col cols="1" align-self="center" class="user-tooltip">
				<input-tooltip-right
					text="User e-mail will be used to log into the application.">
				</input-tooltip-right>
			</v-col>
		</v-row>

		<v-row style="margin: 0">
			<v-col cols="2">
				<v-subheader class="user-label">
					Description
				</v-subheader>
			</v-col>
			<v-col cols="4">
				<v-text-field
					filled
					dense
					hide-details="true"
				>
				</v-text-field>
			</v-col>
			<v-col cols="1" align-self="center" class="user-tooltip">
				<input-tooltip-right
					text="Detailed description of the account.">
				</input-tooltip-right>
			</v-col>
		</v-row>

		<v-row style="margin: 0">
			<v-col cols="2">
				<v-subheader class="user-label">
					Parent
				</v-subheader>
			</v-col>
			<v-col cols="4">
				<v-select
					filled
					dense
					hide-details="true"
					:items="items"
					v-model="defaultSelected"
					:menu-props="{ bottom: true, offsetY: true }"
				>

					<template v-slot:selection = {item}>
						<v-icon :color="item.color">
							{{item.icon}}
						</v-icon>
						<v-card-text class="font-weight-bold">
							{{ item.name }}
						</v-card-text>
					</template>

					<template v-slot:item = {item}>
						<v-icon :color="item.color">
							{{item.icon}}
						</v-icon>
						<v-card-text class="font-weight-bold">
							{{ item.name }}
						</v-card-text>
					</template>
				</v-select>
			</v-col>
			<v-col cols="1" align-self="center" class="user-tooltip">
				<input-tooltip-right
					text="Level determines which permissions the user has access to.">
				</input-tooltip-right>
			</v-col>
		</v-row>

		<v-row style="margin: 0">
			<v-col cols="2">
				<v-subheader class="user-label">
					Created at
				</v-subheader>
			</v-col>
			<v-col cols="4">
				<v-text-field
					filled
					readonly
					disabled
					dense
					hide-details="true"
					value="12-12-2020 12:00:00"
				></v-text-field>
			</v-col>
		</v-row>

		<v-row style="margin: 0">
			<v-col cols="2">
				<v-subheader class="user-label">
					Last updated by
				</v-subheader>
			</v-col>
			<v-col cols="4">
				<v-text-field
					filled
					readonly
					disabled
					dense
					hide-details="true"
					value="OXplus admin at 12-12-2021 12:00:00"
				></v-text-field>
			</v-col>
		</v-row>
	</v-container>
</template>

<style lang="scss" scoped>

.user-label{
	font-size: small;
	font-family:"Verdana", sans-serif
}

.user-tooltip{
	padding: 0;
}
</style>

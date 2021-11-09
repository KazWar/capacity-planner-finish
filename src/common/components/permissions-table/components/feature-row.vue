<script>
	export default {
		name: 'FeatureRow',
		props:['feature','depth'],

		data () {
			return {
				showChildren: false
			}
		},

		methods:{
			toggleChildren() {
				this.showChildren = !this.showChildren;
			}
		},

		computed: {
			// Programmatic CSS indentation for feature levels.
			// Possibly warps the table layout after 6-7 levels deep?
			indent() {
				return {
					transform: `translate(${this.depth * 30}px)`
				}
			}
		}
	}
</script>

<template>
	<div v-frag>
		<tr>
			<td style="border: 1px solid lightgrey">
				<v-card-title class="feature-title" :style="indent">
					{{ feature.name }}
					<v-icon
						:class="showChildren ? 'icon-expand-active' : ''"
						v-if="feature.features.length > 0"
						@click="toggleChildren">
						mdi-chevron-right
					</v-icon>
				</v-card-title>
				<v-card-subtitle class="feature-text" :style="indent">
					{{ feature.description }}
				</v-card-subtitle>
			</td>

			<td style="border: 1px solid lightgrey">
				<v-simple-checkbox
					color="success"
					:value="feature.enabled"
					v-model="feature.enabled"
				/>
			</td>

			<td style="border: 1px solid lightgrey">
				<v-container>
					<v-simple-checkbox
						color="success"
						v-model="feature.default"
					/>
				</v-container>
			</td>
		</tr>

		<feature-row
			v-if="showChildren"
			v-for="feature in feature.features"
			:feature="feature"
			:depth="depth + 1"
			:key="feature.name"
		/>
	</div>
</template>

<style lang="scss" scoped>

.v-simple-checkbox{
	margin: 0 auto;
}

.icon-expand-active{
	transform: rotate(90deg);
}

.feature-title{
	padding-top: 5px;
}

.feature-text{
	padding-bottom: 5px;
}

// Larger checkbox size
.v-simple-checkbox{
	width: max-content;
   	transform: scale(1.3);
}

</style>

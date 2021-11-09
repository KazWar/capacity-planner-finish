<script>

export default {
	name: 'Administration',
	data () {
		return {
		}
	},
	methods:{
		navigate(route){
			this.$router.push({ name: route , append:true})
		}
	}
}
</script>

<template>
	<v-item-group>
		<v-container fluid class="administration-container">
			<v-row>
				<v-col
					class="administration-column"
					md="2"
					v-for="card of $t('administration.cards')"
					:key="card"
				>
					<v-item>
						<v-card
							class="administration-card"
							elevation="1"
							outlined
							tile
							height="140"
							@click="navigate(card.name)"
							hover="true"
						>
							<v-card-title>
								<v-icon large>
									{{ card.icon }}
								</v-icon>
								<span class="card-title">
									{{ card.title }}
								</span>
							</v-card-title>

							<v-card-text class="card-text">
								{{ card.text }}
							</v-card-text>
						</v-card>
					</v-item>
				</v-col>
			</v-row>
		</v-container>
	</v-item-group>
</template>

<style lang="scss" scoped>
.administration-container{
	margin-left: 125px;
	margin-right: 0;
}

.administration-column{
	:hover{
		background-color: #e7f9ef;
		transition: background-color .5s;
	}
}

// Extract font family to global style sheet
.administration-card{
	background-color: whitesmoke;
	border: lightgrey;

	.card-title{
		font-family: "Helvetica", sans-serif;
		font-size: larger;
		padding-left: 5px;
	}

	.card-text{
		font-family: "Helvetica", sans-serif;
		font-size: medium;
	}
}

</style>

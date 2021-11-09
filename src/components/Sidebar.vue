<script>
	// TODO router-link functional
	export default {
		props: {
			items: {
				type: Array,
				default: () => []
			},
			tabs: {
				type: Boolean,
				default: false
			},
			selectedTab: {
				type: String,
				default: ''
			},
		},
		data() {
			return {
				sideBarItems: _.cloneDeep(this.items),
				selectedChild: null
			}
		},
		computed: {
			updatedSideBarItems () {
				return this.sideBarItems
			}
		},
		mounted () {
			this.$root.$on('setSideBarChildrens', this.setSideBarChildrens)
			this.$root.$on('selectChild', this.setSelectedChild)
		},
		methods: {
			tabAction (item) {
				if (item.action) {
					this.$emit(item.action, {})
				}
				if (item.link) {
					return
				}
				else {
					this.$emit('selectTab', item.id)
				}
			},
			setSelectedChild (e) {
				this.selectedChild = e.child
			},
			selectChild (parent, child) {
				this.selectedChild = child
				this.$root.$emit('selectChild', {parent, child})
			},
			setSideBarChildrens (e) {
				const newItems = _.cloneDeep(this.sideBarItems)
				newItems.forEach(item => {
					if (item.title === e.title) {
						item.children = e.data
					}
				})
				this.sideBarItems = newItems
			}
		}
	}
</script>

<template>
	<ul class="sidebar">
		<li v-for="(item, index) in updatedSideBarItems" class="sidebar-item" :class="[item.color ? `color-${item.color}` : '']">
			<div
				:class="[
					selectedTab && selectedTab === item.id ? 'selected' : '',
					{'parent': !_.isEmpty(item.children) && selectedTab === item.id},
					item.icon ? `icon icon-${item.icon}`: ''
				]"
				class="sidebar-item-header"
			>
				<router-link
					class="sidebar-link"
					:to="item.link"
					v-if="item.link"
				>
					{{item.title}}
				</router-link>
				<span class="sidebar-link" @click="tabAction(item)" v-else>
					{{item.title}}
				</span>
				<div v-if="!_.isEmpty(item.children)">
					<div v-for="child in item.children" :key="child.title" class="sidebar-child" @click="selectChild(item.title, child.title)" :class="{'selected': selectedChild === child.title}">
						{{child.title}}
						<span v-if="child.count" style="opacity: 0.5">({{child.count}})</span>
					</div>
				</div>
			</div>
		</li>
	</ul>
</template>

<style lang="scss" scoped>
	@import "../assets/scss/variables";
	@import "../assets/scss/mixins";
	.sidebar {
		padding: 20px;
		background: #fff;
		color: #0079D3;
		&-item {
			&:not(:first-child) {
				margin-top: 20px;
			}
			cursor: pointer;
			&:hover {
				font-weight: 600;
			}
			.sidebar-link {
				width: 100%;
				display: flex;
				color: inherit;
				padding-left: 40px;
				text-decoration: none;
				&:hover, &:active {
					color: inherit;
				}
			}
			&-header {
				position: relative;
				&.selected {
					font-weight: 600;
				}
				.router-link-active {
					font-weight: 600;
				}
				&:before {
					content: '';
					display: block;
					width: 20px;
					height: 20px;
					position: absolute;
					left: 0;
				}
				&:after {
					content: '';
					display: block;
					position: absolute;
					transition: all 0.3s ease;
					right: 0;
					top: 0;
					width: 20px;
					height: 20px;
					background-color: map-get($colors, light-blue);
					transform: rotate(-90deg);
					@include icon-mask('chevron-neerwaarts', 40px, -10px)
				}
				&.parent {
					&:after {
						transform: rotate(0deg);
					}
				}
				&.icon {
					&:before {
						background-color: map-get($colors, light-blue);
						z-index: 1;
					}
				}
				&.icon-gebruiker {
					@include before-icon-mask('gebruiker', 30px)
				}
				&.icon-mail {
					@include before-icon-mask('mail', 30px)
				}
				&.icon-lokatie {
					@include before-icon-mask('lokatie', 30px)
				}
				&.icon-klok {
					@include before-icon-mask('klok', 30px)
				}
				&.icon-percentage {
					@include before-icon-mask('percentage', 30px)
				}
				&.icon-document {
					@include before-icon-mask('document', 30px)
				}
				&.icon-sluiten {
					@include before-icon-mask('sluiten', 30px)
				}
				&.icon-ladder {
					@include before-icon-mask('ladder', 30px)
				}
			}
			&.color {
				&-red {
					color: #DC0000;
					.sidebar-item-header {
						&:before, &:after {
							display: none;
						}
					}
				}
			}
		}
		&-child {
			padding-left: 40px;
			margin-top: 10px;
			height: 16px;
			font-weight: bold;
			&:not(.selected) {
				font-weight: normal;
			}
			&:hover {
				cursor: pointer;
				font-weight: bold;
			}
		}
	}
</style>

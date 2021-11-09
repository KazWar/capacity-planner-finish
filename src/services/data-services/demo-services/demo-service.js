// This service is used to load in the initial demo data into the application.

import features from '@/data/demo/features.json'
import profiles from '@/data/demo/profiles.json'
import users from '@/data/demo/users.json'
import account from '@/data/demo/accounts.json'

import Vue from 'vue'
import {
	Feature,
	Profile,
	User
} from '@/common/model'

export const DemoService = new Vue({
	methods: {
		async getUsers() {
			return users.map(item => this.asUser(item))
		},

		async getFeatures() {
			return features
		},

		async getProfiles() {
			return profiles
		},

		async getAccount() {
			return this.asUser(account)
		},

		asUser(item) {
			if (item) {
				return new User({
					id: item.id,
					firstName: item.firstName,
					lastName: item.lastName,
					description: item.description,
					username: item.username,
					profile: item.profile,
					phoneNr: item.phoneNr,
					active: item.active,
					createdOn: item.createdOn,
					editedOn: item.editedOn,
					permissions: item.permissions
				})
			}
		},

		asProfile(item) {
			if (item) {
				return new Profile({

				})
			}
		},

		asFeature(item) {
			if (item) {
				return new Feature({

				})
			}
		},
	}
})

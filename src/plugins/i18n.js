import Vue from 'vue'
import I18n from 'vue-i18n'

// importing translation files
import { translations } from '@/data/localizations'

Vue.use(I18n)

const options = {
	locale: 'en', // set locale
	availableLocales:['en', 'nl'],
	fallbackLocale: 'en', // rollback locale if locale changing fails
	messages: translations // bind translation files
}

export const i18n = new I18n(options)


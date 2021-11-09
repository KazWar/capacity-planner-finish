import { createVuePlugin } from 'vite-plugin-vue2'
import { defineConfig } from 'vite'

const config = defineConfig({
	plugins: [
		// Vue2-compatible plugin for .vue single-file components
		createVuePlugin({})
	],

	resolve: {
		alias: {
			// Tells vite to import the full Vue 2 package including template compiler.
			// Default import unfortunately picks the version without the included template compiler.
			'vue': 'vue/dist/vue.js',

			// Defines where imports starting from @/ prefix are found
			'@/': __dirname + '/src/',
		},
	},

	server:{
		port: 8003
	}

})

export default config

// This is purely for webstorm to be able to resolve @ alias.
// Webpack isn't used in this project.
// https://stackoverflow.com/questions/51588009/vue-js-configuring-webstorm-to-set-in-path-files-to-the-src-folder

module.exports = {
	resolve: {
		alias: {
			"@": require("path").resolve(__dirname, "src") // change this to your folder path
		}
	}
};

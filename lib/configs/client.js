module.exports = {
	extends: [
		'plugin:react/recommended',
	],
	plugins: [
		'react',
		'@xivanalysis',
	],
	rules: {
		'react/no-unescaped-entities': ['error', {forbid: ['>', '}']}],
		'@xivanalysis/no-unused-dependencies': 'error',
	},
}

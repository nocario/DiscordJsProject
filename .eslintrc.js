module.exports = {
	'env': {
		'commonjs': true,
		'es2020': true,
		'node': true
	},
	'extends': 'eslint:recommended',
	'parserOptions': {
		'ecmaVersion': 11
	},
	'rules': {
		'indent': [
			'error',
			'tab'
		],
		'linebreak-style': [
			'error',
			'windows'
		],
		'quotes': [
			'error',
			'single'
		],
		'semi': [
			'error',
			'always'
		],
		"comma-dangle": [
			"error",
			"always-multiline"
		],
		"block-spacing": "error",
		"array-bracket-spacing": [
			"error",
			"always"
		],
		"multiline-comment-style": "off",
		"computed-property-spacing": "off",
		"space-in-parens": "off",
		"capitalized-comments": "off",
		"object-curly-spacing": [
			"error",
			"always"
		],
		"no-lonely-if": "off"
	}
};

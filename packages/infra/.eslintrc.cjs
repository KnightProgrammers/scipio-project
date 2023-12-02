module.exports = {
	'env': {
		'es2021': true,
		'node': true
	},
	'extends': [
		'eslint:recommended',
		'plugin:import/recommended',
		'prettier',
		'eslint-config-prettier'
	],
	'overrides': [
		{
			'env': {
				'node': true
			},
			'files': [
				'.eslintrc.{js,cjs}'
			],
			'parserOptions': {
				'sourceType': 'script'
			}
		}
	],
	'parserOptions': {
		'ecmaVersion': 'latest',
		'sourceType': 'module'
	},
	'rules': {
		'indent': [
			'error',
			'tab'
		],
		'linebreak-style': [
			'error',
			'unix'
		],
		'quotes': [
			'error',
			'single'
		],
		'semi': [
			'error',
			'always'
		],
		'import/first': 'warn',
		'import/default': 'off',
		'import/newline-after-import': 'warn',
		'import/no-named-as-default-member': 'off',
		'import/no-duplicates': 'error',
		'import/no-named-as-default': 'off',
		'import/no-unresolved': 'off'
	}
};

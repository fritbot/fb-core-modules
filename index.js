module.exports = {
	'displayname': 'Core Modules',
	'description': 'Core fritbot functions.',
	'core': true,
	'children': [
		require('./src/rooms'),
		require('./src/sayhi'),
		require('./src/google'),
		require('./src/weather')
	]};

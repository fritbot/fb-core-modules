module.exports = {
    displayname : 'Core Modules',
    description : 'Core Fritbot functions.',
    children : [
        require('./src/control'),
        require('./src/help'),
        require('./src/rooms'),
        require('./src/sayhi')
    ] };

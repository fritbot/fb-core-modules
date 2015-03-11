module.exports = {
    displayname : 'Core Modules',
    description : 'Core Fritbot functions.',
    children : [
        require('./src/google'),
        require('./src/quotes'),
        require('./src/rooms'),
        require('./src/sayhi'),
        require('./src/weather')
    ] };

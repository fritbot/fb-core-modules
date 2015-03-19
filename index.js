module.exports = {
    displayname : 'Core Modules',
    description : 'Core Fritbot functions.',
    children : [
        require('./src/control'),
        require('./src/facts'),
        require('./src/google'),
        require('./src/help'),
        require('./src/quotes'),
        require('./src/rooms'),
        require('./src/sayhi'),
        require('./src/stocks'),
        require('./src/weather')
    ] };

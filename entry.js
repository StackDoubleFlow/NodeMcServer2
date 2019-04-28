try {
    require('babel-register')({
        presets: ['env']
    });

    module.exports = require('./server.js');
} catch(e) {
    console.error(e.stack);
    while(true);
}
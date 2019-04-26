try {
    require('babel-register')({
        presets: ['env']
    });

    module.exports = require('./index.js');
} catch(e) {
    console.error(e.stack);
    while(true);
}
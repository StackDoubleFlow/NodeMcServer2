try {
    require('@babel/register')({
        presets: ['@babel/preset-env'],
        plugins: ["@babel/plugin-syntax-bigint"]
    });

    module.exports = require('./server.js');
} catch(e) {
    console.error(e.stack);
}
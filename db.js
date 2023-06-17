const {Sequelize} = require('sequelize');

module.exports = new Sequelize(
    'telega_bot',
    'root',
    'root',
    {
        host: '5.189.237.51',
        port: '5432',
        dialect: 'postgres'
    }
)

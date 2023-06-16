const {Sequelize} = require('sequelize');

module.exports = new Sequelize(
    'telega_bot',
    'root',
    'root',
    {
        host: 'master.8fb121ba-3d19-4077-94db-a4ff55916d0c.c.dbaas.selcloud.ru',
        port: '5432',
        dialect: 'postgres'
    }
)

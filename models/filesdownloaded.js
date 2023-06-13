const Sequelize = require('sequelize');
const sequelize = require('../util/database');

const FilesDownloaded = sequelize.define('FilesDownloaded', {
    fileUrl: Sequelize.STRING
})

module.exports = FilesDownloaded;
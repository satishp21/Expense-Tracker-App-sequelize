const User = require('../models/users');
const Expense = require('../models/expenses');
const sequelize = require('../util/database');
const FilesDownloaded = require('../models/filesdownloaded');
const e = require('express');

const getUserLeaderBoard = async (req, res) => {
    try{
        const leaderboardofusers = await User.findAll({
            order:[['totalExpenses', 'DESC']] //for decending DESC for assending ASC
        })
        res.status(200).json(leaderboardofusers)

} catch (err){
    console.log(err)
    res.status(500).json(err)
}
}

const getUrldownloadfiles = async (req, res) => {
    try{
        const urls = await FilesDownloaded.findAll({where:{userId:req.user.id}},{
            order:[['createdAt', 'DESC']]
        })
        res.status(200).json(urls)

} catch (err){
    console.log(err)
    res.status(500).json(err)
}
}
module.exports = {
    getUserLeaderBoard,
    getUrldownloadfiles
}

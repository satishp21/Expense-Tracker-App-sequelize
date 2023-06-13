const Expense = require('../models/expenses');
const User = require('../models/users');
const FilesDownloaded = require('../models/filesdownloaded');
const sequelize = require('../util/database');
const UserServices = require('../services/userservices')
const s3Services = require('../services/s3services')

const addexpense = async(req, res) => {
    const t = await sequelize.transaction()
    try{ 
    const { expenseamount, description, category } = req.body;

    if(expenseamount == undefined || expenseamount.length === 0 ){
        return res.status(400).json({success: false, message: 'Parameters missing'})
    }
    const expense = await Expense.create({ expenseamount, description, category, userId: req.user.id},{transaction:t})
        const totalExpense = Number(req.user.totalExpenses) + Number(expenseamount)
        console.log(totalExpense)
        await User.update({
            totalExpenses: totalExpense
        },{ 
            where:{id:req.user.id},
            transaction:t
        })
        await t.commit();// only after this data gets updated database
        return res.status(201).json({expense, success: true} );
    }
    catch(err) {
        await t.rollback() // this will not let update database as error occured
        return res.status(500).json({success : false, error: err})
      }
}

const getexpenses = async(req, res)=> {
    try{
        let page = req.params.page || 1;
        // console.log('this is let req.params.page',req.params.page)
        let Items_Per_Page =Number(req.params.selectedValue || 3);
        console.log('this is let Items_Per_Page',req.params.selectedValue)
        const expenses2 = await Expense.findAll({ where : { userId: req.user.id}})
        const expenses = await Expense.findAll({ where : { userId: req.user.id}, offset:(page-1)*Items_Per_Page, limit:Items_Per_Page})
        let totalitems = expenses2.length
        console.log('this is let totalitems',totalitems)
        // console.log('expenses',expenses)

        return res.status(200).json({expenses,
            info: {
                currentPage: page,
                hasNextPage: totalitems > page * Items_Per_Page,
                hasPreviousPage: page > 1,
                nextPage: +page + 1,
                previousPage: +page - 1,
                lastPage: Math.ceil(totalitems / Items_Per_Page)
            },
             success: true })
    }
    catch(err) {
        console.log(err)
        return res.status(500).json({ error: err, success: false})
    }
}

const deleteexpense = async (req, res) => {
    console.log('start')
    try{
    const expenseid = req.params.expenseid; //this is obtained from url of delete req
    const expenseobj  = await Expense.findAll ({where : {id : expenseid}})
    console.log(expenseobj[0].expenseamount,expenseobj[0].userId)
    const user= await User.findAll ({where : {id : expenseobj[0].userId }})
    console.log(user)

    if(expenseid == undefined || expenseid.length === 0){
        return res.status(400).json({success: false, })
    }
    const totalExpense = Number(user[0].totalExpenses) - Number(expenseobj[0].expenseamount)
    console.log(totalExpense)
    await User.update({
        totalExpenses: totalExpense
    },{ 
        where:{id:req.user.id},
        // transaction:t
    })
    const noofrows = await Expense.destroy({where: { id: expenseid, userId: req.user.id }})
        if(noofrows === 0){
            return res.status(404).json({success: false, message: 'Expense doenst belong to the user'})
        }
        return res.status(200).json({ success: true, message: "Deleted Successfuly"})
    }catch (err) {
        // await t.rollback()
        console.log(err)
        return res.status(500).json({success : false, error: err})
    }
}

const downloadExpenses =  async (req, res) => {
    try {
        if(!req.user.ispremiumuser){
            return res.status(401).json({ success: false, message: 'User is not a premium User'})
        }
        const expenses = await UserServices.getExpenses(req)
        console.log(expenses)

        const strigifiedexpenses = JSON.stringify(expenses)
        console.log(strigifiedexpenses)

        const userId = req.user.id;

        const filename = `Expense.txt${userId}/${new Date}`
        const fileURL= await s3Services.uploadTOS3(strigifiedexpenses,filename)
        FilesDownloaded.create({fileUrl:fileURL,userId:req.user.id})
        
        console.log(fileURL)
        res.status(200).json({fileURL,success:true})

    } catch(err) {
        console.log(err)
        res.status(500).json({ error: err, success: false, message: 'Something went wrong'})
    }
};

module.exports = {
    deleteexpense,
    getexpenses,
    addexpense,
    downloadExpenses
}
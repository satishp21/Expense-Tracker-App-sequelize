const express = require('express');
const fs =require('fs')
const path = require('path')
const cors = require('cors')
const helmet = require('helmet')
const compression = require('compression')
const morgan = require('morgan')
//morgan middleware is being used to log HTTP requests. morgan is a popular logging middleware for Express.js that logs requests in a specific format, based on a pre-defined set of tokens

const app = express();
const dotenv = require('dotenv');

// get config vars
dotenv.config();
app.use(cors()); // or app.use(cors('*')); both cors middleware allows the request from any origin both works same

const sequelize = require('./util/database');
const User = require('./models/users');
const Expense = require('./models/expenses');
const Order = require('./models/orders');
const Forgotpassword = require('./models/forgotpassword');
const FilesDownloaded = require('./models/filesdownloaded');

const userRoutes = require('./routes/user')
const purchaseRoutes = require('./routes/purchase')
const resetPasswordRoutes = require('./routes/resetpassword')
const expenseRoutes = require('./routes/expense')
const premiumFeatureRoutes = require('./routes/premiumFeature')

const accessLogStream = fs.createWriteStream(path.join(__dirname,'access.log'),{flags:'a'})

const { Stream } = require('stream');

app.use(helmet()) //middleware to  HTTP headers to improve security
app.use(compression())
app.use(morgan('combined',{stream:accessLogStream}))  
// above line of code adds the morgan middleware to the Express.js application, which logs HTTP requests in the "combined" format and writes the logs to the accessLogStream writable stream.

// app.use(bodyParser.urlencoded());  ////this is for handling forms
app.use(express.json());  //this is for handling jsons

app.use('/user', userRoutes)
app.use('/expense', expenseRoutes)
app.use('/purchase', purchaseRoutes)
app.use('/premium', premiumFeatureRoutes)
app.use('/password', resetPasswordRoutes);

User.hasMany(Expense);
Expense.belongsTo(User);

User.hasMany(Order);
Order.belongsTo(User);

User.hasMany(Forgotpassword);
Forgotpassword.belongsTo(User);

User.hasMany(FilesDownloaded);
FilesDownloaded.belongsTo(User);

sequelize.sync()
    .then(() => {
        app.listen(process.env.PORT);
    })
    .catch(err => {
        console.log(err);
    })
async function addNewExpense(e){
    try{
    e.preventDefault();

    const expenseDetails = {
        expenseamount: e.target.expenseamount.value,
        description: e.target.description.value,
        category: e.target.category.value,
    }
    
    console.log(expenseDetails)
    const token  = localStorage.getItem('token')
    const response = await axios.post('http://52.7.15.241:3000/expense/addexpense',expenseDetails,  { headers: {"Authorization" : token} })
    // console.log(response,"this is the resposwe you are lookigng for")
    addNewExpensetoUI(response.data.expense);
    }
    catch(err) {
        showError(err)
    }
}

async function RPPvalue(){
    try{
    const token  = localStorage.getItem('token')
    const page = 1
    const selectElement = document.getElementById("RPP");
    const selectedValue = selectElement.value;
    localStorage.setItem('RPP',selectedValue)
    console.log(`Selected value: ${selectedValue}`);
    const response = await axios.get(`http://52.7.15.241:3000/expense/getexpenses${page}${selectedValue}`, { headers: {"Authorization" : token} })
            response.data.expenses.forEach(expense => {
                addNewExpensetoUI(expense);
            })
            // console.log("this is response.data",response.data)
            showPagination(response.data.info)
    
    }catch(err) {
        console.log(err)
        showError(err)
    }
}

function showPremiumuserMessage() {
    document.getElementById('rzp-button1').style.visibility = "hidden"
    document.getElementById('message').innerHTML = "You are a premium user "
}

function parseJwt (token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
}

window.addEventListener('DOMContentLoaded', async()=> {
    try{
    const page = 1
    const token  = localStorage.getItem('token')
    const selectedValue  = localStorage.getItem('RPP') || 3
    const decodeToken = parseJwt(token)
    console.log(decodeToken)
    const ispremiumuser = decodeToken.ispremiumuser
    if(ispremiumuser){
        showPremiumuserMessage()
        showLeaderboard()
    }
    const response = await axios.get(`http://52.7.15.241:3000/expense/getexpenses${page}${selectedValue}`, { headers: {"Authorization" : token} })
            response.data.expenses.forEach(expense => {
                addNewExpensetoUI(expense);
            })
            // console.log("this is response.data",response.data)
            showPagination(response.data.info)
    }catch(err) {
        console.log(err)
        showError(err)
    }
});

function addNewExpensetoUI(expense){
    const parentElement = document.getElementById('listOfExpenses');
    const expenseElemId = `expense-${expense.id}`;
    parentElement.innerHTML += `
        <li id=${expenseElemId}>
            ${expense.expenseamount} - ${expense.category} - ${expense.description}
            <button onclick="deleteExpense(event, '${expense.id}')">
                Delete Expense
            </button>
        </li>`
}

async function deleteExpense(e, expenseid) {
    try{
    const token = localStorage.getItem('token')
    await axios.delete(`http://52.7.15.241:3000/expense/deleteexpense/${expenseid}`,  { headers: {"Authorization" : token} })
    removeExpensefromUI(expenseid);
    }catch(err) {
        showError(err);
    }
}

function showError(err){
    document.body.innerHTML += `<div style="color:red;"> ${err}</div>`
}

function showLeaderboard(){
    const inputElement = document.createElement("input")
    inputElement.type = "button"
    inputElement.value = 'Show Leaderboard'
    inputElement.onclick = async() => {
        const token = localStorage.getItem('token')
        const userLeaderBoardArray = await axios.get('http://52.7.15.241:3000/premium/showLeaderBoard', { headers: {"Authorization" : token} })
        console.log(userLeaderBoardArray)

        var leaderboardElem = document.getElementById('leaderboard')
        leaderboardElem.innerHTML = '<h1> Leader Board </<h1>'
        userLeaderBoardArray.data.forEach((userDetails) => {
            leaderboardElem.innerHTML += `<li>Name - ${userDetails.name} Total Expense - ${userDetails.totalExpenses || 0} </li>`
        })
    }
    document.getElementById("message").appendChild(inputElement);

    const inputElement2 = document.createElement("input")
    inputElement2.type = "button"
    inputElement2.value = 'Show downloaded files'
    inputElement2.onclick = async() => {
        const token = localStorage.getItem('token')
        const downloadfilesArray = await axios.get('http://52.7.15.241:3000/premium/showdownloadedfiles', { headers: {"Authorization" : token} })
        console.log(downloadfilesArray)

        var downloadfileElem = document.getElementById('downloadedfiles')
        downloadfileElem.innerHTML = '<h1> Downloaded Files </<h1>'
        downloadfilesArray.data.forEach((Downloadedfile) => {
            downloadfileElem.innerHTML += `<li>URL-${Downloadedfile.fileUrl} </li>`
        })
    }
    document.getElementById("message").appendChild(inputElement2);
}

function removeExpensefromUI(expenseid){
    const expenseElemId = `expense-${expenseid}`;
    document.getElementById(expenseElemId).remove();
}

function download(){
    const token  = localStorage.getItem('token')
    axios.get('http://52.7.15.241:3000/user/download', { headers: {"Authorization" : token} })
    .then((response) => {
        if(response.status === 200){
            //the bcakend is essentially sending a download link
            //  which if we open in browser, the file would download
            var a = document.createElement("a");
            a.href = response.data.fileURL;
            a.download = 'myexpense.csv';
            a.click();
        } else {
            throw new Error(response.data.message)
        }
    })
    .catch((err) => {
        showError(err)
        alert('You are not a Premium User Now')
    });
}

document.getElementById('rzp-button1').onclick = async function (e) {
    const token = localStorage.getItem('token')
    const response  = await axios.get('http://52.7.15.241:3000/purchase/premiummembership', { headers: {"Authorization" : token} });
    console.log(response);
    var options =
    {
     "key": response.data.key_id, // Enter the Key ID generated from the Dashboard in razor pay site
     "order_id": response.data.order.id,// For one time payment
     // This handler function will handle the success payment
     "handler": async function (response) {
        const res = await axios.post('http://52.7.15.241:3000/purchase/updatetransactionstatus',{
             order_id: options.order_id,
             payment_id: response.razorpay_payment_id,
         }, { headers: {"Authorization" : token} })
        
        console.log(res)
         alert('You are a Premium User Now')
         document.getElementById('rzp-button1').style.visibility = "hidden"
         document.getElementById('message').innerHTML = "You are a premium user "
         localStorage.setItem('token', res.data.token)
         showLeaderboard()
     },
  };

  const rzp1 = new Razorpay(options);
  rzp1.open();
  e.preventDefault();

  rzp1.on('payment.failed', async function (response){
    alert('Something went wrong')
 });
}

function showPagination({currentPage,hasNextPage,hasPreviousPage,nextPage,previousPage,lastPage}){
    // let page = 1;
    try{
    const pagination = document.getElementById('pagination')
    
    pagination.innerHTML = '';

    if(hasPreviousPage){
        const button1 = document.createElement('button');
        button1.innerHTML = previousPage ;
        button1.addEventListener('click' , ()=>getPageExpenses(previousPage))
        pagination.appendChild(button1)
    }

    const button2 = document.createElement('button');
    button2.classList.add('active')
    button2.innerHTML = currentPage ;
    button2.addEventListener('click' , ()=>getPageExpenses(currentPage))
    pagination.appendChild(button2)

    if(hasNextPage){
        const button3 = document.createElement('button');
        button3.innerHTML = nextPage ;
        button3.addEventListener('click' , ()=>getPageExpenses(nextPage))
        pagination.appendChild(button3)
    }
    }catch(err){
        console.log(err)
    }
}

async function getPageExpenses(page){
    try{
    const selectedValue  = localStorage.getItem('RPP') || 3
    const token  = localStorage.getItem('token')
    const parentElement = document.getElementById('listOfExpenses');
    parentElement.innerHTML=''
    const response = await axios.get(`http://52.7.15.241:3000/expense/getexpenses${page}${selectedValue}`, { headers: {"Authorization" : token} })
            response.data.expenses.forEach(expense => {
                addNewExpensetoUI(expense);
            })
            console.log("this is response.data",response.data.info)
            showPagination(response.data.info)
    }catch(err) {
        showError(err)
    }
}
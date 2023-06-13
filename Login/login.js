function login(e) {
    e.preventDefault();
    const form = new FormData(e.target);

    const loginDetails = {
        email: form.get("email"),
        password: form.get("password")

    }
    // const loginDetails = {
    //     email: e.target.email.value,
    //     password: e.target.password.value
    // }

    console.log(loginDetails, "this is login details")
    // console.log(response.data,response.data.user, "this is response.data.user")
    axios.post('http://localhost:3000/user/login',loginDetails).then(response => {
        
        if(response.status === 200 ){
            console.log(response)
            console.log(response.data,response.data.user, "this is response.data.user")
            localStorage.setItem('token', response.data.token);
            // localStorage.setItem('userDetails', JSON.stringify(response.data.user))
            window.location.href = "../ExpenseTracker/index.html" // change the page on successful login
        } else {
            throw new Error('Failed to login')
        }
    }).catch(err => {
        document.body.innerHTML += `<div style="color:red;">${err} <div>`;
    })
}

function forgotpassword() {
    window.location.href = "../ForgotPassword/index.html"
}
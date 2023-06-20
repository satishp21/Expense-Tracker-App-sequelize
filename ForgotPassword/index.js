async function forgotpassword(e) {

    try{
    e.preventDefault();
    const form = new FormData(e.target);
    const userDetails = {
        email: form.get("email"),
    }
    
    const response = await axios.post('http://52.7.15.241:3000/password/forgotpassword',userDetails)
    document.body.innerHTML += '<div style="color:red;">Mail Successfuly sent <div>'

    }
    catch(err) {
        document.body.innerHTML += `<div style="color:red;">${err} <div>`;
    }
}
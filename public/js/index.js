goIn = ()=>{
    const password = 'Centigrade';
    const pswd = document.getElementById('pswd').value;

    if(pswd !== password){
        alert('Entered password is wrong');
        
        return false
    }
    return true
}
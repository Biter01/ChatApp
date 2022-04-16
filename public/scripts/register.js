'use strict';

const form = document.querySelector('form');

form.addEventListener('submit', async (event)=> {
    
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const result = await fetch('api/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            username,
            password
        })
    }).then((response) => {
        //console.log(response);
        //console.log(response.json())
        return response.json()
    });
    displayMessage(result);
   
});


function displayMessage(result) {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = result.message;
    if(result.status === 'error') {
        //console.log(result.message);
        //messageDiv.style.color = 'red';
    } else {
       //console.log('Sucessful Registration');
      // messageDiv.style.color = 'green';
    }
}
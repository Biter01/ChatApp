'use strict';

const form = document.querySelector('form');
form.addEventListener('submit', async (event)=> {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const result = await fetch('api/login', {
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
        return response.json()
    });

    //console.log(result);
    
    if(result.status === 'ok') {
        //console.log('Got the token ', result.data);
        localStorage.setItem('token', result.data);
        window.location.href='http://localhost:5000/chat.html';
    } else {
        displayErrorMessage(result);
        console.log(result.message);
    }
});


function displayErrorMessage(result) {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = result.message;
    if(result.status === 'error') {
        //console.log(result.message);
        messageDiv.style.color = 'red';
    }
}


window.addEventListener('load', ()=> {
    console.log('seite geladen');
    
});


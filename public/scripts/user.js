'use strict';
const socket = io();
const messages = document.getElementById('messages');
const form = document.querySelector('form');
const input = document.getElementById('input');

const getUserToken = ()=> {
    return localStorage.getItem('token');
}


(async () => {
    //Userroom wird gesucht
    const url = window.location.href.split('/');
    const userRoom = url[url.length - 1];
    //console.log(userRoom);
    const result =  await fetch('/api/chat/room', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            token: getUserToken(),
            userInputRoom: userRoom
        })
    }).then((response)=>{ 
       return response.json();
    });
    //console.log(result);
    
    if(result.status === 'error') {
        displayError(result.message);
    } else {
        console.log(result.message);
    }

})();


function displayError(message) {
        const body = document.body;
        const errorDiv = document.createElement('div');
        body.innerHTML = '';
        errorDiv.textContent = message;
        errorDiv.style.fontWeight = 'bold';
        errorDiv.style.color = 'red';
        body.appendChild(errorDiv);

}

form.addEventListener('submit', (event)=> {
    event.preventDefault();
    if(input.value){
        socket.emit('chat-message', input.value);
        input.value = '';
    }
});


socket.on('send-message', (msg)=> {
    console.log('client chat message', msg);
    const listItem = document.createElement('li');
    listItem.textContent = msg;
    messages.appendChild(listItem);
});
      

'use strict';
const socket = io();
const messages = document.getElementById('messages');
const form = document.querySelector('form');
const input = document.getElementById('input');


const user = {};

const getUserToken = ()=> {
    return localStorage.getItem('token');
}


(async () => {
    //Userroom wird gesucht
    const url = window.location.href.split('/');
    //console.log(url);
    user.userRoom = url[url.length - 1];
    if(!user.userRoom) {
        user.userRoom = url[url.length - 2];
    }
    //console.log(userRoom);
    const result =  await fetch('/api/chat/room', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            token: getUserToken(),
            userRoom: user.userRoom
        })
    }).then((response)=>{ 
       return response.json();
    });
    //console.log(result);
    
    if(result.status === 'error') {
        displayError(result.message);
    } else if(result.status === 'ok') {
        //console.log(result.user);
        user.userName = result.user;
        console.log(user.userName);
        displayJoinMessage();
        socket.emit('user-join', user);
        //console.log(result.message);
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


function displayJoinMessage() {
    //Anzeige Für den Client das er gejoined ist
    const listItemJoin = document.createElement('li');
    listItemJoin.textContent = 'You joined';
    messages.appendChild(listItemJoin);
}


form.addEventListener('submit', (event)=> {
    event.preventDefault();
    if(input.value){
        const {userName} = user;
        //li Element Für den Sender
        const listItemAdresser = document.createElement('li');
        listItemAdresser.textContent = `You: ${input.value}`
        messages.appendChild(listItemAdresser);
        //erstellung message Obj
        const messageObj = {...user, message: input.value };
        socket.emit('chat-message', messageObj);
        input.value = '';
    }
    
});

// socket.on('send-message-joined', (user)=> {
//     console.log('join');
//     //Anzeige für Alle Client(s) dass ein User gejoined ist
//     const listItemJoin = document.createElement('li');
//     listItemJoin.textContent = `${user} joined`;
//     messages.appendChild(listItemJoin);
// });


document.addEventListener('visibilitychange', (event)=> {
    if(document.visibilityState === 'hidden') {
        socket.emit('save-history', user);
    }
});


socket.on('send-message', (messageObj)=> {
    console.log(messageObj);
    console.log('client chat message', messageObj.message);
    const listItemRecipient = document.createElement('li');
    listItemRecipient.textContent = `${messageObj.userName}: ${messageObj.message}`;
    messages.appendChild(listItemRecipient);
});
      

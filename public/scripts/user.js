'use strict';
const socket = io();
const messages = document.getElementById('messages');
const form = document.querySelector('form');
const input = document.getElementById('input');
const deleteBtn = document.getElementById('delete');

const userInfo = {};
//user.messages = [];


const getUserToken = ()=> {
    return localStorage.getItem('token');
}


(async () => {
    //Userroom wird gesucht
    const url = window.location.href.split('/');
    //console.log(url);
    userInfo.userRoom = url[url.length - 1];
    if(!userInfo.userRoom) {
        userInfo.userRoom = url[url.length - 2];
    }
    //console.log(userRoom);
    const result =  await fetch('/api/chat/room', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            token: getUserToken(),
            userRoom: userInfo.userRoom
        })
    }).then((response)=>{ 
       return response.json();
    });
    //console.log(result);
    
    if(result.status === 'error') {
        displayError(result.message);
    } else if(result.status === 'ok') {
        //console.log(result.user);
        userInfo.userName = result.username;
        //console.log(userInfo.userName);
        socket.emit('user-join', userInfo);
        displayJoinMessage();
        displayHistory();
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
        /*
            Speicher gesendete Nachricht in Array
            //user.messages.push(input.value);
        */

        //li Element Für den Sender
        const listItemAdresser = document.createElement('li');
        listItemAdresser.textContent = `You: ${input.value}`
        messages.appendChild(listItemAdresser);
        //erstellung message Obj
        const messageObj = {...userInfo, message: input.value };
        socket.emit('chat-message', messageObj);
        input.value = '';
         //Speichere den Chat verlauf
        
        //console.log('save-history Sender');
        socket.emit('save-history', messageObj);
    }
    
});




async function displayHistory() {
    const {userName, userRoom} = userInfo;
    const param = `?userName=${userName}&userRoom=${userRoom}`
    //console.log(param);
    const result =  await fetch('/api/chat/get-history' + param , {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    }).then((response)=>{ 
       return response.json();
    });

    let history = result.history;
    if(history.length < 1) {
        messages.innerHTML = '';
        displayJoinMessage();
    } 
    history.forEach((element) => {
        const listItem = document.createElement('li');
        const textArr = element.split(':');
        //console.log(textArr);
        if(textArr[0] === userName) {
            textArr[0] = 'You';
        }
        listItem.textContent = `${textArr[0]}: ${textArr[1]}`;
        messages.appendChild(listItem);
    });
}


deleteBtn.addEventListener('click', async(event)=> {
    const {userName, userRoom} = userInfo;
    //console.log(userInfo);
    const result =  await fetch('/api/chat/delete-history', {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            userName: userName,
            userRoom: userRoom
        })
    }).then((response)=>{ 
       return response.json();
    })
    console.log(result);
    displayHistory();
});


socket.on('send-message', (message)=> {
    // userRoom und userName sind hier die des Empfängers und nicht des Senders außer die Nachricht "message" 
    const messageObjRecipient = {...userInfo, message};
    const {userRoom, userName } = messageObjRecipient

    //console.log('client chat message', message);
    const listItemRecipient = document.createElement('li');
    listItemRecipient.textContent = `${userRoom}: ${message}`;
    messages.appendChild(listItemRecipient);
   

});
      

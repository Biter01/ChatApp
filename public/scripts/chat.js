'use strict';
const socket = io(); 

const userObj = {
    userName: '',
    getUserToken: ()=>{
        return localStorage.getItem('token');
    }
}

checkPermissionState();
async function checkPermissionState() {
    const result =  await fetch('/api/chat/checkPermission', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            token: userObj.getUserToken()    
        })
    }).then((response)=>{ 
       return response.json();
    });
    //console.log(result);
    if(displayPermissionState(result.status, result.message)) {
        userObj.userName = result.userName;
        return true;
    }
    
}

//Damit der Wert von userName schon gesetzt wurde um ihn zu verwenden, sodass userName einen Wert hat!!!
new Promise((resolve, reject) => {
    const timer = setInterval(()=> {
        if(userObj.userName!=='') {resolve(timer);}
    }, 10);
})
.then((timer) => {
    console.log(userObj.userName);
    clearInterval(timer);
    socket.emit('update-onlinestatus', userObj.userName);
    socket.emit('connect-user', userObj.userName);
});

const contentElements = document.querySelectorAll('#content div')
const navList = document.querySelector('nav ul');

for(let i = 0; i < navList.children.length; i++ ) {
        navList.children[i].addEventListener('click', function(event) {
            const targetContent = document.getElementById(this.dataset.link);
            if(targetContent.classList.contains('hide')) {
                //console.log('contains hide');
                targetContent.classList.remove('hide');
            }
            for(let j = 0; j < contentElements.length; j++ ) {
                //console.log('add hide');
                if(contentElements[j] !== targetContent) {
                    contentElements[j].classList.add('hide')
                }
            }
    });
};



const roomForm = document.querySelectorAll('form')[0];


socket.on('update-userRooms', (rooms)=>{
    console.log(rooms);
    createSearchedRooms(rooms);
    
});

function createSearchedRooms(rooms) {
    const list = document.getElementById('rooms');
    list.innerHTML = '';
    rooms.forEach((room)=> {
        const {roomname, unreadmessages} = room
        const listItem = document.createElement('li');
        const link = document.createElement('a');
        const infoElement = document.createElement('span');
        link.innerHTML = roomname;
        link.href = `/chat/${roomname}/`;
        infoElement.innerHTML = ` ${unreadmessages}`;
        listItem.appendChild(link);
        listItem.appendChild(infoElement) 
        list.appendChild(listItem);
    });

}


// roomForm.addEventListener('change', async (event)=> {
    
//     event.preventDefault();
//     console.log('in Room Form');
//     const searchedRoom = document.getElementById('search').value;
//     const param = `?searchedRoom=${searchedRoom}&userName=${userObj.userName}`;
//     const searchResult =  await fetch('/api/chat/search-room' + param, {
//         method: 'GET',
//         headers: {
//             'Content-Type': 'application/json',
//         }
//     }).then((response)=>{
//         //console.log(response);
//         return response.json();
//     }).catch((err)=> {
//         console.log(err);
//     });
//     console.log('test');
//     //console.log(searchResult);

//     if(checkPermissionState()) {
//         createSearchedUsers(searchResult.users);
//     }
// });


const searchForm = document.querySelectorAll('form')[1];

searchForm.addEventListener('submit', async (event)=> {
    event.preventDefault();
    const searchedUser = document.getElementById('searchInput').value;
    const param = `?searchedUser=${searchedUser}&userName=${userObj.userName}`;
    const searchResult =  await fetch('/api/chat/search-user' + param, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    }).then((response)=>{
        //console.log(response);
        return response.json();
    });
    //console.log(searchResult);

    if(checkPermissionState()) {
        console.log(searchResult.users);
        createSearchedUsers(searchResult.users);
    }
});


function displayPermissionState(status, message) {
    const messageDiv = document.getElementById('message');
    console.log(status, message);
    if(status === 'ok' && message !== undefined) {
        messageDiv.textContent = message;
        return true;
    }
    else if(status === 'ok') {
        return true
    } 
    else {
        const body = document.body;
        const errorDiv = document.createElement('div');
        body.innerHTML = '';
        console.log(errorDiv);
        errorDiv.textContent = message;
        errorDiv.style.fontWeight = 'bold';
        errorDiv.style.color = 'red';
        body.appendChild(errorDiv);
        return false;
    }
}


function createSearchedUsers(users) {
    const list = document.getElementById('user');
    list.innerHTML = '';
    users.forEach((user)=> {
        const username =  user.username;
        const listItem = document.createElement('li');
        const link = document.createElement('a');
        link.innerHTML = username;
        link.href = `/chat/${username}/`;
        listItem.appendChild(link); 
        list.appendChild(listItem);
    });
}

const logoutBtn = document.getElementById('logout');

logoutBtn.addEventListener('click', (event)=> {
   localStorage.removeItem('token');
   window.location.replace("http://localhost:5000/index.html");
});












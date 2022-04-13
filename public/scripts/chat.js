'use strict';

const getUserToken = ()=> {
    return localStorage.getItem('token');
}

(async () => {
    const result =  await fetch('/api/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            token: getUserToken()    
        })
    }).then((response)=>{ 
       return response.json();
    });
    console.log(result);
    if(result.status === 'ok') {

    }
    checkPermissionState(result.status, result.message);
})();

const searchForm = document.querySelector('form');

searchForm.addEventListener('submit', async (event)=> {
    event.preventDefault();
    const username = document.getElementById('search').value;
    const searchResult =  await fetch('/api/chat/search-user', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            username: username, 
            token: getUserToken()
        })
    }).then((response)=>{
        //console.log(response);
        return response.json();
    });
    //console.log(searchResult);

    if(checkPermissionState(searchResult.status, searchResult.message)) {
        createSearchedUsers(searchResult.users);
    }
});


function checkPermissionState(status, message) {
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
        errorDiv.id="errorDiv"
        body.innerHTML = '';
        console.log(errorDiv);
        errorDiv.textContent = message;
        errorDiv.style.fontWeight = 'bold';
        //errorDiv.style.color = 'red';
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












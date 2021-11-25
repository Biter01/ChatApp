'use strict';
(async () => {
    const userToken = localStorage.getItem('token');
    const result =  await fetch('/api/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            token: userToken    
        })
    }).then((response)=>{ 
       return response.json();
    });
    //console.log(result);
    displayMessage(result);


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
                token: userToken    
            })
        }).then((response)=>{
            //console.log(response);
            return response.json();
        });
        console.log(searchResult);
        createSearchedUsers(searchResult.users);
    });

    

    function displayMessage(result) {
        const messageText = result.message;
        const messageDiv = document.getElementById('message');
        if(result.status === 'ok') {
            messageDiv.textContent = `Wilkommen ${messageText}!`;
        } else {
            messageDiv.textContent = messageText;
            messageDiv.style.fontWeight = 'bold';
            messageDiv.style.color = 'red';
        }
    }


    let list = document.getElementById('user');
    function createSearchedUsers(users) {
        list.innerHTML = '';
        users.forEach((user)=> {
           const username =  user.username;
           const listItem = document.createElement('li');
           const link = document.createElement('a');
           link.innerHTML = username;
           link.href = `/chat/${username}`;
           listItem.appendChild(link); 
           list.appendChild(listItem);
        });
    }

})();












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
    displayMessage(result);
})();

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
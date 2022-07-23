const chatForm = document.getElementById("chat-form");
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users')



//Get username and room from URL

const {username, room} = Qs.parse(location.search, {
    ignoreQueryPrefix: true
})





// HAVING ACCESS TO THE SOCKET
const socket = io();


//Join chatroom
socket.emit("joinRoom", {username, room});

//check for  any messages recieved
socket.on('message', message => {
    console.log(message);
    outputMessage(message);
    // Scroll down 
    chatMessages.scrollTop = chatMessages.scrollHeight;
})

//GEt room and users
socket.on('roomUsers', ({ room, users}) => {
    outputRoomName(room);
    outputUsers(users);
});


//Message submit

chatForm.addEventListener('submit', (e) => {
    // we dont want to submir to a file
    e.preventDefault();

    //GEt message for server
    const msg = e.target.elements.msg.value;

    //emiting a message to the server
    socket.emit("chatMessage", msg);

    //CLear our input
    e.target.elements.msg.value = '';
    e.target.elements.msg.focus();

})

function outputMessage(message) {
    const div = document.createElement('div');
    div.classList.add('message');
    div.innerHTML = '<p class="meta">'+message.username+' <span>'+message.time+'</span></p> \
    <p class="text">' + message.text +'</p>';
    document.querySelector('.chat-messages').appendChild(div);
}



// Add room name to DOM

function outputRoomName(room) {
    roomName.innerText = room;
}

// add users to DOM 
function outputUsers(users) {
    userList.innerHTML = users.map(user=> '<li>' + user.username + '</li>').join('');
    console.log(userList.innerHTML);
}

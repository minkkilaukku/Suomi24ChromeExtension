

var userNameInput = document.getElementById("userNamesInput");
var alwaysRemoveList = document.getElementById("alwaysRemoveUsersContainer");

function sendMsg(msg) {
    chrome.tabs.query({active: true, currentWindow: true}, gotTabs);
    function gotTabs(tabs) {
        for (let tab of tabs) chrome.tabs.sendMessage(tab.id, msg);
    }
}

document.getElementById("removeUsersPostsButton").onclick = function () {
    var users = userNameInput.value.split(",").map(w=>w.trim()).filter(x=>x.length);
    sendMsg({removePosts: true, userNames: users});
};

document.getElementById("alwaysRemoveUsersPostsButton").onclick =  function() {
    var users = userNameInput.value.split(",").map(w=>w.trim()).filter(x=>x.length);
    sendMsg({removePosts: true, userNames: users, removeAlways: true});
    var prevNameSet = new Set (Array.from(alwaysRemoveList.children).map(x=>x.textContent));
    for (let uN of users) {
        if (!prevNameSet.has(uN)) addAlwaysRemoveUser(uN);
    }
};


document.getElementById("clearAlwaysRemoveButton").onclick = function () {
    sendMsg({clearAlwaysRemoves: true});
    setAlwaysRemoveUsers([]);
};



var addAlwaysRemoveUser = function(userName) {
    let el = document.createElement("p");
    el.innerText = userName;
    el.onclick = function() {
        alwaysRemoveList.removeChild(el);
        sendMsg({removeFromAlwaysToRemove: true, userNames: [userName]});
    };
    alwaysRemoveList.appendChild(el);
};


var setAlwaysRemoveUsers = function(userNames) {
    alwaysRemoveList.innerHTML = "";
    for (let uN of userNames) {
        addAlwaysRemoveUser(uN);
    }
};

//fill the alwaysRemoveUsersContainer from querying the active tab
chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {getAlwaysRemoveUsers: true}, function(response) {
        if (response) {
            setAlwaysRemoveUsers(response)
        }
    });
});





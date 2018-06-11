const USERS_TO_REMOVE_STORAGE_NAME = "lankki_miukku_aina_poistettavat_nimet";


var makeRemovedP = function(userName, type="viesti") {
    var remNode = document.createElement("p");
    remNode.style.color = "rgb(50, 0, 0)";
    remNode.style.fontSize = "x-small";
    remNode.style.fontStyle = "italic";
    
    remNode.innerHTML = "Poistettu käyttäjän <span style='font-weight: bold;'>"+userName+"</span> "+type;
    return remNode;
};



var removeUsersPosts = function(userNames) {
    var usersToRemove = new Set(userNames);
    
    var foundNames = Array.from(document.querySelectorAll("p.user-info-name")).map(x=>x.textContent.trim());
    
    var handlePostElement = function(elem, type="viesti") {
        let userNameCont = elem.getElementsByClassName("user-info-name")[0];
        if (userNameCont) {
            let nameLinks = userNameCont.getElementsByTagName("a"); //registered users' name inside a
            let userName;
            if (nameLinks[0]) {
                userName = nameLinks[0].textContent.trim();
            } else {
                userName = userNameCont.textContent.trim();
            }
            
            if (usersToRemove.has(userName)) {
                
                //comments have action bar below them that needs to be removed separately
                let sib = elem.nextElementSibling;
                if (sib && sib.classList.contains("action-bar")) {
                    //sib.parentElement.removeChild(sib);
                    sib.style.display = "none";
                }
                
                elem.after(makeRemovedP(userName, type));
                //elem.parentElement.removeChild(elem);
                elem.style.display = "none";
            }
        }
    };
    
    var answers = document.querySelectorAll(".answer-container");
    var comments = document.querySelectorAll(".comment-container");
    
    for (let ans of answers) {
        handlePostElement(ans, "viesti");
        /*
        let ansUserNameCont = ans.getElementsByClassName("user-info-name")[0];
        
        if ( ansUserNameCont ) {
            let ansUserName = ansUserNameCont.textContent.trim();
            if ( usersToRemove.has(ansUserName) ) {
                ans.after(makeRemovedP(ansUserName));
                ans.parentElement.removeChild(ans);
            }
        }
        */
    }
    
    for (let comm of comments) {
        handlePostElement(comm, "kommentti");
        /*
        let commUserNameCont = comm.getElementsByClassName("user-info-name")[0];
        if ( commUserNameCont &&  usersToRemove.has(commUserNameCont.textContent.trim())) {
            let commUserName = commUserNameCont.textContent.trim();
            comm.after(makeRemovedP(commUserName, "kommentti"));
            comm.parentElement.removeChild(comm);
        }
        */
    }
    
};



chrome.runtime.onMessage.addListener(gotMessage);

function gotMessage(msg, sender, sendResponse) {
    
    //console.log(msg);
    
    if (msg.removePosts == true) {
        removeUsersPosts(msg.userNames);
        if (msg.removeAlways == true) {
            addUsersToRemoveAlways(msg.userNames)
        }
    } else if (msg.getAlwaysRemoveUsers == true) {
        sendResponse(getUsersToRemoveAlways());
        //console.log("got queried about the always-to-remove users: "+getUsersToRemoveAlways());
    } else if (msg.removeFromAlwaysToRemove == true) {
        removeUsersToRemoveAlways(msg.userNames);
    } else if (msg.clearAlwaysRemoves == true) {
        setUsersToRemoveAlways([]);
    }
    
    
}


var addUsersToRemoveAlways = function(userNames) {
    var prev = getUsersToRemoveAlways();
    var toStore = Array.from(new Set( prev.concat(userNames) ));
    setUsersToRemoveAlways(toStore);
};

var removeUsersToRemoveAlways = function(userNames) {
    var prev = new Set(getUsersToRemoveAlways());
    for (let uN of userNames) prev.delete(uN);
    var toStore = Array.from(prev);
    setUsersToRemoveAlways(toStore);
};

var setUsersToRemoveAlways = function(userNames) {
    localStorage.setItem(USERS_TO_REMOVE_STORAGE_NAME, JSON.stringify(userNames));
};


var getUsersToRemoveAlways = function() {
    return JSON.parse(localStorage.getItem(USERS_TO_REMOVE_STORAGE_NAME)) || [];
    
};



removeUsersPosts( getUsersToRemoveAlways() );

//console.log("removing users "+ getUsersToRemoveAlways() +" always");










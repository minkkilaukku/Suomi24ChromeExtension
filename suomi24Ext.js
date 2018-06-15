const USERS_TO_REMOVE_STORAGE_NAME = "lankki_miukku_aina_poistettavat_nimet";
const USERS_HIGHLIGHTS_STORAGE_NAME = "lankki_miukku_korostus_värit";

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
                
                //elem.after(makeRemovedP(userName, type)); //put the removedP as a child
                //elem.parentElement.removeChild(elem);
                //elem.style.display = "none";
                //hide all children, but leave the container and put the removedP in it
                for (let child of elem.children) {
                    child.style.display = "none";
                }
                elem.appendChild(makeRemovedP(userName, type));
            }
        }
    };
    
    var answers = document.querySelectorAll(".answer-container");
    var comments = document.querySelectorAll(".comment-container");
    
    for (let ans of answers) {
        handlePostElement(ans, "viesti");
    }
    
    for (let comm of comments) {
        handlePostElement(comm, "kommentti");
    }
    
};


/**
*  @param hlMap: object where keys are user names and values the color to use highlighting
*/
var highlightUserPosts = function(hlMap) {
    
    
    var handlePostElement = function(elem, type="viesti") {
        let userNameCont = elem.getElementsByClassName("user-info-name")[0];
        if (userNameCont) {
            let nameLinks = userNameCont.getElementsByTagName("a"); //registered users' name inside a
            let userNameOfElem;
            if (nameLinks[0]) {
                userNameOfElem = nameLinks[0].textContent.trim();
            } else {
                userNameOfElem = userNameCont.textContent.trim();
            }
            
            elem.style.background = hlMap[userNameOfElem] || "";
            
        }
    };
    
    var startMsgHead = document.querySelectorAll(".user-info-big")[0];
    var startMsg = document.querySelectorAll(".thread-text")[0];
    var answers = document.querySelectorAll(".answer-container");
    var comments = document.querySelectorAll(".comment-container");
    if (startMsgHead) {
        let nameOfElem;
        let nameLinks = startMsgHead.getElementsByTagName("a");
        if (nameLinks[0]) {
            nameOfElem = nameLinks[0].textContent.trim();
        } else {
            nameOfElem = startMsgHead.getElementsByTagName("p")[0].textContent.trim();
        }
        
        startMsgHead.style.background = hlMap[nameOfElem] || "";
        startMsg.style.background = hlMap[nameOfElem] || "";
        
    }
    
    for (let ans of answers) {
        handlePostElement(ans, "viesti");
    }
    
    for (let comm of comments) {
        handlePostElement(comm, "kommentti");
    }
    
};


/** Get a list of objects {username, postCount} */
var getAllNamesOnPostsData = function() {
    var all = Array.from(document.querySelectorAll("p.user-info-name")).map(x=>x.textContent.trim());
    var usersOb = {}; //this counts the messages for each username
    for (let u of all) {
        if (!usersOb[u]) usersOb[u] = 0;
        usersOb[u] += 1
    }
    var res = [];
    for (let u in usersOb) {
        res[res.length] = {username: u, postCount: usersOb[u]};
    }
    return res;
};


var cachedUserEls = [];
var cachedUserName = null;
var cachedSortBy = null;

var getUserPostElems = function(userName, sortBy) {
    if (userName === cachedUserName && sortBy === cachedSortBy) {
        return cachedUserEls;
    } else {
        var userEls = Array.from(document.querySelectorAll("p.user-info-name"));
        var userNames = userEls.map(x=>x.textContent.trim());

        if (userName.length>0) { //empty userName means get all
            for (let i=0; i<userNames.length; i++) {
                if (userNames[i]!==userName) {
                    delete userEls[i];
                }
            }
            userEls = userEls.filter(x=>x);
        }

        if (sortBy==="time") {
            let timeStampGetter = el=>{
                var tSEl = el.parentElement.getElementsByClassName("user-info-timestamp")[0];
                if (tSEl) return tSEl.textContent.trim();
                return "1.1.1900 00:00";
            };
            let dateMaker = ts => {
                var [da, ti] = ts.split(" ");
                var [day, month, year] = da.split(".");
                var [hour, minute] = ti.split(":");
                //month is zero-based (doesn't affect ordering but make it still correct)
                return new Date(year, month-1, day, hour, minute, 0); //-1 converts to number

            };
            //put a date object to each element as property, so it's easy to sort them
            userEls.forEach( el=>el.datePosted = dateMaker(timeStampGetter(el)) );
            userEls.sort((a,b)=>a.datePosted-b.datePosted);
        }
        
        cachedUserEls = userEls;
        cachedUserName = userName;
        cachedSortBy = sortBy;
        
        return userEls;
    }
};

/** Get the container parent of a user-name element
* (this way also the removed messages (where user-info is hidden) will be scrolled to)
*/
var getContainerOfUserEl = function(userEl) {
    //to avoid infinite loop
    //if for some reason the userEl isn't inside an answer or comment container
    //it should always be 2 levels up, but find like this to be sure
    var maxLevelsUp = 4;
    var levelUpCounter = 0;
    var res = userEl;
    while (res && res.classList
           && !res.classList.contains("answer-container")
           && !res.classList.contains("comment-container")
           && levelUpCounter<maxLevelsUp) {
        res = res.parentElement;
        levelUpCounter++;
    }
    return res;
};

/**
* scroll the page to the @postIndex'th (in the ordering given by @sortBy)
* post of user @userName (the container of the post is used to give the scroll position).
* (empty userName means consider all posts)
*/
var scrollToUserPost = function(userName, postIndex, sortBy) {
    var userEls = getUserPostElems(userName, sortBy);
    var elsN = userEls.length;
    if (elsN>0) {
        var elInd = (postIndex%elsN+elsN)%elsN;
        var container = getContainerOfUserEl(userEls[elInd]);
        if (container) {
            var topPos = container.getBoundingClientRect().top + window.scrollY;
            window.scrollTo(0, topPos);
        }
    }
    
};



var sendGotUsersToRemoveAlwaysMsg = function(userNames) {
    chrome.runtime.sendMessage({
        gotUsersToRemoveAlways: true, 
        userNames: userNames
    });
};

var sendGotUserHLsMsg = function(hlMap) {
    chrome.runtime.sendMessage({
        gotUserHLs: true, 
        hlMap: hlMap
    });
};

var gotMessage = function(msg, sender, sendResponse) {
    //console.log(msg);
    if (msg.removePosts == true) {
        removeUsersPosts(msg.userNames);
        if (msg.removeAlways == true) {
            addUsersToRemoveAlways(msg.userNames)
        }
    } else if (msg.getAlwaysRemoveUsers) {
        //port gets nulled out, so can't use sendResponse, must send a new message
        getUsersToRemoveAlways(function(res) {sendGotUsersToRemoveAlwaysMsg(res);});
    } else if (msg.removeFromAlwaysToRemove) {
        removeUsersToRemoveAlways(msg.userNames);
    } else if (msg.clearAlwaysRemoves) {
        setUsersToRemoveAlways([]);
    } else if (msg.highlightUsers) {
        highlightUserPosts(msg.hlMap);
        storeUserHighlights(msg.hlMap);
    } else if (msg.getUserHighlights) {
        //TODO must send a new message when change hl getting to chrome.storage, too
        getStoredUserHighlights(res=>sendGotUserHLsMsg(res));
    } else if (msg.getHintUsers) {
        sendResponse(getAllNamesOnPostsData());
    } else if (msg.findUserPost) {
        scrollToUserPost(msg.username, msg.postIndex, msg.sortBy);
    }
    
    
};

chrome.runtime.onMessage.addListener(gotMessage);


var addUsersToRemoveAlways = function(userNames) {
    getUsersToRemoveAlways(function(prev) {
        var toStore = Array.from(new Set( prev.concat(userNames) ));
        setUsersToRemoveAlways(toStore);
    });
};

var removeUsersToRemoveAlways = function(userNames) {
    getUsersToRemoveAlways(function(res) {
        var prevSet = new Set(res);
        for (let uN of userNames) prevSet.delete(uN);
        var toStore = Array.from(prevSet);
        setUsersToRemoveAlways(toStore);
    });
};


//---- storing ----------------------------------------------------------------------

var setUsersToRemoveAlways = function(userNames) {
    var setOb = {};
    setOb[USERS_TO_REMOVE_STORAGE_NAME] = userNames;
    chrome.storage.sync.set(setOb);
    //localStorage.setItem(USERS_TO_REMOVE_STORAGE_NAME, JSON.stringify(userNames));
};

/** Get the stored array of usernames to remove always and pass them to the callBack once received.
*  @param callBack: a function that should be called with the gotten array as parameter.
*/
var getUsersToRemoveAlways = function(callBack) {
    
    chrome.storage.sync.get([USERS_TO_REMOVE_STORAGE_NAME], function(res) {
        var users = res[USERS_TO_REMOVE_STORAGE_NAME] || [];
        callBack(users);
    });
    //return JSON.parse(localStorage.getItem(USERS_TO_REMOVE_STORAGE_NAME)) || [];
    
};


var storeUserHighlights = function(hlMap) {
    var setOb = {};
    setOb[USERS_HIGHLIGHTS_STORAGE_NAME] = hlMap;
    chrome.storage.sync.set(setOb);
    
    //localStorage.setItem(USERS_HIGHLIGHTS_STORAGE_NAME, JSON.stringify(hlMap));
    
}

/** Get the stored map of {username: hlColor} and pass them to the callBack once received.
*  @param callBack: a function that should be called with the result as parameter.
*/
var getStoredUserHighlights = function(callBack) {
    chrome.storage.sync.get([USERS_HIGHLIGHTS_STORAGE_NAME], function(res) {
        var hlMap = res[USERS_HIGHLIGHTS_STORAGE_NAME] || [];
        callBack(hlMap);
    });
    
    //return JSON.parse(localStorage.getItem(USERS_HIGHLIGHTS_STORAGE_NAME)) || {};
    
};


/** Get the stored object for info about keyboard searching:
 * { useKeyboard:boolean, prevKeyCode:{code, ctrl, alt}, nextKeyCode:{code, ctrl, alt} }
 */
var getStoredKeyboardFindingMsg = function(callBack) {
    var stKey = "lankki_miukku_nappaimisto_etsiminen";
    chrome.storage.sync.get([stKey], function(res) {
            callBack(res[stKey]);
    });

};
//---------------------------------------------------------------------------------


var setKeyboardFindMsgListener = function(ob) {
    if (ob.useKeyboard) {
        var postInd = 0; //assume want to go to the most recent (with prev button) first
        
        var checkKeyCodeFunc = function(keyCode, event) {
            return event.keyCode === keyCode.code
                && event.altKey === keyCode.alt
                && event.ctrlKey === keyCode.ctrl
                && event.shiftKey === keyCode.shift;
        };
        
        var onKeyDownFunc = function(postIndIncr, event) {
            postInd += postIndIncr;
            scrollToUserPost("", postInd, "time");
            event.preventDefault();
        };
        var keyListener = function(event) {
            if (checkKeyCodeFunc(ob.prevKeyCode, event)) {
                onKeyDownFunc(-1, event);
            } else if (checkKeyCodeFunc(ob.nextKeyCode, event)) {
                onKeyDownFunc(1, event);
            }
        };
        
        document.body.addEventListener("keydown", keyListener);
    }
};





getUsersToRemoveAlways( res => removeUsersPosts(res) );
getStoredUserHighlights( res => highlightUserPosts(res) );

// set keyboard control of finding most recent posts
getStoredKeyboardFindingMsg( setKeyboardFindMsgListener );


//TODO swear word filter
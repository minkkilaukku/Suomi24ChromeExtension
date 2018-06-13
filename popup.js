

var divs = [document.getElementById("findPosts"), document.getElementById("highlightPosts"), document.getElementById("hidePosts")];

var tabs = Array.from(document.getElementById("tabs").children);

var showTab = function(ind) {
    for (let d of divs) d.style.display = "none";
    divs[ind].style.display = "block";
    
    for (let t of tabs) t.setAttribute("active", false);
    tabs[ind].setAttribute("active", true);
};

var initTabs = function() {
    let tabI = 0;
    for (tab of tabs) {
        tab.onclick = showTab.bind(tab, tabI);
        tabI++;
    }
    showTab(0);
};

initTabs();


/** Send a message to the active tab in the current window
* @param msg: the message object
* @param callBack: optional, a function that should get called with a response on the receiving end
*/
var sendMsg = function(msg, callBack) {
    var gotTabs = function(tabs) {
        for (let tab of tabs) chrome.tabs.sendMessage(tab.id, msg, callBack);
    };
    chrome.tabs.query({active: true, currentWindow: true}, gotTabs);
};







// ------ hide posts -----------------------------------------------------------------------------------
{

var userNameInput = document.getElementById("userNamesInput");
var alwaysRemoveList = document.getElementById("alwaysRemoveUsersContainer");

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
//can't use callBack, since the port gets nulled out while getting the values from chrome.storage
sendMsg({getAlwaysRemoveUsers: true});
    //function(response) {
    //debugger;
    //if (response) {
    //    setAlwaysRemoveUsers(response);
    //}
//});

}
// -----------------------------------------------------------------------------------------------------





//----------------------- highlight posts -------------------------------------------------------------
{
    
var hLNameInput = document.getElementById("hlNameInput");
var hLColorInput = document.getElementById("hlColorInput");
var hLSetButton = document.getElementById("hlSetButton");
var hlList = document.getElementById("hlList");

hLSetButton.onclick = function() {
    let uN = hLNameInput.value.trim();
    if (uN.length) {
        addUserHl(uN, hLColorInput.value);
        updateUserHighlights();
    }
};


document.getElementById("clearAllHlsButton").onclick = function() {
    hlList.innerHTML = "";
    updateUserHighlights();
};


var addUserHl = function(userName, color) {
    var el = document.createElement("div");
    el.classList.add("hlListElem");
    let elLab = document.createElement("label");
    elLab.textContent = userName;
    var elColorInput = document.createElement("input");
    elColorInput.type = "color";
    elColorInput.value = color;
    elColorInput.oninput = function() {
        updateUserHighlights();
    };
    elLab.appendChild(elColorInput);
    el.appendChild(elLab);
    
    
    var remButton = document.createElement("button");
    remButton.textContent = "X";
    remButton.onclick = function() {
        try {hlList.removeChild(el);} catch(err){}
        updateUserHighlights();
    };
    el.appendChild(remButton);
    
    hlList.appendChild(el);
    hlList.scrollTop = hlList.scrollHeight;
};


var getHlMap = function() {
    var hlMap = {};
    for (let el of hlList.children) {
        let uN = el.getElementsByTagName("label")[0].textContent;
        let color =  el.getElementsByTagName("input")[0].value;
        hlMap[uN] = color;
    }
    return hlMap;
};

var updateUserHighlights = function() {
    sendMsg({highlightUsers: true, hlMap: getHlMap()});
};



//querying the already existing highlights
sendMsg({getUserHighlights: true}, function(response) {
    if (response) {
        for (let uN of Object.getOwnPropertyNames(response)) {
            addUserHl(uN, response[uN]);
        }
    }
});

}
//--------------------------------------------------------------------------------------------




//----------------------- find posts -------------------------------------------------------------
{

var findNameInput = document.getElementById("finduserNameInput");
var findPrevButton = document.getElementById("findUserPrevButton");
var findNextButton = document.getElementById("findUserNextButton");
var findUserSortSelect = document.getElementById("findUserSortSelect");
    
findUserSortSelect.getSelection = function() {
    for (let c of this.children) {
        if (c.selected) return c;
    }
    return null;
};
    
/** number that tells how manyeth message want to find (not bounded, can also be negative)
 *  need to wrap over total post count when used.
 * initially null, since we want the first post and hence has to be initialized w.r.t first button press
*/
var postIndex = null;
    
var findButtonClick = function(postIndIncr) {
    //initialize postIndex to the opposite direction if want to go frwrd and to 0 if want to go bkwrd
    //so it will be set to correct when incremented
    if (postIndex === null) postIndex = postIndIncr>0 ? -postIndIncr : 0;
    postIndex += postIndIncr;
    var uN = findNameInput.value.trim();
    
    let selectedSortEl = findUserSortSelect.getSelection();
    let selectedSort = selectedSortEl ? selectedSortEl.value : null;
    sendMsg({findUserPost: true, username: uN, postIndex: postIndex, sortBy: selectedSort});
    
};
    
findPrevButton.onclick = function() {
    findButtonClick(-1);
};
    
findNextButton.onclick = function() {
    findButtonClick(1);
};
    
findNameInput.oninput = function() {
    postIndex = null; //start anew for new username input
}

}
//--------------------------------------------------------------------------------------------

    
    


/** Not used, since autocompletion done with datalist, but if we would like to render
 * the options differently (for example show number of messages of each user),
 * autoComplete.js would give means for that //TODO
 */
var hideAutoComplete;
var hlAutoComplete;
//var findAutoComplete; //TODO maybe if this way?

var setAutoCompletes = function(usersResponse) {
    
    //***datalist-way: ***
    let dList = document.createElement("datalist");
    for (let u of usersResponse) {
        let dEl = document.createElement("option");
        dEl.value = u.username;
        dEl.textContent = "("+u.postCount+")";
        dList.appendChild(dEl);
    }

    dList.setAttribute("id", "userNamesDataList");
    document.body.appendChild(dList);

    userNameInput.setAttribute("list", "userNamesDataList");
    hlNameInput.setAttribute("list", "userNamesDataList");
    findNameInput.setAttribute("list", "userNamesDataList");
    //*** --- ***
    
    
    //--- autoComplete.js -way --- //TODO new usersResponse, get username as usersResponse[i].username
    /*
    hideAutoComplete = new autoComplete({
        selector: userNameInput,
        minChars: 1,
        source: function(term, suggest){
            term = term.toLowerCase();
            var choices = userNames;
            var matches = [];
            for (i=0; i<choices.length; i++)
                if (~choices[i].toLowerCase().indexOf(term)) matches.push(choices[i]);
            suggest(matches);
        }
    });

    hlAutoComplete = new autoComplete({
        selector: hLNameInput,
        minChars: 1,
        source: function(term, suggest){
            term = term.toLowerCase();
            var choices = userNames;
            var matches = [];
            for (i=0; i<choices.length; i++)
                if (~choices[i].toLowerCase().indexOf(term)) matches.push(choices[i]);
            suggest(matches);
        }
    });
    */
    //--- *** ---
       
};


//---- get username hints --------------------------------------
sendMsg({getHintUsers: true}, function(response) {
    //console.log("got response ",response);
    if (response) {
        let keyForStorage = "lankki_miukku_user_name_sort";
        chrome.storage.sync.get([keyForStorage], function(storeRes) {
            let valFromStore = storeRes[keyForStorage];
            if (valFromStore==="alphabetical") {
                response.sort((a,b)=>a.username.toLowerCase().localeCompare(b.username.toLowerCase()));
                //console.log("got alphabetical and sorted to", response);
            }
            setAutoCompletes(response);
        });
    }
});



//listen for messages
chrome.runtime.onMessage.addListener(
    function(msg, sender, sendResponse) {
        if (msg.gotUsersToRemoveAlways) {
            //console.log("got message about users to remove always: ",msg.userNames);
            setAlwaysRemoveUsers(msg.userNames);
        }
    }
);







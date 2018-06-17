

var divs = [document.getElementById("findPosts"), document.getElementById("highlightPosts"), document.getElementById("hidePosts"), document.getElementById("statisticsPosts")];

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

//var userNameInput = document.getElementById("userNamesInput");
var hideUserNameInputDiv = document.getElementById("hideUsersInputDiv");
var alwaysRemoveList = document.getElementById("alwaysRemoveUsersContainer");

hideUserNameInputDiv.childrenReady = false;
    
var checkToAlwaysRemove = function(uN) {
    sendMsg({removePosts: true, userNames: [uN], removeAlways: true});
    var prevNameSet = new Set (Array.from(alwaysRemoveList.children).map(x=>x.textContent));
    if (!prevNameSet.has(uN)) addAlwaysRemoveUser(uN);
};
    
var unCheckToAlwaysRemove = function(uN) {
    var elsOfUn = (Array.from(alwaysRemoveList.children).filter(x=>x.textContent===uN));
    if (elsOfUn.length) elsOfUn[0].click(); //click to remove
};

/* not used, as checkboxes are used to always hide
document.getElementById("removeUsersPostsButton").onclick = function () {
    //TODO
    var users = getHideCheckedUserNames();
    //var users = userNameInput.value.split(",").map(w=>w.trim()).filter(x=>x.length);
    sendMsg({removePosts: true, userNames: users});
};

document.getElementById("alwaysRemoveUsersPostsButton").onclick =  function() {
    var users = getHideCheckedUserNames();
    //var users = userNameInput.value.split(",").map(w=>w.trim()).filter(x=>x.length);
    sendMsg({removePosts: true, userNames: users, removeAlways: true});
    var prevNameSet = new Set (Array.from(alwaysRemoveList.children).map(x=>x.textContent));
    for (let uN of users) {
        if (!prevNameSet.has(uN)) addAlwaysRemoveUser(uN);
    }
};
*/

document.getElementById("clearAlwaysRemoveButton").onclick = function () {
    sendMsg({clearAlwaysRemoves: true});
    setAlwaysRemoveUsers([]);
    setHideUserCheckeds(new Set());
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


    
var fillHideUserDiv = function(userNames) {
    for (let uOb of userNames) {
        let el = document.createElement("div");
        hideUserNameInputDiv.appendChild(el);
        let elLab = document.createElement("label");
        el.appendChild(elLab);
        let elCheck = document.createElement("input");
        elCheck.type = "checkbox";
        elCheck.oninput = function() {
            if (elCheck.checked) {
                checkToAlwaysRemove(uOb.username);
            } else {
                unCheckToAlwaysRemove(uOb.username);
            }
        };
        elLab.appendChild(elCheck);
        elLab.appendChild(document.createTextNode(uOb.username));
    }
    hideUserNameInputDiv.childrenReady = true;
    if (hideUserNameInputDiv.childrenToCheck) {
        setHideUserCheckeds(hideUserNameInputDiv.childrenToCheck);
    }
};

/** Set the username checkboxes checked-values to whether they are in the set or not */
var setHideUserCheckeds = function(setOfUsernames) {
    for (let c of hideUserNameInputDiv.getElementsByTagName("input")) {
        if (c.getAttribute("type")==="checkbox") {
            c.checked = setOfUsernames.has(c.parentElement.textContent);
        }
    }
};
    
var getHideCheckedUserNames = function() {
    return Array.from(hideUserNameInputDiv.children).filter(el=>{
        let checkBox = el.getElementsByTagName("input")[0];
        return checkBox && checkBox.checked;
    }).map(el => el.textContent.trim());
};

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
    
hlColorInput.oninput = function() {
    hlSetButton.focus();
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
    

var setUserHlsTo = function(hlMap) {
    hlList.innerHTML = "";
    for (let uN in hlMap) {
        addUserHl(uN, hlMap[uN]);
    }
}



//querying the already existing highlights
sendMsg({getUserHighlights: true});
    
    {
    //can't use callback (port gets nulled), handled by receivin a new message
    //this is listened for at chrome.runtime.onMessage
    
    //function(response) {
    //if (response) {
    //    for (let uN of Object.getOwnPropertyNames(response)) {
    //        addUserHl(uN, response[uN]);
    //    }
    //}
//});
    }

}
//--------------------------------------------------------------------------------------------




//----------------------- find posts -------------------------------------------------------------
{
    
var findNameInput = document.getElementById("finduserNameInput");
var findPrevButton = document.getElementById("findUserPrevButton");
var findNextButton = document.getElementById("findUserNextButton");
var findUserSortSelect = document.getElementById("findUserSortSelect");

//get the checked radiobutton
findUserSortSelect.getSelectedValue = function() {
    for (let c of this.getElementsByTagName("input")) {
        if (c.checked) return c.value;
    }
    return "";
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
    
    sendMsg({findUserPost: true, username: uN,
             postIndex: postIndex,
             sortBy: findUserSortSelect.getSelectedValue()});
    
};
    
findPrevButton.onclick = function() {
    findButtonClick(-1);
};
    
findNextButton.onclick = function() {
    findButtonClick(1);
};
    
findNameInput.oninput = function() {
    postIndex = null; //start anew for new username input
};

}
//--------------------------------------------------------------------------------------------

    
    
// -------------- posts statistics -------------------------------------------------------------

var statCanvas = document.getElementById("statCanvas");
var statTimeRange = document.getElementById("statTimeRange");
var statTimeText = document.getElementById("statTimeText");
var statToolTip = document.getElementById("statToolTip");

var getPostsPerDay = function(posts, days) {
    
    var currDate = new Date();
    currDate.setHours(23);
    currDate.setMinutes(59);
    currDate.setMilliseconds(999); //set to end of today to make day boundaries correct
    var res = new Array(days).fill(null).map((_,i)=>{
        var dateForOb = new Date();
        dateForOb.setDate(dateForOb.getDate()-(days-1-i));
        return {postCount:0, date:dateForOb};
    });
    var MS_PER_DAY = 1000*60*60*24;
    for (let post of posts) {
        let daysAgo = ((currDate-post.date)/MS_PER_DAY)|0;
        if (daysAgo<res.length && daysAgo>=0) { //don't count posts in future, either :)
            res[res.length-1-daysAgo].postCount += 1; //order so that last is the current day
        }
    }
    return res;
    
};


var getDaysAgo = function(date) {
    var currDate = new Date();
    currDate.setHours(23);
    currDate.setMinutes(59);
    currDate.setMilliseconds(999);
    var MS_PER_DAY = 1000*60*60*24;
    return ((currDate-date)/MS_PER_DAY)|0;
};

var dateDdMmYy = function(date, sep="-") {
  var mm = date.getMonth() + 1;
  var dd = date.getDate();
  return [(dd>9 ? "" : "0") + dd,
          (mm>9 ? "" : "0") + mm,
          date.getFullYear()%100
         ].join(sep);
};

var max = arr => Math.max.apply(Math, arr);

/** How many x-values to label when there are days many bars */
var getXStepsForDays = function(days) {
    //steps means that there are +1 labels drawn
    
    if (days<=5) return days+1; //can fit for every day
    if (days<=7) return 2;
    if (days===8) return 3;
    if (days===9) return 4;
    if (days<=12) return 3;
    return 4;
};


var postsForStat = []; //this will be set with message;

var barChartVars = { //this will be set in draw
    y0: 0,
    x0: 0,
    y1: 0,
    x1: 0,
    barW: 0,
    postsPerDay: []
};

var getOnBar = function(x, y) {
    if (barChartVars.x0<=x && x<=barChartVars.x1 && barChartVars.y1<=y && y<=barChartVars.y0) {
        return barChartVars.postsPerDay[((x-barChartVars.x0)/barChartVars.barW)|0];
    }
    return null;
};

var drawStat = function() {
    
    let posts = postsForStat;
    var ctx = statCanvas.getContext("2d");
    var w = statCanvas.width;
    var h = statCanvas.height;
    ctx.clearRect(0,0,w,h);
    var days = posts.length ? (getDaysAgo(posts[0].date)+1) : 1;
    var maxDays = +statTimeRange.value;
    if (days>maxDays) days = maxDays;
    console.log("days = "+days, typeof days);
    var postsPerDay = barChartVars.postsPerDay = getPostsPerDay(posts, days);
    
    var y0 = barChartVars.y0 = h-30;
    var x0 = barChartVars.x0 = 30;
    var y1 = barChartVars.y1 = 10;
    var x1 = barChartVars.x1 = w-20;
    var barW = barChartVars.barW = (x1-x0)/days;
    var drawBarW = Math.max(barW, 1); //draw at least 1px bars
    var maxP = max(postsPerDay.map(({postCount})=>postCount));
    var sclY = (y0-y1)/(maxP||1);
    var y=50;
    var x = x0;
    ctx.fillStyle = "#00ff60";
    ctx.strokeStyle = "#222222";
    ctx.lineWidth = 1;
    for (let ob of postsPerDay) {
        let yTop = y0-(sclY*ob.postCount);
        let barH = y0 -yTop;
        
        ctx.fillRect(x, yTop, drawBarW, barH);
        ctx.strokeRect(x, yTop, drawBarW, barH);
        x += barW;
    }
    
    ctx.font = "10px Helvetica";
    
    //y-axis
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x0, y1);
    ctx.stroke();
    
    
    ctx.textAlign = "right";
    var marginYAxis = 5;
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#000000";
    var ySteps = 4;
    if (maxP<3) ySteps = maxP+1;
    for (let i=0; i<=ySteps; i++) {
        let per = i/ySteps;
        let yCoord = y0 - (y0-y1)*per;
        let yVal = Math.round(maxP*per);
        ctx.fillText(yVal, x0-marginYAxis, yCoord);
    }
    
    
    //x-axis
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y0);
    ctx.stroke();
    
    
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    var marginXAxis = 5;
    ctx.fillStyle = "#000000";
    var xSteps = getXStepsForDays(days);
    console.log("got "+xSteps+" x-steps for "+days);
    for (let i=0; i<=xSteps; i++) {
        let per = i/xSteps;
        let xCoord = x0 + (x1-x0)*per;
        var indForDate = Math.floor((postsPerDay.length-1)*per);
        let xVal = dateDdMmYy(postsPerDay[indForDate].date);
        ctx.fillText(xVal, x0+barW*(indForDate+0.5), y0+marginXAxis); //center for bar at ind
    }
};


statCanvas.onmousemove = function(evt) {
    var x = evt.clientX-statCanvas.offsetLeft;
    var y = evt.clientY-statCanvas.offsetTop;
    var onBar = getOnBar(x, y);
    if (onBar) {
        statToolTip.innerHTML = "<span class='date'>"+dateDdMmYy(onBar.date)+"</span><br>"
            +"<span class='postCount'>"+onBar.postCount+"</span>";
        statToolTip.style.display = "block";
        if (evt.clientX<150) {
            statToolTip.style.left =(evt.clientX+15)+"px";
        } else {
            let toolTipBdd = statToolTip.getBoundingClientRect();
            statToolTip.style.left = (evt.clientX-toolTipBdd.width-15)+"px";
        }
        statToolTip.style.top = evt.clientY+"px";
    } else {
        statToolTip.style.display = "none";
    }
};

statCanvas.onmouseout = function(evt) {
    statToolTip.style.display = "none";
};

var updateStatText = function() {
    statTimeText.innerHTML = "<span class='daysNumber'>"+statTimeRange.value+"</span> päivää";
}

statTimeRange.oninput = function() {
    updateStatText();
    drawStat();
};


/* this can be done with response function, since not gotten from storage */
sendMsg({getPostsStat: true}, function(statData) {
    if (statData) {
        postsForStat = statData.map(ob=>{return {username: ob.username, date: new Date(ob.date)}});
        statTimeRange.max = postsForStat[0] ? getDaysAgo(postsForStat[0].date)+1 : 1;
        updateStatText();
        drawStat();
    }
});


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

    //userNameInput.setAttribute("list", "userNamesDataList");
    fillHideUserDiv(usersResponse);
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
            var toCheck = new Set(msg.userNames);
            if (hideUserNameInputDiv.childrenReady) {
                setHideUserCheckeds(toCheck);
            } else {
                hideUserNameInputDiv.childrenToCheck = toCheck;
            }
        } else if (msg.gotUserHLs) {
            setUserHlsTo(msg.hlMap);
        }
    }
);









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
    
    
document.getElementById("downloadHideAlwaysNames").onclick = function() {
    var uNs = Array.from(alwaysRemoveList.children).map(x=>x.textContent.trim());
    var link = document.getElementById("downloadHideAlwaysNamesLink");
    link.setAttribute("href", "data:text/plain;charset=utf-8,"+encodeURIComponent(JSON.stringify(uNs)));
    link.click();
    //window.open();
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
{
const STAT_CANVAS_W = 280;
const STAT_CANVAS_H = 150;



var statCanvas = document.getElementById("statCanvas");
statCanvas.width = STAT_CANVAS_W;
statCanvas.height = STAT_CANVAS_H;
//var statTimeRange = document.getElementById("statTimeRange");
var statTimeText = document.getElementById("statTimeText");
var statToolTip = document.getElementById("statToolTip");
var statTimeUnitDiv = document.getElementById("statTimeUnit");

var slider = new Slider();
document.getElementById("twoButtonSliderHolder").appendChild(slider.getElement());
window.addEventListener("load", _=>slider.updateButts());


var dateMmYy = function(date, sep="-") {
    var mm = date.getMonth() + 1;
    return [(mm>9 ? "" : "0") + mm,
            date.getFullYear()%100
           ].join(sep);
};

var dateDdMmYy = function(date, sep="-") {
    var mm = date.getMonth() + 1;
    var dd = date.getDate();
    return [(dd>9 ? "" : "0") + dd,
            (mm>9 ? "" : "0") + mm,
            date.getFullYear()%100
           ].join(sep);
};

var dateDdMmHh = function(date) {
    var mm = date.getMonth() + 1;
    var dd = date.getDate();
    var hh = date.getHours();
    var minMin = date.getMinutes();
    return (dd>9 ? "" : "0") + dd + ""+
            (mm>9 ? "" : "0") + mm +" "+
            (hh>9 ? "" : "0") + hh;
};

var dateDdMmHhMm = function(date) {
    var mm = date.getMonth() + 1;
    var dd = date.getDate();
    var hh = date.getHours();
    var minMin = date.getMinutes();
    return (dd>9 ? "" : "0") + dd + ""+
            (mm>9 ? "" : "0") + mm +" "+
            (hh>9 ? "" : "0") + hh +":"+
            (minMin>9 ? "" : "0") + minMin;
};

/*
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
*/
    
/** info for different time units,
* name,
* how many milliseconds it is,
* a function for getting a string value of a date to use,
* a function giving the a date to use as upper bound (and where to subtract values to get previous dates)
*/
var TIME_UNIT_DATA = {
    "tenMinutes": {
        name: "10 minuuttia",
        nameShowAtRange: "10 minuuttista",
        inMs: 1000*60*10,
        dateToStr: dateDdMmHhMm,
        getCurrUpBoundDate: function() {
            var d = new Date();
            d.setSeconds(59);
            d.setMilliseconds(999);
            return d;
        }
    },
    "hour": {
        "name": "tunti",
        nameShowAtRange: "tuntia",
        inMs: 1000*60*60,
        dateToStr: dateDdMmHh,
        getCurrUpBoundDate: function() {
            var d = new Date();
            d.setMinutes(59);
            d.setSeconds(59);
            d.setMilliseconds(999);
            return d;
        }
    },
    "day": {
        name: "päivä",
        nameShowAtRange: "päivää",
        inMs: 1000*60*60*24,
        dateToStr: dateDdMmYy,
        getCurrUpBoundDate: function() {
            var d = new Date();
            d.setHours(23);
            d.setMinutes(59);
            d.setSeconds(59);
            d.setMilliseconds(999);
            return d;
        }
    },
    "month": {
        name: "kuukausi",
        nameShowAtRange: "kuukautta",
        inMs: 1000*60*60*24*(7*31+4*30+28+1*0.25*0.99)/12, //month average days (with leap years too)
        dateToStr: dateMmYy,
        getCurrUpBoundDate: function() {
            var d = new Date();
            d.setMonth(d.getMonth()+1);
            d.setDate(1);
            d.setHours(0);
            d.setMinutes(0);
            d.setSeconds(0);
            d.setSeconds(-1); //makes the last of last month
            d.setMilliseconds(999);
            return d;
        }
    },
};



//TODO better way: for each post get the ind (=date group) it will be,
//     then have only bars that have positive number of posts
//     and when drawing get the x-position from the date (given low and up dates)
/**
*  some sort of endBar ad beginBar w.r.t to what would be the full amount of bars in the previous version
*  beginBar > endBar
*/
var getPostsPerTimeUnit = function(posts, timeUnit, beginBar, endBar) {
    let tUD = TIME_UNIT_DATA[timeUnit] || TIME_UNIT_DATA["day"];
    var currDate = tUD.getCurrUpBoundDate();
    var dateToStr = tUD.dateToStr;
    var UNIT_IN_MS = tUD.inMs;
    
    var dateNowInt = new Date()-0;
    var dateBeginInt = dateNowInt-UNIT_IN_MS*beginBar;
    var dateEndInt = dateNowInt-UNIT_IN_MS*endBar;
    var bars = beginBar-endBar; //this would be the length of the total [beginBar,,,,..,.d endBar] arr
    res = []; //here to only put the needed ones, let other indices be empty
    /*
    var res = new Array(bars).fill(null).map((_,i)=>{
        var dateForOb = new Date(dateNowInt - (bars-1-i)*UNIT_IN_MS);
        return {postCount:0, date:dateForOb, dateStr: dateToStr(dateForOb)};
    });
    */
    
    for (let post of posts) {
        let unitsAgo = ((currDate-post.date)/UNIT_IN_MS)|0;
        if (unitsAgo<=beginBar && unitsAgo>=endBar) {
            let putInd = bars-1 - (beginBar-unitsAgo);
            if (!res[putInd]) {
                let dateForOb = new Date(dateEndInt - (beginBar-1-putInd)*UNIT_IN_MS);
                res[putInd] = {
                    postCount:0,
                    date: dateForOb,
                    dateStr: dateToStr(dateForOb)
                };
            }
            res[putInd].postCount += 1;
        }
    }
    
    res.totalRange = bars;
    
    res.getDateStrForInd = function(ind) {
        return dateToStr(new Date(dateEndInt - (beginBar-1-ind)*UNIT_IN_MS));
    };
    
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

var getTimeUnitsAgo = function(date, timeUnit) {
    var tUD = TIME_UNIT_DATA[timeUnit] || TIME_UNIT_DATA["day"];
    var currDate = tUD.getCurrUpBoundDate();
    var MS_PER_UNIT = tUD.inMs;
    return ((currDate-date)/MS_PER_UNIT)|0;
};


var max = arr => Math.max.apply(Math, arr);

/** How many x-values to label when there are days many bars */
var getXStepsForDays = function(days) {
    //steps means that there are +1 labels drawn
    if (bars===0) return -1; //no steps if no bars
    if (days<=5) return days+1; //can fit for every day
    if (days<=7) return 2;
    if (days===8) return 3;
    if (days===9) return 4;
    if (days<=12) return 3;
    return 4;
};

/** How many x-values to label when there are days many bars */
var getXStepsForTimeUnits = function(bars, timeUnit) {
    //steps means that there are +1 labels drawn
    if (bars===0) return -1; //no steps if no bars
    if (bars<=5) return bars+1; //can fit for every day
    if (bars<=7) return 2;
    if (bars===8) return 3;
    if (bars===9) return 4;
    if (bars<=12) return 3;
    return 4;
    
    //TODO
};


var postsForStat = []; //this will be set with message;

var barChartVars = { //this will be set in draw
    y0: 0,
    x0: 0,
    y1: 0,
    x1: 0,
    barW: 0,
    postsPerUnit: []
};

var getOnBar = function(x, y) {
    //console.log("getting with "+x+", "+y);
    if (barChartVars.x0<=x && x<=barChartVars.x1 && barChartVars.y1<=y && y<=barChartVars.y0) {
        return barChartVars.postsPerUnit[((x-barChartVars.x0)/barChartVars.barW)|0];
    }
    return null;
};

var drawStat = function() {
    
    let posts = postsForStat;
    var ctx = statCanvas.getContext("2d");
    var w = statCanvas.width;
    var h = statCanvas.height;
    ctx.clearRect(0,0,w,h);
    
    var timeUnitToUse = statTimeUnitDiv.getSelectedValue();
    
    
    let barsNotSliced = posts.length ? (getTimeUnitsAgo(posts[0].date, timeUnitToUse)+1) : 1;
    var barsFullRange = barsNotSliced;
    
    //var maxBars = Math.round(slider.getIntervalLength()); //+statTimeRange.value;
    //if (barsNotSliced>maxBars) barsNotSliced = maxBars;
    
    
    
    var beginBar = barsFullRange - Math.round(slider.getLowValue());
    var endBar = barsFullRange - Math.round(slider.getUpValue());
    let postsNotSliced = getPostsPerTimeUnit(posts, timeUnitToUse, beginBar, endBar);
    
    
    var postsPerUnit = barChartVars.postsPerUnit = postsNotSliced;
    //var postsPerUnit = barChartVars.postsPerUnit = postsNotSliced.slice(lowVal, barsNotSliced);
    
    var bars = postsPerUnit.length;
    
    //console.log("time unit = "+timeUnitToUse);
    //console.log("bars = "+bars, typeof bars);
    
    var y0 = barChartVars.y0 = h-30;
    var x0 = barChartVars.x0 = 30;
    var y1 = barChartVars.y1 = 10;
    var x1 = barChartVars.x1 = w-20;
    var barW = barChartVars.barW = (x1-x0)/bars;
    var drawBarW = Math.max(barW, 1); //draw at least 1px bars
    var maxP = max(postsPerUnit.map(({postCount})=>{return postCount||0;}));
    console.log("posts per unit is ",postsPerUnit);
    
    var sclY = (y0-y1)/(maxP||1);
    ctx.fillStyle = "#00ff60";
    ctx.strokeStyle = "#222222";
    ctx.lineWidth = 1;
    var x = x0;
    for (let ob of postsPerUnit) {
        if (ob) {
            let yTop = y0-(sclY*ob.postCount);
            let barH = y0 -yTop;

            ctx.fillRect(x, yTop, drawBarW, barH);
            ctx.strokeRect(x, yTop, drawBarW, barH);
        }
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
    var xSteps = getXStepsForTimeUnits(bars, timeUnitToUse);
    //console.log("got "+xSteps+" x-steps for "+bars);
    for (let i=0; i<=xSteps; i++) {
        let per = i/xSteps;
        let indForUnit = Math.floor((postsPerUnit.totalRange-1)*per);
        let xVal = postsPerUnit.getDateStrForInd(indForUnit);
        ctx.fillText(xVal, x0+barW*(indForUnit+0.5), y0+marginXAxis); //center for bar at ind
    }
};


statCanvas.onmousemove = function(evt) {
    var x = evt.clientX-statCanvas.offsetLeft;
    var y = evt.clientY-statCanvas.offsetTop;
    var onBar = getOnBar(x, y);
    if (onBar) {
        statToolTip.innerHTML = "<span class='date'>"+onBar.dateStr+"</span><br>"
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
    var tUnit = statTimeUnitDiv.getSelectedValue();
    statTimeText.innerHTML = "<span class='daysNumber'>"+statTimeRange.value+"</span> "+
        TIME_UNIT_DATA[tUnit].nameShowAtRange;
};

var prevTimeUnitSelection = "day"; //store for keeping value in same time
var updateTimeRange = function() {
    var tUnit = statTimeUnitDiv.getSelectedValue();
    var coeff = TIME_UNIT_DATA[prevTimeUnitSelection].inMs / TIME_UNIT_DATA[tUnit].inMs
    var valToSet = Math.round( (+statTimeRange.value)*coeff );
    slider.setMaxValue(postsForStat[0] ? getTimeUnitsAgo(postsForStat[0].date, tUnit)+1 : 1);
    slider.setLowValue(slider.getLowValue()*coeff);
    slider.setUpValue(slider.getUpValue()*coeff);
    /*
    statTimeRange.max = postsForStat[0] ? getTimeUnitsAgo(postsForStat[0].date, tUnit)+1 : 1;
    statTimeRange.value = valToSet;
    */
    prevTimeUnitSelection = tUnit;
    
    
};


slider.oninput = function() {
    updateStatText();
    drawStat();
};



statTimeUnitDiv.getSelectedValue = function() {
    for (let c of this.getElementsByTagName("input")) {
        if (c.checked) return c.value;
    }
    return "";
};


for (let c of statTimeUnitDiv.getElementsByTagName("input")) {
    c.oninput = function() {
        updateTimeRange();
        updateStatText();
        drawStat();
    }
}


/* this can be done with response function, since not gotten from storage */
sendMsg({getPostsStat: true}, function(statData) {
    if (statData) {
        postsForStat = statData.map(ob=>{return {username: ob.username, date: new Date(ob.date)}});
        updateTimeRange();
        updateStatText();
        drawStat();
    }
});

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
            } else if (valFromStore==="postCount") {
                response.sort((a,b)=>{
                    if (a.postCount < b.postCount) return 1;
                    if (a.postCount > b.postCount) return -1;
                    return a.username.toLowerCase().localeCompare(b.username.toLowerCase())
                });
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







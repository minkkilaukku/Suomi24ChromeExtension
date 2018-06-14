const STORAGE_NAME_USER_NAME_SORT = "lankki_miukku_user_name_sort";
const STORAGE_NAME_HAVE_COLLAPSE = "lankki_miukku_romahdutus_buttonit";
const STORAGE_NAME_KEY_BOARD_SEARCH = "lankki_miukku_nappaimisto_etsiminen";



document.getElementById("searchWithKeyboardCheckbox").oninput = function() {
    document.getElementById("keysForFindDiv").style.display = this.checked ? "block" : "none";
};

//can use this for both buttons
var keySettingFunc = function() {
    var self = this;
    var keyListener = function(evt) {
        evt.preventDefault();
        self.keyCodeToSave = {code: evt.keyCode, ctrl:evt.ctrlKey, alt: evt.altKey};
        self.removeEventListener("keyup", keyListener);
        self.blur();
        document.getElementById("keySetText").textContent = "";
    };
    this.keyListenerHandle = keyListener; //store handle for removing on blur
    this.addEventListener("keyup", keyListener);
    this.onkeydown = ev => ev.preventDefault();
    document.getElementById("keySetText").textContent = "Aseta näppäin painamalla sitä...";
};

var onBlurFunc = function(evt) {
    this.removeEventListener("keyup", this.keyListenerHandle);
    document.getElementById("keySetText").textContent = "";
};

document.getElementById("keyForPrevButton").onclick = keySettingFunc;
document.getElementById("keyForNextButton").onclick = keySettingFunc;

document.getElementById("keyForPrevButton").onblur = onBlurFunc;
document.getElementById("keyForNextButton").onblur = onBlurFunc;


// Saves options to chrome.storage
function saveOptions() {
    var userNameSortBy = document.getElementById('userNameOrdering').value;
    var haveCollapse = document.getElementById('haveCollapseCheckbox').checked;
    var setOb = {};
    setOb[STORAGE_NAME_USER_NAME_SORT] = userNameSortBy;
    setOb[STORAGE_NAME_HAVE_COLLAPSE] = haveCollapse;
    setOb[STORAGE_NAME_KEY_BOARD_SEARCH] = {
        useKeyboard: document.getElementById("searchWithKeyboardCheckbox").checked,
        prevKeyCode: document.getElementById("keyForPrevButton").keyCodeToSave,
        nextKeyCode: document.getElementById("keyForNextButton").keyCodeToSave
    };
    chrome.storage.sync.set(setOb, function() {
    // Update status to let user know options were saved.
        var status = document.getElementById('saveStatus');
        status.textContent = 'Asetukset tallennettu.';
        setTimeout(function() {
            status.textContent = '';
        }, 750);
    });
}

document.getElementById('saveButton').addEventListener('click', saveOptions);


// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restoreOptions() {
  // Use default value color = 'red' and likesColor = true.
    var getOb = {};
    getOb[STORAGE_NAME_USER_NAME_SORT] = "default";
    getOb[STORAGE_NAME_HAVE_COLLAPSE] = true;
    getOb[STORAGE_NAME_KEY_BOARD_SEARCH] = {
        useKeyboard: false,
        prevKeyCode: null,
        nextKeyCode: null
    };
    chrome.storage.sync.get(getOb, function(items) {
        document.getElementById('userNameOrdering').value = items[STORAGE_NAME_USER_NAME_SORT];
        document.getElementById('haveCollapseCheckbox').checked = items[STORAGE_NAME_HAVE_COLLAPSE];
        
        var keyBOb = items[STORAGE_NAME_KEY_BOARD_SEARCH];
        document.getElementById("searchWithKeyboardCheckbox").checked = keyBOb.useKeyboard;
        document.getElementById("keyForPrevButton").keyCodeToSave = keyBOb.prevKeyCode;
        document.getElementById("keyForNextButton").keyCodeToSave = keyBOb.nextKeyCode;
        //hide set area if not using
        document.getElementById("keysForFindDiv").style.display = keyBOb.useKeyboard ? "block" : "none";
    });
}

document.addEventListener('DOMContentLoaded', restoreOptions);
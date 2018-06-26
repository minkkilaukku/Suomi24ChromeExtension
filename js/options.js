const STORAGE_NAME_USER_NAME_SORT = "lankki_miukku_user_name_sort";
const STORAGE_NAME_HAVE_COLLAPSE = "lankki_miukku_romahdutus_buttonit";
const STORAGE_NAME_KEY_BOARD_SEARCH = "lankki_miukku_nappaimisto_etsiminen";

//from https://github.com/wesbos/keycodes/blob/gh-pages/scripts.js
const KEY_CODES = {
  0 : "That key has no keycode",
  3 : "break",
  8 : "backspace / delete",
  9 : "tab",
  12 : 'clear',
  13 : "enter",
  16 : "shift",
  17 : "ctrl",
  18 : "alt",
  19 : "pause/break",
  20 : "caps lock",
  21 : "hangul",
  25 : "hanja",
  27 : "escape",
  28 : "conversion",
  29 : "non-conversion",
  32 : "spacebar",
  33 : "page up",
  34 : "page down",
  35 : "end",
  36 : "home",
  37 : "left arrow",
  38 : "up arrow",
  39 : "right arrow",
  40 : "down arrow",
  41 : "select",
  42 : "print",
  43 : "execute",
  44 : "Print Screen",
  45 : "insert",
  46 : "delete",
  47 : "help",
  48 : "0",
  49 : "1",
  50 : "2",
  51 : "3",
  52 : "4",
  53 : "5",
  54 : "6",
  55 : "7",
  56 : "8",
  57 : "9",
  58 : ":",
  59 : "semicolon (firefox), equals",
  60 : "<",
  61 : "equals (firefox)",
  63 : "ß",
  64 : "@ (firefox)",
  65 : "a",
  66 : "b",
  67 : "c",
  68 : "d",
  69 : "e",
  70 : "f",
  71 : "g",
  72 : "h",
  73 : "i",
  74 : "j",
  75 : "k",
  76 : "l",
  77 : "m",
  78 : "n",
  79 : "o",
  80 : "p",
  81 : "q",
  82 : "r",
  83 : "s",
  84 : "t",
  85 : "u",
  86 : "v",
  87 : "w",
  88 : "x",
  89 : "y",
  90 : "z",
  91 : "Windows Key / Left ⌘ / Chromebook Search key",
  92 : "right window key",
  93 : "Windows Menu / Right ⌘",
  95: "sleep",
  96 : "numpad 0",
  97 : "numpad 1",
  98 : "numpad 2",
  99 : "numpad 3",
  100 : "numpad 4",
  101 : "numpad 5",
  102 : "numpad 6",
  103 : "numpad 7",
  104 : "numpad 8",
  105 : "numpad 9",
  106 : "multiply",
  107 : "add",
  108 : "numpad period (firefox)",
  109 : "subtract",
  110 : "decimal point",
  111 : "divide",
  112 : "f1",
  113 : "f2",
  114 : "f3",
  115 : "f4",
  116 : "f5",
  117 : "f6",
  118 : "f7",
  119 : "f8",
  120 : "f9",
  121 : "f10",
  122 : "f11",
  123 : "f12",
  124 : "f13",
  125 : "f14",
  126 : "f15",
  127 : "f16",
  128 : "f17",
  129 : "f18",
  130 : "f19",
  131 : "f20",
  132 : "f21",
  133 : "f22",
  134 : "f23",
  135 : "f24",
  144 : "num lock",
  145 : "scroll lock",
  160 : "^",
  161 : '!',
  163 : "#",
  164 : '$',
  165 : 'ù',
  166 : "page backward",
  167 : "page forward",
  168 : "refresh",
  169 : "closing paren (AZERTY)",
  170 : '*',
  171 : "~ + * key",
  172 : "home key",
  173 : "minus (firefox), mute/unmute",
  174 : "decrease volume level",
  175 : "increase volume level",
  176 : "next",
  177 : "previous",
  178 : "stop",
  179 : "play/pause",
  180 : "e-mail",
  181 : "mute/unmute (firefox)",
  182 : "decrease volume level (firefox)",
  183 : "increase volume level (firefox)",
  186 : "semi-colon / ñ",
  187 : "equal sign",
  188 : "comma",
  189 : "dash",
  190 : "period",
  191 : "forward slash / ç",
  192 : "grave accent / ñ / æ / ö",
  193 : "?, / or °",
  194 : "numpad period (chrome)",
  219 : "open bracket",
  220 : "back slash",
  221 : "close bracket / å",
  222 : "single quote / ø / ä",
  223 : "`",
  224 : "left or right ⌘ key (firefox)",
  225 : "altgr",
  226 : "< /git >, left back slash",
  230 : "GNOME Compose Key",
  231 : "ç",
  233 : "XF86Forward",
  234 : "XF86Back",
  235 : "non-conversion",
  240 : "alphanumeric",
  242 : "hiragana/katakana",
  243 : "half-width/full-width",
  244 : "kanji",
  255 : "toggle touchpad"
};

var dataChangedAndNotSaved = false;

document.getElementById("searchWithKeyboardCheckbox").oninput = function() {
    document.getElementById("keysForFindDiv").style.display = this.checked ? "block" : "none";
    dataChangedAndNotSaved = true;
};

//can use this for both buttons
var keySettingFunc = function() {
    var self = this;
    var keyListener = function(evt) {
        evt.preventDefault();
        self.keyCodeToSave = {code: evt.keyCode,
                              ctrl:evt.ctrlKey,
                              alt: evt.altKey,
                             shift: evt.shiftKey};
        self.removeEventListener("keyup", keyListener);
        self.blur();
        updatekeyButtonKeySpans();
        dataChangedAndNotSaved = true;
    };
    this.keyListenerHandle = keyListener; //store handle for removing on blur
    this.addEventListener("keyup", keyListener);
    this.onkeydown = ev => ev.preventDefault();
    document.getElementById("keySetText").style.visibility = "visible";
        //"Aseta näppäin painamalla sitä...";
};

var onBlurFunc = function(evt) {
    this.removeEventListener("keyup", this.keyListenerHandle);
    document.getElementById("keySetText").style.visibility = "hidden";
};

document.getElementById("keyForPrevButton").onclick = keySettingFunc;
document.getElementById("keyForNextButton").onclick = keySettingFunc;

document.getElementById("keyForPrevButton").onblur = onBlurFunc;
document.getElementById("keyForNextButton").onblur = onBlurFunc;


/** Update the text content of spans next to the buttons
* @param prevKeyCodeOb: if not given, gotten from the button
* @param nextKeyCodeOb: if not given, gotten from the button
*/
var updatekeyButtonKeySpans = function(prevKeyCodeOb, nextKeyCodeOb) {
    var updateSpan = function(span, keyCodeOb) {
        span.textContent = "";
            if (keyCodeOb) {
            if (keyCodeOb.shift) span.textContent += "shift + ";
            if (keyCodeOb.ctrl) span.textContent += "ctrl + ";
            if (keyCodeOb.alt) span.textContent += "alt + ";
            span.textContent += KEY_CODES[keyCodeOb.code]||"[unknown]";
        } else {
            span.textContent = "[ei asetettu]";
        }
    };
    
    
    prevKeyCodeOb = prevKeyCodeOb||document.getElementById("keyForPrevButton").keyCodeToSave;
    nextKeyCodeOb = nextKeyCodeOb||document.getElementById("keyForNextButton").keyCodeToSave;
    
    updateSpan(document.getElementById("prevButtKeySpan"), prevKeyCodeOb);
    updateSpan(document.getElementById("nextButtKeySpan"), nextKeyCodeOb);
};



document.getElementById("userNameOrdering").oninput = function() {
    dataChangedAndNotSaved = true;
};

document.getElementById("haveCollapseCheckbox").oninput = function() {
    dataChangedAndNotSaved = true;
};



document.getElementById("defaultOptionsButton").onclick = function() {
    /*
    var setOb = {};
    setOb[STORAGE_NAME_USER_NAME_SORT] = "default";
    setOb[STORAGE_NAME_HAVE_COLLAPSE] = true;
    setOb[STORAGE_NAME_KEY_BOARD_SEARCH] = {
        useKeyboard: false,
        prevKeyCode: null,
        nextKeyCode: null
    };
    */
    var remList = [STORAGE_NAME_USER_NAME_SORT,
                   STORAGE_NAME_HAVE_COLLAPSE,
                   STORAGE_NAME_KEY_BOARD_SEARCH];
    chrome.storage.sync.remove(remList, function() {
    // Update status to let user know options were saved.
        restoreOptions();
        var status = document.getElementById('saveStatus');
        var prevText = status.textContent;
        status.textContent = "Oletusasetukset palautettu"
        status.style.visibility = 'visible'
        setTimeout(function() {
            status.style.visibility = 'hidden';
            status.textContent = prevText;
        }, 750);
    });
    dataChangedAndNotSaved = false;
};



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
        status.style.visibility = 'visible' // = 'Asetukset tallennettu.';
        setTimeout(function() {
            status.style.visibility = 'hidden';
        }, 750);
    });
    dataChangedAndNotSaved = false;
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
        if (keyBOb) {
            document.getElementById("searchWithKeyboardCheckbox").checked = keyBOb.useKeyboard;
            document.getElementById("keyForPrevButton").keyCodeToSave = keyBOb.prevKeyCode;
            document.getElementById("keyForNextButton").keyCodeToSave = keyBOb.nextKeyCode;
            updatekeyButtonKeySpans(keyBOb.prevKeyCode, keyBOb.nextKeyCode);
            //hide set area if not using
            document.getElementById("keysForFindDiv").style.display = keyBOb.useKeyboard ? "block" : "none";
        }
        
    });
}

document.addEventListener('DOMContentLoaded', restoreOptions);



window.onbeforeunload = function() {
    if (dataChangedAndNotSaved) {
        return "Jos poistut, muutoksia ei tallenneta.";
    } else {
        return;
    }
};

const STORAGE_NAME_USER_NAME_SORT = "lankki_miukku_user_name_sort";
const STORAGE_NAME_HAVE_COLLAPSE = "lankki_miukku_romahdutus_buttonit";


// Saves options to chrome.storage
function saveOptions() {
    var userNameSortBy = document.getElementById('userNameOrdering').value;
    var haveCollapse = document.getElementById('haveCollapseCheckbox').checked;
    var setOb = {};
    setOb[STORAGE_NAME_USER_NAME_SORT] = userNameSortBy;
    setOb[STORAGE_NAME_HAVE_COLLAPSE] = haveCollapse;
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
    chrome.storage.sync.get(getOb, function(items) {
        document.getElementById('userNameOrdering').value = items[STORAGE_NAME_USER_NAME_SORT];
        document.getElementById('haveCollapseCheckbox').checked = items[STORAGE_NAME_HAVE_COLLAPSE];
    });
}

document.addEventListener('DOMContentLoaded', restoreOptions);
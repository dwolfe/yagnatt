function loadOptions() {
  chrome.storage.sync.get(['expiration', 'frequency', 'log'], function(items) {
    document.getElementById('expiration').value = items.expiration;
//    document.getElementById('frequency').value = items.frequency;
    document.getElementById('log').checked = items.log;
  });
}

function saveOptions() {
  var expiration = document.getElementById('expiration').value;
//  var frequency = document.getElementById('frequency').value;
  var log = document.getElementById('log').checked;

  chrome.storage.sync.set({
    expiration: parseInt(expiration, 10),
//    frequency: parseInt(frequency, 10),
    log: log
  });
}

function showLog() {
  console.log("Showing log");
  chrome.tabs.create({
    url: "log.html",
    active: true
  }, function(tab) {
console.log("Log:", tab);
  });
}

function setup() {
  loadOptions();

  document.getElementById('doCleanup').addEventListener('click', doCleanup);
  document.getElementById('showLog').addEventListener('click', showLog);

  var settingsControls = document.getElementsByClassName('setting');
  for (var i = 0; i < settingsControls.length; i++) {
    settingsControls[i].addEventListener('change', saveOptions);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  setup();
});

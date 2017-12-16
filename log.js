function clearLog() {
  if (window.confirm("Are you sure you want to delete all log entries?")) {
    chrome.storage.sync.set({ closedTabs: [] }, function() {
      console.log("Log has been cleared.");
      window.location.reload(true);
    });
  }
}

var loadLog = function() {
  var container = document.getElementById('log-data');

  chrome.storage.sync.get('closedTabs', function(items) {

    if (items.closedTabs.length > 0) {
      container.innerHTML += "<h3>But if you want 'em back...</h3>";
      var tableString = "<table class=\"closed-tabs\"><thead><tr><th>Last Visit</th><th>Closed at:</th><th>Page title</th></tr></thead><tbody>";

      for (var i = 0; i < items.closedTabs.length; i++) {
        tableString += "<tr>";
        tableString += "<td>" + moment(items.closedTabs[i].lastVisit).format('ddd MMM D YYYY, h:mm a') + "</td>";
        tableString += "<td>" + Math.round(items.closedTabs[i].hoursSinceLastVisit) + " hours old</td>";
        tableString += "<td><a href=\"" + items.closedTabs[i].url + "\">" + items.closedTabs[i].title + "</a></td>";
        tableString += "</tr>";
      }

      tableString += "</tbody></table>";
      container.innerHTML += tableString;
    } else {
      container.innerHTML += "<h2>No entries in log</h2>";
    }
  });
}

var setupLogPage = function() {
console.log(document.getElementById('clearLog'));
  document.getElementById('clearLog').addEventListener('click', clearLog);
  loadLog();
}

document.addEventListener('DOMContentLoaded', () => {
  setupLogPage();
});

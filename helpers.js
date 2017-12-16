function doCleanup() {
  var tabsToClose = [];
  var numRequestsOutstanding = 0;
  var expiration = 24;

  var closeTabs = function(tabsToClose) {
    var tabIds = tabsToClose.map(id => id.id);
    chrome.tabs.remove(tabIds, function() {
      tabsToClose = [];
    });
  }

  var onAllVisitsProcessed = function() {
    chrome.storage.sync.get("log", function(items) {
      if (items.log === true) {
        var tabsToStore = [];
        chrome.storage.sync.get("closedTabs", function(items) {
console.log("closedTabs", items.closedTabs);
          if (items.closedTabs.constructor === Array) {
            tabsToStore = items.closedTabs.concat(tabsToClose);
          } else {
            tabsToStore = tabsToClose;
          }
          chrome.storage.sync.set({ closedTabs: tabsToStore }, function() {
            closeTabs(tabsToClose);
          });
        });
      } else {
        closeTabs(tabsToClose);
      }
    });
  }

  var processVisits = function(tabId, tabUrl, tabTitle, visitItems) {
    if (visitItems.length > 0) {
      thisTab = {}, lastVisitTime = 0;
      thisTab.id = tabId;
      thisTab.url = tabUrl;
      thisTab.title = tabTitle;
      lastVisitTime = visitItems[visitItems.length - 1].visitTime;
      thisTab.lastVisit = lastVisitTime;
      thisTab.hoursSinceLastVisit = Math.abs(Date.now() - lastVisitTime) / 36e5;

      if (thisTab.hoursSinceLastVisit >= expiration) {
        thisTab.closed = Date.now();
        tabsToClose.push(thisTab);
      }
    }

    if (!--numRequestsOutstanding) {
      onAllVisitsProcessed();
    }
  };

  var processVisitsWithUrl = function(tabId, tabUrl, tabTitle) {
    return function(visitItems) {
      processVisits(tabId, tabUrl, tabTitle, visitItems);
    }
  }

  chrome.tabs.query({}, function(tabs){
    if (tabs.length > 0) {
      chrome.tabs.query({ active: true, currentWindow: true }, function(items) {
        var currentTabId = items[0].id;
        chrome.storage.sync.get("expiration", function(items) {
          if (items.expiration === parseInt(items.expiration, 10)) {
            expiration = parseInt(items.expiration, 10);
          }

          for (var i = 0; i < tabs.length; i++) {
            var tabId = tabs[i].id;
            var tabUrl = tabs[i].url;
            var tabTitle = tabs[i].title;
            if (tabId !== currentTabId) {
              chrome.history.getVisits({url: tabUrl}, processVisitsWithUrl(tabId, tabUrl, tabTitle));
              numRequestsOutstanding++;
            }
          }
        });
      });
    }
  });
}

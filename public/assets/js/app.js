var socket = io.connect("/management");

window.overlayTimeout = setTimeout(function () {
  socket.of('/').emit("disconnect");
}, 1000);


var app = angular.module('magic', ["ui.router"]);

/*
app.run(function ($rootScope) {

  $rootScope.$on("$locationChangeStart", function (event, next, current) {
    // handle route changes     

    console.log("location... start")

  });

  $rootScope.$on("$locationChangeSuccess", function (event, next, current) {
    // handle route changes     

    console.log("location... end")

  });

});
*/


app.factory('$xhrFactory', function () {
  return function createXhr(method, url) {

    //console.log(method, url)


    angular.element(document).ready(function () {
      //console.log("IN XHR DONE")
    });

    return new window.XMLHttpRequest({ mozSystem: true });


  };
});


app.config(function ($stateProvider, $urlRouterProvider) {


	/**
	 * ROOT
	 * @returns {undefined}
	 */
  (function () {

    $urlRouterProvider.otherwise('/session');

    $stateProvider.state("session", {
      url: "/session",
      templateUrl: "../templates/session.html",
      controller: "Session"
    });

    $stateProvider.state("computer", {
      url: "/computer",
      templateUrl: "../templates/computer.html",
      controller: "Computer"
    });

    $stateProvider.state("images", {
      url: "/images",
      templateUrl: "../templates/images.html",
      controller: "Images"
    });

    $stateProvider.state("tasks", {
      url: "/tasks",
      templateUrl: "../templates/tasks.html",
      controller: "Tasks"
    });

    $stateProvider.state("groups", {
      url: "/groups",
      templateUrl: "../templates/groups.html",
      controller: "Groups"
    });

    $stateProvider.state("settings", {
      url: "/settings",
      //redirectTo: 'settings.dashboard',
      templateUrl: "../templates/settings.html",
      controller: "Settings"
    });

  })();


});


app.factory('socket', function ($rootScope) {
  return {
    on: function (eventName, callback) {
      socket.on(eventName, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          callback.apply(socket, args);
        });
      });
    },
    emit: function (eventName, data, callback) {
      socket.emit(eventName, data, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          if (callback) {
            callback.apply(socket, args);
          }
        });
      });
    }
  };
});

app.factory("api", function ($http) {
  return {

    get: function (url, cb) {

      $http({
        method: 'GET',
        url: "/api" + url
      }).then(function successCallback(response) {

        console.log(response)
        cb(null, response.data);

      }, function errorCallback(response) {

        cb(response.data.error);
        console.log("ERROR", response);

      });

    },

    put: function (url, data, cb) {

      $http({
        method: 'PUT',
        url: "/api" + url,
        data: data
      }).then(function successCallback(response) {
        cb(null, response.data);
      }, function errorCallback(response) {

        cb(response.data.error);
        console.log("ERROR", response);

      });

    },

    post: function (url, data, cb) {

      $http({
        method: 'POST',
        url: "/api" + url,
        data: data
      }).then(function successCallback(response) {

        cb(null, response.data);

      }, function errorCallback(response) {

        cb(response.data.error);
        console.log("ERROR", response);

      });

    },

    delete: function (url, cb) {

      $http({
        method: 'DELETE',
        url: "/api" + url
      }).then(function successCallback(response) {
        cb(null, response.data);
      }, function errorCallback(response) {

        cb(response.data.error);
        console.log("ERROR", response);

      });

    }

  }
});


function notification(message, type = "info", timeout = 15000) {

  let parent = $("#notifications");
  let element = $('<div class="alert alert-' + type + '">' + message + '</div>').appendTo(parent);

  element.click(function () {
    element.remove();
  });

  if (timeout > 0) {
    setTimeout(function () {
      element.remove();
    }, timeout);
  }

}


/**
 * NOTIFICATION HELPER
 */
app.factory('notification', function ($rootScope) {
  return notification;
});


socket.on("notification", notification);



window.initBootstrap = function initBootstrap() {
  angular.element(document).ready(function () {
    setTimeout(function () {
      //  $(document).ready(function () {

      console.log("DOM loaded, with timeout, 1s");
      $('[data-toggle="tooltip"]').tooltip();

      $(".btn").click(function () {
        setTimeout(function (element) {

          // unfocus element
          $(element).blur();

        }, 100, this);
      });

    }, 1000);
  });
}

socket.on("disconnect", function () {

  console.log("Show overlay");
  $("#overlay").show();
  $("#view").hide();

});

socket.on("connect", function () {

  // clear overlay timeout
  // dont show the overlay after connection
  clearTimeout(window.overlayTimeout);

  console.log("Hide overlay");
  $("#overlay").hide();
  $("#view").show();

});






app.controller('Session', function ($scope, socket, api) {

  $scope.Math = window.Math;

  // funktioniert wenn nicht upgadet!
  // nach updated von progressbar geht nicht mehr!
  //window.initBootstrap();

  socket.on("queue", (data) => {
    $scope.list = data;
  });

  socket.emit("queue", null, function (data) {
    $scope.list = data;
  });


  $scope.handleForget = function () {

    api.delete("/queue/" + this.computer._id, function (err, data) {
      console.log("HandleForget", err, data);
    });


  };

  $scope.handleInfo = function () {

    console.log("hanlde info");
    $scope.info = this.computer;


  };

  /*
    $scope.$on('$viewContentLoaded', function (event) {
      // code that will be executed ... 
      // every time this view is loaded
      console.log("$viewContentLoaded loaded");
      $('[data-toggle="tooltip"]').tooltip();
  
      $(".btn").click(function () {
        $(this).blur();
      });
  
    });
  */

});

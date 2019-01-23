app.controller('Logfiles', function ($scope, api) {

    $scope.log = [];
    $scope.level = "";
    $scope.settings = null;

    const interval = setInterval(function () {

        console.log("Logfiles, get..");

        api.get("/logfiles", function (err, data) {
            $scope.log = data;
        });

    }, 10000);

    $scope.$on('$destroy', function () {
        console.log("Unload controller");
        clearInterval(interval);
    })

    api.get("/logfiles", function (err, data) {
        $scope.log = data;
    });

    api.get("/settings", function (err, data) {

        console.log("seetings", err, data);
        $scope.settings = data;
        $scope.level = data.logger.level;

    });



    $scope.setLevel = function () {

        $scope.settings.logger = Object.assign($scope.settings.logger, {
            level: $scope.level
        });

        api.post("/settings", {
            logger: $scope.settings.logger
        }, function (err) {

            console.log("Settings saved0", err);

        });

    };




    $scope.clear = function () {
        api.get("/logfiles/clear", function (err, data) {

            $scope.log = [];
            console.log("CLEAR:", err, data);

        });
    };





});

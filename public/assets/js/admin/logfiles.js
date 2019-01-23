app.controller('Logfiles', function ($scope, api) {

    $scope.log = [];
    $scope.level = "";
    $scope.settings = null;

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

            console.log("CLEAR:", err, data);

        });
    };





});

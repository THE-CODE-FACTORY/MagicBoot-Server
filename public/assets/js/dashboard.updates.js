app.controller('Updates', function ($scope, api) {


    api.get("/settings", function (err, data) {

        console.log(data)

        $scope.settings = data;

    });


    $scope.save = function () {
        api.post("/settings", $scope.settings, function (err, result) {

            console.log(err, result)

        });
    };



    $scope.check = function () {
        api.get("/update/check", function (err, data) {

            console.log("CHECK", err, data);

        });
    };

    $scope.load = function () {
        api.get("/update/load", function (err, data) {

            console.log("LOAD", err, data);

        });
    };

    $scope.install = function () {
        api.get("/update/install", function (err, data) {

            console.log("INSTALL", err, data);

        });
    };

});

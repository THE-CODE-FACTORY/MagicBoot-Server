app.controller('Settings', function ($scope, api) {


    api.get("/settings", function (err, data) {

        $scope.settings = data;

    })


    $scope.save = function () {
        api.post("/settings", $scope.settings, function (err, result) {

            console.log(err, result)

        });
    }


});

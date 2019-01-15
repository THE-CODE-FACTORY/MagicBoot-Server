app.controller('Logfiles', function ($scope, api) {

    $scope.log = [];

    api.get("/logfiles", function (err, data) {

        console.log(data);


        $scope.log = data.split("\n").map((entry) => {
            return JSON.parse(entry);
        });

        console.log($scope.log)

    });


});

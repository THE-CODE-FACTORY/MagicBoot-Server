app.controller('Logfiles', function ($scope, api) {


    api.get("/logfiles", function (err, data) {


        $scope.log = data;

    });


});

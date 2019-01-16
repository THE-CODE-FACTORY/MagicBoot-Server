app.controller('Computer', function ($scope, api) {

    api.get("/computer", function (err, data) {

        $scope.list = data;

    })





});

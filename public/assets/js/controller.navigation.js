app.controller('Navigation', function ($scope, $location) {

    $scope.isActive = function (path) {
        return $location.$$path === path;
    };

});

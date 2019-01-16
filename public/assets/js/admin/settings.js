app.controller('Settings', function ($scope, api) {


    api.get("/settings", function (err, data) {

        console.log(data)

        $scope.settings = data;

    });


    $scope.save = function () {
        api.post("/settings", $scope.settings, function (err, result) {

            console.log(err, result)

        });
    }


    $scope.langauges = [
        {
            "name": "Deutsch",
            "icon": "de",
            "version": 1.0,
            "author": "Marc Stirner"
        },
        {
            "name": "English",
            "icon": "gb",
            "version": 1.3,
            "author": "Marc Stirner"
        },
        {
            "name": "Russisch",
            "icon": "ru",
            "version": 1.2,
            "author": "Google"
        },
        {
            "name": "Brazil",
            "icon": "br",
            "version": 1.3,
            "author": "Marc Stirner"
        },
        {
            "name": "Gibralta",
            "icon": "ad",
            "author": "Hans Wurst",
            "version": 1.3
        }
        , {
            "name": "France",
            "icon": "fr",
            "author": "Jon Doe",
            "version": 1.3
        }, {
            "name": "English",
            "icon": "us",
            "version": 1.3
        }, {
            "name": "English",
            "icon": "us",
            "author": "Jane Doe",
            "version": 1.3
        }, {
            "name": "English",
            "icon": "us",
            "author": "Marc Stirner",
            "version": 1.3
        }
    ]

});

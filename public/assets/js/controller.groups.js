app.controller('Groups', function ($scope, api, notification) {

    $scope.Math = window.Math;

    window.initBootstrap();
    $scope.add = {};

    api.get("/groups", function (err, data) {
        $scope.list = data;
    });


    api.get("/tasks", function (err, data) {
        $scope.tasks = data;
    });


    $scope.handleDelete = function () {
        if (confirm("Lösche Gruppe \"" + this.group.name + "\" ?")) {

            let element = this.task;

            api.delete("/groups/" + this.group._id, function (err, data) {

                if (err) {
                    return notification("Gruppe konnte nicht gelöscht werden", "danger");
                }

                const index = $scope.list.indexOf(element);
                $scope.list.splice(index, 1);

                notification("Gruppe wurde gelöscht", "success");

            });

        }
    };


    $scope.handleEdit = function () {
        if (this.edit === true) {

            console.log("Save Changes!");

            api.post("/groups/" + this.group._id, this.group, function (err, result) {

                if (err) {
                    return notification("Gruppe kunnte nicht gespeichert werden", "danger");
                }

                notification("Gruppe wurde gespeichert", "success");

                console.log("Posted", err, result);
            });

        }
    };

    $scope.handleAdd = function () {

        console.log($scope.add);

        api.put("/groups", $scope.add, function (err, data) {

            if (err) {
                return notification("Gruppe konnte nicht hinzugefügt werden", "danger");
            }

            $scope.list.push(data);
            $scope.add = {};

            notification("Gruppe wurde hinzugefügt", "success");

        });

    };

});

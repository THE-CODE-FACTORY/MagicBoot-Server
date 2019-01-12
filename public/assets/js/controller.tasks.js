app.controller('Tasks', function ($scope, api, notification) {

    $scope.Math = window.Math;
    window.initBootstrap();

    //$scope.list = [];
    $scope.add = {
        settings: {
            attempts: 3
        }
    };


    api.get("/tasks", function (err, data) {
        $scope.list = data;
    });



    $scope.handleAdd = function () {

        console.log($scope.add);

        api.put("/tasks", $scope.add, function (err, data) {

            if (err) {
                return notification("Task konnte nicht hinzugefügt werden", "danger");
            }

            console.log(err, data)

            $scope.list.push(data);

            $scope.add = {
                settings: {
                    attempts: 3
                }
            };


            notification("Task wurde hinzugefügt", "success");

        });



    };

    $scope.handleEdit = function () {
        if (this.edit === true) {

            console.log("Save Changes!");

            api.post("/tasks/" + this.task._id, this.task, function (err, result) {

                if (err) {
                    return notification("Task konnte nicht gespeichert werden", "danger");
                }

                notification("Task wurde gespeichert", "success");
                console.log("Posted", err, result);

            });

        }
    };


    $scope.handleDelete = function () {
        if (confirm("Task \"" + this.task.name + "\" löschen ?")) {

            let element = this.task;

            api.delete("/tasks/" + this.task._id, function (err, data) {

                if (err) {
                    return notification("Task konnte nicht gelöscht werden", "danger");
                }

                const index = $scope.list.indexOf(element);
                $scope.list.splice(index, 1);

                notification("Task wurde gelöscht", "success");

            });

        }
    };


});

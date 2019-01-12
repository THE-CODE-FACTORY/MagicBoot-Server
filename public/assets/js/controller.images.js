app.controller('Images', function ($scope, api, notification) {

    $scope.Math = window.Math;

    $scope.add = {
        type: "windows",
        index: 1
    };

    api.get("/images", function (err, data) {
        $scope.list = data;
    });


    $scope.handleDelete = function () {
        if (confirm("Lösche Image \"" + this.image.name + "\" ?")) {

            let element = this.task;

            api.delete("/images/" + this.image._id, function (err, data) {

                if (err) {
                    return notification("Image konnte nicht gelöscht werden", "danger");
                }

                const index = $scope.list.indexOf(element);
                $scope.list.splice(index, 1);

                notification("Image wurde gelöscht", "success");

            });

        }
    };


    $scope.handleEdit = function () {
        if (this.edit === true) {

            console.log("Save Changes!");

            api.post("/images/" + this.image._id, this.image, function (err, result) {

                if (err) {
                    return notification("Image konnte nicht bearbeitet werden", "danger");
                }

                notification("Image wurde gespeichert", "success");


                console.log("Posted", err, result);

            });

        }
    };

    $scope.handleAdd = function () {

        console.log($scope.add);

        api.put("/images", $scope.add, function (err, data) {

            if (err) {
                return notification("Image konnte nicht hinzugefügt werden", "danger");
            }

            $scope.list.push(data);

            $scope.add = {
                type: "windows",
                index: 1
            };


            notification("Image wurde hinzugefügt", "success");


        });



    };



});

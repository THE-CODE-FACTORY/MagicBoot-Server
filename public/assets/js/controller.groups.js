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


    $scope.orderTasks = function () {

        console.log("order takss for group '%s'", this.group.name, this.group.tasks);
        $scope.targetGroup = this.group;


        $scope.order = [];

        this.group.tasks.forEach(id => {

            const element = $scope.tasks.find(task => {
                return task._id === id;
            });

            $scope.order.push(element)

        });

        $scope.target = $scope.order[0]._id;

        console.log("Tasks to order:", $scope.order)

    };


    $scope.moveUp = function () {


        const element = $scope.order.find(element => {
            return element._id === $scope.target;
        });

        const index = $scope.order.indexOf(element);

        console.log("move idnex +1", index)

        $scope.order.splice(index, 1);
        $scope.order.splice(index - 1, 0, element);

    }


    $scope.moveDown = function () {

        const element = $scope.order.find(element => {
            return element._id === $scope.target;
        });

        const index = $scope.order.indexOf(element);

        console.log("move idnex -1", index)

        $scope.order.splice(index, 1);
        $scope.order.splice(index + 1, 0, element);

    }


    $scope.applyOrder = function () {

        console.log("ORder array", $scope.order)

        const index = $scope.list.indexOf($scope.targetGroup);
        //const group = $scope.list[index];

        console.log($scope.order)

        const tasks = $scope.order.map(element => {
            return element._id;
        });

        $scope.targetGroup.tasks = tasks;
        console.log("new order", tasks)

    };


    $scope.abortOrder = function () {

        $scope.order = null;
        $scope.target = null;
        $scope.targetGroup = null;

        console.log("Abort order!");

    };


});

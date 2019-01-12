angular.element(document).ready(function () {
  setTimeout(function () {
    //  $(document).ready(function () {

    console.log("DOM loaded, with timeout, 1s");
    $('[data-toggle="tooltip"]').tooltip();

    $(".btn").click(function () {
      setTimeout(function (element) {

        // unfocus element
        $(element).blur();

      }, 100, this);
    });

  }, 1000);
});

app.controller('Computer', function ($scope, api, notification) {


  $scope.Math = window.Math;

  $scope.list = [];
  $scope.images = [];





  // checkbox edit
  const selected = [];

  $scope.handleEdit = function () {
    console.log("Edit clicked", this);

    if (this.edit === true) {

      console.log("Save Changes!");

      api.post("/computer/" + this.computer._id, this.computer, function (err, result) {

        if (err) {
          return notification("Computer konnte nicht gespeichert werden", "danger");
        }

        console.log("Posted", err, result);
        notification("Computer wurde gespeichert", "success");

      });

    }

  };


  $scope.handleDelete = function () {
    if (confirm("Lösche Computer \"" + this.computer.name + "\" ?")) {

      console.log("Löschen")
      let element = this.computer;

      api.delete("/computer/" + this.computer._id, function (err, data) {

        console.log(err, data)

        if (err) {
          return notification("Computer konnte nicht gelöscht werden", "danger");
        }

        const index = $scope.list.indexOf(element);
        $scope.list.splice(index, 1);

        notification("Computer wurde gelöscht", "success");

      });

    } else {

      console.log("Abbrechen")

    }
  };


  $scope.handleCheckbox = function () {
    // push index to array
    // remove from array when not selected (uncheck)
    console.log("Add  to edit", this);
  };


  $scope.handleHardware = function () {
    $scope.info = this.computer.systeminfo;
  };

  $scope.handleDiagnostic = function () {

    api.put("/computer/" + this.computer._id + "/diagnostic", {
      mac: this.computer.mac
    }, function (err, result) {

      console.log(err, result)

    });

    alert("Computer statet mit Diagnose bootloader!");

    console.log(this.computer);

  };




  api.get("/computer?populate=image", function (err, data) {
    $scope.list = data;
  });


  api.get("/images", function (err, data) {
    $scope.images = data;
  });

  api.get("/groups", function (err, data) {
    $scope.groups = data;
  });

  api.get("/tasks", function (err, data) {
    $scope.tasks = data;
  });


  /*
    for (let i = 0; i < 100; i++) {
      list.push({
        name: "DELL-6800-" + i,
        image: { name: "Windows - 10" },
        descirption: "SN-0100-" + i,
        timestamps: { added: "11.02.2018", deployed: "22.07.2018" }
      });
    }
  
    $scope.list = list;
  */
});

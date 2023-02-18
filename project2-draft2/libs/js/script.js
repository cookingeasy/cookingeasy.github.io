window.addEventListener("load", function () {
  $(".pre-load").addClass("fadeOut");
});

populateEmployeeList();
populateLocations();
populateDepartments();

// Populates the employee list
function populateEmployeeList() {
  $("#personnelTbody").empty();
  $.ajax({
    url: "libs/php/getAll.php",
    type: "GET",
    dataType: "json",
    success: function (data) {
      // Iterate through the returned data and add it to the table
      data.data.forEach(function (person) {
        $("#personnelTbody").append(`
        <tr>
          <td>${person.firstName} ${person.lastName}</td>
          <td>${person.jobTitle}</td>
          <td>${person.email}</td>
          <td>${person.department}</td>
          <td>${person.location}</td>
          <td>
          <button class="btn btn-secondary btn-sm" data-toggle="modal" data-target="#editModal" data-id="${person.id}"><i class="fa-solid fa-pen-to-square"></i></button>
          <button class="btn btn-secondary btn-sm deleteBtn" data-id="delete${person.id}"><i class="fa-regular fa-trash-can"></i></button>
          </td>
        </tr>
      `);
      });
    },
  });

  // card layout when the display is smaller
  $("#container2").empty();
  $.ajax({
    url: "libs/php/getAll.php",
    type: "GET",
    dataType: "json",
    success: function (data) {
      // Iterate through the returned data and add it to the container
      data.data.forEach(function (person) {
        $("#container2").append(`
          <div class="card">
            <h3 class="card-title">
              <button class="btn collapseBtn" data-toggle="collapse" data-target="#employee-${person.id}">
                ${person.firstName} ${person.lastName} <i class="fas fa-plus"></i>
              </button>
            </h3>
            <div id="employee-${person.id}" class="collapse">
              <p class="card-text">${person.jobTitle}</p>
              <p class="card-text">${person.email}</p>
              <p class="card-text">${person.department}</p>
              <p class="card-text">${person.location}</p>
              <button class="btn btn-secondary btn-sm" data-toggle="modal" data-target="#editModal" data-id="${person.id}"><i class="fa-solid fa-pen-to-square"></i></button>
              <button class="btn btn-secondary btn-sm deleteBtn" data-id="delete${person.id}"><i class="fa-regular fa-trash-can"></i></button>
            </div>
          </div>
        `);
      });
    },
  });
}

// toggle visibility of the details when clicked
$(".collapseBtn").on("click", function () {
  var target = $(this).data("target");
  $(target).collapse("toggle");
});

//populates the department list
function populateDepartments() {
  $("#departments tbody").empty();
  $.ajax({
    type: "GET",
    url: "libs/php/getAllDepartments.php",
    dataType: "json",
    success: function (data) {
      // fetch all locations to use later
      $.ajax({
        type: "GET",
        url: "libs/php/getAllLocations.php",
        dataType: "json",
        success: function (locations) {
          data.data.forEach(function (department) {
            // find the location name based on the locationID
            let locationName = locations.data.find(
              (location) => location.id === department.locationID
            ).name;
            // Add departments to the table
            $("#departments tbody").append(
              "<tr><td>" +
                department.name +
                "</td><td>" +
                locationName +
                "</td><td>" +
                `<div class="btn-group btn-group-sm">
                <button type="button" class="btn btn-sm btn-secondary" data-toggle="modal" data-target="#editDepartmentModal" data-id="${department.id}">
                  <i class="fa-solid fa-pen-to-square"></i>
                </button>
                <button class="btn btn-secondary btn-sm deleteBtn2" data-id="delete${department.id}">
                  <i class="fa-regular fa-trash-can"></i>
                </button>
              </div>` +
                "</td></tr>"
            );
          });
        },
      });
    },
  });
}

//populates the locations list
function populateLocations() {
  $("#locations tbody").empty();
  $.ajax({
    type: "GET",
    url: "libs/php/getAllLocations.php",
    dataType: "json",
    success: function (data) {
      data.data.forEach(function (location) {
        //Adds departments to the select element
        $("#locations tbody").append(
          "<tr><td>" +
            location.name +
            "</td><td>" +
            `<div class="btn-group btn-group-sm">
            <button type="button" class="btn btn-secondary btn-sm" data-toggle="modal" data-target="#editLocationModal" data-id="${location.id}"><i class="fa-solid fa-pen-to-square"></i></button>
            <button class="btn btn-secondary btn-sm deleteBtn3" data-id="delete${location.id}"><i class="fa-regular fa-trash-can"></i></button>
            </div>` +
            "</td></tr>"
        );
      });
    },
  });
}

$("#personnelTbody, #container2").on("click", ".deleteBtn", function () {
  let id = $(this).data("id").replace("delete", "");
  $.ajax({
    url: "libs/php/getPersonnelByID.php",
    type: "GET",
    dataType: "json",
    data: {
      id: id, // Retrieves the data-id attribute from the calling button
    },
    success: function (result) {
      var resultCode = result.status.code;

      if (resultCode == 200) {
        $("#areYouSurePersonnelName").text(result.data.personnel[0].firstName);
        $("#areYouSureDeletePersonnelModal").modal("show");
      }
    },
  });

  $("#yesDelete3")
    .off("click")
    .on("click", function () {
      $.ajax({
        url: `libs/php/deleteEmployee.php`,
        type: "POST",
        data: { id: id },
        dataType: "json",
        success: function (response) {
          if (response.status.code == "200") {
            // Show success toast notification
            $.toast({
              heading: "Success",
              text: "Employee deleted successfully",
              showHideTransition: "slide",
              icon: "success",
              position: "top-right",
            });
            // Refreshes the employee list
            populateEmployeeList();
          } else {
            // Show error toast notification
            $.toast({
              heading: "Error",
              text: "Failed to delete employee",
              showHideTransition: "slide",
              icon: "error",
              position: "top-right",
            });
          }
        },
      });
    });
});

$("#editForm").on("submit", function (e) {
  e.preventDefault();
  var updatedId = $("#employeeID").val();
  var updatedFirstName = $("#editFirstName").val();
  var updatedLastName = $("#editLastName").val();
  var updatedEmail = $("#editEmail").val();
  var updatedJobTitle = $("#editJobTitle").val();
  var updatedDepartmentID = $("#departmentSearch3").val();

  $.ajax({
    url: "libs/php/editPersonnel.php",
    method: "POST",
    data: {
      id: updatedId,
      firstName: updatedFirstName,
      lastName: updatedLastName,
      jobTitle: updatedJobTitle,
      email: updatedEmail,
      departmentID: updatedDepartmentID,
    },
    dataType: "json",
    success: function (response) {
      if (response.status.description === "success") {
        //hide the modal
        $("#editModal").modal("hide");
        //show success message with $.toast
        $.toast({
          heading: "Success",
          text: "Personnel details updated successfully!",
          showHideTransition: "slide",
          icon: "success",
          position: "top-right",
        });
        //reload the page to show updated details
        populateEmployeeList();
      } else {
        //show error message with $.toast
        $.toast({
          heading: "Error",
          text: response,
          showHideTransition: "slide",
          icon: "error",
          position: "top-right",
        });
      }
    },
  });
});

$("#editModal").on("show.bs.modal", function (e) {
  $.ajax({
    url: "libs/php/getPersonnelByID.php",
    type: "GET",
    dataType: "json",
    data: {
      id: $(e.relatedTarget).attr("data-id"), // Retrieves the data-id attribute from the calling button
    },
    success: function (result) {
      var resultCode = result.status.code;

      if (resultCode == 200) {
        $("#employeeID").val(result.data.personnel[0].id);
        $("#editFirstName").val(result.data.personnel[0].firstName);
        $("#editLastName").val(result.data.personnel[0].lastName);
        $("#editJobTitle").val(result.data.personnel[0].jobTitle);
        $("#editEmail").val(result.data.personnel[0].email);
        $("#departmentSearch3").val(result.data.personnel[0].departmentID);
      } else {
        $("#editModal .modal-title").replaceWith("Error retrieving data");
      }
    },
    error: function (jqXHR, textStatus, errorThrown) {
      $("#editModal .modal-title").replaceWith("Error retrieving data");
    },
  });
});

$("#editModal").on("shown.bs.modal", function () {
  $("#editFirstName").focus();
});

$("#editModal").on("hidden.bs.modal", function () {
  $("#editForm")[0].reset();
});

$("#editDepartmentForm").on("submit", function (e) {
  e.preventDefault();
  //get the updated values from the form

  var updatedId = $("#departmentID").val();
  var updatedLocationId = $("#editDepartmentLocation").val();
  var updatedName = $("#editDepartmentName").val();

  $.ajax({
    url: "libs/php/editDepartment.php",
    method: "POST",
    data: {
      id: updatedId,
      name: updatedName,
      locationId: updatedLocationId,
    },
    dataType: "json",
    success: function (response) {
      if (response.status.description === "success") {
        //hide the modal
        $("#editDepartmentModal").modal("hide");
        //show success message with Toastr
        $.toast({
          text: "Department details updated successfully!",
          showHideTransition: "slide",
          icon: "success",
          position: "top-right",
        });
        //reload the page to show updated details
        updateDropdowns();
        populateDepartments();
      } else {
        $.toast({
          text: response,
          showHideTransition: "slide",
          icon: "error",
          position: "top-right",
        });
      }
    },
  });
});

$("#editDepartmentModal").on("show.bs.modal", function (e) {
  $.ajax({
    url: "libs/php/getDepartmentByID.php",
    type: "GET",
    dataType: "json",
    data: {
      id: $(e.relatedTarget).attr("data-id"), // Retrieves the data-id attribute from the calling button
    },
    success: function (result) {
      var resultCode = result.status.code;

      if (resultCode == 200) {
        $("#departmentID").val(result.data[0].id);
        $("#editDepartmentName").val(result.data[0].name);
        $("#editDepartmentLocation").val(result.data[0].locationID);
      } else {
        $("#editDepartmentModal .modal-title").replaceWith(
          "Error retrieving data"
        );
      }
    },
    error: function (jqXHR, textStatus, errorThrown) {
      $("#editDepartmentModal .modal-title").replaceWith(
        "Error retrieving data"
      );
    },
  });
});

$("#editDepartmentModal").on("shown.bs.modal", function () {
  $("#editDepartmentName").focus();
});

$("#editDepartmentModal").on("hidden.bs.modal", function () {
  $("#editDepartmentForm")[0].reset();
});

$("#editLocationForm").on("submit", function (e) {
  e.preventDefault();
  //get the updated values from the form

  //get the updated values from the form
  var updatedId = $("#locationID").val();
  var updatedName = $("#editLocationName").val();

  $.ajax({
    url: "libs/php/editLocation.php",
    method: "POST",
    data: {
      id: updatedId,
      name: updatedName,
    },
    dataType: "json",
    success: function (response) {
      if (response.status.description === "success") {
        //hide the modal
        $("#editLocationModal").modal("hide");
        //show success message
        $.toast({
          heading: "Success",
          text: "Location details updated successfully!",
          showHideTransition: "slide",
          icon: "success",
          position: "top-right",
        });
        //reload the page to show updated details
        updateDropdowns();
        populateLocations();
      } else {
        $.toast({
          heading: "Error",
          text: response,
          showHideTransition: "slide",
          icon: "error",
          position: "top-right",
        });
      }
    },
  });
});

$("#editLocationModal").on("show.bs.modal", function (e) {
  $.ajax({
    url: "libs/php/getLocationByID.php",
    type: "GET",
    dataType: "json",
    data: {
      id: $(e.relatedTarget).attr("data-id"), // Retrieves the data-id attribute from the calling button
    },
    success: function (result) {
      var resultCode = result.status.code;

      if (resultCode == 200) {
        //populate the form fields with the location details
        $("#locationID").val(result.data[0].id);
        $("#editLocationName").val(result.data[0].name);
      } else {
        $("#editLocationModal .modal-title").replaceWith(
          "Error retrieving data"
        );
      }
    },
    error: function (jqXHR, textStatus, errorThrown) {
      $("#editLocationModal .modal-title").replaceWith("Error retrieving data");
    },
  });
});

$("#editLocationModal").on("shown.bs.modal", function () {
  $("#editLocationName").focus();
});

$("#editLocationModal").on("hidden.bs.modal", function () {
  $("#editLocationForm")[0].reset();
});

//populates the department search and filters the employee list
function updateDropdowns() {
  //Retrieve all departments
  $.ajax({
    url: "libs/php/getAllDepartments.php",
    type: "GET",
    dataType: "json",
    success: function (data) {
      $("#departmentSearch").empty();
      $("#departmentSearch").prepend(
        $("<option>", {
          selected: "selected",
          value: "",
          text: "All Departments",
        })
      );
      data.data.forEach(function (department) {
        //Add departments to the select element
        $("#departmentSearch").append(
          $("<option>", {
            value: department.name,
            text: department.name,
          })
        );
      });
    },
  });

  $.ajax({
    url: "libs/php/getAllDepartments.php",
    type: "GET",
    dataType: "json",
    success: function (data) {
      $("#departmentSearch2").empty();
      $("#departmentSearch2").prepend(
        $("<option>", {
          disabled: "disabled",
          selected: "selected",
          value: "",
          text: "Select Department",
        })
      );
      data.data.forEach(function (department) {
        //Add departments to the select element
        $("#departmentSearch2").append(
          $("<option>", {
            value: department.id,
            text: department.name,
          })
        );
      });
    },
  });

  $.ajax({
    url: "libs/php/getAllLocations.php",
    type: "GET",
    dataType: "json",
    success: function (data) {
      $("#locationIdInput").empty();
      $("#locationIdInput").prepend(
        $("<option>", {
          disabled: "disabled",
          selected: "selected",
          value: "",
          text: "Select Location",
        })
      );
      data.data.forEach(function (location) {
        //Add departments to the select element
        $("#locationIdInput").append(
          $("<option>", {
            value: location.id,
            text: location.name,
          })
        );
      });
    },
  });

  $.ajax({
    url: "libs/php/getAllLocations.php",
    type: "GET",
    dataType: "json",
    success: function (data) {
      $("#editDepartmentLocation").empty();
      $("#editDepartmentLocation").prepend(
        $("<option>", {
          disabled: "disabled",
          selected: "selected",
          value: "",
          text: "Select Location",
        })
      );
      data.data.forEach(function (location) {
        //Add departments to the select element
        $("#editDepartmentLocation").append(
          $("<option>", {
            value: location.id,
            text: location.name,
          })
        );
      });
    },
  });

  $.ajax({
    url: "libs/php/getAllDepartments.php",
    type: "GET",
    dataType: "json",
    success: function (data) {
      $("#departmentSearch3").empty();
      $("#departmentSearch3").prepend(
        $("<option>", {
          disabled: "disabled",
          selected: "selected",
          value: "",
          text: "Select Department",
        })
      );
      data.data.forEach(function (department) {
        //Add departments to the select element
        $("#departmentSearch3").append(
          $("<option>", {
            value: department.id,
            text: department.name,
          })
        );
      });
    },
  });
}

updateDropdowns();

const table = document.querySelector(".table");
if (table.classList.contains("d-none")) {
  $("#nameSearch").on("keyup", function () {
    var nameValue = $(this).val().toLowerCase();
    var departmentValue = $("#departmentSearch").val().toLowerCase();

    if (nameValue.length > 0 || departmentValue.length > 0) {
      $("tbody tr").each(function () {
        var name = $(this).find("td:nth-child(1)").text().toLowerCase();
        var department = $(this).find("td:nth-child(4)").text().toLowerCase();

        if (
          name.indexOf(nameValue) === -1 ||
          department.indexOf(departmentValue) === -1
        ) {
          $(this).hide();
        } else {
          $(this).show();
        }
      });
    } else {
      $("tbody tr").show();
    }
  });

  $("#departmentSearch").on("change", function () {
    var nameValue = $("#nameSearch").val().toLowerCase();
    var departmentValue = $(this).val().toLowerCase();

    if (nameValue.length > 0 || departmentValue.length > 0) {
      $("tbody tr").each(function () {
        var name = $(this).find("td:nth-child(1)").text().toLowerCase();
        var department = $(this).find("td:nth-child(4)").text().toLowerCase();

        if (
          name.indexOf(nameValue) === -1 ||
          department.indexOf(departmentValue) === -1
        ) {
          $(this).hide();
        } else {
          $(this).show();
        }
      });
    } else {
      $("tbody tr").show();
    }
  });
}
if (window.matchMedia("(max-width: 992px)").matches) {
  $("#nameSearch").on("keyup", function () {
    var nameValue = $(this).val().toLowerCase();
    var departmentValue = $("#departmentSearch").val().toLowerCase();

    $(".card").each(function () {
      var name = $(this).find("h3").text().toLowerCase();
      var department = $(this).find("p:nth-child(3)").text().toLowerCase();

      if (
        name.indexOf(nameValue) === -1 ||
        department.indexOf(departmentValue) === -1
      ) {
        $(this).hide();
      } else {
        $(this).show();
      }
    });
  });

  $("#departmentSearch").on("change", function () {
    var nameValue = $("#nameSearch").val().toLowerCase();
    var departmentValue = $(this).val().toLowerCase();

    $(".card").each(function () {
      var name = $(this).find("h3").text().toLowerCase();
      var department = $(this).find("p:nth-child(3)").text().toLowerCase();

      if (
        name.indexOf(nameValue) === -1 ||
        department.indexOf(departmentValue) === -1
      ) {
        $(this).hide();
      } else {
        $(this).show();
      }
    });
  });
}

$("#addEmployeeForm").on("submit", function (e) {
  e.preventDefault();
  var firstName = $("#firstNameInput").val();
  var lastName = $("#lastNameInput").val();
  var jobTitle = $("#jobTitleInput").val();
  var email = $("#emailInput").val();
  var departmentID = $("#departmentSearch2").val();

  // Use ajax to call getDepartmentByID.php and retrieve department name and location ID
  $.ajax({
    url: "libs/php/getDepartmentByID.php",
    type: "GET",
    data: { id: departmentID },
    success: function (data) {
      departmentName = data.departmentName;
      locationID = data.locationID;

      $.ajax({
        url: "libs/php/addEmployee.php",
        type: "POST",
        data: {
          firstName: firstName,
          lastName: lastName,
          jobTitle: jobTitle,
          email: email,
          departmentID: departmentID,
        },
        success: function (data) {
          $("#addModal").modal("hide");
          $.toast({
            text: "Employee added successfully!",
            showHideTransition: "slide",
            position: "top-right",
            icon: "success",
          });
          populateEmployeeList();
          $("#addEmployeeForm")[0].reset();
        },
      });
    },
  });
});

$("#addDepartmentForm").on("submit", function (e) {
  e.preventDefault();

  //Get the values from the form
  let name = $("#departmentNameInput").val();
  let locationID = $("#locationIdInput").val();

  //Make an AJAX request to insert the department into the database
  $.ajax({
    url: "libs/php/insertDepartment.php",
    type: "POST",
    data: { name: name, locationID: locationID },
    success: function (data) {
      $("#addDepartmentModal").modal("hide");
      $.toast({
        text: "Department added successfully!",
        showHideTransition: "slide",
        position: "top-right",
        icon: "success",
      });
      $("#addDepartmentForm")[0].reset();
      updateDropdowns();
      populateDepartments();
    },
    error: function (xhr, status, error) {
      $.toast({
        text: "Failed to add department: " + error,
        showHideTransition: "slide",
        position: "top-right",
        icon: "error",
      });
    },
  });
});

$("#departments tbody").on("click", ".deleteBtn2", function () {
  let id = $(this).data("id").replace("delete", "");
  // Make an AJAX request to check if the department is being used
  $.ajax({
    url: "libs/php/checkDepartment.php",
    type: "POST",
    dataType: "json",
    data: { id: id },
    success: function (result) {
      if (result.status.code == 200) {
        if (result.data[0].departmentCount == 0) {
          $("#areYouSureDeptName").text(result.data[0].departmentName);

          $("#areYouSureDeleteDepartmentModal").modal("show");
        } else {
          $("#cantDeleteDeptName").text(result.data[0].departmentName);
          $("#pc").text(result.data[0].departmentCount);

          $("#cantDeleteDepartmentModal").modal("show");
        }
      } else {
        $.toast({
          text: "Failed to check department: " + error,
          position: "top-right",
          hideAfter: 5000,
        });
      }
    },
    error: function (xhr, status, error) {
      $.toast({
        text: "Failed to check department: " + error,
        position: "top-right",
        hideAfter: 5000,
      });
    },
  });

  $("#yesDelete")
    .off("click")
    .on("click", function () {
      // Make an AJAX request to delete the department from the database
      $.ajax({
        url: "libs/php/deleteDepartmentByID.php",
        type: "POST",
        data: { id: id },
        success: function () {
          $("#deleteDepartmentModal").modal("hide");
          $.toast({
            heading: "Success",
            text: "Department deleted successfully!",
            showHideTransition: "slide",
            icon: "success",
            position: "top-right",
          });
          updateDropdowns();
          populateDepartments();
        },
        error: function (xhr, status, error) {
          $.toast({
            text: "Failed to delete department: " + error,
            showHideTransition: "slide",
            bgColor: "#F44336",
            textColor: "#fff",
            allowToastClose: true,
            hideAfter: 6000,
            stack: 5,
            position: "top-right",
          });
        },
      });
    });
});

$("#addLocationForm").on("submit", function (e) {
  e.preventDefault(); //Prevent the page from refreshing

  //Get the values from the form
  let name = $("#locationNameInput").val();

  //Make an AJAX request to insert the location into the database
  $.ajax({
    url: "libs/php/insertLocation.php",
    type: "POST",
    data: { name: name },
    success: function (data) {
      $("#addLocationModal").modal("hide");
      $.toast({
        text: "Location added successfully!",
        showHideTransition: "slide",
        position: "top-right",
        icon: "success",
      });
      $("#addLocationForm")[0].reset();
      updateDropdowns();
      populateLocations();
    },
    error: function (xhr, status, error) {
      $.toast({
        text: "Failed to add location: " + error,
        position: "top-right",
        hideAfter: 5000,
      });
    },
  });
});

$("#locations tbody").on("click", ".deleteBtn3", function () {
  let id = $(this).data("id").replace("delete", "");
  console.log(id);
  // Make an AJAX request to check if the location is being used
  $.ajax({
    url: "libs/php/checkLocation.php",
    type: "POST",
    dataType: "json",
    data: { id: id },
    success: function (result) {
      if (result.status.code == 200) {
        if (result.data[0].locationCount == 0) {
          $("#areYouSureLocationName").text(result.data[0].locationName);

          $("#areYouSureDeleteLocationModal").modal("show");
        } else {
          $("#cantDeleteLocName").text(result.data[0].locationName);
          $("#departmentCount").text(result.data[0].locationCount);

          $("#cantDeleteLocationModal").modal("show");
        }
      } else {
        $.toast({
          text: "Failed to check location: " + error,
          position: "top-right",
          hideAfter: 5000,
        });
      }
    },
    error: function (xhr, status, error) {
      $.toast({
        text: "Failed to check location: " + error,
        position: "top-right",
        hideAfter: 5000,
      });
    },
  });

  $("#yesDelete2")
    .off("click")
    .on("click", function () {
      console.log(id);
      // Make an AJAX request to delete the location from the database
      $.ajax({
        url: "libs/php/deleteLocationByID.php",
        type: "POST",
        data: { id: id },
        success: function () {
          $("#deleteLocationModal").modal("hide");
          $.toast({
            heading: "Success",
            text: "Location deleted successfully!",
            showHideTransition: "slide",
            icon: "success",
            position: "top-right",
          });
          updateDropdowns();
          populateLocations();
        },
        error: function (xhr, status, error) {
          $.toast({
            text: "Failed to delete location: " + error,
            showHideTransition: "slide",
            bgColor: "#F44336",
            textColor: "#fff",
            allowToastClose: true,
            hideAfter: 6000,
            stack: 5,
            position: "top-right",
          });
        },
      });
    });
});

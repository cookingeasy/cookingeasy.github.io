<?php

$executionStartTime = microtime(true);

// this includes the login details
include("../../config.php");

header('Content-Type: application/json; charset=UTF-8');

$conn = new mysqli($cd_host, $cd_user, $cd_password, $cd_dbname, $cd_port, $cd_socket);

if (mysqli_connect_errno()) {

  $output['status']['code'] = "300";
  $output['status']['name'] = "failure";
  $output['status']['description'] = "database unavailable";
  $output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
  $output['data'] = [];

  mysqli_close($conn);

  echo json_encode($output);

  exit;

}

$locationID = $_POST['id'];

$query = "SELECT count(d.id) as locationCount, l.name as locationName
FROM department d
LEFT JOIN location l ON (l.id = d.locationID)
WHERE l.id = ?";

$stmt = $conn->prepare($query);
$stmt->bind_param("i", $locationID);
$stmt->execute();
$result = $stmt->get_result();
$row = $result->fetch_assoc();

$output = [
  'status' => [
    'code' => "200",
    'name' => "success",
    'description' => "Location count and name retrieved successfully",
    'returnedIn' => (microtime(true) - $executionStartTime) / 1000 . " ms"
  ],
  'data' => [
    [
      'locationName' => $row['locationName'],
      'locationCount' => $row['locationCount']
    ]
  ]
];

echo json_encode($output);

$conn->close();

?>
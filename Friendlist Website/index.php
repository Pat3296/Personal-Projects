<?php
require_once("settings.php");

$conn = @mysqli_connect($host, $user, $pswd, $dbnm);

if (!$conn) {
    $msg = "Database connection failure: " . mysqli_connect_error();
} else {
    // Create the 'friends' table
    $createFriends = "CREATE TABLE IF NOT EXISTS friends (
        friend_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
        friend_email VARCHAR(50) NOT NULL UNIQUE,
        password VARCHAR(20) NOT NULL,
        profile_name VARCHAR(30) NOT NULL,
        date_started DATE NOT NULL,
        num_of_friends INT UNSIGNED DEFAULT 0
    )";

    // Create the 'myfriends' table
    $createMyFriends = "CREATE TABLE IF NOT EXISTS myfriends (
        friend_id1 INT NOT NULL,
        friend_id2 INT NOT NULL
    )";

    if (mysqli_query($conn, $createFriends) && mysqli_query($conn, $createMyFriends)) {
        
        $checkData = mysqli_query($conn, "SELECT * FROM friends");
        
        if (mysqli_num_rows($checkData) == 0) {
            // 10 Actor Records with realistic passwords
            $insertFriends = "INSERT INTO friends (friend_email, password, profile_name, date_started, num_of_friends) VALUES 
                ('leo.dicaprio@hollywood.com', 'Leo_99Pass', 'Leonardo DiCaprio', '2023-01-15', 2),
                ('meryl.streep@acting.org', 'MStree#2023', 'Meryl Streep', '2023-02-10', 3),
                ('tom.hanks@wilson.com', 'T_Hanks77!', 'Tom Hanks', '2023-03-22', 2),
                ('viola.davis@egot.com', 'ViolaD_88', 'Viola Davis', '2023-05-05', 2),
                ('denzel.w@trainingday.com', 'DenW_pass1', 'Denzel Washington', '2023-06-18', 3),
                ('scarlett.j@marvel.com', 'S_Johan84', 'Scarlett Johansson', '2023-08-12', 2),
                ('ryan.reynolds@mint.ca', 'Ryan_R_99!', 'Ryan Reynolds', '2023-09-25', 2),
                ('cate.blanchett@aus.com', 'C_Blan_2024', 'Cate Blanchett', '2024-01-05', 1),
                ('cillian.m@peaky.uk', 'CMurphy_#1', 'Cillian Murphy', '2023-11-14', 2),
                ('margot.robbie@barbie.au', 'M_Robbie90', 'Margot Robbie', '2023-12-20', 1)";
            
            // 20 Relationship Records
            $insertMyFriends = "INSERT INTO myfriends (friend_id1, friend_id2) VALUES 
                (1,3), (3,1), (1,5), (5,1), 
                (2,4), (4,2), (2,6), (6,2), 
                (2,8), (8,2), (3,7), (7,3), 
                (4,10), (10,4), (5,9), (9,5), 
                (5,2), (2,5), (7,9), (9,7)";

            if(mysqli_query($conn, $insertFriends) && mysqli_query($conn, $insertMyFriends)) {
                $msg = "Tables successfully created and populated.";
            } else {
                $msg = "Tables created but data population failed: " . mysqli_error($conn);
            }
        } else {
            $msg = "Tables already exist and are populated.";
        }
    } else {
        $msg = "Error setting up database: " . mysqli_error($conn);
    }
    mysqli_close($conn);
}
?>

<!DOCTYPE html>
<html>
<head>
<meta http-equiv="content-type" content="text/html; charset=utf-8" />
<meta name="description" content="Assignment 3: System Development Project 2" />
<meta name="keywords" content="Web,programming" />
<meta name="author" content="Patrick Caldwell" />
<title>Assignment 3: System Development Project 2</title>
<link href="style.css" rel="stylesheet" type="text/css" />
</head>

<body>
    <h1>COS30020 - Advanced Web Development Assignment 3: System Development Project 2</h1>
    
    <p>Patrick James Caldwell - S106023760 - 106023760@student.swin.edu.au</p>
    <p>I declare that this assignment is my individual work. I have not worked collaboratively nor have I copied from any other students work or from any other source.</p>

    <p>Tables have been created successfully and populated</p>

    <p><a href="login.php">Log In</a></p>
    <p><a href="signup.php">Sign Up</a></p>
    <p><a href="about.php">About this assignment</a></p>
</body>
</html>
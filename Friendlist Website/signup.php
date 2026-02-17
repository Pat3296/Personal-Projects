<?php
session_start();
require_once("settings.php");

$email = $profile = "";
$errorMsg = "";

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $email = trim($_POST["email"]);
    $profile = trim($_POST["profile_name"]);
    $pwd = $_POST["password"];
    $cpwd = $_POST["confirm_password"];

    $conn = @mysqli_connect($host, $user, $pswd, $dbnm);

    if (!$conn) {
        $errorMsg = "Database connection failed.";
    } else {
        // Validation Logic
        $valid = true;
        
        // Email validation
        if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $errorMsg .= "Invalid email format. ";
            $valid = false;
        } else {
            $checkEmail = mysqli_query($conn, "SELECT * FROM friends WHERE friend_email = '$email'");
            if (mysqli_num_rows($checkEmail) > 0) {
                $errorMsg .= "Email already exists. ";
                $valid = false;
            }
        }

        // Profile validation (Letters only)
        if (empty($profile) || !preg_match("/^[a-zA-Z ]*$/", $profile)) {
            $errorMsg .= "Profile name must contain only letters and cannot be blank. ";
            $valid = false;
        }

        // Password validation (Alphanumeric and matching)
        if (empty($pwd) || !preg_match("/^[a-zA-Z0-9]*$/", $pwd)) {
            $errorMsg .= "Password must contain only letters and numbers. ";
            $valid = false;
        } elseif ($pwd !== $cpwd) {
            $errorMsg .= "Passwords do not match. ";
            $valid = false;
        }

        // If all valid, insert into DB
        if ($valid) {
            $date = date("Y-m-d");
            $insertQuery = "INSERT INTO friends (friend_email, password, profile_name, date_started, num_of_friends) 
                            VALUES ('$email', '$pwd', '$profile', '$date', 0)";
            
            if (mysqli_query($conn, $insertQuery)) {
                $new_id = mysqli_insert_id($conn);

                $_SESSION["user_email"] = $email;
                $_SESSION["user_name"] = $profile;
                $_SESSION["user_id"] = $new_id; 
                $_SESSION["logged_in"] = true;
                
                mysqli_close($conn);
                header("Location: friendadd.php");
                exit();
            } else {
                $errorMsg = "Registration failed: " . mysqli_error($conn);
            }
        }
        mysqli_close($conn);
    }
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <title>My Friend System - Sign Up</title>
    <link href="style.css" rel="stylesheet" type="text/css" />
</head>
<body>
    <h1>My Friend System</h1>
    <h2>Registration Page</h2>

    <?php if ($errorMsg) echo "<p style='color:red;'>$errorMsg</p>"; ?>

    <form action="signup.php" method="POST">
        <p>Email: <input type="text" name="email" value="<?php echo htmlspecialchars($email); ?>" /></p>
        <p>Profile Name: <input type="text" name="profile_name" value="<?php echo htmlspecialchars($profile); ?>" /></p>
        <p>Password: <input type="password" name="password" /></p>
        <p>Confirm Password: <input type="password" name="confirm_password" /></p>
        
        <input type="submit" value="Register" />
        <input type="reset" value="Clear" />
    </form>

    <p><a href="index.php">Back to Home</a></p>
</body>
</html>
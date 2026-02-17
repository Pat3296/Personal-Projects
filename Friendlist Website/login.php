<?php
session_start();
require_once("settings.php");

$email = "";
$errorMsg = "";

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $email = trim($_POST["email"]);
    $pwd = $_POST["password"];

    $conn = @mysqli_connect($host, $user, $pswd, $dbnm);

    if (!$conn) {
        $errorMsg = "Database connection failure.";
    } else {
        // Sanitize input for the query
        $email = mysqli_real_escape_string($conn, $email);
        $pwd = mysqli_real_escape_string($conn, $pwd);

        // Check if email and password match a record in the friends table
        $query = "SELECT * FROM friends WHERE friend_email = '$email' AND password = '$pwd'";
        $result = mysqli_query($conn, $query);

        if ($result && mysqli_num_rows($result) > 0) {
            $row = mysqli_fetch_assoc($result);
            
            // Set session variables upon successful login
            $_SESSION["user_email"] = $row["friend_email"];
            $_SESSION["user_name"] = $row["profile_name"];
            $_SESSION["user_id"] = $row["friend_id"];
            $_SESSION["logged_in"] = true;

            mysqli_close($conn);
            header("Location: friendlist.php");
            exit();
        } else {
            $errorMsg = "Invalid email or password.";
        }
        mysqli_close($conn);
    }
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <meta name="author" content="Patrick Caldwell" />
    <title>My Friend System - Log In</title>
    <link href="style.css" rel="stylesheet" type="text/css" />
</head>
<body>
    <h1>My Friend System</h1>
    <h2>Log In Page</h2>

    <?php if ($errorMsg) echo "<p style='color:red;'>$errorMsg</p>"; ?>

    <form action="login.php" method="POST">
        <p>Email: <input type="text" name="email" value="<?php echo htmlspecialchars($email); ?>" /></p>
        <p>Password: <input type="password" name="password" /></p>
        
        <input type="submit" value="Log In" />
    </form>

    <p><a href="index.php">Back to Home</a></p>
</body>
</html>
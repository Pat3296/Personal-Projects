<?php
session_start();
require_once("settings.php");

// Check if user is logged in
if (!isset($_SESSION["logged_in"]) || $_SESSION["logged_in"] !== true) {
    header("Location: login.php");
    exit();
}

$user_id = $_SESSION["user_id"];
$user_name = $_SESSION["user_name"];
$conn = @mysqli_connect($host, $user, $pswd, $dbnm);

if (!$conn) {
    die("Database connection failure.");
}

// Handle Unfriend Logic
if ($_SERVER["REQUEST_METHOD"] == "POST" && isset($_POST["unfriend_id"])) {
    $friend_to_remove = $_POST["unfriend_id"];

    // Delete the friendship (both ways)
    $deleteQuery = "DELETE FROM myfriends 
                    WHERE (friend_id1 = $user_id AND friend_id2 = $friend_to_remove) 
                    OR (friend_id1 = $friend_to_remove AND friend_id2 = $user_id)";
    
    if (mysqli_query($conn, $deleteQuery)) {
        // Update friend counts for both users
        mysqli_query($conn, "UPDATE friends SET num_of_friends = num_of_friends - 1 WHERE friend_id = $user_id");
        mysqli_query($conn, "UPDATE friends SET num_of_friends = num_of_friends - 1 WHERE friend_id = $friend_to_remove");
    }
}

// Get current friends list
$query = "SELECT f.friend_id, f.profile_name 
          FROM friends f
          JOIN myfriends m ON f.friend_id = m.friend_id2
          WHERE m.friend_id1 = $user_id
          ORDER BY f.profile_name ASC";
$result = mysqli_query($conn, $query);
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <title>My Friend System - Friend List</title>
    <link href="style.css" rel="stylesheet" type="text/css" />
</head>
<body>
    <h1>My Friend System</h1>
    <h2><?php echo htmlspecialchars($user_name); ?>'s Friend List Page</h2>
    <p>Total number of friends is <?php echo mysqli_num_rows($result); ?></p>

    <table border="0">
        <?php while ($row = mysqli_fetch_assoc($result)): ?>
        <tr>
            <td><?php echo htmlspecialchars($row["profile_name"]); ?></td>
            <td>
                <form method="POST" action="friendlist.php" style="display:inline;">
                    <input type="hidden" name="unfriend_id" value="<?php echo $row["friend_id"]; ?>" />
                    <input type="submit" value="Unfriend" />
                </form>
            </td>
        </tr>
        <?php endwhile; ?>
    </table>

    <hr />
    <p>
        <a href="friendadd.php">Add Friends</a> | 
        <a href="logout.php">Log Out</a>
    </p>
</body>
</html>
<?php mysqli_close($conn); ?>
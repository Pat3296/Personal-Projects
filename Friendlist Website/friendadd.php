<?php
session_start();
require_once("settings.php");

if (!isset($_SESSION["logged_in"]) || $_SESSION["logged_in"] !== true) {
    header("Location: login.php");
    exit();
}

$user_id = isset($_SESSION["user_id"]) ? $_SESSION["user_id"] : 0;
$user_name = $_SESSION["user_name"];
$conn = @mysqli_connect($host, $user, $pswd, $dbnm);

if (!$conn) {
    die("Database connection failure.");
}

// Pagination Setup
$limit = 5; 
$page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
if ($page < 1) $page = 1;
$offset = ($page - 1) * $limit;

// Handle Add Friend Logic
if ($_SERVER["REQUEST_METHOD"] == "POST" && isset($_POST["add_friend_id"])) {
    $friend_to_add = $_POST["add_friend_id"];
    $insertQuery = "INSERT INTO myfriends (friend_id1, friend_id2) VALUES ($user_id, $friend_to_add)";
    
    if (mysqli_query($conn, $insertQuery)) {
        mysqli_query($conn, "UPDATE friends SET num_of_friends = num_of_friends + 1 WHERE friend_id = $user_id");
        mysqli_query($conn, "UPDATE friends SET num_of_friends = num_of_friends + 1 WHERE friend_id = $friend_to_add");
    }
}

// Count total potential friends
$countQuery = "SELECT COUNT(*) as total FROM friends 
               WHERE friend_id != $user_id 
               AND friend_id NOT IN (SELECT friend_id2 FROM myfriends WHERE friend_id1 = $user_id)";
$countResult = mysqli_query($conn, $countQuery);
$totalRecords = mysqli_fetch_assoc($countResult)['total'];
$totalPages = ceil($totalRecords / $limit);

// Fetch friends with Mutual Friend Count
$result = false;
if ($user_id > 0) {
    // This query uses a correlated subquery to count mutual friends
    $query = "SELECT f.friend_id, f.profile_name, 
              (SELECT COUNT(*) 
               FROM myfriends m1 
               JOIN myfriends m2 ON m1.friend_id2 = m2.friend_id2 
               WHERE m1.friend_id1 = $user_id 
               AND m2.friend_id1 = f.friend_id) AS mutual_count
              FROM friends f
              WHERE f.friend_id != $user_id 
              AND f.friend_id NOT IN (
                  SELECT friend_id2 FROM myfriends WHERE friend_id1 = $user_id
              )
              ORDER BY f.profile_name ASC
              LIMIT $limit OFFSET $offset";
              
    $result = mysqli_query($conn, $query);
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <title>My Friend System - Add Friends</title>
    <link href="style.css" rel="stylesheet" type="text/css" />
</head>
<body>
    <h1>My Friend System</h1>
    <h2><?php echo htmlspecialchars($user_name); ?>'s Add Friend Page</h2>
    
    <table border="0">
        <?php if ($result): ?>
            <?php while ($row = mysqli_fetch_assoc($result)): ?>
            <tr>
                <td><?php echo htmlspecialchars($row["profile_name"]); ?></td>
                <td><?php echo $row["mutual_count"]; ?> mutual friends</td>
                <td>
                    <form method="POST" action="friendadd.php?page=<?php echo $page; ?>" style="display:inline;">
                        <input type="hidden" name="add_friend_id" value="<?php echo $row["friend_id"]; ?>" />
                        <input type="submit" value="Add as friend" />
                    </form>
                </td>
            </tr>
            <?php endwhile; ?>
        <?php endif; ?>
    </table>

    <div class="pagination">
        <?php if ($page > 1): ?>
            <a href="friendadd.php?page=<?php echo $page - 1; ?>">Previous</a>
        <?php endif; ?>

        <?php if ($page < $totalPages): ?>
            <a href="friendadd.php?page=<?php echo $page + 1; ?>">Next</a>
        <?php endif; ?>
    </div>

    <hr />
    <p>
        <a href="friendlist.php">Friend List</a> | 
        <a href="logout.php">Log Out</a>
    </p>
</body>
</html>
<?php mysqli_close($conn); ?>
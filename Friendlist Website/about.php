<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <meta name="description" content="Assignment 3 - About Page" />
    <meta name="keywords" content="PHP, Web Programming" />
    <meta name="author" content="Patrick Caldwell" />
    <title>My Friend System - About Page</title>
</head>
<body>
    <h1>My Friend System</h1>
    <h2>About This Assignment</h2>

    <ul>
        <li><strong>What tasks you have not attempted or not completed?</strong>
            <br />I have completed all tasks, including the advanced Task 8 (Pagination) and Task 9 (Mutual Friends).
        </li>
        
        <li><strong>What special features have you done, or attempted, in creating the site that we should know about?</strong>
            <br />I implemented <strong>SQL Join logic</strong> to calculate mutual friends in real-time and used <strong>LIMIT/OFFSET</strong> clauses for efficient data pagination.
        </li>

        <li><strong>Which parts did you have trouble with?</strong>
            <br />The most challenging part was the correlated subquery required to count mutual friends for each user while maintaining the pagination state through the URL.
        </li>

        <li><strong>What would you like to do better next time?</strong>
            <br />Next time, I would like to implement a more advanced database schema that includes indices on the friend ID columns to improve query performance as the user base grows.
        </li>

        <li><strong>What additional features did you add to the assignment?</strong>
            <br />I implemented a bi-directional friendship link logic where adding or removing a friend automatically updates the friend counts for both users involved.
        </li>
    </ul>

    <hr />
    <p>
        <a href="friendlist.php">Friend List</a> | 
        <a href="friendadd.php">Add Friends</a> | 
        <a href="index.php">Home Page</a>
    </p>

</body>
</html>
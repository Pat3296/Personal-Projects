<?php
session_start(); // Access the current session
session_unset(); // Remove all session variables
session_destroy(); // Destroy the session itself

// Redirect to the Home page 
header("Location: index.php");
exit();
?>
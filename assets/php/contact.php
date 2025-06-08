<?php
header('Content-Type: application/json');

function respond($success, $message) {
    echo json_encode(['success' => $success, 'message' => $message]);
    exit;
}

// Allow only POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(false, 'Invalid request method.');
}

// Get and sanitize POST data
$name = isset($_POST['name']) ? trim($_POST['name']) : '';
$email = isset($_POST['email']) ? trim($_POST['email']) : '';
$subject = isset($_POST['subject']) ? trim($_POST['subject']) : '';
$message = isset($_POST['message']) ? trim($_POST['message']) : '';

// Server-side validation
if (empty($name)) {
    respond(false, 'Name is required.');
}
if (empty($email)) {
    respond(false, 'Email is required.');
} elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    respond(false, 'Invalid email format.');
}
if (empty($subject)) {
    respond(false, 'Subject is required.');
}
if (empty($message)) {
    respond(false, 'Message is required.');
}

// Prepare mail parameters
$to = 'kunalgavit285@gmail.com';  // <- Change this to your email address for real use
$safe_name = str_replace(["\r", "\n"], '', $name);
$safe_email = str_replace(["\r", "\n"], '', $email);
$clean_subject = substr($subject, 0, 78);
$headers = "From: \"$safe_name\" <$safe_email>\r\n";
$headers .= "Reply-To: $safe_email\r\n";
$headers .= "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

$email_body = "You have received a new message from your website contact form.\n\n";
$email_body .= "Name: $name\n";
$email_body .= "Email: $email\n";
$email_body .= "Subject: $subject\n\n";
$email_body .= "Message:\n$message\n";

// Send the email
$sent = @mail($to, $clean_subject, $email_body, $headers);

if ($sent) {
    respond(true, 'Thank you for contacting us! Your message has been sent.');
} else {
    respond(false, 'Sorry, your message could not be sent. Please try again later.');
}

<?php
/**
 * Portfolio Contact Form Handler
 * Multiple sending methods for maximum compatibility
 */

// ==============================================
// CONFIGURATION - CHANGE THESE VALUES
// ==============================================

// Your email where you want to receive messages
$receiving_email_address = 'kunalgavit285@gmail.com'; // Change this to your email

// SMTP Configuration (recommended for reliability)
$use_smtp = true; // Set to false to use simple method
$smtp_host = 'smtp.gmail.com';
$smtp_port = 587;
$smtp_username = 'kunalgavit285@gmail.com'; // Your Gmail address
$smtp_password = 'your-app-password'; // Your Gmail app password (not regular password)

// ==============================================
// FORM PROCESSING
// ==============================================

// Check if form was submitted
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    
    // Allow both AJAX and regular form submissions
    $is_ajax = isset($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest';
    
    // Sanitize and validate input data
    $name = isset($_POST['name']) ? trim(strip_tags($_POST['name'])) : '';
    $email = isset($_POST['email']) ? trim(strip_tags($_POST['email'])) : '';
    $subject = isset($_POST['subject']) ? trim(strip_tags($_POST['subject'])) : '';
    $message = isset($_POST['message']) ? trim(strip_tags($_POST['message'])) : '';
    
    // Validation
    $errors = [];
    
    if (empty($name)) {
        $errors[] = 'Name is required';
    }
    
    if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $errors[] = 'Valid email is required';
    }
    
    if (empty($subject)) {
        $errors[] = 'Subject is required';
    }
    
    if (empty($message)) {
        $errors[] = 'Message is required';
    }
    
    // Additional security checks
    if (strlen($name) > 100 || strlen($subject) > 200 || strlen($message) > 5000) {
        $errors[] = 'Input too long';
    }
    
    // Basic spam protection
    $spam_keywords = ['viagra', 'casino', 'lottery', 'winner', 'congratulations', 'inheritance'];
    $content_check = strtolower($message . ' ' . $subject);
    foreach ($spam_keywords as $keyword) {
        if (strpos($content_check, $keyword) !== false) {
            $errors[] = 'Message contains prohibited content';
        }
    }
    
    // If there are errors, return them
    if (!empty($errors)) {
        http_response_code(400);
        die(implode(', ', $errors));
    }
    
    // Try to send email
    $email_sent = false;
    
    if ($use_smtp && class_exists('PHPMailer\PHPMailer\PHPMailer')) {
        $email_sent = sendEmailWithPHPMailer($name, $email, $subject, $message);
    }
    
    // Fallback to simple methods
    if (!$email_sent) {
        $email_sent = sendEmailSimple($name, $email, $subject, $message);
    }
    
    // If still not sent, try file logging as last resort
    if (!$email_sent) {
        $email_sent = logEmailToFile($name, $email, $subject, $message);
    }
    
    if ($email_sent) {
        echo "OK";
    } else {
        http_response_code(500);
        die('Unable to send email. Please try again later.');
    }
    
} else {
    // Not a POST request
    http_response_code(405);
    die('Method not allowed');
}

// ==============================================
// EMAIL SENDING FUNCTIONS
// ==============================================

function sendEmailWithPHPMailer($name, $email, $subject, $message) {
    global $smtp_host, $smtp_port, $smtp_username, $smtp_password, $receiving_email_address;
    
    try {
        // Check if PHPMailer is available
        if (!class_exists('PHPMailer\PHPMailer\PHPMailer')) {
            return false;
        }
        
        $mail = new PHPMailer\PHPMailer\PHPMailer(true);
        
        // Server settings
        $mail->isSMTP();
        $mail->Host = $smtp_host;
        $mail->SMTPAuth = true;
        $mail->Username = $smtp_username;
        $mail->Password = $smtp_password;
        $mail->SMTPSecure = PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port = $smtp_port;
        
        // Recipients
        $mail->setFrom($smtp_username, 'Portfolio Contact Form');
        $mail->addAddress($receiving_email_address);
        $mail->addReplyTo($email, $name);
        
        // Content
        $mail->isHTML(false);
        $mail->Subject = "Portfolio Contact: " . $subject;
        $mail->Body = "New message from your portfolio contact form:\n\n" .
                     "Name: " . $name . "\n" .
                     "Email: " . $email . "\n" .
                     "Subject: " . $subject . "\n\n" .
                     "Message:\n" . $message . "\n\n" .
                     "---\nSent from portfolio contact form";
        
        $mail->send();
        return true;
        
    } catch (Exception $e) {
        error_log("PHPMailer Error: " . $e->getMessage());
        return false;
    }
}

function sendEmailSimple($name, $email, $subject, $message) {
    global $receiving_email_address;
    
    $to = $receiving_email_address;
    $email_subject = "Portfolio Contact: " . $subject;
    
    $email_body = "New message from your portfolio contact form:\n\n";
    $email_body .= "Name: " . $name . "\n";
    $email_body .= "Email: " . $email . "\n";
    $email_body .= "Subject: " . $subject . "\n\n";
    $email_body .= "Message:\n" . $message . "\n\n";
    $email_body .= "---\nSent from portfolio contact form";
    
    $headers = "From: " . $name . " <noreply@" . $_SERVER['HTTP_HOST'] . ">\r\n";
    $headers .= "Reply-To: " . $email . "\r\n";
    $headers .= "X-Mailer: PHP/" . phpversion() . "\r\n";
    $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
    
    return mail($to, $email_subject, $email_body, $headers);
}

function logEmailToFile($name, $email, $subject, $message) {
    $log_file = dirname(__FILE__) . '/contact_messages.txt';
    
    $log_entry = "\n" . str_repeat("=", 50) . "\n";
    $log_entry .= "Date: " . date('Y-m-d H:i:s') . "\n";
    $log_entry .= "Name: " . $name . "\n";
    $log_entry .= "Email: " . $email . "\n";
    $log_entry .= "Subject: " . $subject . "\n";
    $log_entry .= "Message: " . $message . "\n";
    $log_entry .= str_repeat("=", 50) . "\n";
    
    return file_put_contents($log_file, $log_entry, FILE_APPEND | LOCK_EX) !== false;
}

// ==============================================
// INSTALLATION GUIDE
// ==============================================

/*
STEP 1: Update Configuration
- Change $receiving_email_address to your email
- If using Gmail SMTP, update $smtp_username and $smtp_password

STEP 2: For Gmail SMTP (Recommended):
1. Enable 2-factor authentication on your Gmail account
2. Generate an app password:
   - Go to Google Account settings
   - Security > 2-Step Verification > App passwords
   - Generate password for "Mail"
   - Use this password in $smtp_password

STEP 3: Install PHPMailer (if using SMTP):
Run this command in your project root:
composer require phpmailer/phpmailer

STEP 4: Alternative - Simple Mode:
If you can't use SMTP, set $use_smtp = false
This will use PHP's mail() function or log to file

STEP 5: Test the form:
Submit a test message through your contact form
Check your email or the contact_messages.txt file
*/

?>

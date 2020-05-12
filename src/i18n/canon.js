/* eslint-disable quote-props */
/* this file needs to retain quote-props for it to pass as valid JSON */

export default {
  "Activate": {
    "actions": {
      "ACTIVATE_SEND_FAILURE": "Error sending activation to {{email}}.",
      "ACTIVATE_SEND_SUCCESS": "{{email}} has been sent an activation link. Please check your inbox.",
      "ACTIVATE_TOKEN_FAILURE": "Activation token is invalid or has expired."
    },
    "button": "Send Verification",
    "mailgun": {
      "body": "Thanks for signing up for {{site}}! Please confirm your email address by clicking on the link below.",
      "button": "Click To Confirm",
      "closing": "Yours sincerely,",
      "footer": "You're receiving this email because you recently created a new {{site}} account or added a new email address. If this wasn't you, please ignore this email.",
      "greeting": "Hi {{username}},",
      "link": "Or copy and paste the following into your browser: {{confirmLink}}",
      "signature": "The {{site}} Team",
      "title": "E-mail Verification",
      "welcome": "Welcome to {{site}}!"
    }
  },
  "CMS": {
    "Options": {
      "Close": "Close",
      "Copied": "Copied",
      "Copy": "Copy",
      "Direct link": "Direct link",
      "Download": "Download",
      "Download as CSV": "Download as CSV",
      "Endpoint": "Endpoint",
      "Image Format": "Image Format",
      "Image area": "Image area",
      "Loading Data": "Loading Data",
      "Processing image": "Processing image",
      "Save Image": "Save Image",
      "Save visualization as": "Save visualization as",
      "Scroll to section": "Scroll to section",
      "Share": "Share",
      "Share on Facebook": "Share on Facebook",
      "Share on Twitter": "Share on Twitter",
      "Social": "Social",
      "Transparent Background": "Transparent Background",
      "View Data": "View Data",
      "Visualization options": "Visualization options",
      "entire section": "entire section",
      "visualization only": "visualization only"
    },
    "SourceGroup": {
      "and": "and",
      "Data provided by": "Data provided by"
    }
  },
  "Loading": {
    "description": "Loading {{progress}} of {{total}} datasets",
    "title": "Please Wait"
  },
  "Login": {
    "E-mail": "E-mail",
    "Facebook": "Facebook",
    "Instagram": "Instagram",
    "Login": "Login",
    "Password": "Password",
    "Twitter": "Twitter",
    "error": "Wrong Username or Password",
    "success": "Successfully Logged In"
  },
  "Reset": {
    "Confirm Password": "Confirm New Password",
    "E-mail": "E-mail",
    "Password": "New Password",
    "Reset": "Reset",
    "button": "Reset Password",
    "actions": {
      "RESET_SEND_FAILURE": "No account associated with {{email}}.",
      "RESET_SEND_SUCCESS": "{{email}} has been sent a password reset. Please check your inbox.",
      "RESET_TOKEN_FAILURE": "Password reset token is invalid or has expired."
    },
    "mailgun": {
      "body": "Someone has requested that your {{site}} account password be reset. If this wasn't you, you can safely ignore this email and your password will remain the same.",
      "button": "Reset My Password",
      "footer": "Or just visit {{resetLink}} in your browser",
      "title": "Password Reset"
    }
  },
  "SignUp": {
    "Confirm Password": "Confirm Password",
    "E-mail": "E-mail",
    "Facebook": "Facebook",
    "Instagram": "Instagram",
    "Password": "Password",
    "PrivacyTermsText": "By checking this box, you agree to our <a href='{{terms}}'>Terms of Service</a> and <a href='{{privacy}}'>Privacy Policy</a>",
    "PrivacyText": "By checking this box, you agree to our <a href='{{privacy}}'>Privacy Policy</a>",
    "Sign Up": "Sign Up",
    "TermsText": "By checking this box, you agree to our <a href='{{terms}}'>Terms of Service</a>",
    "Twitter": "Twitter",
    "Username": "Username",
    "error": {
      "Exists": "E-mail or Username already in use",
      "IncompleteFields": "Please set all fields",
      "PasswordMatch": "Passwords don't match",
      "TermsAgree": "Must agree to terms to continue"
    },
    "success": "Successfully Signed Up"
  }
};

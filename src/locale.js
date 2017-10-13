export default {
  Activate: {
    button: "Send Verification",
    actions: {
      ACTIVATE_SEND_FAILURE: "Error sending activation to {{email}}.",
      ACTIVATE_SEND_SUCCESS: "{{email}} has been sent an activation link. Please check your inbox.",
      ACTIVATE_TOKEN_FAILURE: "Activation token is invalid or has expired."
    }
  },
  Login: {
    "E-mail": "E-mail",
    "Facebook": "Facebook",
    "Instagram": "Instagram",
    "Login": "Login",
    "Password": "Password",
    "Twitter": "Twitter",
    "error": "Wrong Username or Password",
    "success": "Successfully Logged In"
  },
  Reset: {
    "Confirm Password": "Confirm New Password",
    "E-mail": "E-mail",
    "Password": "New Password",
    "Reset": "Reset",
    "button": "Reset Password",
    "actions": {
      RESET_SEND_FAILURE: "No account associated with {{email}}.",
      RESET_SEND_SUCCESS: "{{email}} has been sent a password reset. Please check your inbox.",
      RESET_TOKEN_FAILURE: "Password reset token is invalid or has expired."
    }
  },
  SignUp: {
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
      Exists: "E-mail or Username already in use",
      IncompleteFields: "Please set all fields",
      PasswordMatch: "Passwords don't match",
      TermsAgree: "Must agree to terms to continue"
    },
    "success": "Successfully Signed Up"
  }
};

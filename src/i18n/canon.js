/* eslint-disable quote-props */
/* this file needs to retain quote-props for it to pass as valid JSON */

export default {
  "Activate": {
    "button": "Send Verification",
    "actions": {
      "ACTIVATE_SEND_FAILURE": "Error sending activation to {{email}}.",
      "ACTIVATE_SEND_SUCCESS": "{{email}} has been sent an activation link. Please check your inbox.",
      "ACTIVATE_TOKEN_FAILURE": "Activation token is invalid or has expired."
    },
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
      "Direct link": "Direct link",
      "Download as CSV": "Download as CSV",
      "Generating Image": "Generating Image",
      "Loading Data": "Loading Data",
      "Only Download Visualization": "Only Download Visualization",
      "Save Image": "Save Image",
      "Share": "Share",
      "Copy": "Copy",
      "Copied": "Copied",
      "Share on Facebook": "Share on Facebook",
      "Share on Twitter": "Share on Twitter",
      "Social": "Social",
      "Scroll to section": "Scroll to section",
      "Transparent Background": "Transparent Background",
      "View Data": "View Data"
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
  },
  "Vizbuilder": {
    "action_apply": "Apply",
    "action_back": "Back",
    "action_close": "Close",
    "action_delete": "Delete",
    "action_edit": "Edit",
    "action_enlarge": "Enlarge",
    "action_fileissue": "File an issue",
    "action_newfilter": "Add filter",
    "action_newgroup": "Add group",
    "action_reset": "Reset",
    "action_retry": "Retry",
    "action_togglemoe": "Calculate Margins of Error",
    "chart_labels": {
      "ci": "Confidence Interval",
      "moe": "Margin of Error",
      "source": "Source",
      "collection": "Collection",
      "measure_share": "{{measureName}} (share)"
    },
    "comparison": {
      "EQ": "Equal to",
      "HAS": "Contains the term",
      "HT": "Higher than",
      "HTE": "Higher than or equal to",
      "LT": "Lower than",
      "LTE": "Lower than or equal to",
      "NEQ": "Not equal to"
    },
    "error": {
      "chartfail_detail": "This chart failed during rendering. You can try re-rendering it, or report the problem to us.",
      "chartfail_title": "Chart render failed",
      "empty_detail": "The server doesn't have data for the parameters you requested.\nPlease try again with more broad filters, members, or drilldowns, or file an issue.",
      "empty_title": "Empty dataset",
      "internal_detail": "There was an internal error in Vizbuilder.\nIf this keeps happening, please file an issue including the permalink and/or an screenshot of the parameters in the sidebar.",
      "internal_title": "Internal error",
      "message": "Error details: \"{{message}}\".",
      "network_detail": "Please check your internet connection and try again.",
      "network_title": "Disconnected",
      "nocharts_detail": "This is probably an issue with vizbuilder.\nPlease file an issue indicating the set of parameters that outputted this result.",
      "nocharts_title": "No charts could be computed with these parameters.",
      "overload_detail": "The parameters defined returned too many data points. Please try a query with less granularity.",
      "overload_title": "Too much data",
      "server_detail": "The server had an internal problem while processing your request. Please try again later, or if the problem persists, file an issue.",
      "server_title": "Server error",
      "unknown_detail": "An unexpected error happened.\nIf this keeps happening, please file an issue including the permalink and/or an screenshot of the parameters in the sidebar.",
      "unknown_title": "Unknown error"
    },
    "prefix_dataset": "Dataset: ",
    "prefix_source": "Source: ",
    "title_areacharts": "Visualizations",
    "title_areasidebar": "Visualization controls",
    "title_bottomten": "Bottom 10 ({{timePeriod}})",
    "title_filters": "Filter by",
    "title_groups": "Grouped by",
    "title_measure": "Showing",
    "title_ranking": "Ranking ({{timePeriod}})",
    "title_source": "Source information",
    "title_topten": "Top 10 ({{timePeriod}})"
  }
};

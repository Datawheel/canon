export default {
  link: [
    {rel: "icon", href: "favicon.ico"}
  ],
  meta: [
    {charset: "utf-8"},
    {"http-equiv": "X-UA-Compatible", "content": "IE=edge"},
    {name: "description", content: "{{pkg.description}}"},
    {name: "viewport", content: "width=device-width, initial-scale=1"},
    {name: "mobile-web-app-capable", content: "yes"},
    {name: "apple-mobile-web-app-capable", content: "yes"},
    {name: "apple-mobile-web-app-status-bar-style", content: "black"},
    {name: "apple-mobile-web-app-title", content: "{{pkg.name}}"}
  ],
  title: "{{pkg.name}}"
};

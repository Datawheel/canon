import {titleCase} from "d3plus-text";

const serviceJavaScript = {
  FACEBOOK_PIXEL: id => `!function(f,b,e,v,n,t,s) {if(f.fbq)return;n=f.fbq=function(){
        n.callMethod? n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0; t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window,document,'script', 'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '${id}'); fbq('track', 'PageView');`,
  GOOGLE_TAG_MANAGER: id => `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
        new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
        j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
        'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
        })(window,document,'script','dataLayer','${id}');`,
  GOOGLE_ANALYTICS: id => `(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
        (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
        m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
        })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');
        ${id.split(",").map((key, i) => `ga('create', '${key}', 'auto', 'tracker${i + 1}');`).join("\n      ")}
        ${id.split(",").map((key, i) => `ga('tracker${i + 1}.send', 'pageview');`).join("\n      ")}`,
  HOTJAR: id => `(function(h,o,t,j,a,r){
        h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
        h._hjSettings={hjid:${id},hjsv:6};
        a=o.getElementsByTagName('head')[0];
        r=o.createElement('script');r.async=1;
        r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
        a.appendChild(r);
        })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');`,
  GOOGLE_OPTIMIZE: id => `(function(w,d, optimizeId){
        var script = d.createElement('script');
        script.src = "https://www.googleoptimize.com/optimize.js?id="+optimizeId;
        d.head.prepend(script);
      })(window, document, "${id}")`
};

const serviceHTML = {
  GOOGLE_TAG_MANAGER: id => `<noscript>
      <iframe src="https://www.googletagmanager.com/ns.html?id=${id}" height="0" width="0" style="display:none;visibility:hidden"></iframe>
    </noscript>`
};

const servicesAvailable = Object.keys(serviceJavaScript).filter(s => [undefined, ''].indexOf(process.env[`CANON_${s}`]) === -1);

const servicesScript = servicesAvailable
  .map(s => `
        // ${titleCase(s.replace(/\_/g, " "))}
        ${serviceJavaScript[s](process.env[`CANON_${s}`])}
        // End ${titleCase(s.replace(/\_/g, " "))}
  `).join("\n");

const servicesBody = servicesAvailable
  .filter(s => serviceHTML[s])
  .map(s => `
    <!-- ${titleCase(s.replace(/\_/g, " "))} -->
    ${serviceHTML[s](process.env[`CANON_${s}`])}
    <!-- End ${titleCase(s.replace(/\_/g, " "))} -->
  `).join("\n");

export {servicesAvailable, servicesBody, servicesScript};

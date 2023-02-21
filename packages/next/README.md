# canon-next: Nextjs components for sites migrating away from canon-core.

This package provides React Components for rendering a canon profile on a NextJS app, using Mantine components.

# Setup an installation

You'll need to create a NextJS (v13) app. Install the package using npm:

```npm i @datawheel/canon-next```

You'll need to wrap your entire app into a `MantineProvider`, in order to allow Mantine components to render properly. For detailed instructions follow the official [Mantine Documentation for NextJS](https://mantine.dev/guides/next/). In adition, you'll need to set up `next-i18next` on your app, with the appropiate locales.

## Connecting to your canon API

You'll need to provide `canon-next` components access to your `canon-cms` API end point setting the ´NEXT_PUBLIC_CMS´ enviroment variable on your NextJS app.

```
NEXT_PUBLIC_CMS=your_canon_cms/api
```

## Rendering a profile

The `Profile` component is used to render a canon profile. It needs to recieve the following props:
- `profile`: the JSON object representation of the required profile to render
- `formatters`, an array of the required formatters
- `t`: a `next-i18next` translation function, with access to the proper CMS translations. You can find the base CMS translations on the [example-next app](https://github.com/Datawheel/canon/blob/canon-next/example-next/public/locales/en/profile.json)

## Set up with SSG:

For rendering a profile with SSG on NextJS, you'll need to get your `profile` and `formatters` objects inside of `getStaticProps` you can follow the [example app](https://github.com/Datawheel/canon/blob/canon-next/example-next/pages/profile/%5B...members%5D.js) for setting this up for a classic `canon-cms` instance.

If you chose to serve the profile pages from a path other than `/profile`, you'll need to provide an appropiate `linkify` function. The `linkify` function should take an array of slug/id pairs and convert it to a valid url path in your app.


## Aplying custom styles
We recommend using Mantine components overrides into the `theme` object of the `MantineProvider`, as described in the [mantine documentation](https://mantine.dev/theming/theme-object/). If you need more fine grained adjustements, you can target some components using its class name through the `globalStyles` object of your `MantineProvider`



```
import {MantineProvider} from "@mantine/core";
import {Inter} from "@next/font/google";

const inter = Inter({subsets: ["latin"]});

export default function App(props) {
  const {Component, pageProps} = props;

  return (
    <MantineProvider
      withGlobalStyles
      withNormalizeCSS
      theme={{

        /** Put your mantine theme override here */
        colorScheme: "light",
        globalStyles: {

          /** Put your cms overrides here*/
          ".cp-hero-heading-dimension": {
            fontFamily: `${inter.style.fontFamily} !important`
          }
        }
      }}
    >
      <Component {...pageProps} />
    </MantineProvider>
  );
}

```

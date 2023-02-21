import Head from "next/head";
import {MantineProvider} from "@mantine/core";
import {Inter} from "@next/font/google";
import {appWithTranslation} from "next-i18next";

// eslint-disable-next-line new-cap
const inter = Inter({subsets: ["latin"]});
// eslint-disable-next-line require-jsdoc
function App(props) {
  const {Component, pageProps} = props;

  return (
    <>
      <Head>
        <title>Page title</title>
        <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width" />
      </Head>

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
    </>
  );
}

export default appWithTranslation(App);

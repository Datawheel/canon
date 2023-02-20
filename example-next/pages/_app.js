import Head from "next/head";
import {MantineProvider} from "@mantine/core";
import {Inter} from "@next/font/google";

const inter = Inter({subsets: ["latin"]});
// eslint-disable-next-line require-jsdoc
export default function App(props) {
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

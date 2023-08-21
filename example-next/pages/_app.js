import Head from "next/head";
import {MantineProvider} from "@mantine/core";
import {Inter} from "@next/font/google";
import {appWithTranslation} from "next-i18next";
import {useRouter} from "next/router";
import {rtlCache, ltrCache} from "../emotion-cache";

const cmsStyles = theme => ({
  ".monshaat-Modal-header, .monshaat-Modal-header": {
    background: "transparent",
    svg: {
      "stroke": "white",
      ":hover": {
        stroke: theme.colors["monshaat-blue"]
      }
    }
  },
  ".cp-hero": {
    "minHeight": 400,
    "fontWeight": 500,

    ".cp-image-credits-btn": {
      "padding": "0px 24px",
      "top": "64px !important",
      "fontSize": 16,
      "button": {
        "color": theme.colors["monshaat-blue"],
        "background": "white",
        "fontSize": 14,
        "fontWeight": 400,
        "opacity": 0.8,
        "transition": "opacity .4s",
        "&:hover": {
          opacity: 1
        }
      },
      ".cp-image-credits": {
        right: "24px"
      },
      ".cp-image-credits *": {
        fontSize: "14px !important"
      }
    },

    ".cp-hero-caption": {

      "width": "100%",
      "& > div": {
        width: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: theme.spacing.sm,
        padding: "120px"
      },
      "h1": {
        maxWidth: "700px",
        span: {
          color: "white",
          textAlign: "center",
          fontSize: 65,
          fontWeight: 400,
          lineHeight: 1,
          textShadow: " 0px 5.49885px 5.49885px rgba(0, 0, 0, 0.25);",
          [theme.fn.smallerThan("md")]: {
            fontSize: 38,
            lineHeight: 1
          }
        },
        svg: {
          stroke: "white",
          paddingLeft: theme.spacing.md,
          height: "32px",
          width: "32px",
          flexShrink: 0
        }
      },
      "h2": {
        textAlign: "center",
        fontSize: 18,
        padding: "0px 10px",
        color: "white",
        width: "fit-content",
        background: "linear-gradient(79.43deg, rgba(42, 77, 160, 0.6) 0%, rgba(0, 114, 151, 0.5) 100%);",
        borderRadius: 25,
        margin: "auto",
        fontWeight: 400,
        textShadow: " 0px 5.49885px 5.49885px rgba(0, 0, 0, 0.25);"
      },
      ".cp-comparison-add, .cp-comparison-remove": {
        ".cms-profilesearch": {
          "width": 300,
          "transform": "translateX(-50%)",
          "left": "50%",
          "input": {fontSize: 16},
          ".monshaat-Input-icon svg": {
            width: 20,
            height: 20
          }
        },
        ".cp-comparison-button": {
          backgroundColor: "white",
          color: theme.colors["monshaat-blue"],
          fontSize: 16,
          lineHeight: 20,
          fontWeight: 450
        }
      },
      ".cp-comparison-remove": {
        position: "absolute !important",
        left: "100%",
        top: "50%",
        transform: "translate(-50%, -50%)",
        [theme.fn.smallerThan("md")]: {
          left: "50%",
          top: "100%"
        }
      }

    },
    ".monshaat-Overlay-root, .monshaat-rtl-Overlay-root": {
      background: "linear-gradient(79.43deg, rgba(42, 77, 160, 0.5) 0%, rgba(0, 114, 151, 0.5) 100%);"
    }

  },

  ".cp-main": {
    "padding": 0,

    ".cp-section-heading": {
      scrollMarginTop: 150
    }
  },

  ".cp-subnav": {
    "background": "#fff",
    "position": "sticky",
    "display": "auto !important",
    "top": 64,
    "boxShadow": theme.shadows.sm,
    [theme.fn.smallerThan(300)]: {
      display: "none"
    },
    ".cp-subnav-list": {
      gap: 50,
      [theme.fn.smallerThan("md")]: {
        gap: 30
      }
    },
    ".cp-subnav-link": {
      "borderRadius": 5,
      "fontSize": 22,
      "color": "#7B8794",
      "textTransform": "capitalize",
      [theme.fn.smallerThan("md")]: {
        fontSize: 16
      },
      "&:hover": {
        color: "#7B8794 !important"
      }
    },

    ".monshaat-Popover-dropdown, .monshaat-rtl-Popover-dropdown": {
      background: "#DFE3E8",
      borderRadius: 5,
      border: "1px solid #DFE3E8",
      overflow: "hidden",
      padding: 0
    },
    ".cp-subnav-group-list": {
      padding: "0px !important",
      margin: "0px !important",
      transition: "background-color 0.2s, border-radius 0.2s",
      li: {
        "margin": 0,
        "overflow": "hidden",
        "width": "100%",
        "borderTop": "0.5px solid white",
        "borderBottom": "0.5px solid white",
        "textTransform": "capitalize",
        "&:first-of-type": {
          borderRadius: "5px 5px 0px 0px",
          borderTop: "none"
        },
        "&:last-of-type": {
          borderRadius: "0px 0px 5px 5px",
          borderBottom: "none"
        },
        "&:hover": {
          backgroundColor: "#007297",
          color: "white !important"
        },
        "& .monshaat-rtl-List-itemWrapper, & .monshaat-List-itemWrapper": {
          width: "100%"
        },
        "a": {
          "color": "grey",
          "fontSize": 14,
          "padding": "5px 10px",
          "display": "block",
          "textDecoration": "none",
          "&:hover": {
            color: "white"
          }
        }
      }
    }
  },

  ".cp-hero-group": {
    [theme.fn.smallerThan("md")]: {
      flexDirection: "column"
    }
  },
  ".cp-hero-search .monshaat-Paper-root": {
    "background": "linear-gradient(79.43deg, #2A4DA0 0%, #007297 100%);",
    "&::before": {
      position: "absolute",
      left: 0,
      width: 300,
      content: "url(/images/about.svg);"
    }
  },
  ".cp-grouping-comparison .cp-related-profiles-section-section-grouping": {
    display: "none"
  },
  ".cp-grouping-comparison .cp-grouping-section-grouping": {
    "background": "linear-gradient(269.22deg, #007297 0%, #2A4DA0 100%);",
    "padding": "0 1rem",
    "textAlign": "center",
    // marginTop: theme.spacing.md,
    ".cp-grouping-section-heading": {
      background: "unset"
    }
  },
  ".cp-grouping-comparison:first-of-trype": {
    marginTop: 0
  },
  ".cp-grouping-section-heading, .cp-related-heading": {
    "display": "flex",
    "justifyContent": "center",
    "alignItems": "center",
    "background": "linear-gradient(269.22deg, #007297 0%, #2A4DA0 100%);",
    "cursor": "default",
    "transition": "opacity .45s",
    "paddingTop": 12,
    "paddingBottom": 12,
    "h2": {
      transform: "translateY(5px)"
    },
    "color": "white",
    "margin": "0px !important",
    "fontSize": "36px !important",
    "fontWeight": 400,
    "lineHeight": "1 !important",
    "letterSpacing": "0.05em",
    "& a svg": {
      stroke: "white"
    }
  },
  ".cp-related-heading": {
    paddingTop: 16,
    paddingBottom: 16
  },

  ".cp-section-heading-wrapper": {
    cursor: "default",
    transition: "opacity .45s",
    a: {
      opacity: 0
    }
  },
  ".cp-section-heading-wrapper:hover": {
    a: {
      opacity: 1
    }
  },
  "#cp-section-24": {
    backgroundColor: "#00000008"
  },
  ".cp-default-section-grouping-inner": {
    "borderBottom": "1px solid var(--monshaat-blue)",
    [theme.fn.smallerThan("md")]: {
      flexDirection: "column"
    },
    ".cp-default-section": {
      borderBottom: "none"
    }
  },
  ".cp-default-section, .cp-related-tile-list": {
    "borderBottom": "1px solid var(--monshaat-blue)",
    "maxWidth": 1320, // mimics mantine container (matches footer width)
    "margin": "auto",
    "paddingLeft": 24,
    "paddingRight": 24,
    "marginTop": theme.spacing.xl,
    "&:last-of-type": {
      borderBottom: "1px solid transparent"
    },
    ".cp-section-heading-wrapper": {
      marginLeft: -16,
      justifyContent: "flex-end",
      flexDirection: "row-reverse",
      h3: {
        marginTop: 0,
        lineHeight: 1
      }
    },

    ".cp-default-section-heading": {
      fontWeight: 400,
      color: theme.colors["monshaat-blue"],
      fontSize: 28,
      marginTop: theme.spacing.md
    },
    ".cp-viz-title": {
      color: theme.colors["monshaat-grey"],
      fontWeight: 400,
      fontSize: 22,
      marginTop: 0
    },
    ".cp-viz-figure": {
      minHeight: 300
    }
  },

  ".cp-section-paragraph": {
    color: theme.colors["monshaat-grey"],
    fontWeight: 400,
    letterSpacing: "0.05em",
    fontSize: 20,
    lineHeight: 1.15,
    marginBottom: "5px !important"
  },
  ".cp-related-tile-list": {
    "padding": "36px 24px !important",
    ".cms-profilesearch-tile": {
      "aspectRatio": 1,
      "*": {
        alignItems: "flex-end"
      },
      ".profile-tile-overlay": {
        background: "linear-gradient(79.43deg, rgba(42, 77, 160, 0.8) 0%, rgba(0, 114, 151, 0.5) 100%);"
      },
      ".profile-tile-overlay:hover": {
        opacity: 0.8
      }
    }
  }
  // ...searchStyles(theme)

});

// eslint-disable-next-line new-cap
const inter = Inter({subsets: ["latin"]});
// eslint-disable-next-line require-jsdoc
function App(props) {
  const {Component, pageProps} = props;

  const {locale} = useRouter();
  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <>
      <Head>
        <title>Page title</title>
        <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width" />
      </Head>
      <div dir={dir}>
        <MantineProvider
          withGlobalStyles
          withNormalizeCSS
          emotionCache={locale === "ar" ? rtlCache : ltrCache}
          theme={{

            /** Put your mantine theme override here */
            colorScheme: "light",
            globalStyles: theme => ({

              /** Put your cms overrides here*/
              ...cmsStyles(theme),
              ".cp-hero-heading-dimension": {
                fontFamily: `${inter.style.fontFamily} !important`
              }
            }),
            dir
          }}
        >
          <Component {...pageProps} />
        </MantineProvider>
      </div>
    </>
  );
}

export default appWithTranslation(App);

/* eslint-disable require-jsdoc */
/* eslint-disable max-len */
/*
 TODO:
   - [ ] determine dev/prod "paths" configuration for getStaticPaths (env var to set top z-index percentile on prod?)

*/
import {Box, useMantineTheme} from "@mantine/core";
import {useTranslation} from "next-i18next";
import {useRouter} from "next/router";
import {serverSideTranslations} from "next-i18next/serverSideTranslations";
import {Profile, NonIdealState, cmsDefaultPaths, cmsDefaultProps} from "@datawheel/canon-next";
// import customSections from "../../cms/sections";
import {IconChartLine, IconFolders, IconWorld, IconPackage, IconUser} from "@tabler/icons-react";
import {rtlCache, ltrCache} from "@/emotion-cache";
function ProfilePage({profile, formatters}) {
  const router = useRouter();
  const {t} = useTranslation("profile");
  const theme = useMantineTheme();

  if (router.isFallback) return <NonIdealState />;

  return (
    <Box>
      <Profile
        formatters={formatters}
        profile={profile}
        linkify={profile => profile.reduce((href, member) => `${href}/${member.slug}/${member.memberSlug || member.id}`, "/profile")}
        // you can also specify the configuration for ProfileSearch here:
        searchProps={{placeholder: "Seach profiles"}}
        // and your custom sections mapping object:
        // customSections={customSections}
        // you can also add a icons mapping to replace legacy blueprint icons
        mantineProviderProps={{theme, emotionCache: router.locale === "ar" ? rtlCache : ltrCache}}
        user={{role: 10}}
        icons={{
          "timeline-line-chart": <IconChartLine />,
          "chart": <IconChartLine />,
          "folder-close": <IconFolders />,
          "globe-network": <IconWorld />,
          "box": <IconPackage />,
          "person": <IconUser />
        }}
        t={t}
      />
    </Box>
  );
}

export default ProfilePage;


export async function getStaticPaths() {
  return {
    ...await cmsDefaultPaths()
  };
}

export async function getStaticProps({locale, params}) {
  return {
    props: {
      ...await serverSideTranslations(locale, ["common", "profile"]),
      ...await cmsDefaultProps(params.members, locale)
    }
  };
}

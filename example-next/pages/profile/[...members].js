/* eslint-disable require-jsdoc */
/* eslint-disable max-len */
/*
 TODO:
   - [ ] determine dev/prod "paths" configuration for getStaticPaths (env var to set top z-index percentile on prod?)

*/
import {Title} from "@mantine/core";
import {useTranslation} from "next-i18next";
import {useRouter} from "next/router";
import {serverSideTranslations} from "next-i18next/serverSideTranslations";
import {Profile, NonIdealState, cmsDefaultPaths, cmsDefaultProps} from "@datawheel/canon-next";
import customSections from "../../cms/sections";


function ProfilePage({profile, formatters}) {
  const router = useRouter();
  const {t} = useTranslation("profile");

  if (router.isFallback) return <NonIdealState />;
  return (
    <>
      <Title>Profile</Title>
      <Profile
        formatters={formatters}
        profile={profile}
        linkify={profile => profile.reduce((href, member) => `${href}/${member.slug}/${member.memberSlug || member.id}`, "/profile")}
        // you can also specify the configuration for ProfileSearch here:
        searchProps={{placeholder: "Seach profiles", filterDimensionTitle: d => "All Sectors", filterProfileTitle: (content, meta) => console.log("profile",  meta), limit: 80}}
        customSections={customSections}
        t={t}
      />
    </>
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

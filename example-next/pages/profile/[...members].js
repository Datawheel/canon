/* eslint-disable require-jsdoc */
/* eslint-disable max-len */
/*
 TODO:
   - [ ] determine dev/prod "paths" configuration for getStaticPaths (env var to set top z-index percentile on prod?)

*/
import axios from "axios";
import {Title} from "@mantine/core";
import {useTranslation} from "next-i18next";
import {useRouter} from "next/router";
import {serverSideTranslations} from "next-i18next/serverSideTranslations";
import {NonIdealState, Profile} from "@datawheel/canon-next";
import getProfile from "../helpers/getProfile";
// import {profileSearchConfig} from "../../helpers/search";
// import stripP from "../../canon-next/cms/utils/formatters/stripP";
// import stripHTML from "../../canon-next/cms/utils/formatters/stripHTML";

const {NEXT_PUBLIC_CMS} = process.env;

function ProfilePage({formatters, profile}) {
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
        // searchProps={{...profileSearchConfig, placeholder}}
        t={t}
      />
    </>
  );
}

export default ProfilePage;


export async function getStaticPaths() {
  return {
    paths: [
      // {params: {members: ["country", "usa"]}, locale:"en"},
      // {params: {members: ["country", "chn"]}, locale:"en"}
    ],
    fallback: true
  };
}

export async function getStaticProps({locale, params}) {
  const profile = await getProfile(params.members, locale);
  if (profile.error) return {notFound: true};

  const formatterURL = new URL("/api/formatters", NEXT_PUBLIC_CMS);
  const formatters = await axios.get(formatterURL.href)
    .then(resp => resp.data);

  return {
    props: {
      ...await serverSideTranslations(locale, ["common", "profile"]),
      formatters,
      profile
    }
  };
}

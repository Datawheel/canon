import Head from "next/head";
import {Title, Button, Container, Modal} from "@mantine/core";
import {ProfileSearch} from "@datawheel/canon-next";
import {useTranslation} from "next-i18next";
import {serverSideTranslations} from "next-i18next/serverSideTranslations";
import {useDisclosure} from "@mantine/hooks";
import {stripHTML} from "@datawheel/canon-next/utils";

const customProfileGroups = {
  "World": "Country",
  "Trade Bloc": "International Organizations"
};

const cubeMap = {
  trade_i_baci_a_92: "<span class='hidden-sort'>B. </span>Country",
  trade_wld: "<span class='hidden-sort'>A. </span>World"
};

const productMap = {
  hs_master_cube: "<span class='hidden-sort'>A. </span>🌐 Harmonized<br />System (HS)",
  trade_i_oec_a_sitc2: "<span class='hidden-sort'>B. </span>🌐 Standard International<br />Trade Classification (SITC)",
  trade_s_fra_q_cpf: "<span class='hidden-sort'>C. </span>🇫🇷 French Classification<br />of Products (CPF)",
  trade_s_deu_m_egw: "<span class='hidden-sort'>D. </span>🇩🇪 German Commodity<br />Groups (EGW)"
};

const profileSearchConfig = {
  placeholder: "Explore World Trade",
  display: "grid",
  limit: 20,
  filters: true,
  showExamples: true,
  filterProfileTitle: content => {
    // remove HTML tags and parenthesis suffixes from labels
    const stripped = stripHTML(content.label.replace(/\s{0,}\([A-z].*\)/, ""));
    return customProfileGroups[stripped] || stripped;

  },
  filterDimensionTitle: (d, profileTitle) => {
    if (profileTitle === "Products") return "Show All<br />Classifications";
    else if (profileTitle === "Country" && d === "Exporter") return "All Levels";
    else if (profileTitle === "Subnational") return "All Countries";

    return d;

  },
  filterCubeTitle: (d, profileTitle) => {

    if (profileTitle === "Products") return productMap[d] || d;
    if (cubeMap[d]) return cubeMap[d];

    return d.replace(/^trade_s_([a-z]{3}).*$/, (str, match) => {
      const iso = match.toUpperCase();
      return `${iso}`;
    });
  },
  defaultProfiles: "1,54"
};
// eslint-disable-next-line require-jsdoc
export default function Home() {
  const {t} = useTranslation("profile");
  const [opened, handlers] = useDisclosure(false);
  return (
    <>
      <Head>
        <title>Example NextJS App for canon-next</title>
        <meta name="description" content="Example NextJS App for canon-next" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <main>
        <Container py="lg">
          <Title>Example App for sites using canon-next</Title>
          <Button mt="md" onClick={() => handlers.open()}>Search Profiles</Button>
        </Container>
        <Modal opened={opened} onClose={() => handlers.close()} fullScreen>
          <ProfileSearch {...profileSearchConfig} t={t}/>
        </Modal>
      </main>
    </>
  );
}


// eslint-disable-next-line require-jsdoc
export async function getStaticProps({locale}) {
  return {
    props: {
      ...await serverSideTranslations(locale, ["common", "profile"])
    }
  };
}

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

  }
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

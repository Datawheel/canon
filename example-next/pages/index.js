import Head from "next/head";
import {Title, Button, Container, Modal} from "@mantine/core";
import {ProfileSearch} from "@datawheel/canon-next";
import {useTranslation} from "next-i18next";
import {serverSideTranslations} from "next-i18next/serverSideTranslations";
import {useDisclosure} from "@mantine/hooks";

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
          <ProfileSearch t={t} display="grid" filters limit={20} showExamples/>
        </Modal>
      </main>
    </>
  );
}


export async function getStaticProps({locale}) {
  return {
    props: {
      ...await serverSideTranslations(locale, ["common", "profile"])
    }
  };
}

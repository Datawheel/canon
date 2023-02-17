import Head from "next/head";
import {Title, Button, Container} from "@mantine/core";

// eslint-disable-next-line require-jsdoc
export default function Home() {
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
          <Button mt="md">Search Profiles</Button>
        </Container>
      </main>
    </>
  );
}

import {
  BackgroundImage, Center, Flex, Loader, LoadingOverlay, Stack, Text,
} from "@mantine/core";
import SVG from "react-inlinesvg";

function NonIdealState({
  image = null, message = "Loading...", graphic = <Loader />, height = "100vh",
}) {
  return (
    <BackgroundImage src={image} h={height}>
      <LoadingOverlay
        loader={(
          <Flex align="center" justify="center">
            <Stack
              align="center"
              sx={(theme) => ({
                "& > .oec-logo": {
                  "path, polygon": {
                    fill: theme.colorScheme === "dark" ? "white" : theme.colors["oec-dark-grey"],
                  },
                },
              })}
            >
              <SVG className="oec-logo" height={100} src="/images/oec-logo.svg" />
              <Center>
                {graphic}
              </Center>
              <Text color="dimmed" size="lg" weight="bold">{message}</Text>
            </Stack>
          </Flex>
)}
        overlayBlur={5}
        visible
      />
    </BackgroundImage>
  );
}

export default NonIdealState;

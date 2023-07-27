import React, {useContext, useState} from "react";
import {nest} from "d3-collection";
import {
  BackgroundImage,
  Box,
  Button,
  Collapse,
  Flex,
  Group,
  List,
  Overlay,
  Paper,
  Stack,
  Text,
  Title,
  UnstyledButton,
} from "@mantine/core";
import {
  IconSearch,
  IconPhoto,
} from "@tabler/icons-react";
import ProfileContext from "../ProfileContext";
import SourceGroup from "../Viz/SourceGroup";
import StatGroup from "../Viz/StatGroup";
import Viz from "../Viz/Viz";
import stripP from "../../utils/formatters/stripP";

// import {strip} from "d3plus-text";
// const filename = str => strip(str.replace(/<[^>]+>/g, ""))
//   .replace(/^\-/g, "")
//   .replace(/\-$/g, "");
// import PDFButton from "./components/PDFButton";

import {ProfileSearchModal} from "../fields/ProfileSearch";

/** the profile hero, AKA header, AKA splash */
function Hero({
  comparisonButton,
  contents,
  // hidePDF = false,
  hideTitleSearch = false,
  loading,
  profile,
  sources,
  type,
}) {
  // NOTE: using color scheme here asumes there is theme switch enabled
  // const {colorScheme} = useMantineColorScheme();
  const [clickedIndex, setClickedIndex] = useState(undefined);
  const [creditsVisible, setCreditsVisible] = useState(false);
  const {
    formatters, searchProps, linkify, t,
  } = useContext(ProfileContext);
  const {stripHTML = (d) => d} = formatters || {};

  const titleClick = (index) => {
    setClickedIndex(index);
    setTimeout(() => {
      document.querySelector(".cp-hero-search .cp-input input").focus();
    }, 300);
  };

  const spanifyTitle = (title) => {
    const {variables} = profile;

    // stories don't have variables
    if (!hideTitleSearch && variables && title) {
      const names = [variables.name1, variables.name2];

      // must swap names completely out, longest to shortest, to protect against
      // titles within other titles (ie. "Brazil Nuts from Brazil")
      const swappedTitle = names.sort((a, b) => b.length - a.length)
        .reduce((t, name) => t.replace(name, `{{name${names.indexOf(name) + 1}}}`), title);

      // some titles have <> signs in them. encode them, so the span doesn't break.
      const fixHTML = (d) => (d ? d.replace(/</g, "&lt;").replace(/\\>/g, "&gt;") : d);

      return swappedTitle.replace(/\{\{name([0-2])\}\}/g, (str, i) => {
        const name = names[i - 1];
        return `<span class="cp-hero-heading-dimension"
          title=${fixHTML(name)} >
            ${fixHTML(name)}
          </span>`;
      });
    }

    return title;
  };

  let title = spanifyTitle(profile.title);
  let paragraphs; let sourceContent; let statContent; let subtitleContent;

  if (contents) {
    title = spanifyTitle(contents.title);
    // subtitles
    if (contents.subtitles.length) {
      subtitleContent = contents.subtitles.map((subhead) => (
        <Title
          order={2}
          key={`${subhead.subtitle}-subhead`}
          dangerouslySetInnerHTML={{__html: stripP(subhead.subtitle)}}
        />
      ));
    }

    // stats
    if (contents.stats.length > 0) {
      const statGroups = nest().key((d) => d.title).entries(contents.stats);

      statContent = (
        <Flex
          className="cp-stat-content"
          justify="flex-start"
          align="flex-start"
          direction="row"
          gap="xl"
          wrap="wrap"
          w="100%"
        >
          {statGroups.map(({key, values}) => <StatGroup key={key} title={key} stats={values} />)}
        </Flex>
      );
    }

    // descriptions
    if (contents.descriptions.length) {
      paragraphs = loading
        ? <Text>Loading...</Text>
        : contents.descriptions.map((content) => (
          <Text key={`hero-paragraph-${content.description}`}>
            {content.description}
          </Text>
        ));
    }

    // sources
    sourceContent = <SourceGroup sources={sources} />;
  }

  // heading & subhead(s)

  const heading = (
    <div>
      <h1>
        <UnstyledButton w="100%" onClick={() => titleClick(1)}>
          <Flex justify="space-between" align="center">
            <Title component="span" size="h1" dangerouslySetInnerHTML={{__html: stripP(title)}} inherit />
            <IconSearch />
          </Flex>
        </UnstyledButton>
      </h1>
      {subtitleContent}
      {comparisonButton}
    </div>
  );
  // custom images can be uploaded with no flickr source. Only show the "image credits" section
  // if at least one of the images has the flickr data to show
  const hasAuthor = profile.images.some((d) => d.author);

  return (
    <Stack
      className="cp-hero"
      component="header"
      style={{overflow: "show", width: "100%"}}
      pos="relative"
      align="center"
    >
      <Flex sx={{zIndex: 4}} w="100%" p="xl">
        {/* caption */}
        <div className="cp-hero-caption" style={{flexGrow: 1}}>
          {heading}
          {statContent}
          {paragraphs}
          {sourceContent}
        </div>

        {/* print JUST the first visualization */}
        {contents && contents.visualizations && contents.visualizations.length
          ? (
            <Box key={contents.visualizations[0].id} className="cp-hero-figure" maw={400} sx={{flexGrow: 1}}>
              <Viz
                section={this}
                config={contents.visualizations[0]}
                showTitle={false}
                sectionTitle={title}
                hideOptions
                slug={contents.slug}
              />
            </Box>
          )
          : null}
      </Flex>

      {/* display image credits, and images */}
      {profile.images.length
        ? (
          <>
            {/* credits */}
            {type !== "story" && hasAuthor
            && (
            <Box
              className="cp-image-credits-btn"
              style={{
                zIndex: 8, position: "absolute", right: 10, top: 10,
              }}
            >
              <Button
                onClick={() => setCreditsVisible(!creditsVisible)}
                leftIcon={<IconPhoto size="0.9rem" />}
                size="xs"
                variant={creditsVisible ? "light" : "subtle"}
                compact
              >
                {t(
                  "CMS.Profile.image_credits",
                  {
                    action: creditsVisible
                      ? t("CMS.Options.hide")
                      : t("CMS.Options.show"),
                  },
                )}
              </Button>
              <Collapse className="cp-image-credits" pos="absolute" in={creditsVisible}>
                {profile.images.map((img, i) => (
                  <Paper key={JSON.stringify(img)} shadow="xs" p="xs" mt={5} radius="sm">
                    <Text size="sm">
                      Image
                      {" "}
                      {i + 1}
                    </Text>
                    <List size="xs" listStyleType="none" pl="0px !important" mb="0px !important" mt="sm">
                      {img.author
                        && (
                        <List.Item>
                          {t("CMS.Profile.photograph_by", {author: img.author})}
                        </List.Item>
                        )}
                      {img.meta
                        && (
                        <List.Item>
                          {img.meta}
                        </List.Item>
                        )}
                      {img.permalink
                        && (
                        <List.Item>
                          {t("CMS.Options.direct_link")}
                          {": "}
                          <a target="_blank" href={img.permalink} rel="noreferrer">
                            {img.permalink}
                          </a>
                        </List.Item>
                        )}
                    </List>
                  </Paper>
                ))}
              </Collapse>
            </Box>
            )}

            {/* images */}
            <Group
              spacing={0}
              style={{
                height: "100%", width: "100%", position: "absolute",
              }}
              grow
              noWrap
            >
              {profile.images.map((img) => img.src
              && (
              <BackgroundImage
                style={{
                  height: "100%",
                  width: `${100 / profile.images.length}%`,
                }}
                key={img.src}
                radius={0}
                src={img.src}
              />
              ))}
            </Group>
            <Overlay
              opacity={1}
              // eslint-disable-next-line max-len
              gradient="linear-gradient(0deg, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0.5) 50%, rgba(255, 255, 255, 0.8) 100%)"
              blur={2}
              zIndex={1}
            />
          </>
        )
        : (
          <Overlay
            opacity={0.7}
            blur={2}
            zIndex={1}
          />
        )}
      <ProfileSearchModal
        defaultProfiles={`${profile.id}`}
        filters
        display="grid"
        showExamples
        linkify={linkify}
        t={t}
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...searchProps}
        modalProps={{
          // overridable
          size: "80%",
          ...searchProps?.modalProps || {},
          // not-overridable
          className: "cp-hero-search",
          opened: clickedIndex !== undefined,
          onClose: () => setClickedIndex(undefined),
        }}
      />
    </Stack>
  );
}

export default Hero;

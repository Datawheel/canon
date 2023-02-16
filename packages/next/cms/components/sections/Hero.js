import {useContext, useState} from "react";
import {nest} from "d3-collection";
import {useTranslation} from "next-i18next";
import {
  Button, Group, Collapse, Paper, Text, BackgroundImage, List,
  Stack, Overlay, Flex, Title, useMantineColorScheme, Modal
} from "@mantine/core";
import {
  IconChevronDown, IconChevronUp
} from "@tabler/icons-react";
// eslint-disable-next-line import/no-cycle
import {
  ProfileContext, SourceGroup, StatGroup, Viz
} from "../../../index";
import stripP from "../../utils/formatters/stripP";

// import {strip} from "d3plus-text";
// const filename = str => strip(str.replace(/<[^>]+>/g, ""))
//   .replace(/^\-/g, "")
//   .replace(/\-$/g, "");
// import PDFButton from "./components/PDFButton";

// import {Dialog} from "@blueprintjs/core";

import ProfileSearch from "../fields/ProfileSearch";

/** the profile hero, AKA header, AKA splash */
function Hero({
  comparisonButton,
  contents,
  hidePDF = false,
  hideTitleSearch = false,
  loading,
  profile,
  sources,
  type
}) {
  const {t} = useTranslation("profile");

  // NOTE: using color scheme here asumes there is theme switch enabled
  // const {colorScheme} = useMantineColorScheme();
  const [clickedIndex, setClickedIndex] = useState(undefined);
  const [creditsVisible, setCreditsVisible] = useState(false);
  const {formatters, searchProps, linkify} = useContext(ProfileContext);
  const {stripHTML = d => d} = formatters || {};

  const titleClick = index => {
    setClickedIndex(index);
    setTimeout(() => {
      document.querySelector(".cp-hero-search .cp-input input").focus();
    }, 300);
  };

  const spanifyTitle = title => {
    const {variables} = profile;

    // stories don't have variables
    if (!hideTitleSearch && variables && title) {
      const names = [variables.name1, variables.name2];

      // must swap names completely out, longest to shortest, to protect against
      // titles within other titles (ie. "Brazil Nuts from Brazil")
      const swappedTitle = names.sort((a, b) => b.length - a.length)
        .reduce((t, name) => t.replace(name, `{{name${names.indexOf(name) + 1}}}`), title);

      // some titles have <> signs in them. encode them, so the span doesn't break.
      const fixHTML = d => d ? d.replace(/</g, "&lt;").replace(/\\>/g, "&gt;") : d;

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
      subtitleContent = contents.subtitles.map(subhead => 
        <Title
          order={2}
          align="center"
          key={`${subhead.subtitle}-subhead`}
          dangerouslySetInnerHTML={{__html: stripP(subhead.subtitle)}}
        />
      );
    }

    // stats
    if (contents.stats.length > 0) {
      const statGroups = nest().key(d => d.title).entries(contents.stats);

      statContent = 
        <Flex
          justify="space-between"
          align="flex-start"
          direction="row"
          wrap="wrap"
          w="100%"
        >
          {statGroups.map(({key, values}) => 
            <StatGroup key={key} title={key} stats={values} />
          )}
        </Flex>
      ;
    }

    // descriptions
    if (contents.descriptions.length) {
      paragraphs = loading
        ? <Text>Loading...</Text>
        : contents.descriptions.map(content => 
          <Text key={`hero-paragraph-${content.description}`}>
            {content.description}
          </Text>
        );
    }

    // sources
    sourceContent = <SourceGroup sources={sources} />;
  }

  // heading & subhead(s)

  const heading = 
    <Stack>
      <Title
        align="center"
        order={1}
        onClick={() => titleClick(1)}
        dangerouslySetInnerHTML={{__html: stripP(title)}}
      />
      {subtitleContent}
    </Stack>
  ;

  // custom images can be uploaded with no flickr source. Only show the "image credits" section
  // if at least one of the images has the flickr data to show
  const hasAuthor = profile.images.some(d => d.author);

  return (
    <Stack component="header" style={{overflow: "hidden", width: "100%"}} pos="relative" align="center">
      <Flex sx={{zIndex: 2}} w="100%" align="center" p="xl" gap={100}>
        {/* { hidePDF ? null : <PDFButton className="cp-hero-pdf" filename={filename(profile.title)} /> } */}
        {/* caption */}
        <Stack className="cp-hero-caption" align="flex-start" px="xl">
          {heading}
          {statContent}
          {paragraphs}
          {sourceContent}
        </Stack>

        {/* print JUST the first visualization */}
        {contents && contents.visualizations && contents.visualizations.length && 
          <div key={contents.visualizations[0].id} className="cp-hero-figure">
            <Viz
              section={this}
              config={contents.visualizations[0]}
              showTitle={false}
              sectionTitle={title}
              hideOptions
              slug={contents.slug}
            />
          </div>
        }
      </Flex>

      {/* display image credits, and images */}
      {profile.images.length && 
        <>
          {/* credits */}
          {type !== "story" && hasAuthor && 
            <Stack
              spacing={0}
              style={{
                zIndex: 8, position: "absolute", right: 10, top: 10
              }}
            >
              <Button
                onClick={() => setCreditsVisible(!creditsVisible)}
                leftIcon={creditsVisible ? <IconChevronUp /> : <IconChevronDown />}
                size="xs"
                variant="subtle"
              >
                {t(
                  "CMS.Profile.image_credits",
                  {
                    action: creditsVisible
                      ? t("CMS.Options.hide")
                      : t("CMS.Options.show")
                  }
                )}
              </Button>
              <Collapse in={creditsVisible}>
                {profile.images.map((img, i) => 
                  <Paper key={JSON.stringify(img)} shadow="xs" p="xs" mt={5} radius={0}>
                    <Text>
                      Image
                      {" "}
                      {i + 1}
                    </Text>
                    <List size="xs">
                      {img.author && 
                        <List.Item>
                          {t("CMS.Profile.photograph_by", {author: img.author})}
                        </List.Item>
                      }
                      {img.meta && 
                        <List.Item>
                          {img.meta}
                        </List.Item>
                      }
                      {img.permalink && 
                        <List.Item>
                          {t("CMS.Options.direct_link")}
                          {": "}
                          <a target="_blank" href={img.permalink} rel="noreferrer">
                            {img.permalink}
                          </a>
                        </List.Item>
                      }
                    </List>
                  </Paper>
                )}
              </Collapse>
            </Stack>
          }

          {/* images */}
          <Group
            spacing={0}
            style={{
              height: "100%", width: "100%", position: "absolute"
            }}
            noWrap
          >
            {profile.images.map((img, i) => img.src && 
              <BackgroundImage
                style={{
                  height: "100%",
                  width: `${100 / profile.images.length}%`
                }}
                key={img.src}
                radius={0}
                src={img.src}
              />
            )}
          </Group>
          <Overlay
            opacity={0.7}
            // color={colorScheme === "dark" ? "#000" : "#fff"}
            blur={2}
            zIndex={1}
          />
        </>
      }

      <Modal
        size="80%"
        className="cp-hero-search"
        opened={clickedIndex !== undefined}
        onClose={() => setClickedIndex(undefined)}
      >

        <ProfileSearch
          defaultProfiles={`${profile.id}`}
          defaultQuery={contents ? stripHTML(contents.title) : ""}
          filters
          inputFontSize="lg"
          display="grid"
          showExamples
          linkify={linkify}
          // eslint-disable-next-line react/jsx-props-no-spreading
          {...searchProps}
        />

      </Modal>

    </Stack>
  );
}

export default Hero;

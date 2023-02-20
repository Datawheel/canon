// Todo
// - Keydown events

/* eslint-disable no-case-declarations */
/* eslint-disable no-nested-ternary */
import Link from "next/link";
import axios from "axios";

import {unique} from "d3plus-common";
import {
  group, max, merge, min
} from "d3-array";
import {select} from "d3-selection";

// import ProfileColumns from "./ProfileColumns";
import {
  useState, useEffect, useRef
} from "react";
import {
  Box, Text, TextInput, Flex, Group, ScrollArea, Anchor, SimpleGrid, FocusTrap
} from "@mantine/core";
import {useDebouncedValue, useHotkeys} from "@mantine/hooks";
import {useRouter} from "next/router";
import ProfileTile from "./ProfileTile";
import groupMeta from "../../utils/groupMeta";
import stripHTML from "../../utils/formatters/stripHTML";
import NonIdealState from "../../../core/components/NonIdealState";

/** used for up/down arrow movement */
function findSibling(elem, dir = "next") {
  let node = elem.parentNode;
  while (node.tagName.toLowerCase() !== "li") node = node.parentNode;

  let sibling = node[`${dir}Sibling`];

  if (!sibling) {
    const list = node.parentNode.parentNode;
    if (list.tagName.toLowerCase() === "li") {
      const column = list[`${dir}Sibling`];
      const items = select(column).selectAll("li");
      sibling = dir === "next" ? select(column).select("li").node()
        : items.nodes()[items.size() - 1];
    }
  }

  return sibling ? select(sibling).select("a").node() : sibling;
}

/** used for left/right arrow movement */
function findNeighbor(elem, dir = "next") {
  let node = elem.parentNode;
  while (node.tagName.toLowerCase() !== "li") node = node.parentNode;
  const nodeBounds = node.getBoundingClientRect();
  const columnX = nodeBounds.left;
  const nodeY = nodeBounds.top;
  const list = node.parentNode.parentNode;
  let nextColumns = Array.from(select(list).selectAll("li").nodes())
    .filter(d => dir === "next"
      ? d.getBoundingClientRect().left > columnX : d.getBoundingClientRect().left < columnX);
  if (dir === "previous") nextColumns = nextColumns.reverse();
  let sibling = nextColumns.find((d, i) => d.getBoundingClientRect().top === nodeY || i === nextColumns.length - 1);

  if (!sibling) {
    const column = list[`${dir}Sibling`];
    nextColumns = Array.from(select(column).selectAll("li").nodes())
      .filter(d => dir === "next"
        ? d.getBoundingClientRect().left > columnX : d.getBoundingClientRect().left < columnX);
    if (dir === "previous") nextColumns = nextColumns.reverse();
    sibling = nextColumns.find(d => d.getBoundingClientRect().top === nodeY);
    if (!sibling && nextColumns.length) sibling = nextColumns[dir === "previous" ? 0 : nextColumns.length - 1];
  }

  return sibling ? select(sibling).select("a").node() : sibling;
}

function useCMSProfiles() {
  const [profiles, setProfiles] = useState(false);
  useEffect(() => {
    axios.get("/api/cms/profiles")
      .then(resp => resp.data.filter(p => p.visible))
      .then(profiles => setProfiles(profiles))
      .catch(() => setProfiles([]));
  }, []);
  return profiles;
}

function useSearchResults({
  query,
  filterLevels,
  filterProfiles,
  filterCubes,
  limit,
  locale,
  showLaterals,
  minQueryLength,
  ignoredTermsRegex,
  formatResults,
  showExamples
}) {
  console.log(query);
  const [results, setResults] = useState(false);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (!showExamples && !query.length) {
      setResults(false);
      return;
    }

    // Filter ignored terms from user string
    let filteredQuery = query.trim();
    if (query.length < minQueryLength) filteredQuery = "";
    if (ignoredTermsRegex && filteredQuery !== "") {
      filteredQuery = filteredQuery.replace(ignoredTermsRegex, "");
    }

    // Remove multiples spaces with just one -caused by the ignore terms regex and trim it
    filteredQuery = filteredQuery.replace(/\s\s+/g, " ").trim();

    let url = `/api/profilesearch?query=${filteredQuery}&limit=${limit}&locale=${locale}`;
    if (filterProfiles) url += `&profile=${filterProfiles}`;
    if (filterLevels) url += `&hierarchy=${filterLevels}`;
    if (filterCubes) url += `&cubeName=${filterCubes}`;
    if (showLaterals) url += "&showLaterals=true";

    setLoading(url);

    const controller = new AbortController();

    axios.get(url, {
      signal: controller.signal
    })
      .then(formatResults)
      .then(resp => {
        if (resp) {
          setResults(resp.data);
          setLoading(false);
        }
      })
      .catch(() => setLoading(false));

    // eslint-disable-next-line consistent-return
    return () => controller.abort();
  }, [query, filterLevels, filterCubes, filterProfiles, showLaterals]);
  return [results, loading];
}
function ProfileSearch({
  // default props
  activeKey = false,
  availableProfiles = [],
  filters = false,
  defaultCubes = false,
  defaultLevels = false,
  defaultProfiles = false,
  filterCubeTitle = d => d,
  filterDimensionTitle = d => d,
  filterHierarchyTitle = d => d,
  filterProfileTitle = (content, meta) => {
    if (content && content.label && content.label !== "New Profile Label") {
      return stripHTML(content.label);
    }
    if (meta && meta.length) {
      const groupedMeta = groupMeta(meta);
      return groupedMeta.length > 0
        ? groupedMeta.map(g => g[0] ? g[0].dimension || g[0].slug : "ERR_META").join(" / ")
        : "Unnamed";
    }
    return "Unnamed";
  },
  // eslint-disable-next-line react/jsx-props-no-spreading
  renderTile = (result, i, tileProps) => <ProfileTile key={`r-${i}`} {...tileProps} data={result} />,
  showExamples = false,
  showLaterals = false,
  subtitleFormat = d => d.memberHierarchy,
  titleFormat = d => d.name,
  formatResults = resp => resp,
  limit = 10,
  minQueryLength = 1,
  columnOrder = [],
  ignoredTerms = [],
  filterQueryArgs = false,
  joiner = " & ",
  placeholder = "Search...",
  renderListItem = (result, i, link, title, subtitle) =>
    <li key={`r-${i}`} className="cms-profilesearch-list-item">
      <Link href={link} className="cms-profilesearch-list-item-link">
        <div>
          {title}
          <div className="cms-profilesearch-list-item-sub u-font-xs">{subtitle}</div>
        </div>
      </Link>
    </li>
  ,
  position = "static",
  display = "list",
  linkify = profile => profile.reduce(
    (href, member) => `${href}/${member.slug}/${member.memberSlug || member.id}`,
    "/profile"
  ),
  t
}) {
  const {locale} = useRouter();

  const resultContainer = useRef(null);
  const textInput = useRef(null);

  const [query, setQuery] = useState("");
  const [active, setActive] = useState(false);

  const [filterProfiles, setFilterProfiles] = useState(defaultProfiles);
  const [filterCubes, setFilterCubes] = useState(defaultCubes);
  const [filterLevels, setFilterLevels] = useState(defaultLevels);

  const [debouncedQuery] = useDebouncedValue(query, 400);
  const profiles = useCMSProfiles();

  const ignoredTermsRegex = ignoredTerms && ignoredTerms.length > 0
    ? new RegExp(`\\b(${ignoredTerms.join("|")})\\b`, "ig")
    : false;
  const [results, loading] = useSearchResults({
    query: debouncedQuery,
    filterProfiles,
    filterCubes,
    filterLevels,
    showLaterals,
    showExamples,
    limit,
    locale,
    minQueryLength,
    ignoredTermsRegex,
    filterQueryArgs,
    formatResults
  });

  let profileGroups = [];
  if (profiles && filters) {
    const filteredProfiles = (profiles || [])
      .filter(d => !availableProfiles.length || availableProfiles.includes(d.meta[0].slug));
    profileGroups = Array.from(group(filteredProfiles, d => filterProfileTitle(d.content, d.meta)))
      .sort((a, b) => min(a[1], d => d.ordering) - min(b[1], d => d.ordering));
  }
  const activeProfile = profileGroups.find(g => g[1].map(p => p.id).join(",") === filterProfiles);

  const onFilterLevels = filters => {
    if (!profiles || !filters) return;
    const newFilters = filters ? filters.split(",") : [false];
    let newCubes = [];
    let newLevels = [];
    const profileIds = filterProfiles ? filterProfiles.split(",").map(Number) : [];
    const cubeNames = filterCubes ? filterCubes.split(",") : [];
    const levelNames = filterLevels ? filterLevels.split(",") : [];
    const activeMetas = merge(profiles
      .filter(p => profileIds.includes(p.id))
      .map(p => p.meta));

    const hierarchyGroups = Array.from(group(
      activeMetas,
      d => filterDimensionTitle(d.dimension)
    ), arr => [unique(merge(arr[1].map(a => a.levels))), unique(arr[1].map(a => a.cubeName))]);
    hierarchyGroups.forEach(([l, c]) => {
      newFilters.forEach(level => {
        if (c.length > 1) {
          const currCubes = c.find(x => cubeNames.includes(x));
          if (c.includes(level)) newCubes.push(level);
          else if (level && currCubes) newCubes.push(currCubes);
          else newCubes = newCubes.concat(c);
        }
        else {
          const currFilter = l.find(x => levelNames.includes(x));
          if (l.includes(level)) newLevels.push(level);
          else if (level && currFilter) newLevels.push(currFilter);
          else newLevels = newLevels.concat(l);
        }
      });
    });
    setFilterCubes(unique(newCubes).join(","));
    setFilterLevels(unique(newLevels).join(","));
  };

  useEffect(() => onFilterLevels(filterProfiles), [filterProfiles]);

  let activeDimensions;
  if (activeProfile) {
    const groupedDimensions = group(
      merge(
        activeProfile[1].map(p => p.meta)
      ),
      d => filterDimensionTitle(d.dimension, activeProfile[0])
    );
    const dimensions = Array.from(groupedDimensions, ([key, value]) => {
      const dimensions = unique(value.map(d => d.dimension));
      const sortedCubes = Array.from(
        group(
          value.map(
            d => d.cubeName
          ),
          d => filterCubeTitle(d, activeProfile[0])
        ),
        d => unique(d[1]).join(",")
      ).sort((a, b) => filterCubeTitle(a, activeProfile[0]).localeCompare(filterCubeTitle(b, activeProfile[0])));
      const cubes = unique(value.map(d => d.cubeName));
      if (cubes.length > 1) {
        return {
          dimensions, title: key, cubes, sortedCubes
        };
      }

      const levelSets = value.map(v => v.levels);
      const levels = unique(merge(levelSets));
      return {
        dimensions,
        title: key,
        levels,
        sortedLevels: levels.slice().sort((a, b) => max(
          levelSets,
          s => s.indexOf(a)
        ) - max(levelSets, s => s.indexOf(b)))
      };
    });
    activeDimensions = dimensions.filter(d => (d.levels || d.cubes).length > 1);
  }

  // TODO: enable hotkey events
  useHotkeys([
    ["ArrowLeft", () => console.log("arrow left")],
    ["ArrowUp", () => console.log("arrow up")],
    ["ArrowRight", () => console.log("arrow right")],
    ["ArrowDown", () => console.log("arrow down")]
  ]);
  return (
    <FocusTrap active>
      <Box className="cms-profilesearch" h="100%">
        <Box>
          <Text component="label">
            <Text className="u-visually-hidden" key="slt" span>
              {t("CMS.Search.Search profiles")}
            </Text>
          </Text>
          <TextInput
            ref={textInput}
            className="cp-input"
            placeholder={placeholder}
            onFocus={() => setActive(true)}
            onChange={event => setQuery(event.target.value)}
            autoFocus
          />
          {profiles && filters &&
          <Group
            component="ul"
            gap="md"
            position="center"
            spacing="xs"
            sx={{listStyle: "none"}}
          >
            <Text
              key="filters-all"
              fw={!filterProfiles ? 700 : 400}
              sx={{"cursor": "pointer", "&:hover": {textDecoration: "underline"}}}
              onClick={() => setFilterProfiles(false)}
              dangerouslySetInnerHTML={{__html: filterProfileTitle({label: t("CMS.Search.All")})}}
            />
            { profileGroups.map(g => {
              const profileIds = g[1].map(p => p.id);
              return (
                <Text
                  component="li"
                  sx={{"cursor": "pointer", "&:hover": {textDecoration: "underline"}}}
                  key={`filters-${profileIds.join("-")}`}
                  fw={profileIds.join(",") === filterProfiles ? 700 : 400}
                  onClick={() => setFilterProfiles(profileIds.join(","))}
                  dangerouslySetInnerHTML={{__html: g[0]}}
                />
              );
            }) }
          </Group>
          }
          { activeDimensions
            ? <div className="cms-profilesearch-filters-dimensions">
              { activeDimensions.map(d =>
                <Flex
                  component="ul"
                  gap="md"
                  sx={{listStyle: "none"}}
                  key={`filters-dimension-${d.dimensions.join(",").replace(/\s/g, "-")}`}
                  className="cms-profilesearch-filters-levels"
                >
                  { d.levels
                    ?                       <Anchor
                      // className={`cms-profilesearch-filters-dimension${filterLevels && filterLevels.includes(d.levels.join(",")) ? " active" : ""}`}
                      onClick={() => onFilterLevels(false)}
                      dangerouslySetInnerHTML={{__html: d.title}}
                    />

                    :                       <Anchor
                      // className={`cms-profilesearch-filters-dimension${filterCubes && filterCubes.includes(d.cubes.join(",")) ? " active" : ""}`}
                      onClick={() => onFilterLevels(false)}
                      dangerouslySetInnerHTML={{__html: d.title}}
                    />
                  }
                  {d.sortedLevels
                    ? d.sortedLevels.map(l =>
                      <Anchor
                        key={`filters-level-${l}`}
                        // className={`cms-profilesearch-filters-level${filterLevels && !filterLevels.includes(d.levels.join(",")) && filterLevels.includes(l) ? " active" : ""}`}
                        onClick={() => onFilterLevels(l)}
                        dangerouslySetInnerHTML={{__html: filterHierarchyTitle(l, activeProfile[0])}}
                      />
                    )
                    : d.sortedCubes.map(l =>
                      <Anchor
                        key={`filters-level-${l}`}
                        bg={
                          filterCubes &&
                        !filterCubes.includes(d.cubes.join(",")) && filterCubes.includes(l) ? "grey" : "none"
                        }
                        // className={`cms-profilesearch-filters-level${filterCubes && !filterCubes.includes(d.cubes.join(",")) && filterCubes.includes(l) ? " active" : ""}`}
                        onClick={() => onFilterLevels(l)}
                        dangerouslySetInnerHTML={{__html: filterCubeTitle(l.split(",")[0], activeProfile[0])}}
                      />
                    )}
                </Flex>
              ) }
            </div>
            : null }
        </Box>
        <ScrollArea>
          <div
            className={`cms-profilesearch-container cms-profilesearch-container-${position}`}
            key="container"
            ref={resultContainer}
          >
            {
              (position !== "absolute" || active) && results
                ? (() => {
                  if (!results.grouped.length) {
                    return <NonIdealState message={t("CMS.Search.No results", {query: debouncedQuery})} />;
                  }

                  switch (display) {
                    case "grid":
                      const gridProfiles = (results.grouped || [])
                        .filter(d => !availableProfiles.length || availableProfiles.includes(d[0].slug));

                      return (
                        <SimpleGrid
                          key="grid"
                          breakpoints={[
                            {minWidth: "xs", cols: 1},
                            {minWidth: "sm", cols: 3},
                            {minWidth: "md", cols: 5},
                            {minWidth: "lg", cols: 7}
                          ]}
                          className="cms-profilesearch-grid"
                        >
                          {gridProfiles.map((data, j) => renderTile(data, j, {
                            joiner, subtitleFormat, titleFormat, linkify
                          }))}
                        </SimpleGrid>
                      );

                    case "columns":
                      const filteredProfiles = Object.keys(results.profiles || {})
                        .reduce((obj, d) => {
                          let arr = results.profiles[d];
                          if (availableProfiles.length) arr = arr.filter(p => availableProfiles.includes(p[0].slug));
                          // eslint-disable-next-line no-param-reassign
                          if (arr.length) obj[d] = arr;
                          return obj;
                        }, {});
                      const columnProfiles = Object.keys(filteredProfiles || {})
                        .sort((a, b) => {
                          const aIndex = columnOrder.includes(a) ? columnOrder.indexOf(a) : columnOrder.length + 1;
                          const bIndex = columnOrder.includes(b) ? columnOrder.indexOf(b) : columnOrder.length + 1;
                          return aIndex - bIndex;
                        })
                        .map(profile => results.profiles[profile] || []);
                      return (
                        null
                      // TODO: ProfileColumns
                      // <ProfileColumns
                      //   columnFormat={subtitleFormat}
                      //   columnTitles={columnTitles}
                      //   joiner={joiner}
                      //   renderTile={renderTile}
                      //   tileProps={{joiner, subtitleFormat, titleFormat}}
                      //   data={columnProfiles}
                      // />
                      );

                    default:
                    // eslint-disable-next-line no-case-declarations
                      const listProfiles = (results.grouped || [])
                        .filter(d => !availableProfiles.length || availableProfiles.includes(d[0].slug));
                      return (
                        <ul key="list" className="cms-profilesearch-list">
                          {listProfiles.map((result, j) => renderListItem(
                            result,
                            j,
                            linkify(result),
                            result.map(titleFormat).join(joiner),
                            result.map(subtitleFormat).join(joiner)
                          ))}
                        </ul>
                      );
                  }
                })()
                : loading && (position !== "absolute" || active)
                  ? <NonIdealState key="loading" message={t("CMS.Search.Loading")} />
                  : position !== "absolute" ? <NonIdealState message={t("CMS.Search.Empty")} /> : null
            }
          </div>
        </ScrollArea>
      </Box>
    </FocusTrap>
  );
}

export default ProfileSearch;

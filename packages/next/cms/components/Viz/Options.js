/* eslint-disable no-nested-ternary */
import React, {useContext, useEffect, useState} from "react";
import {useRouter} from "next/router.js";

import {
  Flex, Group, ActionIcon, Modal, Button, Tabs, Checkbox, Stack, Text, Center, SegmentedControl, Box
} from "@mantine/core";
import {
  IconTable,
  IconPhoto, IconShare, IconX, IconChartLine, IconLayoutDistributeHorizontal, IconDownload
} from "@tabler/icons-react";

import {select} from "d3-selection";
import JSZip from "jszip";
import * as XLSX from "xlsx";
import axios from "axios";
import {saveAs} from "file-saver";
import {saveElement} from "d3plus-export";
import {strip} from "d3plus-text";

import * as MantineDataTable from "mantine-datatable";
import ProfileContext from "../ProfileContext";
import NonIdealState from "../../../core/components/NonIdealState";
import ShareDirectLink from "./ShareDirectLink";
import ShareTwitterLink from "./ShareTwitterLink";
import ShareFacebookLink from "./ShareFacebookLink";


const {DataTable} = MantineDataTable;


const DOWNLOAD_TYPES = {
  CSV: "CSV",
  JSON: "JSON",
  XLS: "XLS"
};

const PAGE_SIZE = 15;

const filename = str => strip(str.replace(/<[^>]+>/g, ""))
  .replace(/^\-/g, "")
  .replace(/\-$/g, "");

const getBackground = elem => {
  // Is current element's background color set?
  const color = select(elem).style("background-color");
  if (color !== "rgba(0, 0, 0, 0)" && color !== "transparent") return color;

  // if not: are you at the body element?
  if (elem === document.body) return "white";
  return getBackground(elem.parentNode);
};

function DataPanel({
  data, dataFormat, dataAttachments, title, origin, t
}) {
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState([]);
  const [page, setPage] = useState(1);
  const paths = typeof data === "string" ? [data] : data;
  const dataURLs = typeof data === "string"
    ? [data] : Array.isArray(data)
      ? data.filter(d => typeof d === "string") : false;

  const onDownload = type => {
    const zip = new JSZip();
    if (type === DOWNLOAD_TYPES.JSON) {
      zip.file(`${filename(title)}.json`, JSON.stringify(results));
    }
    else if (type === DOWNLOAD_TYPES.XLS) {
      const ws = XLSX.utils.json_to_sheet(results);
      const wb = XLSX.utils.book_new();
      const SHEET_NAME_MAX_LENGTH = 30;
      XLSX.utils.book_append_sheet(wb, ws, filename(title).substring(0, SHEET_NAME_MAX_LENGTH));
      const xls = XLSX.write(wb, {bookType: "xlsx", bookSST: true, type: "binary"});
      zip.file(`${filename(title)}.xlsx`, xls, {binary: true});
    }
    else if (type === DOWNLOAD_TYPES.CSV) { // csv
      const colDelim = ",";
      const rowDelim = "\r\n";

      const columns = results && results[0] ? Object.keys(results[0]) : [];
      let csv = columns.map(val => `\"${val}\"`).join(colDelim);

      for (let i = 0; i < results.length; i++) {
        const data = results[i];

        csv += rowDelim;
        csv += columns.map(key => {
          const val = data[key];

          return typeof val === "number" ? val
            : val ? `\"${val}\"` : "";
        }).join(colDelim);
      }
      // add generated data table to ZIP
      zip.file(`${filename(title)}.csv`, csv);
    }
    else {
      console.error(`Invalid download type: ${type}`);
      return;
    }
    // Include any additional files defined in config
    if (typeof dataAttachments !== "undefined") {
      const attachmentURLs = dataAttachments
        ? Array.isArray(dataAttachments) ? dataAttachments : [dataAttachments] : [];

      const requests = [];
      attachmentURLs.forEach(url => {
        requests.push(axios.get(url, {responseType: "blob"}));
      });

      Promise.all(requests)
        .then(responses => {
          responses.forEach(response => {
            if (response.status === 200 || response.status === 0) {
              // Pull data, grab file name, and add to ZIP
              const blob = new Blob([response.data], {type: response.data.type});
              const dAName = response.config.url.split("/").pop();
              zip.file(`${dAName}`, blob, {binary: true});
            }
          });
          return zip.generateAsync({type: "blob"});
        })
        .then(content => saveAs(content, `${filename(title)}.zip`));
    }
    else {
      // No attachments listed in config, only ZIP data table
      zip.generateAsync({type: "blob"})
        .then(content => saveAs(content, `${filename(title)}.zip`));
    }
  };

  useEffect(() => {
    Promise.all(paths.map(path => typeof path === "string" ? axios.get(path) : {data: path})).then(resps => {
      const loaded = resps.map(d => d.data);
      let results;
      try {
        results = dataFormat(loaded.length === 1 ? loaded[0] : loaded);
        if (typeof results === "object" && !(results instanceof Array)) results = results.data || [];
      }
      catch (e) {
        console.log("Error in Options Panel: ", e);
        results = [];
      }
      setLoading(false);
      setResults(results);
    });
  }, []);
  if (loading) return <NonIdealState height={300} />;
  // TODO: add table (PS. react-table not longer works the same)
  return (
    <Stack spacing="lg">
      {
        dataURLs.map((link, i) => 
          <ShareDirectLink
            link={link.indexOf("http") === 0 ? link : `${origin}${link}`}
            label={`${t("CMS.Options.Endpoint")}${dataURLs.length > 1 ? ` ${i + 1}` : ""}`}
          />
        )
      }
      <Box h={300}>
        <DataTable
          withBorder
          borderRadius="sm"
          withColumnBorders
          striped
          highlightOnHover
          // provide data
          records={results.slice((page - 1) * PAGE_SIZE, (page - 1) * PAGE_SIZE + PAGE_SIZE)}
          totalRecords={results.length}
          page={page}
          recordsPerPage={PAGE_SIZE}
          onPageChange={setPage}
          // define columns
          columns={Object.keys(results[0]).map(key => ({accessor: key}))}
        />
      </Box>
      <Group position="apart" grow>
        <Button size="xs" onClick={() => onDownload(DOWNLOAD_TYPES.CSV)}>
          <Flex align="center" justify="center" gap="xs">
            {t("CMS.Options.Download as CSV")}
            {" "}
            <IconDownload size={16} />
          </Flex>
        </Button>
        <Button size="xs" onClick={() => onDownload(DOWNLOAD_TYPES.XLS)}>
          <Flex align="center" justify="center" gap="xs">
            {t("CMS.Options.Download as XLS")}
            {" "}
            <IconDownload size={16} />
          </Flex>
        </Button>
        <Button size="xs" onClick={() => onDownload(DOWNLOAD_TYPES.JSON)}>
          <Flex align="center" justify="center" gap="xs">
            {t("CMS.Options.Download as JSON")}
            {" "}
            <IconDownload size={16} />
          </Flex>
        </Button>
      </Group>
    </Stack>
  );
}

function ImagePanel({
  mirrorSelector, title, component, t
}) {
  const [backgroundColor, setBackgroundcolor] = useState(true);
  const [imageFormat, setImageFormat] = useState("png");
  const [imageContext, setImageContext] = useState("viz");
  const [imageProcessing, setImageProcessing] = useState(false);
  const getNode = () => {
    let elem = component;

    // get the visualization
    if (imageContext === "viz" && component.viz.current) {
      elem = component.viz.current;

      // d3plus visualizations render within a container; use it for the image
      if (elem.container) return elem.container;
      // custom visualizations
      return elem;
    }

    // get the section
    if (imageContext === "section" && component.section.current) {
      return component.section.current;
    }

    return false;
  };

  const onSave = () => {
    setImageProcessing(true);

    let node = getNode();
    if (node) {
      // config
      let background;
      if (backgroundColor) background = getBackground(node);

      // grab the d3plus visualization directly and save it as-is
      if (imageFormat === "svg") {
        node = select(node).select(".d3plus-viz").node();
        saveElement(
          node,
          {
            callback: () => setImageProcessing(false),
            filename: filename(title),
            type: "svg"
          },
          {background}
        );
      }

      // construct the png image in the mirror
      else {
        // get node dimensions (fudged to account for padding & Mirror footer)
        const width = node.offsetWidth + 40;
        const height = node.offsetHeight + 120;

        // make a copy of the node so we're not editing the original
        node = node.cloneNode(true);

        // get the mirror, make it visible, and size it
        const mirror = document.body.querySelector(mirrorSelector);
        mirror.classList.add("is-visible", `${imageContext}-context`);
        mirror.classList.remove("is-hidden");
        mirror.style.width = `${width}px`;
        mirror.style.height = `${height}px`;

        // once the mirror is visible, clone elements into it
        setTimeout(() => {
          mirror.querySelector(".mirror-content-inner").innerHTML = "";
          mirror.querySelector(".mirror-content-inner").appendChild(node);
          mirror.querySelector(".mirror-footer-text-url").innerHTML = origin.replace("http://", "").replace("https://", "");

          // select elements aren't being rendered to the canvas; replace them
          const selects = mirror.querySelectorAll(".cp-select");
          if (selects) {
            selects.forEach(select => {
              // create a fake element with properties of the select menu
              const fakeSelect = document.createElement("p");
              // get the selected option
              fakeSelect.innerHTML = select.options[select.selectedIndex].text;
              // get the classes from the real select & add them to the fake
              const classes = select.classList;
              fakeSelect.className = classes; // .className syntax needed for IE
              // I'm the captain now
              select.parentNode.replaceChild(fakeSelect, select);
            });
          }

          // // swap out table header buttons with spans
          const tableHeaders = mirror.querySelectorAll(".rt-th");
          if (tableHeaders) {
            tableHeaders.forEach(header => {
              // create a fake element with properties of the header header
              const fakeHeader = document.createElement("span");
              // remove header button screen reader text & icon
              const hiddenText = header.querySelector(".u-visually-hidden");
              if (hiddenText) hiddenText.parentNode.removeChild(hiddenText);
              const icon = header.querySelector(".cp-table-header-icon");
              if (icon) icon.parentNode.removeChild(icon);
              // get header text
              fakeHeader.innerHTML = header.textContent || header.innerText;
              // get the classes from the real header & add them to the fake
              const classes = header.classList;
              fakeHeader.className = classes; // .className syntax needed for IE
              // I'm the captain now
              header.parentNode.replaceChild(fakeHeader, header);
            });
          }

          // save!
          saveElement(
            mirror,
            {
              callback: () => {
                // make mirror invisible
                mirror.classList.add("is-hidden");
                mirror.classList.remove("is-visible", `${imageContext}-context`);
                // remove mirrored content
                mirror.querySelector(".mirror-content-inner").removeChild(node);
                // reset state
                setImageProcessing(false);
              },
              filename: filename(title),
              type: imageFormat
            },
            {background}
          );
        });
      }
    }
    else {
      setImageProcessing(false);
    }
  };

  const node = getNode();
  const svgAvailable = node && select(node).select(".d3plus-viz").size() > 0;
  // god forgive me || did god forgive him?
  const isTable = component?.viz?.props?.config?.logic?.includes("Table");

  return (
    <div className="save-image">
      <Stack spacing="xs">
        <Group position="apart" noWrap>
          <Text
            className="save-image-button-group-label label u-font-xs"
            component="h3"
          >
            {t("CMS.Options.Image area")}
          </Text>
          {!isTable &&
                
                <SegmentedControl
                  onChange={setImageContext}
                  data={[
                    {
                      label: 
                        <Center>
                          <IconChartLine />
                          <Text ml="sm" tt="uppercase" size="xs" inherit>{t("CMS.Options.visualization only")}</Text>
                        </Center>,                      
                      value: "viz"
                    },
                    {
                      label: 
                        <Center>
                          <IconLayoutDistributeHorizontal />
                          <Text ml="sm" tt="uppercase" size="xs" inherit>{t("CMS.Options.entire section")}</Text>
                        </Center>,                      
                      value: "section"
                    }]}
                />
          }
        </Group>
        {
          svgAvailable && imageContext !== "section" &&
                
                <Group position="apart" noWrap>
                  <Text
                    className="save-image-button-group-label label u-font-xs"
                    component="h3"
                  >
                    {t("CMS.Options.Image Format")}
                  </Text>
                  <SegmentedControl
                    onChange={setImageFormat}
                    data={[
                      {
                        label: 
                          <Center>
                            <IconChartLine />
                            <Text ml="sm" tt="uppercase" size="xs" inherit>
                              <Text display="none">{t("CMS.Options.Save visualization as")}</Text>
                              {" "}
                              PNG
                            </Text>
                          </Center>,                        
                        value: "png"
                      },
                      {
                        label: 
                          <Center>
                            <IconLayoutDistributeHorizontal />
                            <Text ml="sm" tt="uppercase" size="xs" inherit>
                              <Text display="none">{t("CMS.Options.Save visualization as")}</Text>
                              {" "}
                              SVG
                            </Text>
                          </Center>,                        
                        value: "svg"
                      }]}
                  />
                </Group>
                
        }
        <Group />

        <Checkbox
          label={t("CMS.Options.Transparent Background")}
          checked={!backgroundColor}
          onChange={event => setBackgroundcolor(!event.target.checked)}
        />
        <Button
          className="save-image-download-button"
          // rebuilding={imageProcessing}
          // disabled={imageProcessing}
          onClick={onSave}
          rightIcon={<IconDownload />}
          loading={imageProcessing}
          loaderPosition="right"
          fontSize="md"
          tt="uppercase"
          fullWidth
        >
          {`${t("CMS.Options.Download")} ${imageFormat}`}
        </Button>
      </Stack>
    </div>
  );
}

function SharePanel({
  origin, mirrorSelector, slug, t
}) {
  const [includeSlug, setIncludeSlug] = useState(true);
  const router = useRouter();
  const shareURL = `${origin}${router.asPath}`;
  const shareLink = `${shareURL}${includeSlug && slug ? `#${slug}` : ""}`;
  return (
    <Stack spacing="md" className="share-dialog">
      <ShareDirectLink link={shareLink} label="Direct Link" />
      <Checkbox
        onChange={() => setIncludeSlug(value => !value)}
        checked={includeSlug}
        label={t("CMS.Options.Scroll to section")}
        className="u-font-xs"
      />
      <Stack spacing="sm">
        <Text span className="u-font-xs options-label-text label">{t("CMS.Options.Social")}</Text>
        <Group>
          <ShareFacebookLink link={shareLink} t={t} />
          <ShareTwitterLink link={shareLink} t={t} />
        </Group>
      </Stack>
    </Stack>
  );
}

export default function Options({
  data, title, slug, dataFormat, dataAttachments, component, mirrorSelector = ".mirror"
}) {
  const {t} = useContext(ProfileContext);
  const [dialogOpen, setDialogOpen] = useState(null);
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    setOrigin(window.location.origin);
  }, []);
  const hasMultiples = Array.isArray(data) && data.length > 1 && data.some(d => typeof d === "string");
  return (
    <>
      <Flex>
        <Group position="right" w="100%">
          <ActionIcon
            component="button"
            onClick={() => setDialogOpen("view-data")}
          >
            <IconTable size={18} />
          </ActionIcon>
          <ActionIcon
            component="button"
            onClick={() => setDialogOpen("save-image")}
          >
            <IconPhoto size={18} />
          </ActionIcon>
          <ActionIcon
            component="button"
            onClick={() => setDialogOpen("share")}
          >
            <IconShare size={18} />
          </ActionIcon>
        </Group>

      </Flex>
      <Modal
        opened={dialogOpen}
        size="70%"
        onClose={() => setDialogOpen(null)}
        withCloseButton={false}
        transition="fade"
        transitionDuration={600}
        transitionTimingFunction="ease"
        centered
      >
        <div style={{position: "relative"}}>

          <ActionIcon component="button" pos="absolute" top="0" right="0" onClick={() => setDialogOpen(null)}>
            <IconX size={12} />
          </ActionIcon>

          <Tabs variant="pills" defaultValue="gallery" value={dialogOpen} onTabChange={setDialogOpen}>
            <Tabs.List>
              <Tabs.Tab value="view-data" icon={<IconTable size={14} />}>{t("CMS.Options.View Data")}</Tabs.Tab>
              <Tabs.Tab value="save-image" icon={<IconPhoto size={14} />}>{t("CMS.Options.Save Image")}</Tabs.Tab>
              <Tabs.Tab value="share" icon={<IconShare size={14} />}>{t("CMS.Options.Share")}</Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="view-data" pt="xs">
              <DataPanel
                data={data}
                dataFormat={dataFormat}
                title={title}
                dataAttachments={dataAttachments}
                origin={origin}
                t={t}
              />
            </Tabs.Panel>

            <Tabs.Panel value="save-image" pt="xs">
              <ImagePanel mirrorSelector={mirrorSelector} title={title} component={component} t={t} />
            </Tabs.Panel>

            <Tabs.Panel value="share" pt="xs">
              <SharePanel slug={slug} origin={origin} t={t} />
            </Tabs.Panel>
          </Tabs>
        </div>
      </Modal>
    </>
  );
}

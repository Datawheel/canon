import React, {useContext} from "react";
import {Group, Title} from "@mantine/core";
import ProfileContext from "../ProfileContext";
import Tile from "../fields/ProfileTile";

/** */
export default function Related({profiles}) {
  const {t, linkify} = useContext(ProfileContext);
  return (
    <section className="cp-related">
      <Title order={2} align="center" className="cp-section-heading cp-related-heading">
        {t("CMS.Search.Related Profiles")}
      </Title>
      <Group
        position="stretch"
        component="ul"
        sx={{
          listStyleType: "none",
          paddingLeft: "0px !important",
          "& li": {
            marginTop: "0px !important",
            minWidth: 150,
          },

          "& a": {
            textDecoration: "none !important",
          },
        }}
        className="cp-related-tile-list"
        key="tl"
        grow
      >
        {profiles.map((data) => (
          <li key={data[0].id}>
            <Tile data={data} linkify={linkify} />
          </li>
        ))}
      </Group>
    </section>
  );
}

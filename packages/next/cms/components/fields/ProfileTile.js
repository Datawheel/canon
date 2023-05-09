import React from "react";
import Link from "next/link.js";
import {
  Stack, Text, Card, BackgroundImage, Group, Overlay
} from "@mantine/core";
import {trim} from "d3plus-text";
import {max} from "d3-array";

/** Determines font-size based on title */
function titleSize(title) {
  const {length} = title;
  const longestWord = max(length ? title.match(/\w+/g).map(t => t.length) : 0);
  if (length > 30 || longestWord > 25) return "sm";
  if (length > 20 || longestWord > 15) return "md";
  return "lg";
}
function ProfileTile({
  data,
  joiner = " & ",
  subtitleFormat = d => d.memberHierarchy,
  titleFormat = d => d.name,
  // eslint-disable-next-line max-len
  linkify = profile => profile.reduce((href, member) => `${href}/${member.slug}/${member.memberSlug || member.id}`, "/profile")
}) {
  return (
    <Link href={linkify(data)} style={{textDecoration: "none"}} passHref>
      <Card
        className="cms-profilesearch-tile"
        pos="relative"
        h={150}
        sx={{
          "cursor": "pointer",
          "textDecoration": "none",
          "zIndex": "auto",
          "borderRadius": 10,
          ".tile-image": {
            transform: "scale(1.2)",
            transition: "transform .45s"
          },
          "&:hover .tile-image": {
            transform: "scale(1)"
          },
          "& .profile-tile-overlay": {
            transition: "opacity 0.4s"
          },
          "&:hover .profile-tile-overlay": {
            opacity: 0.3
          }
        }}
      >

        <Group
          className="cms-profilesearch-tile-link"
          pos="relative"
          position="center"
          justify="center"
          sx={{height: "100%", width: "100%", zIndex: 2}}
          grow
        >
          {data.map((r, i) => {
            const title = titleFormat(r);
            return (
              <div key={JSON.stringify(r)}>
                { i > 0 && <Text size="md" color="white" span>{trim(joiner)}</Text> }
                <Stack className="cms-profilesearch-tile-link-text" justify="center">
                  <Text color="white" size={titleSize(title)}>{title}</Text>
                  <Text color="white" size="xs">{subtitleFormat(r)}</Text>
                </Stack>
              </div>
            );
          })}
        </Group>
        <Group spacing={0} top={0} left={0} pos="absolute" h="100%" w="100%" noWrap>
          {data.map(r =>
            <div key={`tile-image-${r.id}`} style={{height: "100%", width: "100%"}}>
              <BackgroundImage
                className="tile-image"
                sx={{
                  height: "100%",
                  width: `${100 / data.length}%`
                }}
                src={`${process.env.NEXT_PUBLIC_CMS}/image?slug=${r.slug}&id=${r.id}&size=thumb`}
              />
              <Overlay className="profile-tile-overlay" color="#000" opacity={0.5} zIndex={1} />
            </div>
          )}
        </Group>
      </Card>
    </Link>
  );
}
export default ProfileTile;

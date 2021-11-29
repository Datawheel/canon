/* react */
import React from "react";
import {useDispatch, useSelector} from "react-redux";
import {Card, Center, Space, Text, Badge, Button, Group, useMantineTheme} from "@mantine/core";
import {HiOutlineDocumentReport, HiOutlinePencil, HiOutlineCog} from "react-icons/hi";

/* components */
import CogMenu from "./components/CogMenu";

/* redux */
import {setStatus} from "../actions/status";

/* enums */
import {ENTITY_TYPES} from "../utils/consts/cms";

/**
 *
 */
function ProfileCard({id}) {

  const theme = useMantineTheme();

  const secondaryColor = theme.colorScheme === "dark"
    ? theme.colors.dark[1]
    : theme.colors.gray[7];

  const dispatch = useDispatch();

  /* redux */
  const localeDefault = useSelector(state => state.cms.status.localeDefault);
  const profile = useSelector(state => state.cms.profiles.entities.profiles[id]);

  const openProfile = id => {
    dispatch(setStatus({pathObj: {profile: id}}));
  };

  const label = profile.contentByLocale[localeDefault].content.label;

  return (
    <Card shadow="xs" padding="lg" withBorder style={{margin: theme.spacing.sm}}>
      <Group position="apart">
        <Center>
          <HiOutlineDocumentReport size={22} />
          <Space w="xs" />
          <Text margin="xl" weight="bold">{label}</Text>
        </Center>
        <Badge variant="light">{profile.type}</Badge>
      </Group>
      <Text size="sm" style={{color: secondaryColor, lineHeight: 2}}>
        Description of profile will go here
      </Text>
      <Space w="xs" />
      <Group>
        <Button onClick={() => openProfile(id)} leftIcon={<HiOutlinePencil />} compact>
          Edit
        </Button>
        <CogMenu type={ENTITY_TYPES.PROFILE} id={id} control={<Button leftIcon={<HiOutlineCog size={16} />} compact>Settings</Button>}/>
      </Group>
    </Card>
  );

}

export default ProfileCard;

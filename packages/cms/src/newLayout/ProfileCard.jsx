/* react */
import React from "react";
import {useDispatch, useSelector} from "react-redux";
import {Card, Center, Image, Text, Badge, Button, Group, useMantineTheme} from "@mantine/core";
import {HiOutlinePencil, HiOutlineCog} from "react-icons/hi";

/* components */
import CogMenu from "./components/CogMenu";
import img from "../../static/images/dw_icon.png";

/* redux */
import {setStatus} from "../actions/status";

/* enums */
import {ENTITY_TYPES} from "../utils/consts/cms";

/* css */
import "./ProfileCard.css";

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
    <div className="cms-profile-card" style={{width: 270, marginLeft: 20}}>
      <Card shadow="md" padding="lg">
        <Center>
          <Image src={img} align="center" width={100} height={100} alt="Datawheel Profile" />
        </Center>
        <Group position="apart" style={{marginBottom: 5, marginTop: theme.spacing.sm}}>
          <Text weight={500}>{label}</Text>
          <Badge color="orange" variant="light">{profile.type}</Badge>
        </Group>
        <Text size="sm" style={{color: secondaryColor, lineHeight: 2}}>
            Description of profile will go here
        </Text>
        <Group position="right" style={{marginTop: "5px"}}>
          <Button onClick={() => openProfile(id)} leftIcon={<HiOutlinePencil />} variant="light" color="blue" >
          Edit
          </Button>
          <CogMenu type={ENTITY_TYPES.PROFILE} id={id} control={<Button leftIcon={<HiOutlineCog />}variant="light" color="blue" >Settings</Button>}/>
        </Group>
      </Card>
    </div>
  );

}

export default ProfileCard;

/* react */
import React from "react";
import {useDispatch, useSelector} from "react-redux";
import {ActionIcon, Alert, Center, Group, Space} from "@mantine/core";
import {HiOutlineDocumentReport, HiOutlinePlusCircle} from "react-icons/hi";

/* components */
import ProfileCard from "./ProfileCard";
import EntityAddButton from "./components/EntityAddButton";

/* redux */
import {newProfile} from "../actions/profiles";

/**
 *
 */
function ProfilePicker() {

  const dispatch = useDispatch();

  /* redux */
  const profiles = useSelector(state => state.cms.profiles.result);

  return (
    <Center
      style={{
        flexDirection: "column",
        height: "100vh"
      }}>
      <h1>Reports</h1>
      <Group withGutter position="center" style={{width: "100%"}}>
        {profiles.length
          ? profiles.map(profile => <ProfileCard key={profile} id={profile} />)
          : <Alert
            icon={<HiOutlineDocumentReport size={22} />}
            title="No Saved Reports"
          >
            Please use the button below to create your first report.
          </Alert>}
      </Group>
      <Space size="xl" />
      <EntityAddButton
        label="Profile Name"
        onSubmit={name => dispatch(newProfile({label: name}))}
        target={<ActionIcon size="xl" radius="xl"><HiOutlinePlusCircle size={30} /></ActionIcon>}
      />
    </Center>
  );

}

export default ProfilePicker;

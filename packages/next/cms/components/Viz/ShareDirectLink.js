import {Text, Stack} from "@mantine/core";
import {Prism} from "@mantine/prism";
import React, {useContext} from "react";
import ProfileContext from "../ProfileContext";

const ShareDirectLink = ({link, label}) => {
  const {t} = useContext(ProfileContext);
  return (
    <Stack spacing={0}>
      <Text tt="uppercase" weight={500}>{label}</Text>
      <Prism copyLabel={t("CMS.Options.Copy")}>{link}</Prism>
    </Stack>
  );
};

export default ShareDirectLink;

/* react */
import React from "react";
import {useSelector} from "react-redux";
import {Card, Center, Space, Text, Badge, Button, Group, useMantineTheme} from "@mantine/core";
import {HiOutlineDatabase, HiOutlinePencil, HiOutlineTrash} from "react-icons/hi";

/* hooks */
import {useConfirmationDialog} from "../hooks/interactions/ConfirmationDialog";

import {deleteDimension} from "../../actions/reports";

/**
 *
 */
function DimensionCard({id, onEdit}) {

  const theme = useMantineTheme();
  const {getConfirmation} = useConfirmationDialog();

  const secondaryColor = theme.colorScheme === "dark"
    ? theme.colors.dark[1]
    : theme.colors.gray[7];

  /* redux */
  const meta = useSelector(state => state.cms.reports.entities.meta[id]);

  const maybeEdit = async() => {
    const confirmed = await getConfirmation({
      title: "Are you sure?",
      message: "Modifying dimensions can be destructive and break the site. Make sure you know what you're doing!",
      confirmText: "Continue"
    });
    if (confirmed) onEdit(id);
  };

  const maybeDelete = async() => {
    const confirmed = await getConfirmation({
      title: "Are you sure?",
      message: "Deleting dimensions can be destructive and break the site. Make sure you know what you're doing!",
      confirmText: "Delete"
    });
    if (confirmed) deleteDimension(id);
  };

  const {slug, namespace} = meta;

  return (
    <Card shadow="xs" padding="lg" withBorder style={{margin: theme.spacing.sm}}>
      <Group position="apart">
        <Center>
          <HiOutlineDatabase size={22} />
          <Space w="xs" />
          <Text margin="xl" weight="bold">{slug}</Text>
        </Center>
        <Badge variant="light">{namespace}</Badge>
      </Group>
      <Text size="sm" style={{color: secondaryColor, lineHeight: 2}}>
        Description of report will go here
      </Text>
      <Space w="xs" />
      <Group>
        <Button onClick={() => maybeEdit()} leftIcon={<HiOutlinePencil />} compact>
          Edit
        </Button>
        <Button onClick={() => maybeDelete()} leftIcon={<HiOutlineTrash />} compact>
          Delete
        </Button>
      </Group>
    </Card>
  );

}

export default DimensionCard;

/* react */
import React from "react";
import {useSelector} from "react-redux";
import {Card, Center, Space, Text, Badge, Button, Group, useMantineTheme} from "@mantine/core";
import {HiOutlineDatabase, HiOutlinePencil} from "react-icons/hi";

/**
 *
 */
function DimensionCard({id, onEdit}) {

  const theme = useMantineTheme();

  const secondaryColor = theme.colorScheme === "dark"
    ? theme.colors.dark[1]
    : theme.colors.gray[7];

  /* redux */
  const meta = useSelector(state => state.cms.reports.entities.meta[id]);

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
        <Button onClick={() => onEdit(id)} leftIcon={<HiOutlinePencil />} compact>
          Edit
        </Button>
      </Group>
    </Card>
  );

}

export default DimensionCard;

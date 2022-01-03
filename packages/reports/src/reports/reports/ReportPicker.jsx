/* react */
import React from "react";
import {useDispatch, useSelector} from "react-redux";
import {ActionIcon, Alert, Center, Group, Space} from "@mantine/core";
import {HiOutlineDocumentReport, HiOutlinePlusCircle} from "react-icons/hi";

/* components */
import ReportCard from "./ReportCard";
import EntityAddButton from "../components/EntityAddButton";

/* redux */
import {newEntity} from "../../actions/reports";
import {ENTITY_TYPES} from "../../utils/consts/cms";

/**
 *
 */
function ReportPicker() {

  const dispatch = useDispatch();

  /* redux */
  const reports = useSelector(state => state.cms.reports.result);

  return (
    <Center
      style={{
        flexDirection: "column",
        height: "100vh"
      }}>
      <h1>Reports</h1>
      <Group position="center" style={{width: "100%"}}>
        {reports.length
          ? reports.map(report => <ReportCard key={report} id={report} />)
          : <Alert
            icon={<HiOutlineDocumentReport size={22} />}
            title="No Saved Reports"
          >
            Please use the button below to create your first report.
          </Alert>}
      </Group>
      <Space size="xl" />
      <EntityAddButton
        label="Report Name"
        onSubmit={name => dispatch(newEntity(ENTITY_TYPES.REPORT, {label: name}))}
        target={<ActionIcon size="xl" radius="xl"><HiOutlinePlusCircle size={30} /></ActionIcon>}
      />
    </Center>
  );

}

export default ReportPicker;

/* react */
import React, {useState, useEffect} from "react";
import {useDispatch, useSelector} from "react-redux";
import {TextInput, Button, Group, Select} from "@mantine/core";
import axios from "axios";

import DimensionEditor from "./DimensionEditor";
import DimensionCard from "./DimensionCard";

/**
 *
 */
function DimensionBuilder({id}) {

  /* redux */
  const dispatch = useDispatch();
  const meta = useSelector(state => state.cms.reports.entities.reports[id].meta);

  const [editing, setEditing] = useState(false);

  return (
    <div>
      {editing
        ? <DimensionEditor id={id} metaId={editing}/>
        : meta.map(d => <DimensionCard key={d} id={d} onEdit={id => setEditing(id)} />)
      }
    </div>
  );

}

export default DimensionBuilder;

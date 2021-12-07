/* react */
import React, {useState} from "react";
import {useDispatch, useSelector} from "react-redux";

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
      {editing || meta.length === 0
        ? <DimensionEditor id={id} metaId={editing}/>
        : meta.map(d => <DimensionCard key={d} id={d} onEdit={id => setEditing(id)} />)
      }
    </div>
  );

}

export default DimensionBuilder;

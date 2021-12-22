/* react */
import axios from "axios";
import React, {useEffect, useMemo, useState} from "react";
import {useTable} from "react-table";

/* hooks */
import {useDebouncedValue} from "@mantine/hooks";

/** */
export default function MemberEditor() {

  const [query, setQuery] = useState("");
  const [data, setData] = useState([]);
  const [debouncedQuery] = useDebouncedValue(query, 500);

  const columns = useMemo(() => [
    {Header: "id", accessor: "id"},
    {Header: "slug", accessor: "slug"},
    {Header: "name", accessor: "name"},
    {Header: "namespace", accessor: "namespace"}
  ], []);

  useEffect(() => {
    const fetchMembers = async() => {
      const data = await axios.get("/api/reports/newsearch").then(d => d.data).catch(() => []);
      setData(data);
    };
    fetchMembers();
  }, [debouncedQuery]);

  const tableInstance = useTable({columns, data});

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow
  } = tableInstance;

  return (
    // apply the table props
    <table {...getTableProps()}>
      <thead>
        {// Loop over the header rows
          headerGroups.map((headerGroup, hg) =>
          // Apply the header row props
            <tr key={hg} {...headerGroup.getHeaderGroupProps()}>
              {// Loop over the headers in each row
                headerGroup.headers.map((column, c) =>
                // Apply the header cell props
                  <th key={c} {...column.getHeaderProps()}>
                    {// Render the header
                      column.render("Header")}
                  </th>
                )}
            </tr>
          )}
      </thead>
      {/* Apply the table body props */}
      <tbody {...getTableBodyProps()}>
        {// Loop over the table rows
          rows.map((row, r) => {
          // Prepare the row for display
            prepareRow(row);
            return (
            // Apply the row props
              <tr key={r} {...row.getRowProps()}>
                {// Loop over the rows cells
                  row.cells.map((cell, c) =>
                  // Apply the cell props

                    <td key="c" {...cell.getCellProps()}>
                      {// Render the cell contents
                        cell.render("Cell")}
                    </td>

                  )}
              </tr>
            );
          })}
      </tbody>
    </table>
  );

}

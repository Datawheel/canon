/* react */
import axios from "axios";
import React, {useEffect, useMemo, useState} from "react";
import {useSelector} from "react-redux";
import {TextInput} from "@mantine/core";
import {useTable, usePagination} from "react-table";

/* hooks */
import {useDebouncedValue} from "@mantine/hooks";

/* utils */
import paramString from "../../utils/js/paramString";

/** */
export default function MemberEditor() {

  /* state */
  const [query, setQuery] = useState("");
  const [data, setData] = useState([]);
  const [debouncedQuery] = useDebouncedValue(query, 500);

  /* redux */
  const env = useSelector(state => state.env);
  const localeDefault = env.CANON_LANGUAGE_DEFAULT || "en";

  const columns = useMemo(() => [
    {Header: "id", accessor: "id"},
    {Header: "slug", accessor: "slug"},
    {Header: "name", accessor: d => d.contentByLocale[localeDefault].name},
    {Header: "namespace", accessor: "namespace"},
    {Header: "keywords", accessor: d => d.contentByLocale[localeDefault].keywords},
    {Header: "attributes", accessor: d => d.contentByLocale[localeDefault].attr},
    {Header: "image", accessor: d => d.imageId}
  ], []);

  useEffect(() => {
    const fetchMembers = async() => {
      const url = `/api/reports/newsearch?${paramString({
        query,
        all: true
      })}`;
      const data = await axios.get(url).then(d => d.data).catch(() => []);
      setData(data);
    };
    fetchMembers();
  }, [debouncedQuery]);

  const tableInstance = useTable({columns, data}, usePagination);

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow
  } = tableInstance;

  return (
    <React.Fragment>
      <TextInput
        placeholder="Search for a member..."
        label="Search"
        value={query}
        onChange={e => setQuery(e.target.value)}
      />
      <table className="reports-member-table" {...getTableProps()}>
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
    </React.Fragment>
  );

}

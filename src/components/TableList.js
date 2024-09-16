import React from 'react';

function TableList({ tables, onDeleteTable }) {
  return (
    <div>
      <h2>Created Tables</h2>
      {tables.map(table => (
        <div key={table.name}>
          <h3>{table.name}</h3>
          <ul>
            {table.columns.map(column => (
              <li key={column.name}>{column.name} ({column.dataType})</li>
            ))}
          </ul>
          <button onClick={() => onDeleteTable(table.name)}>Delete Table</button>
        </div>
      ))}
    </div>
  );
}

export default TableList;
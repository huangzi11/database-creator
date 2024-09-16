import React, { useState, useEffect } from 'react';

function TableForm({ formId, onDeleteTable, onDeleteForm, updateTableForm, availableTables }) {
  const [tableName, setTableName] = useState('');
  const [columns, setColumns] = useState([{ name: '', dataType: 'varchar', foreignKey: '' }]); // Default column

  useEffect(() => {
    // Update the parent component with the current form data
    updateTableForm({ id: formId, tableName, columns });
  }, [tableName, columns]);

  const addColumn = () => {
    setColumns([...columns, { name: '', dataType: 'varchar', foreignKey: '' }]);
  };

  const updateColumn = (index, key, value) => {
    const newColumns = [...columns];
    newColumns[index][key] = value;
    setColumns(newColumns);
  };

  const removeColumn = (index) => {
    setColumns(columns.filter((_, i) => i !== index));
  };

  const handleDelete = () => {
    if (tableName) {
      console.log(`Attempting to delete table: ${tableName}`);
      onDeleteTable(tableName);
    }
    onDeleteForm(formId);
  };

  return (
    <div className="table-form">
      <input
        type="text"
        value={tableName}
        onChange={(e) => setTableName(e.target.value)}
        placeholder="Table Name"
        required
      />
      {columns.map((column, index) => (
        <div key={index} className="column-row">
          <input
            type="text"
            value={column.name}
            onChange={(e) => updateColumn(index, 'name', e.target.value)}
            placeholder="Column Name"
            required
          />
          <select
            value={column.dataType}
            onChange={(e) => updateColumn(index, 'dataType', e.target.value)}
          >
            <option value="varchar">VARCHAR</option>
            <option value="integer">INTEGER</option>
            <option value="date">DATE</option>
          </select>
          <select
            value={column.foreignKey}
            onChange={(e) => updateColumn(index, 'foreignKey', e.target.value)}
          >
            <option value="">No Foreign Key</option>
            {availableTables.map((table) =>
              table.columns.map((col) => (
                <option key={`${table.name}.${col.name}`} value={`${table.name}.${col.name}`}>
                  {`${table.name}.${col.name}`}
                </option>
              ))
            )}
          </select>
          <button onClick={() => removeColumn(index)}>Remove</button>
        </div>
      ))}
      <button onClick={addColumn}>Add Column</button>
      <button onClick={handleDelete}>Delete Table</button>
    </div>
  );
}

export default TableForm;
import React, { useState } from 'react';

function ColumnForm({ onAddColumn }) {
  const [columnName, setColumnName] = useState('');
  const [dataType, setDataType] = useState('varchar');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (columnName) {
      onAddColumn({ name: columnName, dataType });
      setColumnName('');
      setDataType('varchar');
    }
  };

  return (
    <div>
      <input
        type="text"
        value={columnName}
        onChange={(e) => setColumnName(e.target.value)}
        placeholder="Column Name"
        required
      />
      <select value={dataType} onChange={(e) => setDataType(e.target.value)}>
        <option value="varchar">VARCHAR</option>
        <option value="integer">INTEGER</option>
        <option value="date">DATE</option>
      </select>
      <button onClick={handleSubmit}>Add Column</button>
    </div>
  );
}

export default ColumnForm;
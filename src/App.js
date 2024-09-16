import React, { useState, useEffect } from 'react';
import './App.css'; // Import the CSS file
import TableForm from './components/TableForm';
import TableList from './components/TableList';
import SQLPlayground from './components/SQLPlayground'; // Ensure this import is correct
import axios from 'axios';

function App() {
  const [tables, setTables] = useState([]);
  const [tableForms, setTableForms] = useState([]);

  useEffect(() => {
    // Fetch existing tables to provide options for foreign keys
    const fetchTables = async () => {
      try {
        const response = await axios.get('http://localhost:3002/api/tables');
        setTables(response.data.tables);
      } catch (error) {
        console.error('Failed to fetch tables:', error);
      }
    };

    fetchTables();
  }, []);

  const addTableForm = () => {
    setTableForms([...tableForms, { id: Date.now(), tableName: '', columns: [{ name: '', dataType: 'varchar', foreignKey: '' }] }]);
  };

  const updateTableForm = (updatedForm) => {
    setTableForms(tableForms.map(form => form.id === updatedForm.id ? updatedForm : form));
  };

  const deleteTable = async (tableName) => {
    try {
      console.log(`Attempting to delete table: ${tableName}`);
      await axios.delete(`http://localhost:3002/api/tables/${tableName}`);
      setTables(tables.filter(t => t.name !== tableName));
    } catch (error) {
      console.error('Failed to delete table:', error);
    }
  };

  const deleteTableForm = (formId) => {
    setTableForms(tableForms.filter(form => form.id !== formId));
  };

  const generateAllData = async () => {
    try {
      const tablesToCreate = tableForms.map(form => ({
        name: form.tableName,
        columns: form.columns,
      }));

      for (const table of tablesToCreate) {
        await axios.post('http://localhost:3002/api/tables', table);
      }

      await axios.post('http://localhost:3002/api/generate-data');
      alert('Tables created and random data generated for all tables.');
      setTables(tablesToCreate);
    } catch (error) {
      console.error('Failed to generate data:', error);
      alert('Failed to generate data.');
    }
  };

  return (
    <div className="App">
      <h1>SQL Database Creator</h1>
      <button onClick={addTableForm}>Create Table</button>
      {tableForms.map(form => (
        <TableForm
          key={form.id}
          formId={form.id}
          onDeleteTable={deleteTable}
          onDeleteForm={deleteTableForm}
          updateTableForm={updateTableForm}
          availableTables={tables}
        />
      ))}
      <button onClick={generateAllData}>Generate Data</button>
      <TableList tables={tables} onDeleteTable={deleteTable} />
      <SQLPlayground />
    </div>
  );
}

export default App;
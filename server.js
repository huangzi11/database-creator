const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');

const app = express();
app.use(bodyParser.json());
app.use(cors());

let db;

// Open database connection
async function openDb() {
  db = await open({
    filename: './database.sqlite',
    driver: sqlite3.Database
  });
}

openDb();

app.get('/api/tables', async (req, res) => {
  try {
    const tables = await db.all("SELECT name FROM sqlite_master WHERE type='table'");
    const tableDetails = await Promise.all(tables.map(async (table) => {
      const columns = await db.all(`PRAGMA table_info(${table.name})`);
      return { name: table.name, columns };
    }));
    res.status(200).json({ tables: tableDetails });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch tables' });
  }
});

app.post('/api/tables', async (req, res) => {
  const { name, columns } = req.body;
  
  try {
    const columnDefinitions = columns.map(col => 
      `${col.name} ${col.dataType.toUpperCase()}${col.dataType === 'varchar' ? '(255)' : ''}`
    ).join(', ');

    const foreignKeyDefinitions = columns
      .filter(col => col.foreignKey)
      .map(col => {
        const [referencesTable, referencesColumn] = col.foreignKey.split('.');
        return `FOREIGN KEY (${col.name}) REFERENCES ${referencesTable}(${referencesColumn})`;
      })
      .join(', ');

    const tableDefinition = [columnDefinitions, foreignKeyDefinitions].filter(Boolean).join(', ');

    await db.run(`CREATE TABLE ${name} (${tableDefinition})`);
    
    res.status(201).json({ message: 'Table created successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create table' });
  }
});

app.delete('/api/tables/:name', async (req, res) => {
  const { name } = req.params;
  
  try {
    console.log(`Attempting to delete table: ${name}`);
    await db.run(`DROP TABLE IF EXISTS ${name}`);
    res.status(200).json({ message: 'Table deleted successfully' });
  } catch (error) {
    console.error('Error deleting table:', error);
    res.status(500).json({ error: 'Failed to delete table', details: error.message });
  }
});

app.post('/api/generate-data', async (req, res) => {
  try {
    const tables = await db.all("SELECT name FROM sqlite_master WHERE type='table'");
    
    for (const table of tables) {
      const columns = await db.all(`PRAGMA table_info(${table.name})`);
      const columnDefs = columns.map(col => ({
        name: col.name,
        dataType: col.type.split('(')[0].toLowerCase()
      }));
      
      await generateRandomData(table.name, columnDefs);
    }
    
    res.status(200).json({ message: 'Random data generated for all tables.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to generate data for all tables.' });
  }
});

app.post('/api/execute-query', async (req, res) => {
  const { query } = req.body;

  try {
    const forbiddenKeywords = ['DROP', 'DELETE', 'ALTER', 'TRUNCATE', 'ATTACH', 'DETACH'];
    const upperQuery = query.toUpperCase();
    for (const keyword of forbiddenKeywords) {
      if (upperQuery.includes(keyword)) {
        return res.status(400).json({ error: `Forbidden keyword detected: ${keyword}` });
      }
    }

    const results = await db.all(query);
    res.status(200).json({ results });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to execute query.' });
  }
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

async function generateRandomData(tableName, columns) {
  const numRows = 10;

  for (let i = 0; i < numRows; i++) {
    const values = columns.map(col => generateRandomValue(col.dataType));
    const placeholders = columns.map(() => '?').join(', ');
    const columnNames = columns.map(col => col.name).join(', ');
    
    await db.run(
      `INSERT INTO ${tableName} (${columnNames}) VALUES (${placeholders})`,
      values
    );
  }
}

function generateRandomValue(dataType) {
  switch(dataType.toLowerCase()) {
    case 'varchar':
      return Math.random().toString(36).substring(2, 15);
    case 'integer':
      return Math.floor(Math.random() * 1000);
    case 'date':
      const start = new Date(2000, 0, 1);
      const end = new Date();
      const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
      return date.toISOString().split('T')[0];
    default:
      return null;
  }
}
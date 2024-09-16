import React, { useState } from 'react';
import axios from 'axios';

function SQLPlayground() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);

  const executeQuery = async (e) => {
    e.preventDefault();
    setError(null);
    setResults([]);

    try {
      const response = await axios.post('http://localhost:3002/api/execute-query', { query });
      setResults(response.data.results);
    } catch (err) {
      console.error('Failed to execute query:', err);
      setError(err.response?.data?.error || 'Failed to execute query.');
    }
  };

  return (
    <div style={{ marginTop: '20px' }}>
      <h2>SQL Playground</h2>
      <form onSubmit={executeQuery}>
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter your SQL query here..."
          rows="5"
          cols="60"
          required
        />
        <br />
        <button type="submit">Execute Query</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {results.length > 0 && (
        <div>
          <h3>Results:</h3>
          <table border="1">
            <thead>
              <tr>
                {Object.keys(results[0]).map((header) => (
                  <th key={header}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {results.map((row, idx) => (
                <tr key={idx}>
                  {Object.values(row).map((value, i) => (
                    <td key={i}>{value !== null ? value.toString() : 'NULL'}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default SQLPlayground;
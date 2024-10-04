// src/components/QueryInstructions.tsx
import { useState } from 'react';
import axios from 'axios';

const QueryInstructions = () => {
  const [discriminatorId, setDiscriminatorId] = useState('');
  const [instructions, setInstructions] = useState<string[]>([]);

  const handleQuery = async () => {
    try {
      const response = await axios.get(`http://127.0.0.1:8080/query_instructions/${discriminatorId}`);
      setInstructions(response.data);
    } catch (error) {
      console.error('Error querying instructions:', error);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <input
        type="text"
        placeholder="Discriminator ID"
        value={discriminatorId}
        onChange={(e) => setDiscriminatorId(e.target.value)}
        className="border p-2 w-full"
      />
      <button onClick={handleQuery} className="bg-blue-500 text-white px-4 py-2 rounded mt-4">
        Query Instructions
      </button>
      <ul className="mt-4">
        {instructions.map((instruction, index) => (
          <li key={index} className="border-b p-2">{instruction}</li>
        ))}
      </ul>
    </div>
  );
};

export default QueryInstructions;

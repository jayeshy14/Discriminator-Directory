import { useState } from 'react';
import axios from 'axios';

interface Discriminator {
  value: string;
  instruction: string;
  user_id: string;
}

const QueryDiscriminators = () => {
  const [programId, setProgramId] = useState('');
  const [discriminators, setDiscriminators] = useState<Discriminator[]>([]);

  const handleQuery = async () => {
    try {
      const response = await axios.get(`http://127.0.0.1:8080/query_discriminators/${programId}`);
      setDiscriminators(response.data);
    } catch (error) {
      console.error('Error querying discriminators:', error);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <input
        type="text"
        placeholder="Program ID"
        value={programId}
        onChange={(e) => setProgramId(e.target.value)}
        className="border p-2 w-full"
      />
      <button onClick={handleQuery} className="bg-blue-500 text-white px-4 py-2 rounded mt-4">
        Query Discriminators
      </button>

      {discriminators.length > 0 ? (
        <ul className="mt-4">
          {discriminators.map((disc, index) => (
            <li key={index} className="border-b p-2">
              <p><strong>Discriminator Value:</strong> {disc.value}</p>
              <p><strong>Instruction:</strong> {disc.instruction}</p>
              <p><strong>User ID:</strong> {disc.user_id}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p>No discriminators found</p>
      )}
    </div>
  );
};

export default QueryDiscriminators;

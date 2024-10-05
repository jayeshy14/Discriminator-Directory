import { useState } from 'react';
import axios from 'axios';

const QueryInstructions = () => {
  const [discriminatorId, setDiscriminatorId] = useState('');
  const [instructions, setInstructions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleQuery = async () => {
    setLoading(true);
    setError(null); // Reset any previous errors
    setInstructions([]); // Clear previous instructions

    try {
      const response = await axios.get(`http://127.0.0.1:8080/query_instructions/${discriminatorId}`);
      setInstructions(response.data);
    } catch (err) {
      console.error('Error querying instructions:', err);
      setError('Failed to fetch instructions. Please check the Discriminator ID or try again later.');
    } finally {
      setLoading(false);
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
      <button 
        onClick={handleQuery} 
        className="bg-blue-500 text-white px-4 py-2 rounded mt-4"
        disabled={loading} // Disable button while loading
      >
        {loading ? 'Loading...' : 'Query Instructions'}
      </button>
      {error && <p className="text-red-500 mt-2">{error}</p>} {/* Display error message */}
      <ul className="mt-4">
        {instructions.length > 0 ? (
          instructions.map((instruction, index) => (
            <li key={index} className="border-b p-2">{instruction}</li>
          ))
        ) : (
          <li className="p-2 text-gray-500">No instructions found.</li>
        )}
      </ul>
    </div>
  );
};

export default QueryInstructions;

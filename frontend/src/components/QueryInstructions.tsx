import { useState, useEffect } from 'react';
import ExplanationCard from './common/ExplanationCard';
import InstructionDataView from './common/InstructionDataView';
import { queryInstructionsByDiscriminatorId, Instruction } from '../api';

// Sample data for fallback/testing
const sampleInstructions: Instruction[] = [
  {
    id: '1',
    instruction_id: 'transfer',
    instruction_data: [0x04, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]
  },
  {
    id: '2',
    instruction_id: 'createAccount',
    instruction_data: [0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x02, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]
  }
];

const QueryInstructions = () => {
  const [discriminatorId, setDiscriminatorId] = useState('');
  const [instructions, setInstructions] = useState<Instruction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [backendConnected, setBackendConnected] = useState(true); // Default to true, will check during query

  const handleQuery = async () => {
    if (!discriminatorId.trim()) {
      setError('Please enter a discriminator ID');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Make the actual API call to the backend
      const data = await queryInstructionsByDiscriminatorId(discriminatorId);
      setInstructions(data);
      setBackendConnected(true);
    } catch (err: any) {
      console.error('Error querying instructions:', err);
      
      // Handle specific error scenarios
      if (err.code === 'ECONNREFUSED' || err.code === 'ERR_NETWORK') {
        setError('Cannot connect to backend server. Please ensure it is running at http://localhost:8080');
        setBackendConnected(false);
        
        // Fall back to sample data for demo purposes
        setInstructions(sampleInstructions);
      } else {
        setError(err.response?.data || 'Failed to fetch instructions');
        setInstructions([]);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-gray-900 rounded-lg shadow-md p-6 mb-6 border border-gray-700">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
          <svg className="h-6 w-6 mr-2 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Query Instructions by Discriminator ID
        </h2>
        
        <ExplanationCard 
          title="What are Instructions?"
          description="Instructions are the actual data formats used when calling a specific function in a Solana program. A discriminator maps to a particular instruction, and the instruction defines the exact data structure expected by the program."
          hint="Use this tool to find the instruction format for a specific discriminator. This helps you understand how to correctly call a program's function."
        />
        
        {!backendConnected && (
          <div className="bg-yellow-900/30 border-l-4 border-yellow-500 text-yellow-300 p-4 mb-6 rounded-md" role="alert">
            <p className="font-medium mb-1">Backend Connection Issue</p>
            <p className="text-sm">Cannot connect to the backend server. Showing sample data for demonstration purposes.</p>
          </div>
        )}
        
        <div className="mb-6">
          <div className="flex flex-col md:flex-row">
            <input
              type="text"
              placeholder="Enter Discriminator ID (hex format)"
              value={discriminatorId}
              onChange={(e) => setDiscriminatorId(e.target.value)}
              className="border border-gray-600 bg-gray-800 text-white p-3 flex-grow rounded-l-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none"
            />
            <button 
              onClick={handleQuery} 
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-6 rounded-r-md transition duration-200 ease-in-out shadow-sm disabled:bg-indigo-800 disabled:cursor-not-allowed mt-2 md:mt-0"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Loading...
                </span>
              ) : 'Search'}
            </button>
          </div>
          <p className="text-sm text-gray-400 mt-2">
            Example: ffb004f5bcfd7c19
          </p>
        </div>

        {error && (
          <div className="bg-red-900/30 border-l-4 border-red-500 text-red-300 p-4 mb-6 rounded-md" role="alert">
            <p className="font-medium">Error</p>
            <p>{error}</p>
          </div>
        )}

        {instructions.length > 0 ? (
          <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-900">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Instruction ID</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Instruction Data</th>
                  </tr>
                </thead>
                <tbody className="bg-gray-800 divide-y divide-gray-700">
                  {instructions.map((instruction, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-900'}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-400">{instruction.instruction_id}</td>
                      <td className="px-6 py-4">
                        <InstructionDataView data={instruction.instruction_data} showInterpretation={true} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          !loading && !error && (
            <div className="text-center py-10 bg-gray-800 rounded-lg border border-gray-700">
              <svg className="h-12 w-12 text-gray-600 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-gray-400">Enter a discriminator ID and click Search</p>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default QueryInstructions;
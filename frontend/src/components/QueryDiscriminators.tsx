import { useState, useEffect } from 'react';
import ExplanationCard from './common/ExplanationCard';
import InstructionDataView from './common/InstructionDataView';
import Modal from './common/Modal';
import DiscriminatorDetail from './common/DiscriminatorDetail';

interface Discriminator {
  id: string;
  discriminator_id: string;
  discriminator_data: number[];
  program_id: string;
  user_id: string;
  instruction: {
    id: string;
    instruction_id: string;
    instruction_data: number[];
  } | null;
}

// Sample data for demonstration
const sampleDiscriminators: Discriminator[] = [
  {
    id: '1',
    discriminator_id: 'ffb004f5bcfd7c19',
    discriminator_data: [0xff, 0xb0, 0x04, 0xf5, 0xbc, 0xfd, 0x7c, 0x19],
    program_id: 'D7FhCedCHHkQeA7TRYdShUSP9f5QVpvmxtcZqje9BHy5',
    user_id: 'E4BuDM3TmKqs6du8uhyCiRmWUk6ozTAHCrkeidzb1ps',
    instruction: {
      id: '1',
      instruction_id: 'instr1',
      instruction_data: [0x04, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]
    }
  },
  {
    id: '2',
    discriminator_id: 'c04d39ca3cf20dc6',
    discriminator_data: [0xc0, 0x4d, 0x39, 0xca, 0x3c, 0xf2, 0x0d, 0xc6],
    program_id: 'D7FhCedCHHkQeA7TRYdShUSP9f5QVpvmxtcZqje9BHy5',
    user_id: 'E4BuDM3TmKqs6du8uhyCiRmWUk6ozTAHCrkeidzb1ps',
    instruction: null
  }
];

const QueryDiscriminators = () => {
  const [programId, setProgramId] = useState('D7FhCedCHHkQeA7TRYdShUSP9f5QVpvmxtcZqje9BHy5');
  const [discriminators, setDiscriminators] = useState<Discriminator[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDiscriminator, setSelectedDiscriminator] = useState<Discriminator | null>(null);

  // Pre-populate with sample data for demonstration
  useEffect(() => {
    setDiscriminators(sampleDiscriminators);
  }, []);

  const handleQuery = async () => {
    if (!programId.trim()) {
      setError('Please enter a program ID');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // For demonstration, always return sample data
      // In a real app, this would fetch from the server:
      // const response = await axios.get<Discriminator[]>(`http://localhost:8080/query_discriminators/${programId}`);
      // setDiscriminators(response.data);
      
      setTimeout(() => {
        setDiscriminators(sampleDiscriminators);
        setLoading(false);
      }, 500);
    } catch (err: any) {
      console.error('Error querying discriminators:', err);
      setError(err.response?.data || 'Failed to fetch discriminators');
      setDiscriminators([]);
      setLoading(false);
    }
  };
  
  const handleRowClick = (discriminator: Discriminator) => {
    setSelectedDiscriminator(discriminator);
    setIsModalOpen(true);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-gray-900 rounded-lg shadow-md p-6 mb-6 border border-gray-700">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
          <svg className="h-6 w-6 mr-2 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
          Query Discriminators by Program ID
        </h2>
        
        <ExplanationCard 
          title="What are Discriminators?"
          description="Discriminators are unique identifiers (typically 8 bytes) that help identify specific instructions within Solana programs. They enable developers to interact with deployed smart contracts by determining which instruction is being called."
          hint="Use this tool to search for known discriminators for a specific program ID. This helps when working with undocumented programs."
        />
        
        <div className="mb-6">
          <div className="flex flex-col md:flex-row">
            <input
              type="text"
              placeholder="Enter Program ID"
              value={programId}
              onChange={(e) => setProgramId(e.target.value)}
              className="border border-gray-600 bg-gray-800 text-white p-3 flex-grow rounded-l-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
            />
            <button 
              onClick={handleQuery} 
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-r-md transition duration-200 ease-in-out shadow-sm disabled:bg-blue-800 disabled:cursor-not-allowed mt-2 md:mt-0"
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
            Enter a Solana program ID to find related discriminators
          </p>
        </div>

        {error && (
          <div className="bg-red-900/30 border-l-4 border-red-500 text-red-300 p-4 mb-6 rounded-md" role="alert">
            <p className="font-medium">Error</p>
            <p>{error}</p>
          </div>
        )}

        {discriminators.length > 0 ? (
          <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-900">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      <span className="flex items-center">
                        Discriminator ID
                        <span className="ml-1 text-gray-500 cursor-help" title="A unique identifier for this discriminator, usually in hex format">
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </span>
                      </span>
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      <span className="flex items-center">
                        Discriminator Data
                        <span className="ml-1 text-gray-500 cursor-help" title="The raw byte array (typically 8 bytes) that uniquely identifies the program instruction">
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </span>
                      </span>
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Program ID</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Contributor</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      <span className="flex items-center">
                        Instruction
                        <span className="ml-1 text-gray-500 cursor-help" title="Whether this discriminator has an associated instruction mapping">
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </span>
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-gray-800 divide-y divide-gray-700">
                  {discriminators.map((disc, index) => (
                    <tr 
                      key={index} 
                      className={`${index % 2 === 0 ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-900 hover:bg-gray-700'} cursor-pointer`}
                      onClick={() => handleRowClick(disc)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-400">{disc.discriminator_id}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <InstructionDataView data={disc.discriminator_data} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{disc.program_id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{disc.user_id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {disc.instruction ? (
                          <span className="bg-green-900/50 text-green-300 py-1 px-2 rounded-full text-xs font-medium cursor-pointer hover:bg-green-800/50" title="Click to view instruction details">Available</span>
                        ) : (
                          <span className="bg-gray-700 text-gray-300 py-1 px-2 rounded-full text-xs font-medium">None</span>
                        )}
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              <p className="text-gray-400">Enter a program ID and click Search</p>
            </div>
          )
        )}
      </div>
      
      {/* Detail Modal */}
      {selectedDiscriminator && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Discriminator Details"
        >
          <DiscriminatorDetail discriminator={selectedDiscriminator} />
        </Modal>
      )}
    </div>
  );
};

export default QueryDiscriminators;
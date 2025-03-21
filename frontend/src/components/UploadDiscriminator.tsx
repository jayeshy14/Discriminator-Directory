// src/components/UploadDiscriminator.tsx
import { useState } from 'react';
import ExplanationCard from './common/ExplanationCard';
import { uploadDiscriminator } from '../api';

const UploadDiscriminator = () => {
  const [programId, setProgramId] = useState('');
  const [discriminatorData, setDiscriminatorData] = useState('');
  const [instructionData, setInstructionData] = useState('');
  const [instructionName, setInstructionName] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Function to parse hex string into byte array
  const parseHexString = (hexString: string): number[] => {
    // Remove "0x" prefix if present
    const cleanedHex = hexString.startsWith('0x') ? hexString.substring(2) : hexString;
    
    // Ensure even number of characters
    const paddedHex = cleanedHex.length % 2 === 0 ? cleanedHex : '0' + cleanedHex;
    
    // Convert to byte array
    const result: number[] = [];
    for (let i = 0; i < paddedHex.length; i += 2) {
      result.push(parseInt(paddedHex.substring(i, i + 2), 16));
    }
    
    return result;
  };

  // Validate that input is a valid hex string
  const validateHexData = (input: string): boolean => {
    // Remove "0x" prefix if present
    const hexData = input.startsWith('0x') ? input.substring(2) : input;
    return /^[0-9a-fA-F]*$/.test(hexData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset status
    setSuccess(null);
    setError(null);
    
    // Validate inputs
    if (!programId.trim()) {
      setError('Program ID is required');
      return;
    }
    
    if (!discriminatorData.trim()) {
      setError('Discriminator data is required');
      return;
    }
    
    if (!validateHexData(discriminatorData)) {
      setError('Discriminator data must be a valid hexadecimal string');
      return;
    }
    
    if (instructionData && !validateHexData(instructionData)) {
      setError('Instruction data must be a valid hexadecimal string');
      return;
    }
    
    const discriminatorBytes = parseHexString(discriminatorData);
    if (discriminatorBytes.length !== 8) {
      setError('Discriminator data must be exactly 8 bytes (16 hex characters)');
      return;
    }
    
    setLoading(true);
    
    try {
      // Prepare data for API
      const uploadData = {
        program_id: programId,
        discriminator_data: discriminatorBytes,
        instruction_data: instructionData ? parseHexString(instructionData) : null,
        instruction_id: instructionName || null
      };
      
      // Call the real API
      await uploadDiscriminator(uploadData);
      
      // Clear form on success
      setProgramId('');
      setDiscriminatorData('');
      setInstructionData('');
      setInstructionName('');
      
      setSuccess('Discriminator successfully uploaded!');
    } catch (err: any) {
      console.error('Error uploading discriminator:', err);
      if (err.code === 'ECONNREFUSED' || err.code === 'ERR_NETWORK') {
        setError('Cannot connect to backend server. Please ensure it is running at http://localhost:8080');
      } else {
        setError(err.response?.data || 'Failed to upload discriminator');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-gray-900 rounded-lg shadow-md p-6 mb-6 border border-gray-700">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
          <svg className="h-6 w-6 mr-2 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          Upload Discriminator
        </h2>
        
        <ExplanationCard 
          title="What is this form for?"
          description="This form allows you to upload a newly discovered discriminator and its corresponding instruction format to the directory. Your contribution helps other developers better understand and work with Solana programs."
          hint="If you've reverse-engineered a program and want to share your findings, add the discriminator and optional instruction format here."
        />
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="programId" className="block text-sm font-medium text-gray-300 mb-1">
              Program ID <span className="text-red-500">*</span>
            </label>
            <input
              id="programId"
              type="text"
              value={programId}
              onChange={(e) => setProgramId(e.target.value)}
              placeholder="Solana program ID (base58 encoded)"
              className="border border-gray-600 bg-gray-800 text-white p-3 w-full rounded-md shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none"
              required
            />
            <p className="text-sm text-gray-400 mt-1">
              Example: MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr
            </p>
          </div>
          
          <div>
            <label htmlFor="discriminatorData" className="block text-sm font-medium text-gray-300 mb-1">
              Discriminator Data (hex) <span className="text-red-500">*</span>
            </label>
            <input
              id="discriminatorData"
              type="text"
              value={discriminatorData}
              onChange={(e) => setDiscriminatorData(e.target.value)}
              placeholder="8-byte discriminator in hex format"
              className="border border-gray-600 bg-gray-800 text-white p-3 w-full rounded-md shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none"
              required
            />
            <p className="text-sm text-gray-400 mt-1">
              Example: 5a11bd35 or 0x5a11bd35
            </p>
          </div>
          
          <div className="border-t border-gray-700 pt-6">
            <h3 className="text-lg font-medium text-gray-200 mb-4">Optional Instruction Information</h3>
            <p className="text-sm text-gray-400 mb-4">
              If you know the instruction format for this discriminator, please provide it below.
            </p>
            
            <div className="mb-4">
              <label htmlFor="instructionName" className="block text-sm font-medium text-gray-300 mb-1">
                Instruction Name
              </label>
              <input
                id="instructionName"
                type="text"
                value={instructionName}
                onChange={(e) => setInstructionName(e.target.value)}
                placeholder="Name of the instruction (e.g. 'transfer', 'createAccount')"
                className="border border-gray-600 bg-gray-800 text-white p-3 w-full rounded-md shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none"
              />
            </div>
            
            <div>
              <label htmlFor="instructionData" className="block text-sm font-medium text-gray-300 mb-1">
                Instruction Data Format (hex)
              </label>
              <textarea
                id="instructionData"
                value={instructionData}
                onChange={(e) => setInstructionData(e.target.value)}
                placeholder="Hex data representing the instruction data format (e.g. 'u32 amount' would be '04000000')"
                rows={4}
                className="border border-gray-600 bg-gray-800 text-white p-3 w-full rounded-md shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none"
              ></textarea>
              <p className="text-sm text-gray-400 mt-1">
                Example format: 04000000 for a u32, 0100000000000000 for a u64, etc.
              </p>
            </div>
          </div>
          
          {success && (
            <div className="bg-green-900/30 border-l-4 border-green-500 text-green-300 p-4 rounded-md" role="alert">
              <p className="font-medium">Success!</p>
              <p>{success}</p>
            </div>
          )}
          
          {error && (
            <div className="bg-red-900/30 border-l-4 border-red-500 text-red-300 p-4 rounded-md" role="alert">
              <p className="font-medium">Error</p>
              <p>{error}</p>
            </div>
          )}
          
          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:bg-purple-800 disabled:cursor-not-allowed transition-colors duration-200"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Uploading...
                </span>
              ) : 'Upload Discriminator'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadDiscriminator;
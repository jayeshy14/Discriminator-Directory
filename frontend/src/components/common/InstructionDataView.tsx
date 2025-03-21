import React from 'react';

interface InstructionDataViewProps {
  data: number[];
  showInterpretation?: boolean;
}

/**
 * Component for displaying instruction data bytes with optional interpretation
 */
const InstructionDataView: React.FC<InstructionDataViewProps> = ({ 
  data, 
  showInterpretation = true 
}) => {
  // Attempts to interpret what the data might represent
  const interpretData = (bytes: number[]): string => {
    if (bytes.length === 0) return 'Empty data';
    
    if (bytes.length === 8) {
      return 'Likely a discriminator (8 bytes)';
    }
    
    if (bytes.length === 32) {
      return 'Likely a public key/address (32 bytes)';
    }
    
    // Check if it could be a simple integer
    if (bytes.length <= 8) {
      // Common pattern: first byte is a command/variant index followed by parameters
      const firstByte = bytes[0];
      if (bytes.length > 1 && firstByte < 10) {
        return `Possible command/variant index: ${firstByte}`;
      }
    }
    
    return `${bytes.length} bytes of data`;
  };
  
  // Format bytes as hex
  const hexBytes = data.map(b => b.toString(16).padStart(2, '0')).join(' ');
  
  return (
    <div className="font-mono text-xs">
      <div className="text-gray-300 bg-gray-900/50 p-2 rounded overflow-x-auto">
        {hexBytes || '(No data)'}
      </div>
      
      {showInterpretation && data.length > 0 && (
        <div className="mt-1 text-gray-400 text-xs flex items-center">
          <svg className="h-3 w-3 mr-1 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {interpretData(data)}
        </div>
      )}
    </div>
  );
};

export default InstructionDataView;
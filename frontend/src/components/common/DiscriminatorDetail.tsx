import React from 'react';
import InstructionDataView from './InstructionDataView';

interface Instruction {
  id: string;
  instruction_id: string;
  instruction_data: number[];
}

interface Discriminator {
  id: string;
  discriminator_id: string;
  discriminator_data: number[];
  program_id: string;
  user_id: string;
  instruction: Instruction | null;
}

interface DiscriminatorDetailProps {
  discriminator: Discriminator;
}

const DiscriminatorDetail: React.FC<DiscriminatorDetailProps> = ({ discriminator }) => {
  return (
    <div className="text-gray-300">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-medium text-white mb-4">Discriminator Information</h3>
          
          <div className="space-y-4">
            <div>
              <div className="text-sm text-gray-400 mb-1">Discriminator ID</div>
              <div className="font-mono bg-gray-900 p-2 rounded">{discriminator.discriminator_id}</div>
            </div>
            
            <div>
              <div className="text-sm text-gray-400 mb-1">Raw Bytes</div>
              <InstructionDataView data={discriminator.discriminator_data} />
            </div>
            
            <div>
              <div className="text-sm text-gray-400 mb-1">Program ID</div>
              <div className="font-mono text-sm bg-gray-900 p-2 rounded break-all">{discriminator.program_id}</div>
            </div>
            
            <div>
              <div className="text-sm text-gray-400 mb-1">Contributed By</div>
              <div className="font-mono text-sm bg-gray-900 p-2 rounded break-all">{discriminator.user_id}</div>
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-medium text-white mb-4">Associated Instruction</h3>
          
          {discriminator.instruction ? (
            <div className="space-y-4">
              <div>
                <div className="text-sm text-gray-400 mb-1">Instruction ID</div>
                <div className="font-mono bg-gray-900 p-2 rounded">{discriminator.instruction.instruction_id}</div>
              </div>
              
              <div>
                <div className="text-sm text-gray-400 mb-1">Instruction Data</div>
                <InstructionDataView data={discriminator.instruction.instruction_data} />
              </div>
              
              <div className="bg-blue-900/30 border-l-4 border-blue-500 p-4 rounded-md text-sm">
                <p className="mb-2 text-blue-300 font-medium">How to use this discriminator:</p>
                <code className="block bg-gray-900 p-3 rounded font-mono text-xs overflow-x-auto">
                  {`// Example Solana transaction with this discriminator
const transaction = new Transaction();
transaction.add({
  keys: [/* account keys go here */],
  programId: new PublicKey("${discriminator.program_id}"),
  data: Buffer.from([${discriminator.discriminator_data.map(b => '0x' + b.toString(16).padStart(2, '0')).join(', ')}, /* additional data */])
});`}
                </code>
              </div>
            </div>
          ) : (
            <div className="bg-gray-900 rounded-lg p-4 text-center">
              <svg className="h-12 w-12 text-gray-700 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="text-gray-500">No instruction data is associated with this discriminator yet.</p>
              <button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 px-4 rounded-md">
                + Add Instruction Data
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DiscriminatorDetail;
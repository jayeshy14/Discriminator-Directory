// src/components/UploadDiscriminator.tsx
import { useState } from 'react';
import axios from 'axios';

const UploadDiscriminator = () => {
  const [programId, setProgramId] = useState('');
  const [discriminator, setDiscriminator] = useState('');
  const [instruction, setInstruction] = useState('');
  const [userId, setUserId] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`http://127.0.0.1:8080/upload_discriminator/${programId}`, {
        discriminator,
        instruction,
        user_id: userId,
      });
      alert('Discriminator uploaded successfully!');
    } catch (error) {
      console.error('Error uploading discriminator:', error);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Program ID"
          value={programId}
          onChange={(e) => setProgramId(e.target.value)}
          className="border p-2 w-full"
        />
        <input
          type="text"
          placeholder="Discriminator"
          value={discriminator}
          onChange={(e) => setDiscriminator(e.target.value)}
          className="border p-2 w-full"
        />
        <input
          type="text"
          placeholder="Instruction"
          value={instruction}
          onChange={(e) => setInstruction(e.target.value)}
          className="border p-2 w-full"
        />
        <input
          type="text"
          placeholder="User ID"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          className="border p-2 w-full"
        />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          Upload Discriminator
        </button>
      </form>
    </div>
  );
};

export default UploadDiscriminator;

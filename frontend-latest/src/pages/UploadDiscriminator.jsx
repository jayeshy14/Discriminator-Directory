import axios from 'axios'
import React, { useState } from 'react'


function UploadDiscriminator() {
  const [programId, setProgramId] = useState('');
  const [discriminator, setDiscriminator] = useState('');
  const [instruction, setInstruction] = useState('');
  const [userId, setUserId] = useState('');

  const handleSubmit = async (e) => {
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
    <div className='h-screen pt-24 overflow-auto'>
      <div className="container-fluid mt-5 text-left">
        <div className="content mx-auto">
          <form class="max-w-sm mx-auto" onSubmit={handleSubmit}>
            <div class="mb-4">

              <label for="program_id" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Program ID</label>
              <input onChange={(e) => setProgramId(e.target.value)} type="text" id="program_id" name='program_id' class="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light" placeholder="WjdS7xaSuHY41Y6Lqz6PLY15pKFSJVApEVE2gKCn1cU" required />

              <label for="discriminator" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white mt-4">Discriminator</label>
              <input onChange={(e) => setDiscriminator(e.target.value)} type="text" id="discriminator" name='discriminator' class="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light" placeholder="Discriminator" required />

              <label for="instruction" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white mt-4">Instruction</label>
              <input onChange={(e) => setInstruction(e.target.value)} type="text" id="instruction" name='instruction' class="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light" placeholder="Instruction" required />

              <label for="user_id" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white mt-4">User ID</label>
              <input onChange={(e) => setProgramId(e.target.value)} type="text" id="user_id" name='user_id' class="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light" placeholder="User ID" required />


            </div>
            <div className='text-center'>
              <button type='submit' className="bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl text-white px-4 py-2 rounded mt-2 focus:ring-4 focus:outline-none focus:ring-blue-300">
                Upload Discriminator
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default UploadDiscriminator

import axios from 'axios';
import React, { useState } from 'react'

function QueryInstructions() {
    const [discriminatorId, setDiscriminatorId] = useState('');
    const [instructions, setInstructions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);


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
        <div className='h-screen pt-24 overflow-auto'>
            <div className="container-fluid mt-5 text-left">
                <div className="content mx-auto">
                    <form class="max-w-sm mx-auto">
                        <div class="mb-4">
                            <label for="program_id" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Discriminator ID</label>
                            <input onChange={(e) => setDiscriminatorId(e.target.value)} type="text" id="program_id" name='program_id' class="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light" value={discriminatorId} placeholder='Discriminator ID' required />
                        </div>
                        <div className='text-center'>
                            <button onClick={handleQuery} className="bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl text-white px-4 py-2 rounded mt-2 focus:ring-4 focus:outline-none focus:ring-blue-300">
                                Query Instructions
                            </button>
                        </div>
                    </form>
                    <div className="mt-4 w-3/4 mx-auto">
                        {instructions.length > 0 ? (
                            <ul>
                                {instructions.map((instr, index) => (
                                    <li key={index} className="border-b p-2 text-white">{instr}</li>
                                ))}
                            </ul>
                        ) : (
                            <p className="mt-4 text-white">No instructions found</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default QueryInstructions

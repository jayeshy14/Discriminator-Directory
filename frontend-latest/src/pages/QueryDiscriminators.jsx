import React, { useState } from 'react'
import axios from 'axios'


function QueryDiscriminators() {
    const [programId, setProgramId] = useState('');
    const [discriminators, setDiscriminators] = useState([]);

    const handleQuery = async () => {
        try {
            const response = await axios.get(`http://127.0.0.1:8080/query_discriminators/${programId}`);
            setDiscriminators(response.data);
        } catch (error) {
            console.error('Error querying discriminators:', error);
        }
    };

    return (
        <div className='h-screen pt-24 overflow-auto'>
            <div className="container-fluid mt-5 text-left">
                <div className="content mx-auto">
                    <form class="max-w-sm mx-auto">
                        <div class="mb-4">
                            <label for="program_id" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Program ID</label>
                            <input onChange={(e) => setProgramId(e.target.value)} type="text" id="program_id" name='program_id' class="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light" placeholder="WjdS7xaSuHY41Y6Lqz6PLY15pKFSJVApEVE2gKCn1cU" required value={programId}/>
                        </div>
                        <div className='text-center'>
                            <button onClick={handleQuery()} className="bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl text-white px-4 py-2 rounded mt-2 focus:ring-4 focus:outline-none focus:ring-blue-300">
                                Query Discriminators
                            </button>
                        </div>
                    </form>
                    <div className="mt-4 w-3/4 mx-auto">
                        {discriminators.length > 0 ? (
                            <ul>
                                {discriminators.map((disc, index) => (
                                    <li key={index} className="border-b p-2 text-white">
                                        <p><strong>Discriminator Value:</strong> {disc.value}</p>
                                        <p><strong>Instruction:</strong> {disc.instruction}</p>
                                        <p><strong>User ID:</strong> {disc.user_id}</p>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="mt-4 text-white">No discriminators found</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default QueryDiscriminators

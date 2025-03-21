import { Link, useLocation } from 'react-router-dom';

const NavBar = () => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path || 
           (location.pathname === '/' && path === '/query-discriminators');
  };

  return (
    <nav className="bg-gradient-to-r from-gray-900 to-gray-800 shadow-lg border-b border-gray-700">
      <div className="container mx-auto px-4 py-3">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <Link to="/" className="text-white font-bold text-xl flex items-center mb-4 md:mb-0 group">
            <div className="bg-blue-900 p-2 rounded-md shadow-md mr-3 group-hover:shadow-lg transition-all duration-200 border border-blue-700">
              <svg className="h-6 w-6 text-blue-300" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <span className="block text-xl font-extrabold tracking-tight">Discriminator Directory</span>
              <span className="text-xs text-gray-400 opacity-75 mt-0">Solana Program Discriminator Management</span>
            </div>
          </Link>
          
          <div className="flex flex-row md:bg-gray-700/30 md:rounded-lg md:p-1 space-x-1">
            <Link 
              to="/upload" 
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center ${
                isActive('/upload') 
                  ? 'bg-blue-900 text-white shadow-md' 
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <svg className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Upload
            </Link>
            
            <Link 
              to="/query-discriminators" 
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center ${
                isActive('/query-discriminators') 
                  ? 'bg-blue-900 text-white shadow-md' 
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <svg className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              Query Discriminators
            </Link>
            
            <Link 
              to="/query-instructions" 
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center ${
                isActive('/query-instructions') 
                  ? 'bg-blue-900 text-white shadow-md' 
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <svg className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Query Instructions
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
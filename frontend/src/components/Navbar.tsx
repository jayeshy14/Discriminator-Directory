// src/components/NavBar.tsx
import { Link } from 'react-router-dom';

const NavBar = () => {
  return (
    <nav className="bg-blue-500 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-white font-bold text-xl">Discriminator Directory</h1>
        <ul className="flex space-x-4">
          <li>
            <Link to="/upload" className="text-white hover:underline">
              Upload Discriminator
            </Link>
          </li>
          <li>
            <Link to="/query-discriminators" className="text-white hover:underline">
              Query Discriminators
            </Link>
          </li>
          <li>
            <Link to="/query-instructions" className="text-white hover:underline">
              Query Instructions
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default NavBar;

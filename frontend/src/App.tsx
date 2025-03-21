// src/App.tsx
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import UploadDiscriminator from './components/UploadDiscriminator';
import QueryDiscriminators from './components/QueryDiscriminators';
import QueryInstructions from './components/QueryInstructions';
import NavBar from './components/Navbar';

const App = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gray-900">
        <NavBar />
        <main className="container mx-auto py-6 px-4">
          <Routes>
            <Route path="/" element={<QueryDiscriminators />} />
            <Route path="/upload" element={<UploadDiscriminator />} />
            <Route path="/query-discriminators" element={<QueryDiscriminators />} />
            <Route path="/query-instructions" element={<QueryInstructions />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;

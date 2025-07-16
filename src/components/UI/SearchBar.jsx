// src/components/UI/SearchBar.jsx
const SearchBar = ({ searchTerm, setSearchTerm, darkMode }) => {
  return (
    <input
      type="text"
      placeholder="Search questions..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      className={`block w-full md:w-64 px-4 py-2 border rounded-md shadow-sm text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'border-gray-300'}`}
    />
  );
};

export default SearchBar;
// src/components/UI/CategoryFilter.jsx
const CategoryFilter = ({
  categories,
  selectedCategory,
  showCategoryMenu,
  toggleCategoryMenu,
  selectCategory,
  clearCategoryFilter,
  getCategoryName,
  darkMode
}) => {
  return (
    <div className="relative">
      <button
        onClick={toggleCategoryMenu}
        className={`flex items-center justify-between w-full md:w-48 px-4 py-2 border rounded-md shadow-sm text-sm font-medium focus:outline-none ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
      >
        {selectedCategory ? getCategoryName(selectedCategory) : 'Filter by Category'}
        <svg className="ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>
      
      {showCategoryMenu && (
        <div className={`absolute z-10 mt-1 w-full md:w-48 shadow-lg rounded-md py-1 text-base ring-1 focus:outline-none ${darkMode ? 'bg-gray-700 ring-gray-600' : 'bg-white ring-black ring-opacity-5'}`}>
          <button
            onClick={clearCategoryFilter}
            className={`block w-full text-left px-4 py-2 text-sm ${!selectedCategory ? 'bg-indigo-600 text-white' : darkMode ? 'text-gray-300 hover:bg-gray-600' : 'text-gray-700 hover:bg-gray-100'}`}
          >
            All Categories
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => selectCategory(category.id)}
              className={`block w-full text-left px-4 py-2 text-sm ${selectedCategory === category.id ? 'bg-indigo-600 text-white' : darkMode ? 'text-gray-300 hover:bg-gray-600' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              {category.category_name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryFilter;
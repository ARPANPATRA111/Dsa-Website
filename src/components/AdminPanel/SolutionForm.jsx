// src/components/AdminPanel/SolutionForm.jsx
const SolutionForm = ({ newSolution, setNewSolution }) => {
  return (
    <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200">
      <h5 className="text-sm font-medium text-gray-700 mb-2">Solution</h5>
      <div className="space-y-2">
        <div>
          <label htmlFor="language" className="block text-xs font-medium text-gray-700">
            Language
          </label>
          <select
            id="language"
            name="language"
            value={newSolution.language}
            onChange={(e) => setNewSolution({ ...newSolution, language: e.target.value })}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 sm:px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-xs"
          >
            <option value="JavaScript">JavaScript</option>
            <option value="Python">Python</option>
            <option value="Java">Java</option>
            <option value="C++">C++</option>
            <option value="C">C</option>
            <option value="TypeScript">TypeScript</option>
          </select>
        </div>
        <div>
          <label htmlFor="code" className="block text-xs font-medium text-gray-700">
            Code
          </label>
          <textarea
            id="code"
            name="code"
            rows="4"
            value={newSolution.code}
            onChange={(e) => setNewSolution({ ...newSolution, code: e.target.value })}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 sm:px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-xs font-mono"
          />
        </div>
      </div>
    </div>
  );
};

export default SolutionForm;
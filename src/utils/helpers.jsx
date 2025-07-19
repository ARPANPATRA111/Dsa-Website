// src/utils/helpers.js
import CodeHighlight from '../CodeHighlight';

export const formatCode = (code, language, darkMode = false) => {
  if (!code) return null;

  // This structure restores the background color for the code snippets on the main page.
  return (
    <div className="my-3 w-full overflow-hidden">
      <div className="relative">
        <div className={`w-full rounded-md ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
          <div className="overflow-auto max-w-full">
            <CodeHighlight 
              codeString={code} 
              language={language.toLowerCase()}
              darkMode={darkMode}
              // Explicitly tell the component to wrap the code for the in-page preview
              wrap={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export const formatDescription = (description, darkMode = false) => {
  if (!description) return null;
  return description.split('\n').map((line, index) => (
    <p key={index} className={`${darkMode ? 'text-gray-100' : 'text-gray-700'} mb-4`}>
      {line || <br />}
    </p>
  ));
};

export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString();
};

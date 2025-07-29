// src/utils/helpers.jsx
import CodeHighlight from '../CodeHighlight';

export const formatCode = (code, language, darkMode = false) => {
  if (!code) return null;

  return (
    <div className="my-3 w-full overflow-hidden">
      <div className="relative">
        <div className={`w-full rounded-md ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
          <div className="overflow-auto max-w-full">
            <CodeHighlight 
              codeString={code} 
              language={language.toLowerCase()}
              darkMode={darkMode}
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
  return (
    <p className={`${darkMode ? 'text-gray-100' : 'text-gray-700'} whitespace-pre-line`}>
      {description}
    </p>
  );
};

export const formatDate = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString();
};
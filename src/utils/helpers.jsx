// src/utils/helpers.js
import CodeHighlight from '../CodeHighlight';

export const formatCode = (code, language, darkMode = false) => {
  if (!code) return null;
  const isMobile = window.innerWidth <= 668;

  return (
    <div className="my-3 w-full overflow-hidden">
      <div className="relative">
        <div className={`w-full rounded-md p-1 ${darkMode ? 'bg-gray-900' : 'bg-gray-800'}`}>
          <div className="overflow-auto max-w-full">
            <CodeHighlight 
              codeString={code} 
              language={language.toLowerCase()}
              isMobile={isMobile}
              darkMode={darkMode}
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
    <p key={index} className={`mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
      {line || <br />}
    </p>
  ));
};

export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString();
};
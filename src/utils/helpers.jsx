// src/utils/helpers.js
import CodeHighlight from '../CodeHighlight';

export const formatCode = (code, language) => {
  if (!code) return null;
  const isMobile = window.innerWidth <= 668;

  return (
    <div className="my-3 w-full overflow-hidden">
      <div className="relative">
        <div className="w-full bg-gray-800 rounded-md p-1">
          <div className="overflow-auto max-w-full">
            <CodeHighlight 
              codeString={code} 
              language={language.toLowerCase()}
              isMobile={isMobile}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export const formatDescription = (description) => {
  if (!description) return null;
  return description.split('\n').map((line, index) => (
    <p key={index} className="mb-4">
      {line || <br />}
    </p>
  ));
};

export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString();
};
import React from 'react';
import { Highlight, themes } from 'prism-react-renderer';
import Prism from 'prismjs';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-typescript';

const CodeHighlight = ({ codeString, language = 'javascript', isMobile }) => {
  // Verify language exists, fallback to javascript
  const lang = Prism.languages[language] ? language : 'javascript';

  return (
    <Highlight
      prism={Prism}
      code={codeString}
      language={lang}
      theme={themes.vsDark}
    >
      {({ className, style, tokens, getLineProps, getTokenProps }) => {
        // Extract the key from getLineProps and getTokenProps before spreading
        const getLinePropsWithoutKey = (line, i) => {
          const { key, ...rest } = getLineProps({ line, key: i });
          return rest;
        };

        const getTokenPropsWithoutKey = (token, key) => {
          const { key: tokenKey, ...rest } = getTokenProps({ token, key });
          return rest;
        };

        return (
          <pre 
            className={className} 
            style={{
              ...style,
              padding: isMobile ? '0.5rem' : '1rem',
              fontSize: isMobile ? '0.6rem' : '0.875rem',
              borderRadius: '0.25rem',
              overflow: 'hidden',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              margin: 0
            }}
          >
            {tokens.map((line, i) => (
              <div 
                key={i} 
                {...getLinePropsWithoutKey(line, i)}
                style={{
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word'
                }}
              >
                {line.map((token, key) => (
                  <span key={key} {...getTokenPropsWithoutKey(token, key)} />
                ))}
              </div>
            ))}
          </pre>
        );
      }}
    </Highlight>
  );
};

export default CodeHighlight;
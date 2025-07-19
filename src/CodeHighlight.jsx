// src/components/CodeHighlight.jsx
import React from 'react';
import { Highlight, themes } from 'prism-react-renderer';
import Prism from 'prismjs';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-typescript';

// The component now accepts `fontSize` and `wrap` to control its behavior.
const CodeHighlight = ({ codeString, language = 'javascript', darkMode = false, fontSize: propFontSize, wrap = false }) => {
  const lang = Prism.languages[language] ? language : 'javascript';
  // Reverted to themes.vsLight for better contrast in light mode.
  const theme = darkMode ? themes.vsDark : themes.vsLight;
  
  // Use the passed font size, or a default for the preview.
  const fontSize = propFontSize ? `${propFontSize}px` : '0.8rem';

  return (
    <Highlight
      prism={Prism}
      code={codeString}
      language={lang}
      theme={theme}
    >
      {({ className, style, tokens, getLineProps, getTokenProps }) => {
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
              padding: '1rem',
              margin: 0,
              fontSize: fontSize, // Apply the dynamic font size
              // Conditional styles based on the 'wrap' prop
              whiteSpace: wrap ? 'pre-wrap' : 'pre',
              wordBreak: wrap ? 'break-word' : 'normal',
              // The parent div in the modal will handle scrolling
              overflow: 'visible', 
              backgroundColor: 'transparent',
            }}
          >
            {tokens.map((line, i) => (
              <div 
                key={i} 
                {...getLinePropsWithoutKey(line, i)}
              >
                {/* Conditionally show line numbers only when not wrapping (i.e., in the modal) */}
                {!wrap && <span style={{ display: 'inline-block', width: '2em', userSelect: 'none', opacity: 0.5 }}>{i + 1}</span>}
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

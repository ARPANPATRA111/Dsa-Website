import React from 'react';
import { Highlight, themes } from 'prism-react-renderer';

const CodeHighlight = ({ codeString, language, isMobile }) => (
  <Highlight code={codeString} language={language} theme={themes.vsDark}>
    {({ className, style, tokens, getLineProps, getTokenProps }) => (
      <pre 
        className={`${className}`} 
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
        {tokens.map((line, i) => {
          const { key: lineKey, ...lineProps } = getLineProps({ line, key: i });
          return (
            <div 
              key={lineKey} 
              {...lineProps} 
              style={{
                ...lineProps.style,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word'
              }}
            >
              {line.map((token, key) => {
                const { key: tokenKey, ...tokenProps } = getTokenProps({ token, key });
                return <span key={tokenKey} {...tokenProps} />;
              })}
            </div>
          );
        })}
      </pre>
    )}
  </Highlight>
);

export default CodeHighlight;
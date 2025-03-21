import React from 'react';

export const formatWithLineBreaks = (text: string): React.ReactNode => {
  // First, normalize all existing line breaks and BR tags to a standard format
  const normalizedText = text
    .replace(/\\n/g, '\n')                      // Replace literal \n with actual newlines
    .replace(/\r\n/g, '\n')                     // Normalize Windows line endings
    .replace(/<br\s*\/?>/gi, '\n')              // Replace <br> tags with newlines
    .replace(/&lt;br\s*\/?&gt;/gi, '\n');       // Replace escaped <br> tags

  // Then render with line breaks preserved
  return (
    <>
      {normalizedText.split('\n').map((line, i, arr) => (
        <React.Fragment key={i}>
          {line}
          {i < arr.length - 1 && <br />}
        </React.Fragment>
      ))}
    </>
  );
};
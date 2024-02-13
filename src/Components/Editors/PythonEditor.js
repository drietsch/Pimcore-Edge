import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { LiveProvider, LiveError, LivePreview } from "react-live";
import IframePreview from "./IframePreview";
import ReactJson from 'react-json-view';
import { debounce } from 'lodash';

const JavaScriptEditor = () => {
  const [code, setCode] = useState('');
  
  // Define scope if you are using external components or libraries
  const scope = {
    // Your components or libraries here
  };

  // Create a debounced function to update code state
  const debouncedSetCode = debounce(newCode => {
    setCode(newCode);
  }, 500);

  // Cleanup the debounced function on component unmount
  useEffect(() => {
    return () => debouncedSetCode.cancel();
  }, [debouncedSetCode]);

  const handleEditorChange = (newCode) => {
    debouncedSetCode(newCode);
  };

  return (
    <div style={{ height: '600px' }}>
      <LiveProvider code={code} scope={scope} noInline={true}>
        <LivePreview style={{ padding: '10px', border: '1px solid #ddd', marginBottom: '10px' }} />
        <LiveError style={{ color: 'red' }} />
        <IframePreview />
      </LiveProvider>

      <Editor
        height="300px"
        defaultLanguage="javascript"
        value={code}
        onChange={handleEditorChange}
        options={{
          roundedSelection: false,
          scrollBeyondLastLine: false,
          readOnly: false,
          lineNumbers: 'on',
          minimap: { enabled: false },
          automaticLayout: true,
        }}
      />

      <div style={{ marginTop: '10px' }}>
        <ReactJson src={{ code }} />
      </div>
    </div>
  );
};

export default JavaScriptEditor;
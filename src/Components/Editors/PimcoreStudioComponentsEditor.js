import React, { useState, useEffect, useRef, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import initSwc, { transformSync } from "@swc/wasm-web";
import { debounce } from 'lodash';

const PimcoreStudioComponentsEditor = () => {
  const [code, setCode] = useState('');
  const [initialized, setInitialized] = useState(false);
  const [compiledCode, setCompiledCode] = useState('');
  const outputRef = useRef(null);

  // Function to create script tags from import statements
  function createScriptTags(code) {
    const importRegex = /import (\w+) from ['"]([^'"]+)['"];?/g;
    let match;
    let importStrings = [];

    while ((match = importRegex.exec(code)) !== null) {
      importStrings.push(`<script src="${match[2]}"></script>`);
    }
    return importStrings.join('\n');
  }

  // Function to remove import statements from code
  function removeImportStatements(code) {
    const importRegex = /^import.*from\s+['"].+['"];?$/gm;
    return code.replace(importRegex, '');
  }

  // Effect to initialize SWC on component mount
  useEffect(() => {
    async function importAndRunSwcOnMount() {
      await initSwc();
      setInitialized(true);
    }
    importAndRunSwcOnMount();
  }, []);

  // Function to compile and bundle code using SWC
  const compileAndBundle = useCallback(async () => {
    if (!initialized) {
      console.log("SWC not yet initialized");
      return;
    }
    try {
      const result = transformSync(code, {
        jsc: {
          parser: {
            syntax: "ecmascript",
            sourceMaps: "inline",
            script: false,
            jsx: true,
            isModule: true
          },
          target: "es5",
          minify: {
            compress: true,
            mangle: false
          },
        },
      });

      const scriptTags = createScriptTags(result.code);
      const PimcoreStudioComponent = removeImportStatements(result.code);

      // Create HTML structure for the iframe
      const iframeHTML = `
        <html>
        <head>
          ${scriptTags}
        </head>
        <body>       
          <div id="root"></div>
          <script type="module">
            ${PimcoreStudioComponent}
          </script>
        </body>
        </html>
      `;

      // Set the srcdoc of the iframe
      if (outputRef.current) {
        outputRef.current.srcdoc = iframeHTML;
      }
      setCompiledCode(iframeHTML);
    
    } catch (error) {
      console.error("Compilation error:", error);
    }
  }, [code, initialized]);

  const handleEditorChange = setCode

  return (
    <div style={{ height: '600px' }}>
      <div className="App">
        <button onClick={compileAndBundle}>Compile</button>
      </div>

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

      <iframe
        ref={outputRef}
        style={{ width: '100%', height: '300px', border: 'none' }}
        title="Output"
      />
    </div>
  );
};

export default PimcoreStudioComponentsEditor;

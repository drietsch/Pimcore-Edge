import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { Button } from 'antd';
import ReactJson from 'react-json-view';

const JavaScriptEditor = () => {
  const [code, setCode] = useState('// Type your JavaScript code here');
  const [output, setOutput] = useState('');
  const [worker, setWorker] = useState(null);

  useEffect(() => {
    const workerScript = `
    self.onmessage = async (e) => {
      try {

        // Load SystemJS and AMD Extra
        await eval(await (await fetch('https://cdnjs.cloudflare.com/ajax/libs/systemjs/6.14.3/system.min.js')).text());
        await eval(await (await fetch('https://cdnjs.cloudflare.com/ajax/libs/systemjs/6.14.3/extras/amd.min.js')).text());

        // Define an import map
        const importMap = {
          'babel': 'https://unpkg.com/@babel/standalone/babel.min.js',
        };

        // Override System.resolve to use the import map
        const originalResolve = System.resolve;
        System.resolve = async function (specifier, parentURL) {
          return importMap[specifier] || originalResolve.call(this, specifier, parentURL);
        };

        // Import React and ReactDOMServer using SystemJS
        const Babel = await System.import('babel');

        // Transform the received code using Babel
        //var input = e.data.code;
        const input = \`const profile = (<Button>{ 1+3 }</Button>);\`;

        const transformedCode = Babel.transform(input, { presets: ['react'] }).code;
console.log(transformedCode);


        // Create an HTML template with the rendered component
        const htmlTemplate = \`
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>React App</title>
              <link href="https://cdnjs.cloudflare.com/ajax/libs/antd/5.14.0/antd.min.css" rel="stylesheet">
              <script src="https://unpkg.com/react@18.2.0/umd/react.production.min.js"></script>
              <script src="https://unpkg.com/react-dom@18.2.0/umd/react-dom.production.min.js"></script>
              
              <script src="https://cdnjs.cloudflare.com/ajax/libs/dayjs/1.11.10/dayjs.min.js"></script>
              <script src="https://cdnjs.cloudflare.com/ajax/libs/antd/5.14.0/antd.min.js"></script>
              
            </head>
            <body>xxxxx
              <div id="app"></div>
              <script defer>
              document.addEventListener('DOMContentLoaded', () => {
                const Button = antd.Button; // Accessing Button directly from antd
        
            

              \${transformedCode}
              
              const root = ReactDOM.createRoot(
                document.getElementById('app')
              );

              root.render(profile);
              console.log(root);
            });
              </script>
            </body>
          </html>
        \`;
        console.log('HTML template:', htmlTemplate);
        // Post the complete HTML back to the main thread
        self.postMessage(htmlTemplate);
      } catch (error) {
        console.error('Error in worker:', error);
        self.postMessage({ error: error.message });
      }
    };
    `;

    // Create a blob from the worker script and initialize the worker
    const blob = new Blob([workerScript], { type: 'application/javascript' });
    const workerUrl = URL.createObjectURL(blob);
    const newWorker = new Worker(workerUrl);
    setWorker(newWorker);

    newWorker.onmessage = (e) => {
      if (e.data) {
        
        setOutput(e.data);
      } else if (e.data.error) {
        console.error("Error from worker:", e.data.error);
      }
    };

    return () => {
      newWorker.terminate();
      URL.revokeObjectURL(workerUrl);
    };
  }, []);

  const runCode = () => {
    if (worker) {
      worker.postMessage({ code });
    }
  };

  return (
    <div style={{ height: '600px' }}>
      <Editor
        height="300px"
        defaultLanguage="javascript"
        value={code}
        onChange={setCode}
        options={{
          roundedSelection: false,
          scrollBeyondLastLine: false,
          readOnly: false
        }}
      />
      <Button onClick={runCode}>Run</Button>
      <div>
        <ReactJson src={{ output }} />
        <iframe title="React App Output" width="100%" height="500" srcDoc={output}></iframe>
      </div>
    </div>
  );
};

export default JavaScriptEditor;
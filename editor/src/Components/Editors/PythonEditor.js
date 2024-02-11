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
        if (e.data.writable) {
          const writable = e.data.writable;
          const writer = writable.getWriter();
          
          try {
            // Load SystemJS and AMD Extra
            await eval(await (await fetch('https://cdnjs.cloudflare.com/ajax/libs/systemjs/6.14.3/system.min.js')).text());
            await eval(await (await fetch('https://cdnjs.cloudflare.com/ajax/libs/systemjs/6.14.3/extras/amd.min.js')).text());
            
            // Define an import map
            const importMap = {
              'react': 'https://unpkg.com/react@18.2.0/umd/react.production.min.js',
              'react-dom/server': 'https://unpkg.com/react-dom@18.2.0/umd/react-dom-server.browser.production.min.js'
            };

            // Override System.resolve to use the import map
            const originalResolve = System.resolve;
            System.resolve = async function (specifier, parentURL) {
              return importMap[specifier] || originalResolve.call(this, specifier, parentURL);
            };

            // Import React and ReactDOMServer using SystemJS
            const React = await System.import('react');
            const ReactDOMServer = await System.import('react-dom/server');

            // Process the received code
            const element = React.createElement('div', { className: 'test' }, 'Test Element');
            const stream = await ReactDOMServer.renderToReadableStream(element);

            const reader = stream.getReader();

            // Function to read each chunk and write to the writable stream
            const processStream = () => {
              reader.read().then(({ done, value }) => {
                if (done) {
                  writer.close();
                  return;
                }
                writer.write(value); // Write the chunk to the writable stream
                processStream(); // Continue processing the stream
              }).catch(error => {
                console.error('Error reading the stream:', error);
                writer.write(new TextEncoder().encode('Stream read error: ' + error.message));
                writer.close();
              });
            };
    
            processStream();

          } catch (error) {
            console.error('Error in worker:', error);
            writer.write(encoder.encode('Error: ' + error.message));
            writer.close();
          }
        }
      };
    `;

    // Create a blob from the worker script
    const blob = new Blob([workerScript], { type: 'application/javascript' });
    const workerUrl = URL.createObjectURL(blob);

    // Initialize the worker
    const newWorker = new Worker(workerUrl);
    setWorker(newWorker);

    // Create a pair of streams
    const { readable, writable } = new TransformStream();

    // Transfer the writable stream to the worker
    newWorker.postMessage({ writable }, [writable]);

    // Read from the readable stream
    const reader = readable.getReader();
    const decoder = new TextDecoder();
    let result;
    reader.read().then(function processText({ done, value }) {
      if (done) {
        return;
      }
      setOutput(prev => prev + decoder.decode(value, { stream: true }));
      return reader.read().then(processText);
    });

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
      </div>
    </div>
  );
};

export default JavaScriptEditor;

import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import { Button } from 'antd';
import { newQuickJSAsyncWASMModule } from 'quickjs-emscripten';
import ReactJson from 'react-json-view';

const JavaScriptEditor = () => {
  const [code, setCode] = useState('// Type your JavaScript code here');
  const [output, setOutput] = useState({});

  const toJsonCompatible = (data) => {
    try {
      // Try to parse if the data is a JSON string
      return JSON.parse(data);
    } catch {
      // If it's not a JSON string, return a stringified version
      return { value: data.toString() };
    }
  };


  async function main() {
    try {
      const module = await newQuickJSAsyncWASMModule();
      const runtime = module.newRuntime();
      const context = runtime.newContext();
      context.setProp(context.global, "self", context.global);
  

      const response = await fetch('https://unpkg.com/react/umd/react.production.min.js');
      const moduleCode = await response.text();
      context.evalCodeAsync(moduleCode)

      //const result = await context.evalCodeAsync(code);
  
      const result = await context.evalCodeAsync(`
        const e = React.createElement;
        const element = e('div', { className: 'test' }, 'Test Element');
        globalThis.testElement = element;
      `);

      context.unwrapResult(result).dispose();
      const html = context.getProp(context.global, "testElement");
      setOutput(html.consume(context.dump));
    } catch (error) {
      console.error("Error during script execution:", error);
    }
  }


  main();

  return (
    <div style={{ height: '600px'}}>
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
      <Button onClick={main}>Run</Button>
      <div>
        <ReactJson src={output} />
      </div>
    </div>
  );
};

export default JavaScriptEditor;
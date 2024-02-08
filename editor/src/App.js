import logo from './logo.svg';
import './App.css';
import { getQuickJS } from "quickjs-emscripten"
import React from 'react';
import ReactDOM from 'react-dom';

import Editor from '@monaco-editor/react';

async function main() {
  
  const QuickJS = await getQuickJS()
  const vm = QuickJS.newContext()

  const world = vm.newString("world")
  vm.setProp(vm.global, "NAME", world)
  world.dispose()

  const result = vm.evalCode(`"Hello " + NAME + "!"`)
  
  if (result.error) {
    console.log("Execution failed:", vm.dump(result.error))
    result.error.dispose()
  } else {
    console.log("Success:", vm.dump(result.value))
    result.value.dispose()
  }

  vm.dispose()
}

main()


function App() {
  return <Editor height="90vh" defaultLanguage="javascript" defaultValue="// some comment" />;
}

export default App;

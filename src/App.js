import React, { useState } from 'react';
import { Button, Menu, Dropdown, Collapse } from 'antd';
import { PlusOutlined, DeleteOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import './App.css';
import JavaScriptEditor from './Components/Editors/JavaScriptEditor';
import PimcoreStudioComponentsEditor from './Components/Editors/PimcoreStudioComponentsEditor';
import PythonEditor from './Components/Editors/PythonEditor';
import PhpEditor from './Components/Editors/PhpEditor';

// Placeholder component for Editor Icons - Replace with your actual icons
const YourIconForEditor = ({ type }) => {
  // Replace with your actual icon component logic
  return <span>{type}</span>;
};

function EditorHeader({ editor, onRemove, onMoveUp, onMoveDown, index, total, addEditor }) {
  const handleButtonClick = (event, action) => {
    event.stopPropagation(); // Prevents the Collapse from toggling
    action();
  };

  const menu = (
    <Menu onClick={(e) => handleButtonClick(e.domEvent, () => addEditor(e.key, index + 1))}>
      <Menu.Item key="JavaScriptEditor">JavaScript Editor</Menu.Item>
      <Menu.Item key="PimcoreStudioComponentsEditor">JavaScript Editor</Menu.Item>
      <Menu.Item key="PythonEditor">Python Editor</Menu.Item>
      <Menu.Item key="PhpEditor">PHP Editor</Menu.Item>
    </Menu>
  );

  return (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <YourIconForEditor type={editor.type} style={{ width: '16px', height: '16px' }} />
      <span style={{ marginLeft: '10px' }}>Editor - {editor.type}</span>
    </div>
    <div style={{ display: 'flex', gap: '5px' }}>
      <Dropdown overlay={menu} trigger={['click']} onClick={(e) => e.stopPropagation()}>
        <Button icon={<PlusOutlined style={{ fontSize: '12px' }} />} />
      </Dropdown>
      <Button icon={<DeleteOutlined style={{ fontSize: '12px' }} />} onClick={(e) => handleButtonClick(e, () => onRemove(editor.id))} />
      <Button icon={<ArrowUpOutlined style={{ fontSize: '12px' }} />} onClick={(e) => handleButtonClick(e, () => onMoveUp(editor.id))} disabled={index === 0} />
      <Button icon={<ArrowDownOutlined style={{ fontSize: '12px' }} />} onClick={(e) => handleButtonClick(e, () => onMoveDown(editor.id))} disabled={index === total - 1} />
    </div>
  </div>
  );
}

function App() {
  const [editors, setEditors] = useState([]);

  const addEditor = (type, index = editors.length) => {
    const newEditor = { id: Date.now(), content: `// Editor type: ${type}`, type };
    const updatedEditors = [...editors];
    updatedEditors.splice(index, 0, newEditor);
    setEditors(updatedEditors);
  };

  const removeEditor = (id) => {
    setEditors(editors.filter(editor => editor.id !== id));
  };

  const moveEditor = (id, direction) => {
    const index = editors.findIndex(editor => editor.id === id);
    if (direction === 'up' && index > 0) {
      [editors[index], editors[index - 1]] = [editors[index - 1], editors[index]];
    } else if (direction === 'down' && index < editors.length - 1) {
      [editors[index], editors[index + 1]] = [editors[index + 1], editors[index]];
    }
    setEditors([...editors]);
  };

  const renderEditor = (editor) => {
    switch (editor.type) {
      case 'JavaScriptEditor':
        return <JavaScriptEditor defaultValue={editor.content} />;
      case 'PimcoreStudioComponentsEditor':
        return <PimcoreStudioComponentsEditor defaultValue={editor.content} />;        
      case 'PythonEditor':
        return <PythonEditor defaultValue={editor.content} />;
      case 'PhpEditor':
        return <PhpEditor defaultValue={editor.content} />;
      default:
        return <div>Unsupported editor type</div>;
    }
  };

  const menu = (
    <Menu onClick={({ key }) => addEditor(key)}>
      <Menu.Item key="JavaScriptEditor">JavaScript Editor</Menu.Item>
      <Menu.Item key="PimcoreStudioComponentsEditor">Pimcore Studio Components Editor</Menu.Item>
      <Menu.Item key="PythonEditor">Python Editor</Menu.Item>
      <Menu.Item key="PhpEditor">PHP Editor</Menu.Item>
    </Menu>
  );

  return (
    <div style={{ width: '600px' }}>
      <Dropdown overlay={menu}>
        <Button>Add New Editor</Button>
      </Dropdown>
      {editors.map((editor, index) => (
      <Collapse>
          <Collapse.Panel
            header={<EditorHeader 
                      editor={editor}
                      onRemove={() => removeEditor(editor.id)}
                      onMoveUp={() => moveEditor(editor.id, 'up')}
                      onMoveDown={() => moveEditor(editor.id, 'down')}
                      index={index}
                      total={editors.length}
                      addEditor={addEditor} />}
            key={editor.id}
          >
            {renderEditor(editor)} 
        
      </Collapse.Panel>
      </Collapse>
      ))}
      
    </div>
  );
}

export default App;

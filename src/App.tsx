import { useState } from 'react';
import { MultiSelect } from './MultiSelect/MultiSelect';
import { type MultiSelectState } from './MultiSelect/useMultiSelect';

function App() {
  const [state, setState] = useState<MultiSelectState>();

  return (
    <>
      <div className="flex items-center justify-center h-screen flex-col">
        <MultiSelect
          onChange={setState}
          options={[
            { label: 'one', value: 'one' },
            { label: 'on', value: 'on' },
            { label: 'two', value: 'two' },
          ]}
        />
        <div className="mt-40">
          <pre>{JSON.stringify(state, null, 2)}</pre>
        </div>
      </div>
    </>
  );
}

export default App;

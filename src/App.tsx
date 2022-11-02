import { MultiSelect } from './MultiSelect/MultiSelect';

function App() {
  return (
    <div className="flex items-center justify-center h-screen">
      <MultiSelect
        options={[
          { label: 'one', value: 'one' },
          { label: 'two', value: 'two' },
        ]}
      />
    </div>
  );
}

export default App;

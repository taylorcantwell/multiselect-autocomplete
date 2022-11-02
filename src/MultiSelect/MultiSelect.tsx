import { useMultiSelect } from './useMultiSelect';

export type MultiSelectProps = {
  options: {
    label: string;
    value: string;
  }[];
};

export const MultiSelect = ({ options }: MultiSelectProps) => {
  const {
    open,
    filteredOptions,
    getInputProps,
    getOptionProps,
    getButtonProps,
    selectedOptions,
  } = useMultiSelect(options);

  return (
    <div className="relative">
      <div className="grid w-[300px] h-[50px]">
        <button
          {...getButtonProps()}
          aria-controls="owned_listbox"
          tabIndex={0}
          className="z-10 h-full bg-transparent border border-red-500 grid-stack"
        />
        <div className="flex h-full p-2 grid-stack">
          <span className="flex items-center h-full p-2 border-r-2 w-min whitespace-nowrap">
            {selectedOptions}
          </span>
          <input
            {...getInputProps()}
            className="w-full ml-2 border-none outline-none background-transparent"
            aria-autocomplete="list"
            role="combobox"
            aria-controls="owned_listbox"
          />
        </div>
      </div>

      <ul
        aria-multiselectable="true"
        className="absolute top-[100%]"
        hidden={!open}
        role="listbox"
        id="owned_listbox"
      >
        {filteredOptions.map((option, index) => (
          <li
            {...getOptionProps(index, option.value)}
            className="data-[filtered=true]:visually-hidden"
            key={option.value + option.label}
            role="option"
          >
            {option.label}
          </li>
        ))}
      </ul>
    </div>
  );
};

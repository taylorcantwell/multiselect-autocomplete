import { type MultiSelectOption, useMultiSelect } from './useMultiSelect';

export type MultiSelectProps = {
  options: MultiSelectOption[];
};

export const MultiSelect = ({ options }: MultiSelectProps) => {
  const {
    open,
    filteredOptions,
    getInputProps,
    getOptionProps,
    getButtonProps,
    selectedLabels,
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
            {selectedLabels}
          </span>
          <input
            {...getInputProps()}
            aria-controls="owned_listbox"
            aria-autocomplete="list"
            className="w-full ml-2 border-none outline-none background-transparent"
            role="combobox"
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
        {filteredOptions.map((option) => (
          <li
            {...getOptionProps(option.value)}
            className="data-[active=true]:bg-blue-500"
            key={option.value}
            role="option"
          >
            {option.label}
          </li>
        ))}
      </ul>
    </div>
  );
};

import React, { useEffect, useMemo, useReducer, useRef } from 'react';

export const useMultiSelect = (options: MultiSelectOption[]) => {
  const [state, _dispatch] = useReducer(reducer, {
    options,
    open: false,
    activeOption: null,
    selectedOptions: [],
    input: '',
  });
  console.log(
    '🚀 ~ file: useMultiSelect.tsx ~ line 11 ~ useMultiSelect ~ state',
    state
  );

  const dispatch = new Dispatcher(_dispatch);
  const filteredOptions = useMemo(() => {
    return state.options.filter((option) => {
      return option.label.toLowerCase().includes(state.input.toLowerCase());
    });
  }, [state.input, state.options]);

  const selectedLabels = state.selectedOptions
    .map((selectedOption) => {
      return state.options.find((option) => option.value === selectedOption)
        ?.label;
    })
    .join(', ');

  const inputRef = useRef<HTMLInputElement>(null);
  const filteredOptionsRef = useRef(filteredOptions.length);

  useEffect(
    function onFilterSelectFirstOption() {
      if (filteredOptions.length !== filteredOptionsRef.current) {
        filteredOptionsRef.current = filteredOptions.length;

        const firstOption = filteredOptions[0];
        dispatch.setActive(firstOption?.value ?? null);
      }
    },
    [filteredOptions, filteredOptionsRef]
  );

  const getButtonProps = () => {
    return {
      'aria-expanded': state.open,
      onClick: () => {
        dispatch.toggle();
        inputRef.current?.focus();
      },
      onKeyDown: (event: React.KeyboardEvent<HTMLButtonElement>) => {
        if (!state.open) {
          dispatch.open();
          inputRef.current?.focus();
        }
      },
      onBlur: () => dispatch.close(),
    };
  };

  const getOptionProps = (value: MultiSelectOptionValue) => {
    const isSelected = state.selectedOptions.includes(value);
    const isActive = state.activeOption === value;

    return {
      id: value,
      'aria-selected': isSelected,
      'data-active': isActive,
      onMouseDown: (event: React.MouseEvent<HTMLLIElement>) => {
        event.preventDefault();
        dispatch.setSelected(value);
        dispatch.setInput('');
      },
      onMouseEnter: () => {
        dispatch.setActive(value);
      },
    };
  };

  const getInputProps = () => {
    return {
      'aria-expanded': state.open,
      'aria-activedescendant': state.activeOption,
      value: state.input,
      ref: inputRef,
      onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
        dispatch.setInput(event.target.value);
      },
      onFocus: () => {
        dispatch.open();
      },
      onBlur: () => {
        dispatch.close();
      },
      onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => {
        const invalidKey = !Object.keys(Keys).some((code) =>
          event.code.startsWith(code)
        );

        if (invalidKey) return;

        if (!state.open) {
          dispatch.open();
        }

        switch (event.code) {
          case Keys.ArrowDown: {
            const lastOption = filteredOptions[filteredOptions.length - 1];
            const isNotLastOption = lastOption.value !== state.activeOption;

            if (isNotLastOption) {
              dispatch.targetDown(filteredOptions);
            }
            break;
          }

          case Keys.ArrowUp: {
            const firstOption = filteredOptions[0].value;
            const isNotFirstOption = firstOption !== state.activeOption;

            if (isNotFirstOption) {
              dispatch.targetUp(filteredOptions);
            }
            break;
          }

          case Keys.Enter: {
            if (state.activeOption && state.open) {
              dispatch.setSelected(state?.activeOption);
              dispatch.close();
            }
            break;
          }

          case Keys.Escape: {
            dispatch.close();
            break;
          }

          case Keys.Tab: {
            dispatch.close();
            break;
          }

          case Keys.Backspace: {
            const shouldDeleteLastSelectedOption =
              state.input === '' && state.selectedOptions.length > 0;

            if (shouldDeleteLastSelectedOption) {
              const lastSelectedOption =
                state.selectedOptions[state.selectedOptions.length - 1];
              dispatch.setSelected(lastSelectedOption);
            }
          }

          default:
            return;
        }
      },
    };
  };

  return {
    open: state.open,
    selectedLabels,
    filteredOptions,
    getInputProps,
    getOptionProps,
    getButtonProps,
  };
};

export type MultiSelectOption = {
  label: string;
  value: MultiSelectOptionValue;
};

type MultiSelectOptionValue = number | string;

type MultiSelectState = {
  options: MultiSelectOption[];
  open: boolean;
  selectedOptions: MultiSelectOptionValue[];
  activeOption: MultiSelectOptionValue | null;
  input: string;
};

export type MultiSelectAction =
  | { type: 'OPEN' }
  | {
      type: 'TOGGLE';
    }
  | {
      type: 'CLOSE';
    }
  | TargetUpDispatch
  | TargetDownDispatch
  | SetSeletedDispatch
  | SetActiveDispatch
  | SetInputDispatch;

type TargetUpDispatch = {
  type: 'TARGET_UP';
  payload: MultiSelectOption[];
};

type TargetDownDispatch = {
  type: 'TARGET_DOWN';
  payload: MultiSelectOption[];
};

type SetSeletedDispatch = {
  type: 'SET_SELECTED';
  payload: MultiSelectOptionValue;
};

type SetActiveDispatch = {
  type: 'SET_ACTIVE';
  payload: MultiSelectOptionValue;
};

type SetInputDispatch = {
  type: 'SET_INPUT';
  payload: string;
};

const reducer = (
  state: MultiSelectState,
  action: MultiSelectAction
): MultiSelectState => {
  switch (action.type) {
    case 'SET_SELECTED':
      const isOptionAlreadySelected = state.selectedOptions.some(
        (selectedOption) => selectedOption === action.payload
      );

      if (isOptionAlreadySelected) {
        const newSelectedOptions = state.selectedOptions.filter(
          (selectedOption) => selectedOption !== action.payload
        );

        return {
          ...state,
          selectedOptions: newSelectedOptions,
        };
      }

      return {
        ...state,
        selectedOptions: [...state.selectedOptions, action.payload],
      };

    case 'SET_ACTIVE':
      return {
        ...state,
        activeOption: action.payload,
      };

    case 'TARGET_UP': {
      const filteredOptions = action.payload;
      const activeOption = getNewActiveOption(
        state.activeOption,
        filteredOptions,
        'up'
      );

      return {
        ...state,
        activeOption,
      };
    }

    case 'TARGET_DOWN': {
      const filteredOptions = action.payload;
      const activeOption = getNewActiveOption(
        state.activeOption,
        filteredOptions,
        'down'
      );

      return {
        ...state,
        activeOption,
      };
    }

    case 'OPEN':
      console.log('OPEN');
      const firstOption = state.options[0].value;

      return {
        ...state,
        activeOption: firstOption,
        open: true,
      };
    case 'CLOSE':
      return { ...state, open: false };

    case 'TOGGLE':
      return { ...state, open: !state.open };

    case 'SET_INPUT':
      return {
        ...state,
        input: action.payload,
      };

    default:
      throw new Error('Invalid action type');
  }
};

class Dispatcher {
  constructor(private dispatch: React.Dispatch<MultiSelectAction>) {}

  setSelected = (payload: MultiSelectOptionValue) => {
    this.dispatch({ type: 'SET_SELECTED', payload });
  };
  setActive = (payload: MultiSelectOptionValue) => {
    this.dispatch({ type: 'SET_ACTIVE', payload });
  };
  targetUp = (payload: MultiSelectOption[]) => {
    this.dispatch({ type: 'TARGET_UP', payload });
  };
  targetDown = (payload: MultiSelectOption[]) => {
    this.dispatch({ type: 'TARGET_DOWN', payload });
  };
  open = () => {
    this.dispatch({ type: 'OPEN' });
  };
  close = () => {
    this.dispatch({ type: 'CLOSE' });
  };
  toggle = () => {
    this.dispatch({ type: 'TOGGLE' });
  };
  setInput = (payload: SetInputDispatch['payload']) => {
    this.dispatch({ type: 'SET_INPUT', payload });
  };
}

enum Keys {
  Enter = 'Enter',
  Escape = 'Escape',
  ArrowUp = 'ArrowUp',
  ArrowDown = 'ArrowDown',
  Digit = 'Digit',
  Key = 'Key',
  Tab = 'Tab',
  Backspace = 'Backspace',
}

const getNewActiveOption = (
  activeOption: MultiSelectOptionValue,
  filteredOptions: MultiSelectOption[],
  direction: 'up' | 'down'
) => {
  const currentIndex = filteredOptions.findIndex((option) => {
    return option.value === activeOption;
  });
  const movement = direction === 'up' ? -1 : 1;
  const newIndex = currentIndex + movement;
  const newActiveOption = filteredOptions[newIndex].value;

  return newActiveOption;
};

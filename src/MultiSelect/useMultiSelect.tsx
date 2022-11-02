import React, { useReducer, useRef } from 'react';

export const useMultiSelect = (
  options: Omit<MultiSelectState['options'], 'index'>
) => {
  const [state, _dispatch] = useReducer(reducer, {
    options,
    open: false,
    activeIndex: -1,
    selectedOptions: [],
    input: '',
  });

  const dispatch = new Dispatcher(_dispatch);
  const filteredOptions = state.options.filter((option) => {
    return option.label.toLowerCase().includes(state.input.toLowerCase());
  });

  const inputRef = useRef<HTMLInputElement>(null);

  const getButtonProps = () => {
    return {
      onClick: () => {
        dispatch.toggle();
        inputRef.current?.focus();
      },
      'aria-expanded': state.open,
      onBlur: () => dispatch.close(),
    };
  };

  const getOptionProps = (index: number, value: string) => {
    return {
      id: index,
      'aria-selected': state.selectedOptions.includes(index),
      'data-active': state.activeIndex === index,
      onMouseDown: (event: React.MouseEvent<HTMLLIElement>) => {
        event.preventDefault();
        dispatch.setSelected(index);
        dispatch.setInput('');
      },
      onMouseEnter: () => {
        dispatch.setActive(index);
      },
    };
  };

  const getInputProps = () => {
    return {
      'aria-expanded': state.open,
      'aria-activedescendant': state.activeIndex,
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

        dispatch.open();

        switch (event.code) {
          case Keys.ArrowDown:
            if (state.activeIndex < state.options.length - 1) {
              dispatch.targetDown();
            }
            break;

          case Keys.ArrowUp:
            if (state.activeIndex > 0) {
              dispatch.targetUp();
            }
            break;

          case Keys.Enter:
            if (state.activeIndex >= 0 && state.open) {
              dispatch.setSelected(state.activeIndex);
              dispatch.close();
              return;
            }
            break;

          case Keys.Escape:
            dispatch.close();
            break;

          case Keys.Tab:
            dispatch.close();
            break;

          case Keys.Backspace:
            if (state.input === '' && state.selectedOptions.length > 0) {
              dispatch.setSelected(state.selectedOptions.length - 1);
            }

          default:
            return;
        }
      },
    };
  };

  return {
    open: state.open,
    selectedOptions: state.selectedOptions
      .map((option) => state.options[option].label)
      .join(', '),
    filteredOptions,
    getInputProps,
    getOptionProps,
    getButtonProps,
  };
};

export type MultiSelectState = {
  options: {
    label: string;
    value: string;
  }[];
  open: boolean;
  selectedOptions: number[];
  activeIndex: number;
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
  | {
      type: 'TARGET_DOWN';
    }
  | {
      type: 'TARGET_UP';
    }
  | SetSeletedDispatch
  | SetActiveDispatch
  | SetInputDispatch;

type SetSeletedDispatch = {
  type: 'SET_SELECTED';
  payload: number;
};

type SetActiveDispatch = {
  type: 'SET_ACTIVE';
  payload: number;
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
      const isAlreadySelected = state.selectedOptions.some(
        (selectedOption) => selectedOption === action.payload
      );

      const selectedOptions = isAlreadySelected
        ? state.selectedOptions.filter(
            (selectedOption) => selectedOption !== action.payload
          )
        : [...state.selectedOptions, action.payload];

      return {
        ...state,
        selectedOptions,
      };

    case 'SET_ACTIVE':
      return {
        ...state,
        activeIndex: action.payload,
      };

    case 'TARGET_UP':
      return {
        ...state,
        activeIndex: state.activeIndex - 1,
      };
    case 'TARGET_DOWN':
      return {
        ...state,
        activeIndex: state.activeIndex + 1,
      };
    case 'OPEN':
      return {
        ...state,
        open: true,
      };
    case 'CLOSE':
      return { ...state, activeIndex: -1, open: false };
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

  setSelected = (payload: SetSeletedDispatch['payload']) => {
    this.dispatch({ type: 'SET_SELECTED', payload });
  };
  setActive = (payload: SetActiveDispatch['payload']) => {
    this.dispatch({ type: 'SET_ACTIVE', payload });
  };
  targetUp = () => {
    this.dispatch({ type: 'TARGET_UP' });
  };
  targetDown = () => {
    this.dispatch({ type: 'TARGET_DOWN' });
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

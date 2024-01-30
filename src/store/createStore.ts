import { useSyncExternalStore } from 'react';

type SetterFn<TState> = (prevState: TState) => Partial<TState>;

export function createStore<TState extends Record<string, any>>(
  createState: (
    setState: (partialState: Partial<TState> | SetterFn<TState>) => void,
    getState: () => TState,
  ) => TState,
) {
  let state: TState;

  const listeners = new Set<() => void>();

  function notifyListeners() {
    listeners.forEach((listener) => listener());
  }

  function setState(partialState: Partial<TState> | SetterFn<TState>) {
    const newValue =
      typeof partialState === 'function' ? partialState(state) : partialState;

    state = {
      ...state,
      ...newValue,
    };

    notifyListeners();
  }

  function subscribe(listener: () => void) {
    listeners.add(listener);

    return () => {
      listeners.delete(listener);
    };
  }

  function getState() {
    return state;
  }

  function useStore<TValue>(
    selector: (currentState: TState) => TValue,
  ): TValue {
    return useSyncExternalStore(subscribe, () => selector(state));
  }

  state = createState(setState, getState);

  return useStore;
}

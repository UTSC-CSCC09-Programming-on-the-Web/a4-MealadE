/**
 * A simple JavaScript library to demonstrate the concept of a React-like state management system.
 * This library is not a full implementation of React, but rather a simplified version to illustrate
 * the core concepts of state management and component lifecycle.
 *
 * Two main functions are provided:
 * - `useState`: Allows you to add state to your components.
 * - `useEffect`: Allows you to perform side effects based on state dependencies.
 */
const meact = (function () {
  "use strict";
  const module = {};

  // In this implementation, the state object is a simple key-value store that is global to the module.
  // In React, for example, the state is scoped to a component.
  const state = {};

  const useEffectListeners = {};

  /**
   * useState allows you to add state to your components.
   *
   * Example:
   * const [count, getCount, setCount] = useState(0);
   * setCount(count + 1); // Updates the state and triggers rerenders based on defined useEffect listeners.
   * getCount(); // Returns the current state value.
   *
   * The `count` variable is used as a dependency for useEffect.
   */
  module.useState = function (initialValue) {
    console.log("useState called with initial value:", initialValue);
    const key = Symbol();
    state[key] = initialValue;
    return [
      key,
      function () {
        console.log("Getting state value for key:", key);
        return structuredClone(state[key]);
      },
      function (newValue) {
        console.log(
          "Setting state value for key:",
          key,
          "New value:",
          newValue,
        );
        state[key] = newValue;
        if (useEffectListeners[key]) {
          useEffectListeners[key].forEach((callback) => callback(newValue));
        }
      },
    ];
  };

  module.useEffect = function (callback, dependencies) {
    console.log("useEffect called with dependencies:", dependencies);
    if (dependencies.length === 0) {
      console.log("No dependencies provided, calling callback immediately");
      callback();
      return;
    }
    dependencies.forEach((dep) => {
      console.log("Registering callback for dependency:", dep);
      if (!useEffectListeners[dep]) {
        useEffectListeners[dep] = [];
      }
      useEffectListeners[dep].push(callback);
    });
    console.log("Calling callback with initial state:", state[dependencies[0]]);
    callback(state[dependencies[0]]);
  };

  return module;
})();

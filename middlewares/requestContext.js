const { AsyncLocalStorage } = require('async_hooks');

const asyncLocalStorage = new AsyncLocalStorage();

function runWithContext(req, res, next) {
  asyncLocalStorage.run(new Map(), () => {
    const store = asyncLocalStorage.getStore();
    next();
  });
}

function setContextValue(key, value) {
  const store = asyncLocalStorage.getStore();
  if (store) store.set(key, value);
}

function getContextValue(key) {
  const store = asyncLocalStorage.getStore();
  return store ? store.get(key) : undefined;
}

module.exports = { runWithContext, setContextValue, getContextValue };

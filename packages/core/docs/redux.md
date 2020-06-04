# @datawheel/canon-core

## Redux Store

Default values can be added to the Redux Store by creating a file located at `app/store.js`. This file should export an Object, whose values will be merged with the defaul store. This file can use either ES6 or node style exports, but if you import any other dependencies into that file you must use node's `require` syntax.

Here is an example:

```js
export default {
  countries: ["nausa", "sabra", "aschn"]
};
```

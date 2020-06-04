# @datawheel/canon-core

## Hot Module Reloading

To enable hot module reloading, the component being used on a Route (like `Home.jsx` or `Profile.jsx`) needs to be wrapped with the `hot` wrapper when exporting. Import it like this:

```jsx
import {hot} from "react-hot-loader/root";
```

And export it like this:

```jsx
export default hot(Home);
```

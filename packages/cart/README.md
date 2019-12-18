# Canon cart

## Getting started

Install the package from [npm](https://www.npmjs.com/):

```bash
npm i @datawheel/canon-cart --save
```

## Basic setup

Cart's state is managed from the site-wide redux state, so is a requirement to setup the Cart's reducer function.
In `app/reducers/index.js`, import the reducer function and assign it to the `cart` key:

```js
import {cartStateReducer} from "@datawheel/canon-cart";

...

export default {
  ...
  cart: cartStateReducer,
  ...
};
```

## Components

### 1. AddToCartControl

Create an individual add to Cart button.

#### Props
- query: (string) Absoulte url of a query to Mondrian, Tesseract or Logic Layer.
- tooltip: (boolean) Define if show tooltip on hover or not.

#### Example

```jsx
import {AddToCartControl} from "@datawheel/canon-cart";
...
render() {
    const url = `https://api.datamexico.org/tesseract/data?State=1&cube=economy_foreign_trade_ent&drilldowns=HS4&measures=Trade+Value&parents=true&sparse=false&locale=undefined&Year=2018&Flow=1`;

    return (
      <AddToCartControl query={url} tooltip={true} />
    )
  }

```

### 2. NavCartControl

Create a Cart button to include in your navbar. It shows the number of datasets and on hover a tooltip appear with the list of datasets added and download an clear buttons.

#### Props
- cartRoute: (string) Path of your cart route -just to complete the links-.

#### Example

```jsx
import {NavCartControl} from "@datawheel/canon-cart";
...
render() {

    return (
      <NavCartControl cartRoute={"/cart"} />
    )
  }

```

### 3. Cart

Full page Cart component.

#### Props
None

#### Example

```jsx
import {Cart} from "@datawheel/canon-cart";
...
render() {

    return (
      <Cart />
    )
  }

```

## Actions

### 1. clearCartAction

Remove all datasets from cart.

#### Payload
None

#### Example

```jsx
import {clearCartAction} from "@datawheel/canon-cart";
...

onCustomClearClick = () => {
  this.props.dispatch(clearCartAction());
}
```

### 2. addToCartAction

Add an url to cart.

#### Payload
- A single string: the url

#### Example

```jsx
import {addToCartAction} from "@datawheel/canon-cart";
...

onCustomAddClick = () => {
  const url = `https://api.datamexico.org/tesseract/data?State=1&cube=economy_foreign_trade_ent&drilldowns=HS4&measures=Trade+Value&parents=true&sparse=false&locale=undefined&Year=2018&Flow=1`;

  this.props.dispatch(addToCartAction(query));
}
```

### 3. removeFromCartAction

Remove an url from cart.

#### Payload
- A single string: the url

#### Example

```jsx
import {removeFromCartAction} from "@datawheel/canon-cart";
...

onCustomAddClick = () => {
  const url = `https://api.datamexico.org/tesseract/data?State=1&cube=economy_foreign_trade_ent&drilldowns=HS4&measures=Trade+Value&parents=true&sparse=false&locale=undefined&Year=2018&Flow=1`;

  this.props.dispatch(removeFromCartAction(query));
}
```

## Custom Styles
TBD, for now override styles like:
```css
#oec-style{
  & .canon-add-to-cart-control-container{
    background-color: steelblue;
    color: white;
    padding: 5px 10px;
    &.remove-state{
      background-color: steelblue;
      color: #ccc;
    }
  }
  & .canon-cart-container {
    & .canon-cart-area-sidebar {
      background-color: steelblue;
    }
    & .bp3-icon{
      & path{
        fill: white;
      }
    }
  }
}
```

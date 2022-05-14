# StateMesh - Lightweight State Manager

This library provides powerful and lightweight state machine with support for lazy evaluation, immediate evaluation, nested states and value caching.
Any change on the states propagates to the app so app can react to the change at time of the change or wait until the end of the app loop.
Lazy evaluation and value caching give performance boost for apps with heavy computations.
Nested state allows to define complex state trees with ease.

## Installation


```shell
$ npm install statemesh
```

node:
```javascript
const { Binding, State } = require("statemesh")
```

or:
```javascript
const { Binding, State } = require("./path-to-module/statemesh.js")
```

web:
```javascript
<script src="https://cdn.jsdelivr.net/npm/statemesh@latest/dist/statemesh.min.js"> </script>
```

es6:
```javascript
<script type="module">
    import { Binding, State } from "https://cdn.jsdelivr.net/npm/statemesh@latest/dist/statemesh.module.js"
</script>
```


## Getting started

We can create a state by just giving an initial value. In this case we have userState which holds our user properties. When we set new value to userState, listener is notified and prints new user object. It passes the user object to the listener, so we can use it to update our app.

```javascript
// Create a simple user state
var userState = new State("user", {
    username: 'johndoe',
    email: 'johndoe@example.com',
    membership: 'basic'
});

// Listen changes on userState, this way we'll be notified any time userState is changed.
userState.addChangeListener(user => {
    console.log(`User has been updated:\n`, user);
});

// Change membership
userState.set({
    ...userState.get(),
    membership: 'platinium'
});
// Output: 
// User has been updated: 
// {
//     username: 'johndoe',
//     email: 'johndoe@example.com',
//     membership: 'platinium'
// }

```

## StateGroup

StateGroup allows us to create nested states. We can think of it as a container for all states.
We can create a tree of states by adding StateGroups recursively. In this example we'll create a simple
app with basic states.

```javascript
const appState = new StateGroup().addState(
    new State("user", {
        username: 'johndoe',
        email: 'johndoe@example.com',
        membership: 'basic'
    }),
    new StateGroup("project").addState(
        new State("details", {
            name: 'My Project',
            description: 'This is my project'
        }),
        new State("coverUrl", "./cover.png"),
        new State("assets", ["./img.png", "./img2.png"]),
        new StateGroup("settings").addState(
            new State("theme", "light"),
            new State("fontSize", 16),
            new State("fontFamily", "monospace"),
        )
    )
);
```

We can get all structured data by calling get() on the root appState object.

```javascript
console.log(appState.get());
// output:
// {
//   user: {
//     username: 'johndoe',
//     email: 'johndoe@example.com',
//     membership: 'basic'
//   },
//   project: {
//     details: { 
//       name: 'My Project', 
//       description: 'This is my project' 
//     },
//     coverUrl: './cover.png',
//     assets: [ './img.png', './img2.png' ],
//     settings: { 
//       theme: "light", 
//       fontSize: 16, 
//       fontFamily: 'monospace' 
//     }
//   }
// }
```

Say we have ui engine and it needs to update itself based on the setting state changes.
Adding a listener to the root appState won't make sense, because all other state changes will trigger ui update and 
it will cause unnecessary overhead on the ui engine. Instead we can add a change listener to the each setting state separately.

```javascript
appState.project.settings.theme.addChangeListener(theme => {
    console.log("Dark mode has been updated: ", theme);
})

appState.project.settings.theme.set("dark");
// output: 
// Dark mode has been updated: dark
```

Its possible to add a listener to the settings state, you'll get all settings at once by calling get() on the settings state or adding a listener to the settings state.

```javascript
appState.project.settings.addChangeListener(settings => {
    console.log("Settings have been updated: ", settings);
})
appState.project.settings.fontSize.set(18)
// output: Settings have been updated:
// {
//   theme: 'dark',
//   fontSize: 18,
//   fontFamily: 'monospace'
// }
```

## Connecting states and setting custom computation

Sometimes you want to compute a value based on the values of other states. 
You can use the Binding class that allows you to set custom computation function for this purpose.
In this example we'll do some basic vector computations by linearly interpolating two vectors.

```javascript
// Simple vector class
class Vector {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    toString() {
        return "Vector{" +
            "x=" + this.x +
            ", y=" + this.y +
            '}';
    }
}

var vecA = new State("vecA", new Vector(1, 1));
var vecB = new State("vecB", new Vector(2, 2));
var t = new State("t", .5);

var multiplyState = new Binding();
multiplyState.addState(vecA, vecB, t);

// These inputs can be accessed by their name.
console.log(multiplyState.vecA.get());
console.log(multiplyState.vecB.get());
console.log(multiplyState.t.get());

multiplyState.setComputeFn((v1, v2, t) => {
    const tInv = 1 - t;
    const out = new Vector(v1.x * t + v2.x * tInv, v1.y * t + v2.y * tInv);
    console.log("output computed:", out);
    return out;
});

multiplyState.addChangeListener(val => {
    console.log("Interpolated value:", val);
});

// When we change any state, the binding will be invalidated and listener will be notified.
t.set(.8);

// Since computation already done, get() will return the cached value and won't print 'output computed'
console.log(multiplyState.get());
// output:
// Vector { x: 1.2, y: 1.2 }
```

Compute function will receive all connected state values as parameter with the connection order. In this example `setComputeFn` passes vecA, vecB and t values as parameter since these are the only connected states.

Another thing is StateMesh uses lazy evaluation algorithm. It means value won't be computed until it is called. It will be computed only once at the first call. Any other consecutive calls will receive cached value. This saves lots of computation power and time if app has heavy calculations or has too many states. If we try to call multiplyState again you'll notice that it wont print 'output computed.' again since its calling it from cache.

## Conclusion
We have covered the basics of StateMesh. We can use it to create complex state trees and connect them together. We can also use it to create custom state values that can be computed based on other states. It's covers many of the modern use cases and helps to create fast and flexible apps. Sometimes small libraries like this more suited for light apps and prototypes instead of using advanced ones with heavy boilerplate codes and long learning curve. As a coding enthusiast, I hope you'll find this library useful and I hope you'll use it in your projects.
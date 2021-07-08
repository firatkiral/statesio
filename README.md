# State Connection Graph

This library allows to follow or subscribe state changes in application.
Any change on the state will be notified to subscribers, so subscribers can update theirselves accordingly.
Scalable state trees can be created by connecting them each other.

## Install 
For nodejs application it can be installed from npm:
```shell
$ npm install stateconnect
```

Then it can be imported with require:
```javascript
const {State} = require("stateconnect")
```

Or it can be directly imported from the path:
```javascript
const {State} = require("./path-to-module/stateconnect.cjs")
```


For web, it can also be imported from path. StateConnect relies on ES modules, any script that references it must use type="module" as shown below:
```javascript
<script type="module">
    import { State } from "./path-to-module/stateconnect.mjs"
</script>
```

## Usage

```javascript
var firstnameState = new State("John");

firstnameState.subscribe((state) => {
    console.log(`Firstname changed to: ${state.get()}`);
});

firstnameState.set(("Frank"))
// Output: Firstname changed to: Frank
```

We create state by just giving a initial value which is "John" in current case. When we set new name to firstnameState subscriber is notified and prints new name. It will pass state itself as a parameter to subscribe function.

We can connect states by setting custom computation function.
```javascript
var firstnameState = new State("John");
var lastnameState = new State("Doe");

var fullnameState = new State();
firstnameState.connect(fullnameState);
lastnameState.connect(fullnameState);

fullnameState.setComputeFn((firstname, lastname) => {
    console.log("Computed.");
    return `Fullname: ${firstname} ${lastname}`;
});

console.log(fullnameState.get());
// Output: Computed.
// Fullname: John Doe
console.log(fullnameState.get());
// Output: Fullname: John Doe
```
State uses lazy evaluation algorithm. Value wont be computed until it is called. It will only be computed once at the first call. Any other consecutive calls receive cached value. This saves lots of computation power and time if app has heavy calculations or too many states. 

Compute function wll receive all connected state values as parameter with the connection order. In this example setComputeFn passes firstname and lastname as parameter since these are the only connected states. 

StateConnect has built-in undo manager and enabled by default. It can be set by changing static `withUndo` variable.
```javascript
State.withUndo = true
State.undoKit.setLimit(150)

firstnameState.set("Maria");
console.log(fullnameState.get());
// Output: Computed.
// Fullname: Maria Doe

State.undo()
console.log(fullnameState.get());
// Output: Computed.
// Fullname: John Doe

State.redo()
console.log(fullnameState.get());
// Output: Computed.
// Fullname: Maria Doe
```

Actions can be undone and redone simply by calling static undo and redo functions as shown above. Also history limit can be changed from static undokit object stored in the State. Please check [UndoKit](https://github.com/firatkiral/UndoKit) library for more info about undo management.

StateConnect supports async computations. Computation function might do some server side calls etc. that requires async operation.

```javascript
var userIdState = new State("usr324563");
var userObjAsyncState = new State();
userIdState.connect(userObjAsyncState)

userObjAsyncState.setComputeAsyncFn((userId) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve({
                uId: "usr324563",
                firstname: "John",
                lastname: "Doe"
            });
        }, 2000);
    });
});

userObjAsyncState.getAsync().then((res) => {
    console.log("resultAsync: ", res);
});
// Output: resultAsync:  { uId: 'usr324563', firstname: 'John', lastname: 'Doe' }
```

To be able to do async computations we need to use `setComputeAsyncFn` and `getAsync` functions. Compute function must return promise object as shown above. setTimeout function is used here test purposes to simulate server call delay. We call async state values by getAsync function.


# StateMesh - A State Manager for JavaScript

This library allows following or subscribing state changes in application.
Any change on the state will be notified to subscribers, so subscribers can update theirselves accordingly.
Scalable state trees can be created by connecting them each other.

## Install 
For nodejs application it can be installed from npm:
```shell
$ npm install statemesh
```

Nodejs:
```javascript
const { Binding, State } = require("statemesh")
```

Or:
```javascript
const { Binding, State } = require("./path-to-module/statemesh.js")
```


Web:
```javascript
<script src="https://cdn.jsdelivr.net/npm/statemesh@latest/dist/statemesh.min.js"> </script>
```

Es6,
```javascript
<script type="module">
    import { Binding, State } from "https://cdn.jsdelivr.net/npm/statemesh@latest/dist/statemesh.module.js"
</script>
```

## Node Usage

### Creating simple state:

```javascript
const { Binding, State } = require("statemesh")

var userState = new State({
    username: 'johndoe',
    email: 'johndoe@example.com',
    membership: 'basic'
});

// Subscribe to changes on userState, this way we'll be notified any time nameState is changed.
userState.addSubscriber(user => {
    console.log(`User has been updated:\n`, user);
});

// Change membership
userState.set({
    ...userState.get(), 
    membership: 'platinium'
});
// Output: User has been updated: 
// {
//     username: 'johndoe',
//     email: 'johndoe@example.com',
//     membership: 'platinium'
// }
```

We create state by just giving an initial value. In this case we have user object which holds our user properties. When we set new value to userState, subscriber is notified and prints new user object. It passes state itself as a parameter to addSubscriber function. This way we can get state value inside the function scope.

### Connecting states and setting custom computation:
We are not limited to one state object that holds all states. We can create micro states for each property and connect them to one final state. This way whenever micro state is changed, final state will update itself automatically and return array that holds all connected values by connection order. This will allow us freedom to update micro states individually without touching other states and prevent accidental value updates for other states.

```javascript
var usernameState = new State("johndoe");
var emailState = new State("johndoe@example.com");
var membershipState = new State("basic");

var userState = new Binding();
userState.addInput(usernameState, emailState, membershipState);

console.log(userState.get());
// [ 'johndoe', 'johndoe@example.com', 'basic' ]
```

We can also set custom computation function. This way when final state will update itself by the given compute function.

```javascript
userState.setComputeFn((username, email, membership) => {
    console.log("Computed.");
    return {
        username,
        email,
        membership
    };
});

console.log(userState.get());
// Output: Computed.
// {
//     username: 'johndoe',
//     email: 'johndoe@example.com',
//     membership: 'basic'
// }

membershipState.set('platinium')
console.log(userState.get());
// Output:  Computed.
// {
//     username: 'johndoe',
//     email: 'johndoe@example.com',
//     membership: 'platinium'
// }
```

Compute function will receive all connected state values as parameter with the connection order. In this example `setComputeFn` passes usernameState, emailState and membershipState as parameter since these are the only connected states.

Another thing is StateMesh uses lazy evaluation algorithm. It means value won't be computed until it is called. It will be computed only once at the first call. Any other consecutive calls will receive cached value. This saves lots of computation power and time if app has heavy calculations or has too many states. If we try to call userstate again you'll notice that it wont print 'Computed.' again since its calling it from cache.

```javascript
// It will return the cached value since nothing is changed and wont print 'Computed.'.
console.log(userState.get());
// Output:
// {
//     username: 'johndoe',
//     email: 'johndoe@example.com',
//     membership: 'platinium'
// }
```

 ### Async computation:
StateMesh supports async computations where application needs to do some server side calls etc. that requires async operation.

```javascript
var userIdState = new State("usr324563");
var userObjAsyncState = new Binding();
userIdState.connect(userObjAsyncState)

userObjAsyncState.setComputeFn((userId) => {
    return new Promise((resolve, reject) => {
        // Assume we made server call and received new user object
        setTimeout(() => {
            resolve({
                uId: "usr324563",
                firstname: "John",
                lastname: "Doe"
            });
        }, 2000);
    });
});

userObjAsyncState.get().then((res) => {
    console.log("resultAsync: ", res);
});
// Output: resultAsync:  { uId: 'usr324563', firstname: 'John', lastname: 'Doe' }
```

Compute function must return promise object as shown above. `setTimeout` function is used here for test purposes to simulate server call delay. We call async state values by getAsync function.

## Web Usage
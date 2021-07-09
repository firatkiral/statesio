const { State } = require("../../dist/stateConnect.cjs");

//** ### Creating simple state */
var userState = new State({
    username: 'johndoe',
    email: 'johndoe@example.com',
    membership: 'basic'
});

// Subscribe to changes on userState, this way we'll be notified any time userState is changed.
userState.subscribe((state) => {
    console.log(`User has been updated:\n`, state.get());
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


//** ### Connecting states and setting custom computation */
var usernameState = new State("johndoe");
var emailState = new State("johndoe@example.com");
var membershipState = new State("basic");

var userState = new State();
userState.addHook(usernameState, emailState, membershipState);

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

// It will return the cached value since nothing is changed and wont print 'Computed.'.
console.log(userState.get());
// Output:
// {
//     username: 'johndoe',
//     email: 'johndoe@example.com',
//     membership: 'platinium'
// }

//** ### Undo/Redo history */
State.withUndo = true
State.undoKit.setLimit(150)

State.undo();
console.log("Action undone: \n",userState.get());
// Output: Computed.
// Action undone:
//  {
//   username: 'johndoe',
//   email: 'johndoe@example.com',
//   membership: 'basic'
// }

State.redo();
console.log("Action redone: \n",userState.get());
// Output: Computed.
// Action redone:
//  {
//   username: 'johndoe',
//   email: 'johndoe@example.com',
//   membership: 'platinium'
// }

//** ### Async computation */
var userIdState = new State("usr324563");
var userObjAsyncState = new State();
userIdState.hook(userObjAsyncState);

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

class Vector3 {
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
    toString() {
        return "Vector3{" +
            "x=" + this.x +
            ", y=" + this.y +
            ", z=" + this.z +
            '}';
    }
}

var vec1 = new State(new Vector3(1, 1, 1));
var vec2 = new State(new Vector3(2, 2, 2));
var weight = new State(2);

var multiplyState = new State();
multiplyState.addHook(vec1, vec2, weight);

multiplyState.setComputeFn((v1, v2, w) => {
    var out = new Vector3(v1.x * v2.x * w, v1.y * v2.y * w, v1.z * v2.z * w);
    console.log("output computed:", out);
    return out;
});

console.log(multiplyState.get());
console.log(multiplyState.get());

weight.set(5);
console.log(multiplyState.get());
console.log(multiplyState.get());

multiplyState.subscribe((state) => {
    console.log("first subscriber: state changed");
});

multiplyState.subscribe((state) => {
    console.log("first subscriber: " + state.get());
});

weight.set(6);

multiplyState = new State();
multiplyState.addHook(vec1, vec2, weight);

multiplyState.setComputeAsyncFn((v1, v2, w) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            let out = new Vector3(v1.x * v2.x * w, v1.y * v2.y * w, v1.z * v2.z * w);
            resolve(out);
        }, 3000);
    });
});

multiplyState.getAsync().then((res) => {
    console.log("resultAsync: ", res);
});

console.log("result: ", multiplyState.get());

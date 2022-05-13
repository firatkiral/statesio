const { Binding, State, StateMesh } = require("../../dist/statemesh.js");

//** ### Creating simple state */
var userState = new State({
    username: 'johndoe',
    email: 'johndoe@example.com',
    membership: 'basic'
});

// Subscribe to changes on userState, this way we'll be notified any time userState is changed.
userState.addChangeListener(user => {
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


//** ### Connecting states and setting custom computation */
var usernameState = new State("johndoe");
var emailState = new State("johndoe@example.com");
var membershipState = new State("basic");

var userState = new Binding();
userState.addState(usernameState, emailState, membershipState);

console.log(userState.get());
// [ 'johndoe', 'johndoe@example.com', 'basic' ]

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

//** ### Async computation */
var userIdState = new State("usr324563");
var userObjAsyncState = new Binding();
userObjAsyncState.addState(userIdState)

userObjAsyncState.setComputeFn((userId) => {
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

userObjAsyncState.get().then((res) => {
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

var vec1 = new State(new Vector3(1, 1, 1), "vec1");
var vec2 = new State(new Vector3(2, 2, 2), "vec2");
var weight = new State(2, "w");

var multiplyState = new Binding();
multiplyState.addState(vec1, vec2, weight);

// These inputs can be called by their name.
console.log(multiplyState.vec1.get());
console.log(multiplyState.vec2.get());
console.log(multiplyState.w.get());

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

multiplyState.addChangeListener((state) => {
    console.log("first subscriber: state changed");
});

multiplyState.addChangeListener(val => {
    console.log("first subscriber: " + val);
});

weight.set(6);

multiplyState = new Binding();
multiplyState.addState(vec1, vec2, weight);

multiplyState.setComputeFn(async (v1, v2, w) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            let out = new Vector3(v1.x * v2.x * w, v1.y * v2.y * w, v1.z * v2.z * w);
            resolve(out);
        }, 3000);
    });
});

multiplyState.get().then((res) => {
    console.log("resultAsync: ", res);
});

console.log("result: ", multiplyState.get());


let statemesh = new StateMesh();
statemesh.addState(vec1, vec2, weight);
console.log("statemesh: ", statemesh.get());
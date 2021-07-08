const { State } = require("../../dist/stateConnect.cjs");

var firstnameState = new State("John");

firstnameState.subscribe(() => {
    console.log(`Firstname changed to: ${firstnameState.get()}`);
});

firstnameState.set(("Doe"))
// output: Firstname changed to: Doe



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

State.withUndo = true
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
vec1.connect(multiplyState);
vec2.connect(multiplyState);
weight.connect(multiplyState);

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
vec1.connect(multiplyState);
vec2.connect(multiplyState);
weight.connect(multiplyState);

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

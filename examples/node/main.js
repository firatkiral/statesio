const { State } = require("../../dist/stateConnect.js");

let firstnameState = new State("John");
let lastnameState = new State("Doe");

let fullnameState = new State();
firstnameState.connect(fullnameState);
lastnameState.connect(fullnameState);

fullnameState.setComputeFn((firstname, lastname) => {
    console.log("computed");
    return `${firstname} ${lastname}`;
});

console.log(fullnameState.get());
console.log(fullnameState.get());

firstnameState.set("Maria");
console.log(fullnameState.get());
console.log(fullnameState.get());

State.undo();
State.undo();
console.log(fullnameState.get());
console.log(fullnameState.get());

State.redo();
State.redo();
console.log(fullnameState.get());
console.log(fullnameState.get());

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

let vec1 = new State(new Vector3(1, 1, 1));
let vec2 = new State(new Vector3(2, 2, 2));
let weight = new State(2);

let multiplyState = new State();
vec1.connect(multiplyState);
vec2.connect(multiplyState);
weight.connect(multiplyState);

multiplyState.setComputeFn((v1, v2, w) => {
    let out = new Vector3(v1.x * v2.x * w, v1.y * v2.y * w, v1.z * v2.z * w);
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

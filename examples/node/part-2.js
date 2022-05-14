const { Binding, State, StateMesh } = require("../../dist/statemesh.js");


//** ### Connecting states and setting custom computation */
// Sometimes you want to compute a value based on the values of other states. 
// You can use the Binding class that allows you to set custom computation function for this purpose.
// In this example we'll do some basic vector computations by linearly interpolating two vectors.

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

// When we change any state, the binding will be updated by calling the compute function.
t.set(.8);

// All consecutive get() calls receive cached value until any state is changed again.
// This will give us performance boost when you have a lot of heavy computations.
// Following get() call won't trigger computation and wont print "output computed".
console.log(multiplyState.get());
// output:
// Vector { x: 1.2, y: 1.2 }
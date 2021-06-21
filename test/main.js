const {State} = require("../build/stateConnect.js");

let firstnameState = new State("firat");
let lastnameState = new State("kiral");

let fullnameState = new State();
firstnameState.connect(fullnameState);
lastnameState.connect(fullnameState);

fullnameState.setComputeFn((firstname, lastname) => {
    console.log("computed");
    return `${firstname} ${lastname}`;
});

console.log(fullnameState.get())
console.log(fullnameState.get())

firstnameState.set("ece")
console.log(fullnameState.get())
console.log(fullnameState.get())
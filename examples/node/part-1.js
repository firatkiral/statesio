const { State, StateGroup } = require("../../dist/statemesh.js");

// ### Getting Started

//Create a simple state */
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

// Let's try nested states here, StateGroup is the container for all states.
// We can create a tree of states by adding child StateMeshes.
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

// We can get all structured data by calling get() on the root StateGroup.
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

// Say we have UI engine and it needs to update itself based on the setting state changes.
// Adding a listener to the appState won't make sense, because all other state changes will trigger UI update and 
// it will cause unnecessary overhead on the UI Engine. Instead we can add a change listener to the settings state.
appState.project.settings.theme.addChangeListener(theme => {
    console.log("Dark mode has been updated: ", theme);
})

appState.project.settings.theme.set("dark");
// output: 
// Dark mode has been updated: dark


// Its possible add listener to the settings state, you'll get all settings at once by calling get() on the settings state.
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




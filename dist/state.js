"use strict";
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _State_name, _Binding_inputs, _Binding_computeDefault, _Binding_compute;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Binding = exports.State = void 0;
class State {
    constructor(cache) {
        this.valid = true;
        this.subscribers = [];
        _State_name.set(this, '');
        this.hook = () => this.invalidate();
        this.cache = cache;
    }
    setName(name) {
        __classPrivateFieldSet(this, _State_name, name, "f");
        return this;
    }
    getName() {
        return __classPrivateFieldGet(this, _State_name, "f");
    }
    addSubscriber(listener, id) {
        if (this.subscribers.indexOf(listener) === -1) {
            this.subscribers.push(listener);
            listener(this.get());
        }
        return {
            listener: listener,
            destroy: () => {
                this.removeSubscriber(listener);
            }
        };
    }
    removeSubscriber(listener) {
        let index = this.subscribers.indexOf(listener);
        if (index !== -1) {
            this.subscribers.splice(index, 1);
        }
        return this;
    }
    clearSubscribers() {
        for (let idx in this.subscribers) {
            this.removeSubscriber(this.subscribers[0]);
        }
        return this;
    }
    validate() {
        if (!this.valid) {
            this.valid = true;
            this.onValidate();
        }
    }
    invalidate() {
        if (this.valid) {
            this.valid = false;
            this.onInvalidate();
            for (let listener of this.subscribers) {
                listener(this.get());
            }
        }
    }
    onInvalidate() { }
    onValidate() { }
    connect(other) {
        other.setConnection(this);
        return this;
    }
    setConnection(incoming) {
        var _a;
        (_a = this.incoming) === null || _a === void 0 ? void 0 : _a.removeSubscriber(this.hook);
        this.incoming = undefined;
        if (incoming) {
            this.incoming = incoming;
            incoming.addSubscriber(this.hook);
        }
        this.invalidate();
        return this;
    }
    isConnected() {
        return !!this.incoming;
    }
    getIncoming() {
        return this.incoming;
    }
    set(newValue) {
        this.cache = newValue;
        this.invalidate();
        return this;
    }
    get() {
        if (!this.valid) {
            this.cache = this.incoming ? this.incoming.get() : this.cache;
            this.validate();
        }
        return this.cache;
    }
}
exports.State = State;
_State_name = new WeakMap();
class Binding extends State {
    constructor() {
        super(...arguments);
        _Binding_inputs.set(this, []);
        _Binding_computeDefault.set(this, (...args) => this.incoming ? this.incoming.get() : this.cache);
        _Binding_compute.set(this, __classPrivateFieldGet(this, _Binding_computeDefault, "f"));
    }
    addInput(...inputs) {
        inputs.forEach(input => {
            input.addSubscriber(this.hook);
            __classPrivateFieldGet(this, _Binding_inputs, "f").push(input);
        });
        this.invalidate();
        return this;
    }
    removeInput(...inputs) {
        inputs.forEach(input => {
            let idx = __classPrivateFieldGet(this, _Binding_inputs, "f").indexOf(input);
            idx > -1 && this.removeInputAt(idx);
        });
        return this;
    }
    removeInputAt(idx) {
        __classPrivateFieldGet(this, _Binding_inputs, "f")[idx].removeSubscriber(this.hook);
        __classPrivateFieldGet(this, _Binding_inputs, "f").splice(idx, 1);
        this.invalidate();
        return this;
    }
    clearInputs() {
        for (let idx in __classPrivateFieldGet(this, _Binding_inputs, "f")) {
            this.removeInputAt(0);
        }
        return this;
    }
    getInputs() {
        return __classPrivateFieldGet(this, _Binding_inputs, "f");
    }
    set(newValue) {
        // does nothing, its here to override default invalidation
        return this;
    }
    get() {
        if (!this.valid) {
            this.cache = this.compute(...__classPrivateFieldGet(this, _Binding_inputs, "f").map(input => input.get()));
            this.validate();
        }
        return this.cache;
    }
    // It can be overriden by subclass or setComputeFn can be used directly from this class
    compute(...args) {
        return __classPrivateFieldGet(this, _Binding_compute, "f").call(this, ...args);
    }
    setComputeFn(computeFn) {
        __classPrivateFieldSet(this, _Binding_compute, computeFn ? computeFn : __classPrivateFieldGet(this, _Binding_computeDefault, "f"), "f");
        this.invalidate();
        return this;
    }
}
exports.Binding = Binding;
_Binding_inputs = new WeakMap(), _Binding_computeDefault = new WeakMap(), _Binding_compute = new WeakMap();

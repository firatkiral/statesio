var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
var _State_inputs, _State_hook, _State_cache, _State_compute, _State_computeAsync;
import { UndoKit } from "undokit";
export class State {
    constructor(cache) {
        this.valid = true;
        this.subscribers = [];
        _State_inputs.set(this, []);
        _State_hook.set(this, () => this.invalidate());
        _State_cache.set(this, void 0);
        _State_compute.set(this, () => __classPrivateFieldGet(this, _State_cache, "f"));
        _State_computeAsync.set(this, () => new Promise((resolve) => resolve(__classPrivateFieldGet(this, _State_cache, "f"))));
        __classPrivateFieldSet(this, _State_cache, cache, "f");
    }
    subscribe(listener) {
        if (this.subscribers.indexOf(listener) === -1) {
            this.subscribers.push(listener);
            if (!this.valid) {
                listener(this);
            }
        }
        else {
        }
        return this;
    }
    unsubscribe(listener) {
        let index = this.subscribers.indexOf(listener);
        if (index !== -1) {
            this.subscribers.splice(index, 1);
        }
        return this;
    }
    clearSubscribers() {
        for (let idx in this.subscribers) {
            this.unsubscribe(this.subscribers[0]);
        }
        return this;
    }
    validate() {
        if (!this.valid) {
            this.valid = true;
        }
    }
    invalidate() {
        if (this.valid) {
            this.valid = false;
            this.onInvalidate();
            for (let listener of this.subscribers) {
                listener(this);
            }
        }
    }
    onInvalidate() { }
    onValidate() { }
    isConnected() {
        return __classPrivateFieldGet(this, _State_inputs, "f").length > 0;
    }
    connect(input) {
        this.subscribe(__classPrivateFieldGet(input, _State_hook, "f"));
        __classPrivateFieldGet(input, _State_inputs, "f").push(this);
        input.invalidate();
    }
    disconnect(idx) {
        __classPrivateFieldGet(this, _State_inputs, "f")[idx].unsubscribe(__classPrivateFieldGet(this, _State_hook, "f"));
        __classPrivateFieldGet(this, _State_inputs, "f").splice(idx, 1);
        this.invalidate();
    }
    set(newValue) {
        if (State.withUndo) {
            let oldValue = __classPrivateFieldGet(this, _State_cache, "f");
            let setCmd = {
                redo: () => {
                    __classPrivateFieldSet(this, _State_cache, newValue, "f");
                    this.invalidate();
                },
                undo: () => {
                    __classPrivateFieldSet(this, _State_cache, oldValue, "f");
                    this.invalidate();
                }
            };
            State.undoKit.push(setCmd);
        }
        else {
            __classPrivateFieldSet(this, _State_cache, newValue, "f");
            this.invalidate();
        }
    }
    get() {
        if (!this.valid) {
            __classPrivateFieldSet(this, _State_cache, __classPrivateFieldGet(this, _State_compute, "f").call(this, ...__classPrivateFieldGet(this, _State_inputs, "f").map(input => input.get())), "f");
            this.validate();
            this.onValidate();
        }
        return __classPrivateFieldGet(this, _State_cache, "f");
    }
    setComputeFn(computeFn) {
        __classPrivateFieldSet(this, _State_compute, computeFn, "f");
    }
    getAsync() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                if (!this.valid) {
                    try {
                        __classPrivateFieldGet(this, _State_computeAsync, "f").call(this, ...__classPrivateFieldGet(this, _State_inputs, "f").map(input => input.get())).then((res) => {
                            __classPrivateFieldSet(this, _State_cache, res, "f");
                            this.validate();
                            this.onValidate();
                            resolve(__classPrivateFieldGet(this, _State_cache, "f"));
                        });
                    }
                    catch (error) {
                        reject(error);
                    }
                }
            });
        });
    }
    setComputeAsyncFn(computeAsyncFn) {
        __classPrivateFieldSet(this, _State_computeAsync, computeAsyncFn, "f");
    }
}
_State_inputs = new WeakMap(), _State_hook = new WeakMap(), _State_cache = new WeakMap(), _State_compute = new WeakMap(), _State_computeAsync = new WeakMap();
State.undoKit = new UndoKit();
State.withUndo = true;
State.undo = () => State.undoKit.undo();
State.redo = () => State.undoKit.redo();

"use strict";
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
var _State_name, _State_hooks, _State_incoming, _State_hook, _State_cache, _State_computeDefault, _State_compute, _State_computeAsyncDefault, _State_computeAsync;
Object.defineProperty(exports, "__esModule", { value: true });
exports.State = void 0;
class State {
    constructor(cache) {
        this.valid = true;
        this.postSubscribers = [];
        this.preSubscribers = [];
        _State_name.set(this, '');
        _State_hooks.set(this, []);
        _State_incoming.set(this, void 0);
        _State_hook.set(this, () => this.invalidate());
        _State_cache.set(this, void 0);
        _State_computeDefault.set(this, (...args) => __classPrivateFieldGet(this, _State_incoming, "f") ? __classPrivateFieldGet(this, _State_incoming, "f").get() : __classPrivateFieldGet(this, _State_cache, "f"));
        _State_compute.set(this, __classPrivateFieldGet(this, _State_computeDefault, "f"));
        _State_computeAsyncDefault.set(this, () => new Promise((resolve) => resolve((...args) => __classPrivateFieldGet(this, _State_incoming, "f") ? __classPrivateFieldGet(this, _State_incoming, "f").get() : __classPrivateFieldGet(this, _State_cache, "f"))));
        _State_computeAsync.set(this, () => new Promise((resolve) => resolve((...args) => __classPrivateFieldGet(this, _State_incoming, "f") ? __classPrivateFieldGet(this, _State_incoming, "f").get() : __classPrivateFieldGet(this, _State_cache, "f"))));
        __classPrivateFieldSet(this, _State_cache, cache, "f");
    }
    setName(name) {
        __classPrivateFieldSet(this, _State_name, name, "f");
        return this;
    }
    getName() {
        return __classPrivateFieldGet(this, _State_name, "f");
    }
    subscribe(listener, preChange = false) {
        preChange ? this._subscribePre(listener) : this._subscribePost(listener);
        return this;
    }
    _subscribePre(listener) {
        if (this.preSubscribers.indexOf(listener) === -1) {
            this.preSubscribers.push(listener);
        }
    }
    _subscribePost(listener) {
        if (this.postSubscribers.indexOf(listener) === -1) {
            this.postSubscribers.push(listener);
            if (!this.valid) {
                listener(this.get());
            }
        }
    }
    unsubscribe(listener) {
        let index = this.postSubscribers.indexOf(listener);
        if (index !== -1) {
            this.postSubscribers.splice(index, 1);
        }
        index = this.preSubscribers.indexOf(listener);
        if (index !== -1) {
            this.preSubscribers.splice(index, 1);
        }
        return this;
    }
    clearSubscribers() {
        for (let idx in this.postSubscribers) {
            this.unsubscribe(this.postSubscribers[0]);
        }
        return this;
    }
    validate() {
        if (!this.valid) {
            this.valid = true;
            this.onValidate();
        }
    }
    invalidatePre() {
        for (let listener of this.preSubscribers) {
            listener(this.get());
        }
    }
    invalidate() {
        if (this.valid) {
            this.valid = false;
            this.onInvalidate();
            for (let listener of this.postSubscribers) {
                listener(this.get());
            }
        }
    }
    onInvalidate() { }
    onValidate() { }
    isNode() {
        return __classPrivateFieldGet(this, _State_hooks, "f").length > 0;
    }
    hook(input) {
        this.subscribe(__classPrivateFieldGet(input, _State_hook, "f"));
        __classPrivateFieldGet(input, _State_hooks, "f").push(this);
        input.invalidate();
        return this;
    }
    addHook(...args) {
        args.forEach(input => {
            input.hook(this);
        });
        return this;
    }
    removeHook(idx) {
        __classPrivateFieldGet(this, _State_hooks, "f")[idx].unsubscribe(__classPrivateFieldGet(this, _State_hook, "f"));
        __classPrivateFieldGet(this, _State_hooks, "f").splice(idx, 1);
        this.invalidate();
        return this;
    }
    getHooks() {
        return __classPrivateFieldGet(this, _State_hooks, "f");
    }
    plug(incoming) {
        incoming.setPlug(this);
        this.invalidate();
        return this;
    }
    setPlug(incoming) {
        var _a;
        (_a = __classPrivateFieldGet(this, _State_incoming, "f")) === null || _a === void 0 ? void 0 : _a.unsubscribe(__classPrivateFieldGet(this, _State_hook, "f"));
        __classPrivateFieldSet(this, _State_incoming, undefined, "f");
        if (incoming) {
            __classPrivateFieldSet(this, _State_incoming, incoming, "f");
            incoming.subscribe(__classPrivateFieldGet(this, _State_hook, "f"));
        }
        this.invalidate();
        return this;
    }
    isPlugged() {
        return !!__classPrivateFieldGet(this, _State_incoming, "f");
    }
    getPlug() {
        return __classPrivateFieldGet(this, _State_incoming, "f");
    }
    set(newValue) {
        this.invalidatePre();
        __classPrivateFieldSet(this, _State_cache, newValue, "f");
        this.invalidate();
        return this;
    }
    get() {
        if (!this.valid) {
            __classPrivateFieldSet(this, _State_cache, __classPrivateFieldGet(this, _State_compute, "f").call(this, ...__classPrivateFieldGet(this, _State_hooks, "f").map(input => input.get())), "f");
            this.validate();
        }
        return __classPrivateFieldGet(this, _State_cache, "f");
    }
    setComputeFn(computeFn) {
        __classPrivateFieldSet(this, _State_compute, computeFn ? computeFn : __classPrivateFieldGet(this, _State_computeDefault, "f"), "f");
        this.invalidate();
        return this;
    }
    getAsync() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                if (!this.valid) {
                    try {
                        __classPrivateFieldGet(this, _State_computeAsync, "f").call(this, ...__classPrivateFieldGet(this, _State_hooks, "f").map(input => input.get())).then((res) => {
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
                else {
                    resolve(__classPrivateFieldGet(this, _State_cache, "f"));
                }
            });
        });
    }
    setComputeAsyncFn(computeAsyncFn) {
        __classPrivateFieldSet(this, _State_computeAsync, computeAsyncFn ? computeAsyncFn : __classPrivateFieldGet(this, _State_computeAsyncDefault, "f"), "f");
        this.invalidate();
        return this;
    }
}
exports.State = State;
_State_name = new WeakMap(), _State_hooks = new WeakMap(), _State_incoming = new WeakMap(), _State_hook = new WeakMap(), _State_cache = new WeakMap(), _State_computeDefault = new WeakMap(), _State_compute = new WeakMap(), _State_computeAsyncDefault = new WeakMap(), _State_computeAsync = new WeakMap();

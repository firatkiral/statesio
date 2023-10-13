type Listener = () => void;
type ChangeListener<K> = (val: K | undefined) => void;



export class State<T>{
    valid: boolean = true;
    private changeListeners: Array<(property: T | undefined) => void> = [];
    private listeners: Array<Listener> = [];

    incoming?: State<T>;
    protected hook: (property: T | undefined) => void = () => this.invalidate();
    protected cache?: T;

    #name: string;

    constructor(name?: string, cache?: T) {
        this.cache = cache;
        this.#name = name || '';
    }

    setName(name: string) {
        this.#name = name;
        return this;
    }

    getName() {
        return this.#name;
    }

    /**
     * Listeners are called with new value by validating the state when state is changed.
     * @param listener 
     * @returns Object with listener and destroy method
     */
    subscribe(listener: ChangeListener<T>) {
        if (this.changeListeners.indexOf(listener) === -1) {
            this.changeListeners.push(listener);
        }

        return {
            listener,
            destroy: () => {
                this.removeSubscriber(listener);
            }
        };
    }

    removeSubscriber(listener: ChangeListener<T>) {
        let index = this.changeListeners.indexOf(listener);
        if (index !== -1) {
            this.changeListeners.splice(index, 1);
        }

        return this;
    }

    clearSubscribers() {
        for (let idx in this.changeListeners) {
            this.removeSubscriber(this.changeListeners[0]);
        }
        return this;
    }

    /**
     * Listeners are called when state is invalidated without validation of the state. New value is not passed to the listener.
     * @param listener 
     * @returns Object with listener and destroy method
     */
    listen(listener: Listener) {
        if (this.listeners.indexOf(listener) === -1) {
            this.listeners.push(listener);
        }

        return {
            listener: listener,
            destroy: () => {
                this.removeSubscriber(listener);
            }
        };
    }

    removeListener(listener: Listener) {
        let index = this.listeners.indexOf(listener);
        if (index !== -1) {
            this.listeners.splice(index, 1);
        }

        return this;
    }

    clearListeners() {
        for (let idx in this.listeners) {
            this.removeSubscriber(this.listeners[0]);
        }
        return this;
    }

    isValid() {
        return this.valid;
    }

    protected validate() {
        if (!this.valid) {
            this.valid = true;
            this.onValidate();
        }
    }

    protected invalidate() {
        if (this.valid) {
            this.valid = false;
            this.onInvalidate();

            for (let listener of this.listeners) {
                listener();
            }
        }
        for (let listener of this.changeListeners) {
            listener(this.get());
        }
    }

    onInvalidate() { }

    onValidate() { }

    connect(other: State<T>) {
        other.setConnection(this);
        return this;
    }

    setConnection(incoming?: State<T>) {
        this.incoming?.removeSubscriber(this.hook);
        this.incoming = undefined;

        if (incoming) {
            this.incoming = incoming;
            incoming.subscribe(this.hook);
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

    set(newValue: T, invalidate = true) {
        this.cache = newValue;
        invalidate ? this.invalidate() : this.valid = false;
        return this;
    }

    get(): T | undefined {
        if (!this.valid) {
            this.cache = this.incoming ? this.incoming.get() : this.cache;
            this.validate();
        }
        return this.cache;
    }
}


export class StateGroup extends State<any> {
    [key: string]: any;
    #inputs: State<any>[] = [];

    constructor(name?: string, computeFn?: (...args: any) => any) {
        super(name);
        this.setComputeFn(computeFn);
    }

    addState(...inputs: State<any>[]) {
        inputs.forEach(input => {
            input.subscribe(this.hook);
            this.#inputs.push(input);
            this[input.getName()] = input;
        });
        this.invalidate();
        return this;
    }

    removeState(...inputs: State<any>[]) {
        inputs.forEach(input => {
            let idx = this.#inputs.indexOf(input);
            idx > -1 && this.removeStateAt(idx);
        });
        return this;
    }

    removeStateAt(idx: number) {
        delete this[this.#inputs[idx].getName()];
        this.#inputs[idx].removeSubscriber(this.hook);
        this.#inputs.splice(idx, 1);
        this.invalidate();
        return this;
    }

    clearStates() {
        for (let idx in this.#inputs) {
            this.removeStateAt(0);
        }
        return this;
    }

    getStates() {
        return this.#inputs;
    }


    set(newValue: any, invalidate = true) {
        Object.keys(newValue).forEach(key => {
            this[key].set(newValue[key], false);
        });
        invalidate ? this.invalidate() : this.valid = false;
        return this;
    }


    get() {
        if (!this.valid) {
            this.cache = this.compute(...this.#inputs.map(input => input.get()));
            this.validate();
        }
        return this.cache;
    }

    // It can be overriden by subclass or setComputeFn can be used directly from this class
    compute(...args: any) {
        return this.#compute(...args);
    }

    #computeDefault = (...args: any) => {
        if (this.incoming) return this.incoming.get();

        let res: any = {};
        for (const state of this.getStates()) {
            res[state.getName()] = state.get();
        }
        return res;
    };
    #compute: (...args: any) => any = this.#computeDefault;

    setComputeFn(computeFn?: (...args: any) => any) {
        this.#compute = computeFn ? computeFn : this.#computeDefault;
        this.invalidate();
        return this;
    }
}
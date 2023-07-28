declare type Listener = () => void;
declare type ChangeListener<K> = (val: K | undefined) => void;
export declare class State<T> {
    #private;
    valid: boolean;
    private changeListeners;
    private listeners;
    incoming?: State<T>;
    protected hook: (property: T | undefined) => void;
    protected cache?: T;
    constructor(name?: string, cache?: T);
    setName(name: string): this;
    getName(): string;
    /**
     * Listeners are called with new value by validating the state when state is changed.
     * @param listener
     * @returns Object with listener and destroy method
     */
    subscribe(listener: ChangeListener<T>): {
        listener: ChangeListener<T>;
        destroy: () => void;
    };
    removeSubscriber(listener: ChangeListener<T>): this;
    clearSubscribers(): this;
    /**
     * Listeners are called when state is invalidated without validation of the state. New value is not passed to the listener.
     * @param listener
     * @returns Object with listener and destroy method
     */
    listen(listener: Listener): {
        listener: Listener;
        destroy: () => void;
    };
    removeListener(listener: Listener): this;
    clearListeners(): this;
    isValid(): boolean;
    protected validate(): void;
    protected invalidate(): void;
    onInvalidate(): void;
    onValidate(): void;
    connect(other: State<T>): this;
    setConnection(incoming?: State<T>): this;
    isConnected(): boolean;
    getIncoming(): State<T> | undefined;
    set(newValue: T): this;
    get(): T | undefined;
}
export declare class StateGroup extends State<any> {
    #private;
    [key: string]: any;
    constructor(name?: string, computeFn?: (...args: any) => any);
    addState(...inputs: State<any>[]): this;
    removeState(...inputs: State<any>[]): this;
    removeStateAt(idx: number): this;
    clearStates(): this;
    getStates(): State<any>[];
    set(newValue: any): this;
    get(): any;
    compute(...args: any): any;
    setComputeFn(computeFn?: (...args: any) => any): this;
}
export {};

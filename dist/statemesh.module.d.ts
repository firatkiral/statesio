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
    addChangeListener(listener: (val: T | undefined) => void): {
        listener: (val: T | undefined) => void;
        destroy: () => void;
    };
    removeChangeListener(listener: (val: T | undefined) => void): this;
    clearChangeListeners(): this;
    addInvalidationListener(listener: () => void): {
        listener: () => void;
        destroy: () => void;
    };
    removeInvalidationListener(listener: () => void): this;
    clearInvalidationListeners(): this;
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

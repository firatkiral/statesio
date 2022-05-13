export declare class State<T> {
    #private;
    valid: boolean;
    private changeListeners;
    private listeners;
    incoming?: State<T>;
    protected hook: (property: T | undefined) => void;
    protected cache?: T;
    constructor(cache?: T, name?: string);
    setName(name: string): this;
    getName(): string;
    addChangeListener(listener: (val: T | undefined) => void, id?: string): {
        listener: (val: T | undefined) => void;
        destroy: () => void;
    };
    removeChangeListener(listener: (val: T | undefined) => void): this;
    clearChangeListeners(): this;
    addListener(listener: () => void, id?: string): {
        listener: () => void;
        destroy: () => void;
    };
    removeListener(listener: () => void): this;
    clearListeners(): this;
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
export declare class Binding<T> extends State<T> {
    #private;
    [key: string]: any;
    constructor(computeFn?: (...args: any) => T | undefined, name?: string);
    addState(...inputs: State<any>[]): this;
    removeState(...inputs: State<any>[]): this;
    removeStateAt(idx: number): this;
    clearStates(): this;
    getStates(): State<any>[];
    set(newValue: T): this;
    get(): T | undefined;
    compute(...args: any): T | undefined;
    setComputeFn(computeFn?: (...args: any) => T | undefined): this;
}
interface Mesh {
    [key: string]: any;
}
export declare class StateMesh extends Binding<Mesh> {
    constructor(name: string);
    compute(...args: any): Mesh;
}
export {};

export declare class State<T> {
    #private;
    valid: boolean;
    private subscribers;
    incoming?: State<T>;
    protected hook: (property: T | undefined) => void;
    protected cache?: T;
    constructor(cache?: T);
    setName(name: string): this;
    getName(): string;
    addSubscriber(listener: (val: T | undefined) => void, id?: string): {
        listener: (val: T | undefined) => void;
        destroy: () => void;
    };
    removeSubscriber(listener: (val: T | undefined) => void): this;
    clearSubscribers(): this;
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
    addInput(...inputs: State<any>[]): this;
    removeInput(...inputs: State<any>[]): this;
    removeInputAt(idx: number): this;
    clearInputs(): this;
    getInputs(): State<any>[];
    set(newValue: T): this;
    get(): T | undefined;
    compute(...args: any): T | undefined;
    setComputeFn(computeFn?: (...args: any) => T | undefined): this;
}

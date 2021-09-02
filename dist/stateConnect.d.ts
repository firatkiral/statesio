export declare class State<T> {
    #private;
    valid: boolean;
    private subscribers;
    constructor(cache?: T);
    setName(name: string): this;
    getName(): string;
    addSubscriber(listener: (property: T | undefined) => void): void;
    removeSubscriber(listener: (property: T | undefined) => void): this;
    clearSubscribers(): this;
    protected validate(): void;
    protected invalidate(): void;
    onInvalidate(): void;
    onValidate(): void;
    addInput(...inputs: State<any>[]): this;
    removeInput(idx: number): this;
    clearInputs(): this;
    getInputs(): State<any>[];
    connect(other: State<T>): this;
    setConnection(incoming?: State<T>): this;
    isConnected(): boolean;
    getIncoming(): State<T> | undefined;
    set(newValue: T): this;
    get(): T | undefined;
    setComputeFn(computeFn?: (...args: any) => T | undefined): this;
    getAsync(): Promise<T>;
    setComputeAsyncFn(computeAsyncFn?: (...args: any) => Promise<T>): this;
}

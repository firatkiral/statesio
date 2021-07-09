import { UndoKit } from "undokit";
export declare class State<T> {
    #private;
    valid: boolean;
    private subscribers;
    static undoKit: UndoKit;
    static withUndo: boolean;
    static undo: () => void;
    static redo: () => void;
    constructor(cache?: T);
    subscribe(listener: (state: State<T>) => void): this;
    unsubscribe(listener: (state: State<T>) => void): this;
    clearSubscribers(): this;
    protected validate(): void;
    protected invalidate(): void;
    onInvalidate(): void;
    onValidate(): void;
    isHooked(): boolean;
    hook(input: State<T>): this;
    addHook(...args: State<T>[]): this;
    removeHook(idx: number): this;
    set(newValue: T): this;
    get(): T | undefined;
    setComputeFn(computeFn: (...args: any) => T): this;
    getAsync(): Promise<T>;
    setComputeAsyncFn(computeAsyncFn: (...args: any) => Promise<T>): this;
}

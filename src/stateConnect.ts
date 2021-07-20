import {UndoKit} from "undokit"

export class State<T>{
    valid: boolean = true
    private subscribers: Array<(state: State<T>) => void> = []

    #inputs: State<any>[] = []
    #hook: (state: State<T>) => void = () => this.invalidate()
    #cache?: T | any[]

    static undoKit = new UndoKit()
    static withUndo = true
    static undo = () => State.undoKit.undo()
    static redo = () => State.undoKit.redo()

    constructor(cache?: T) {
        this.#cache = cache
    }

    subscribe(listener: (state: State<T>) => void) {
        if (this.subscribers.indexOf(listener) === -1) {
            this.subscribers.push(listener)
            if (!this.valid) {
                listener(this)
            }
        } else {
        }
        return this
    }

    unsubscribe(listener: (state: State<T>) => void) {
        let index: number = this.subscribers.indexOf(listener)

        if (index !== -1) {
            this.subscribers.splice(index, 1)
        }

        return this
    }

    clearSubscribers() {
        for (let idx in this.subscribers) {
            this.unsubscribe(this.subscribers[0])
        }
        return this
    }

    protected validate() {
        if (!this.valid) {
            this.valid = true
        }
    }

    protected invalidate() {
        if (this.valid) {
            this.valid = false
            this.onInvalidate()
            for (let listener of this.subscribers) {
                listener(this)
            }
        }
    }

    onInvalidate() { }

    onValidate() { }

    isHooked(): boolean {
        return this.#inputs.length > 0
    }

    hook(input: State<T>) {
        this.subscribe(input.#hook)
        input.#inputs.push(this)
        input.invalidate()
        return this
    }

    addHook(...args: State<T>[]){
        args.forEach(input=>{
            input.hook(this)
        })
        return this
    }

    removeHook(idx: number) {
        this.#inputs[idx].unsubscribe(this.#hook)
        this.#inputs.splice(idx, 1)
        this.invalidate()
        return this
    }

    set(newValue: T) {
        if(State.withUndo){
            let oldValue = this.#cache
            let setCmd = {
                redo:()=>{
                    this.#cache = newValue
                    this.invalidate()
                },
                undo:()=>{
                    this.#cache = oldValue
                    this.invalidate()
                }
            }
            State.undoKit.push(setCmd)
        }
        else{
            this.#cache = newValue
            this.invalidate()
        }
        return this
    }

    get() {
        if (!this.valid) {
            this.#cache = this.#compute(...this.#inputs.map(input => input.get()))
            this.validate()
            this.onValidate()

        }
        return this.#cache
    }

    #compute: (...args: any) => any[] | T | undefined = () => this.#inputs.length > 0 ? this.#inputs.map(input => input.get()) : this.#cache
    setComputeFn(computeFn?: (...args: any) => any[] | T) {
        this.#compute = computeFn ? computeFn : () => this.#inputs.length > 0 ? this.#inputs.map(input => input.get()) : this.#cache
        this.invalidate()
        return this
    }

    async getAsync() {
        return new Promise<T>((resolve: (value: any) => void, reject: (reason?: any) => void) => {
            if (!this.valid) {
                try {
                    this.#computeAsync(...this.#inputs.map(input => input.get())).then((res) => {
                        this.#cache = res
                        this.validate()
                        this.onValidate()
                        resolve(this.#cache)
                    })

                } catch (error) {
                    reject(error)
                }
            }
        })
    }

    #computeAsync: (...args: any) => Promise<T> = () => new Promise<T>((resolve:(value: any) => void) => resolve(this.#inputs.length > 0 ? this.#inputs.map(input => input.get()) : this.#cache))
    setComputeAsyncFn(computeAsyncFn?: (...args: any) => Promise<T>) {
        this.#computeAsync = computeAsyncFn ? computeAsyncFn : () => new Promise<T>((resolve:(value: any) => void) => resolve(this.#inputs.length > 0 ? this.#inputs.map(input => input.get()) : this.#cache))
        this.invalidate()
        return this
    }
}
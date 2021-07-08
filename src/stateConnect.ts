export class State<T>{
    valid: boolean = true
    private subscribers: Array<(state: State<T>) => void> = []

    #inputs: State<any>[] = []
    #hook: (state: State<T>) => void = () => this.invalidate()
    #cache?: T

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

    isConnected(): boolean {
        return this.#inputs.length > 0
    }

    connect(input: State<T>) {
        this.subscribe(input.#hook)
        input.#inputs.push(this)
        input.invalidate()
    }

    disconnect(idx: number) {
        this.#inputs[idx].unsubscribe(this.#hook)
        this.#inputs.splice(idx, 1)
        this.invalidate()
    }

    set(newValue: T) {
        this.#cache = newValue
        this.invalidate()
    }

    get() {
        if (!this.valid) {
            this.#cache = this.#compute(...this.#inputs.map(input => input.get()))
            this.validate()
            this.onValidate()

        }
        return this.#cache
    }

    #compute: (...args: any) => T | undefined = () => this.#cache

    setComputeFn(computeFn: (...args: any) => T) {
        this.#compute = computeFn
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

    #computeAsync: (...args: any) => Promise<T> = () => new Promise<T>((resolve:(value: any) => void) => resolve(this.#cache))
    setComputeAsyncFn(computeAsyncFn: (...args: any) => Promise<T>) {
        this.#computeAsync = computeAsyncFn
    }

}
export class State<T>{
    valid: boolean = true
    private subscribers: Array<(property: T | undefined) => void> = []

    #name = ''

    incoming?: State<T>
    protected hook: (property: T | undefined) => void = () => this.invalidate()
    protected cache?: T

    constructor(cache?: T) {
        this.cache = cache
    }

    setName(name: string) {
        this.#name = name
        return this
    }

    getName() {
        return this.#name
    }

    addSubscriber(listener: (val: T | undefined) => void, id?: string) {
        if (this.subscribers.indexOf(listener) === -1) {
            this.subscribers.push(listener)
            listener(this.get())
        }

        return {
            listener: listener,
            destroy: () => {
                this.removeSubscriber(listener)
            }
        }
    }

    removeSubscriber(listener: (val: T | undefined) => void) {
        let index = this.subscribers.indexOf(listener)
        if (index !== -1) {
            this.subscribers.splice(index, 1)
        }

        return this
    }

    clearSubscribers() {
        for (let idx in this.subscribers) {
            this.removeSubscriber(this.subscribers[0])
        }
        return this
    }

    protected validate() {
        if (!this.valid) {
            this.valid = true
            this.onValidate()
        }
    }

    protected invalidate() {
        if (this.valid) {
            this.valid = false
            this.onInvalidate()
            for (let listener of this.subscribers) {
                listener(this.get())
            }
        }
    }

    onInvalidate() { }

    onValidate() { }

    connect(other: State<T>) {
        other.setConnection(this)
        return this
    }

    setConnection(incoming?: State<T>) {
        this.incoming?.removeSubscriber(this.hook)
        this.incoming = undefined

        if (incoming) {
            this.incoming = incoming
            incoming.addSubscriber(this.hook)
        }

        this.invalidate()
        return this
    }

    isConnected() {
        return !!this.incoming
    }

    getIncoming() {
        return this.incoming
    }

    set(newValue: T) {
        this.cache = newValue
        this.invalidate()
        return this
    }

    get(): T | undefined {
        if (!this.valid) {
            this.cache = this.incoming ? this.incoming.get() : this.cache
            this.validate()
        }
        return this.cache
    }
}

export class Binding<T> extends State<T>{
    #inputs: State<any>[] = []

    addInput(...inputs: State<any>[]) {
        inputs.forEach(input => {
            input.addSubscriber(this.hook)
            this.#inputs.push(input)
        })
        this.invalidate()
        return this
    }

    removeInput(...inputs: State<any>[]) {
        inputs.forEach(input => {
            let idx = this.#inputs.indexOf(input)
            idx > -1 && this.removeInputAt(idx)
        })
        return this
    }

    removeInputAt(idx: number) {
        this.#inputs[idx].removeSubscriber(this.hook)
        this.#inputs.splice(idx, 1)
        this.invalidate()
        return this
    }

    clearInputs() {
        for (let idx in this.#inputs) {
            this.removeInputAt(0)
        }
        return this
    }

    getInputs() {
        return this.#inputs
    }

    
    set(newValue: T) {
        // does nothing, its here to override default invalidation
        return this
    }
    

    get() {
        if (!this.valid) {
            this.cache = this.compute(...this.#inputs.map(input => input.get()))
            this.validate()
        }
        return this.cache
    }

    // It can be overriden by subclass or setComputeFn can be used directly from this class
    compute(...args: any) {
        return this.#compute(...args)
    }

    #computeDefault = (...args: any) => this.incoming ? this.incoming.get() : this.cache
    #compute: (...args: any) => T | undefined = this.#computeDefault

    setComputeFn(computeFn?: (...args: any) => T | undefined) {
        this.#compute = computeFn ? computeFn : this.#computeDefault
        this.invalidate()
        return this
    }

}
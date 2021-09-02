export class State<T>{
    valid: boolean = true
    private postSubscribers: Array<(property: T | undefined) => void> = []
    private preSubscribers: Array<(property: T | undefined) => void> = []

    #name = ''

    #inputs: State<any>[] = []
    #incoming?: State<T>
    #hook: (property: T | undefined) => void = () => this.invalidate()
    #cache?: T

    constructor(cache?: T) {
        this.#cache = cache
    }

    setName(name: string) {
        this.#name = name
        return this
    }

    getName() {
        return this.#name
    }

    addSubscriber(listener: (property: T | undefined) => void, preChange = false) {
        preChange ? this._subscribePre(listener) : this._subscribePost(listener)
        return this
    }

    private _subscribePre(listener: (property: T | undefined) => void) {
        if (this.preSubscribers.indexOf(listener) === -1) {
            this.preSubscribers.push(listener)
        }
    }

    private _subscribePost(listener: (property: T | undefined) => void) {
        if (this.postSubscribers.indexOf(listener) === -1) {
            this.postSubscribers.push(listener)
            listener(this.get())
        }
    }

    removeSubscriber(listener: (property: T | undefined) => void) {
        let index = this.postSubscribers.indexOf(listener)
        if (index !== -1) {
            this.postSubscribers.splice(index, 1)
        }

        index = this.preSubscribers.indexOf(listener)
        if (index !== -1) {
            this.preSubscribers.splice(index, 1)
        }
        return this
    }

    clearSubscribers() {
        for (let idx in this.postSubscribers) {
            this.removeSubscriber(this.postSubscribers[0])
        }
        return this
    }

    protected validate() {
        if (!this.valid) {
            this.valid = true
            this.onValidate()
        }
    }

    protected invalidatePre() {
        for (let listener of this.preSubscribers) {
            listener(this.get())
        }
    }

    protected invalidate() {
        if (this.valid) {
            this.valid = false
            this.onInvalidate()
            for (let listener of this.postSubscribers) {
                listener(this.get())
            }
        }
    }

    onInvalidate() { }

    onValidate() { }

    addInput(...inputs: State<any>[]) {
        inputs.forEach(input => {
            input.addSubscriber(this.#hook)
            this.#inputs.push(input)
        })
        return this
    }

    removeInput(idx: number) {
        this.#inputs[idx].removeSubscriber(this.#hook)
        this.#inputs.splice(idx, 1)
        return this
    }

    getInputs() {
        return this.#inputs
    }

    connect(other: State<T>) {
        other.setConnection(this)
        return this
    }

    setConnection(incoming?: State<T>) {
        this.#incoming?.removeSubscriber(this.#hook)
        this.#incoming = undefined

        if (incoming) {
            this.#incoming = incoming
            incoming.addSubscriber(this.#hook)
        }

        this.invalidate()
        return this
    }

    isConnected() {
        return !!this.#incoming
    }

    getIncoming() {
        return this.#incoming
    }

    set(newValue: T) {
        this.invalidatePre()
        this.#cache = newValue
        this.invalidate()
        return this
    }

    get() {
        if (!this.valid) {
            this.#cache = this.#compute(...this.#inputs.map(input => input.get()))
            this.validate()
        }
        return this.#cache
    }

    #computeDefault = (...args: any) => this.#incoming ? this.#incoming.get() : this.#cache
    #compute: (...args: any) => T | undefined = this.#computeDefault

    setComputeFn(computeFn?: (...args: any) => T | undefined) {
        this.#compute = computeFn ? computeFn : this.#computeDefault
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
            }else{
                resolve(this.#cache)
            }
        })
    }

    #computeAsyncDefault = () => new Promise<T>((resolve:(value: any) => void) => resolve((...args: any) => this.#incoming ? this.#incoming.get() : this.#cache))
    #computeAsync: (...args: any) => Promise<T> = () => new Promise<T>((resolve:(value: any) => void) => resolve((...args: any) => this.#incoming ? this.#incoming.get() : this.#cache))
    setComputeAsyncFn(computeAsyncFn?: (...args: any) => Promise<T>) {
        this.#computeAsync = computeAsyncFn ? computeAsyncFn : this.#computeAsyncDefault
        this.invalidate()
        return this
    }
}
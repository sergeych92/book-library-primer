export class GetJsonRequest extends Promise {

    get wasCancelled() { return this._controller.signal.aborted; }

    constructor(requestUrl) {
        let controller = new AbortController();
        super(function myFunc(resolve, reject) {
            fetch(requestUrl, {
                signal: controller.signal
            })
                .then(r => r.json(), reject)
                .then(resolve, reject);
        });
        this._controller = controller;
    }

    cancel() {
        this._controller.abort();
    }
}

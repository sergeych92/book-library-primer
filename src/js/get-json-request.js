export class GetJsonRequest extends Promise {

    get wasCancelled() { return this._controller.signal.aborted; }

    static from(requestUrl) {
        let controller = new AbortController();
        let request = new GetJsonRequest((resolve, reject) => {
            fetch(requestUrl, {
                signal: controller.signal
            })
                .then(r => r.json(), reject)
                .then(resolve, reject);
        });
        request._controller = controller;
        return request;
    }

    cancel() {
        this._controller.abort();
    }
}

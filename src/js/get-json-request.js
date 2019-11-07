export class GetJsonRequest {

    // get wasCancelled() { return this._controller.signal.aborted; }

    // static from(requestUrl) {
    //     let controller = new AbortController();
    //     let request = new GetJsonRequest((resolve, reject) => {
    //         fetch(requestUrl, {
    //             signal: controller.signal
    //         })
    //             .then(r => r.json(), reject)
    //             .then(resolve, reject);
    //     });
    //     request._controller = controller;
    //     return request;
    // }

    // then(resolve, reject) {
    //     let pr = super.then(resolve, reject);
    //     pr._controller = this._controller;
    //     return pr;
    // }

    // cancel() {
    //     this._controller.abort();
    // }

    get wasCancelled() { return this._controller.signal.aborted; }

    constructor(requestUrl) {
        this._controller = new AbortController();
        this._request = fetch(requestUrl, {
            signal: this._controller.signal
        }).then(r => r.json());
    }

    then(onResolved, onRejected) {
        this._request = this._request.then(onResolved, onRejected);
        return this;
    }

    finally(onFinally) {
        this._request = this._request.finally(onFinally);
        return this;
    }

    catch(onRejected) {
        this._request = this._request.catch(onRejected);
        return this;
    }

    cancel() {
        this._controller.abort();
    }
}

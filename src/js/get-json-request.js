export class GetJsonRequest {

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

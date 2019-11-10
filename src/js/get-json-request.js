export class GetJsonRequest {

    get wasCancelled() { return this._controller.signal.aborted; }

    constructor(requestUrl) {
        if (typeof (requestUrl) === 'string') {
            this._controller = new AbortController();
            this._request = fetch(requestUrl, {
                signal: this._controller.signal
            }).then(r => r.json());
        } else {
            this._controller = requestUrl.controller;
            this._request = requestUrl.request;
        }
    }

    then(onResolved, onRejected) {
        return new GetJsonRequest({
            ...this.getState(),
            request: this._request.then(onResolved, onRejected)
        });
    }

    finally(onFinally) {
        return new GetJsonRequest({
            ...this.getState(),
            request: this._request.finally(onFinally)
        });
    }

    catch(onRejected) {
        return new GetJsonRequest({
            ...this.getState(),
            request: this._request.catch(onRejected)
        });
    }

    cancel() {
        this._controller.abort();
    }

    getState() {
        return {
            request: this._request,
            controller: this._controller
        };
    }
}

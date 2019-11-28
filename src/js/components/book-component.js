export class BookComponent {
    get element() { return this._element; }
    get removeStream() { return this._removeStream; }

    constructor() {
        this._element = null;
        this._removeStream = null;
        this._id = null;
    }

    bind({id, name, description, code}) {
        this._id = id;

        this._element = toDom`
            <li data-id=${id} class="book">
                <a class="remove-btn" href="#" (click)=${this._registerOnRemoveClick.bind(this)}></a>
                <div>
                    <div class="name">${name}</div>
                    <div>${description}</div>
                    <div>${code}</div>
                </div>
            </li>`;

        return {
            element: this._element,
            removeStream: this._removeStream
        };
    }

    _registerOnRemoveClick(stream) {
        stream.preventDefault = true;
        this._removeStream = stream.pipe().map(t => ({id: this._id}));
    }
}

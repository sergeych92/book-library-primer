import { BookComponent } from "./book-component";

export class BookListComponent {
    get element() { return this._element; }
    get removeStream() { this._removeStream; }

    constructor() {
        this._element = null;
        this._removeStream = null;
    }

    bind({bookList}) {
        this._element = toDom`
            <ul class="book-list">
                ${{
                    directive: 'for',
                    key: 'id',
                    variable: bookList,
                    component: BookComponent,
                    onCreate: component => {
                        // Add component to a list of forkJoin or something to react to its id change
                    },
                    onDelete: componet => {
                        // Remove the given component from the observable list
                    }
                }}
            </ul>`;
        
        return {
            element: this._element,
            removeStream: this._removeStream
        };
    }
}

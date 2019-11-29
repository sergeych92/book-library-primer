import { BookComponent } from "./book-component";
import { toDom } from "../dom-renderer/to-dom";

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
                        console.log('created');
                    },
                    onDelete: componet => {
                        // Remove the given component from the observable list
                        console.log('deleted');
                    }
                }}
            </ul>`;
        
        return {
            element: this._element,
            removeStream: this._removeStream
        };
    }
}

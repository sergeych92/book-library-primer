import { NameComponent } from "./name-component";
import { Subject } from "../stream/subject";
import { toDom } from "../dom-renderer/to-dom";

export class FormComponent {
    get element() {
        return this._element;
    }

    get submitStream() {
        return this._submitStream;
    }

    get formData() {
        return new FormData(this._element.querySelector('form'));
    }

    constructor() {
        this._store = new Subject(this._getDefaultState());
        this._formValidStream = this._store.pipe().map(s => !s.name.error && !s.description.error && !s.code.error);
        this._element = null;
        this._nameComponent = new NameComponent();
        this._descriptionComponent = null;
        this._codeComponent = null;
        this._submitStream = null;
    }

    bind() {
        this._bindNameComponent();

        const registerOnClick = e => {
            e.preventDefault = true;
            this._submitStream = e;
                // .pipe()
                // .withLatestFrom(this._formValidStream)
                // .filter(([submit, valid]) => valid)
                // .map(([submit, valid]) => submit);
        }
        const btnTypeStream = this._formValidStream.map(v => v ? 'add-btn' : 'cancel-btn');

        this._element = toDom`
            <div class="book book-edit">
                <a class="commit-btn ${btnTypeStream}" href="#" (click)=${registerOnClick}></a>
                <form novalidate>
                    ${this._nameComponent.element}
                </form>
            </div>`;

        this._store.state = this._getDefaultState();

        return {
            element: this._element,
            submitStream: this._submitStream
        };
    }

    reset() {
        this._store.state = this._getDefaultState();
    }

    async _bindNameComponent() {
        const nameObs = this._store.pipe().map(s => s.name).tap(e => console.log(e));
        this._nameComponent.bind({
            loading: false,
            error: nameObs.map(s => s.error),
            pristine: nameObs.map(s => s.pristine)
        });

        const errorStream = this._nameComponent.inputChange
            .pipe()
            .map(e => e.checkValidity() ? '' : e.validationMessage);

        let eventCount = 0;
        for await (let error of errorStream) {
            console.log('error stream: ' + error);
            let nameState = {};
            eventCount++;
            if (eventCount >= 2) {
                nameState.pristine = false;
            }

            nameState.error = error;
            this._store.state = {name: nameState};
        }
    }

    _getDefaultState() {
        return {
            name: {
                pristine: true,
                error: ''
            },
            description: {
                pristine: true,
                error: ''
            },
            code: {
                pristine: true,
                error: '',
                loading: false
            }
        };
    }
}

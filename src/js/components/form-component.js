import { Subject } from "../stream/subject";
import { toDom } from "../dom-renderer/to-dom";
import { NameComponent } from "./name-component";
import { DescriptionComponent } from "./description-component";
import { CodeComponent } from "./code-component";

export class FormComponent {
    get element() {
        return this._element;
    }

    get submitStream() {
        return this._submitStream;
    }

    get formData() {
        return new FormData(this._formElement);
    }

    constructor() {
        this._store = new Subject(this._getDefaultState());
        this._formValidStream = this._store.pipe().map(s => !s.name.error && !s.description.error && !s.code.error);

        this._element = null;
        this._formElement = null;
        this._nameComponent = new NameComponent();
        this._descriptionComponent = new DescriptionComponent();
        this._codeComponent = new CodeComponent();
        this._submitStream = null;
    }

    bind() {
        this._bindNameComponent();
        this._bindDescriptionComponent();
        this._bindCodeComponent();
        const btnTypeStream = this._formValidStream.map(v => v ? 'add-btn' : 'cancel-btn');

        const children = new DocumentFragment();
        children.append(
            this._nameComponent.element,
            this._descriptionComponent.element,
            this._codeComponent.element
        );
        this._element = toDom`
            <div class="book book-edit">
                <a class="commit-btn ${btnTypeStream}" href="#" (click)=${this._registerOnSubmitBtnClick.bind(this)}></a>
                <form novalidate>
                    ${children}
                </form>
            </div>`;
        this._formElement = this._element.querySelector('form');

        this._store.setState(this._getDefaultState());

        return {
            element: this._element,
            submitStream: this._submitStream
        };
    }

    reset() {
        this._store.setState(this._getDefaultState());
    }

    _registerOnSubmitBtnClick(stream) {
        stream.preventDefault = true;
        this._submitStream = stream
            .pipe()
            .withLatestFrom(this._formValidStream)
            .filter(([_, valid]) => valid)
            .map(([submit]) => submit);
    }

    async _bindNameComponent() {
        const nameStateStream = this._store.pipe().map(s => s.name);
        this._nameComponent.bind({
            loading: false,
            error: nameStateStream.map(s => s.error),
            pristine: nameStateStream.map(s => s.pristine)
        });

        let eventCount = 0;
        let pristine = true;
        for await (let error of this._nameComponent.errorStream) {
            if (++eventCount >= 2) {
                pristine = false;
            }

            this._store.setState({name: {error, pristine}});
        }
    }

    async _bindDescriptionComponent() {
        const descriptionStateStream = this._store.pipe().map(s => s.description);
        this._descriptionComponent.bind({
            loading: false,
            error: descriptionStateStream.map(s => s.error),
            pristine: descriptionStateStream.map(s => s.pristine)
        });

        let eventCount = 0;
        let pristine = true;
        for await (let error of this._descriptionComponent.errorStream) {
            if (++eventCount >= 2) {
                pristine = false;
            }

            this._store.setState({description: {error, pristine}});
        }
    }

    async _bindCodeComponent() {
        const codeStateStream = this._store.pipe().map(s => s.code);
        this._codeComponent.bind({
            loading: codeStateStream.map(s => s.loading),
            error: codeStateStream.map(s => s.error),
            pristine: codeStateStream.map(s => s.pristine),
            onLoadingStart: () => {
                this._store.setState(prevState => ({
                    code: {
                        ...prevState.code,
                        loading: true
                    }
                }));
            }
        });

        let eventCount = 0;
        let pristine = true;
        for await (let error of this._codeComponent.errorStream) {
            if (++eventCount >= 2) {
                pristine = false;
            }

            this._store.setState({
                code: {
                    loading: false,
                    pristine,
                    error
                }
            });
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

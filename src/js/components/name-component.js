import { renderDom } from "../dom-renderer/render-dom";

export class NameComponent {
    bind({loading, error}) {
        const onInput = e => {
            console.log(e);
        };
        const dirtyClass = 'invalid';
        const element = renderDom`
            <div class="control ${dirtyClass}">
                <label>Name</label>
                <input required name="name" class="name input" *(input)=${onInput}>
                <div class="error" *if=${error}>
                    <div class="triangle-left"></div>
                    <div class="message">${error}</div>
                </div>
                <div class="loading" *if=${loading}></div>
            </div>`;

        return {
            element,
            inputChange: null
        };
    }
}

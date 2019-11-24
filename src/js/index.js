import '../css/style.scss';
import { loadRows, renderBook, removeBook, bookListEl, clearUpForm } from './booklist-renderer';
import { FormValidator } from './form-validator';
import { FormComponent } from './components/form-component';
import { Subject } from './stream/subject';

loadRows();

bookListEl.addEventListener('click', e => {
    const removeBtn = e.target;
    if (removeBtn.matches('.remove-btn')) {
        e.preventDefault();
        const id = parseInt(removeBtn.parentElement.dataset.id);
        fetch('/books/book', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify({id})
        }).then(response => response.json())
        .then(({wasRemoved}) => {
            if (wasRemoved) {
                removeBook(id);
            } else {
                alert('Could not remove the book, sorry');
            }
        });
    }
});

// const formValidator = new FormValidator(
//     document.querySelector('.book-edit')
// );

// (async () => {
//     for await (let _ of formValidator.submitStream) {
//         const response = await fetch('/books/book', {
//             method: 'POST',
//             body: formValidator.formData
//         }).then(response => response.json())
        
//         if (!response.error) {
//             renderBook(response);
//             formValidator.reset();
//         } else {
//             alert(`Couldn't add a book because ${response.error}`);
//         }
//     }
// })();

// (async function () {
//     const formComponent = new FormComponent();
//     formComponent.bind();
//     document.querySelector('.library').prepend(
//         formComponent.element
//     );

//     for await (let click of formComponent.submitStream) {
//         console.log(click);
//     }
// })();

(async function () {
    let subject = new Subject({
        name: 'hello',
        code: 'hi'
    });

    // const startPipe = subject.pipe().throttle();

    // const decode = startPipe.map(c => c.name === 'hello' ? 'greeting' : 'farewell');
    // const codeUpper = startPipe.map(c => c.code.toUpperCase());


    (async function() {
        // for await (let s of subject) {
        //     console.log(`name: ${s.name}, code: ${s.code}`);
        // }

        const iterator = subject[Symbol.asyncIterator]();
        let s = await iterator.next();
        while (!s.done) {
            console.log(`name: ${s.value.name}, code: ${s.value.code}`);
            s = await iterator.next();
        }
    })();

    (async function() {
        for (let i of [1,2,3,4,5,6,7,8,9,10]) {
            const j = i;
            queueMicrotask(() => {
                subject.state = {
                    name: 'Mia',
                    code: j
                };
                console.log(`setting ${j}`);
            });
        }

        // subject.state = {
        //     name: 'Mia',
        //     code: await Promise.resolve(2)
        // };
        // console.log(`setting 2`);

        // subject.state = {
        //     name: 'Mia',
        //     code: await Promise.resolve(3)
        // };
        // console.log(`setting 3`);

        // subject.state = {
        //     name: 'Mia',
        //     code: await Promise.resolve(4)
        // };
        // console.log(`setting 4`);

        // for await (let s of [1,2,3,4,5,6,7,8,9,10]) {
        //     await Promise.resolve();
        //     subject.state = {
        //         name: 'Mia',
        //         code: s
        //     };
        //     console.log(`setting ${s}`);
        // }
    })();
    // (async function() {
    //     for await (let type of decode) {
    //         console.log(`type: ${type}`);
    //     }
    // })();

    // for await (let [type, upper] of decode.combineLatest(codeUpper)) {
    //     console.log(`type: ${type}, upper: ${upper}`);
    // }
})();

// async function* generate() {
//     yield 1;
//     yield 2;
//     yield 3;
// }

// (async function () {
//     let i = 1;
//     const generator = generate();
//     console.log('start');
//     for await (let v of generator) {
//         console.log(`value: ${v}`);
//         const j = i++;
//         setTimeout(() => {
//             console.log(`index ${j}`);
//         });
//     }
//     console.log('end');
// })();

// import '../css/style.scss';
// import { loadRows, renderBook, removeBook, bookListEl, clearUpForm } from './booklist-renderer';
// import { FormValidator } from './form-validator';
// import { NameComponent } from './components/input-component';
// import { Subject } from './stream/subject';
// import { FormComponent } from './components/form-component';

// loadRows();

// bookListEl.addEventListener('click', e => {
//     const removeBtn = e.target;
//     if (removeBtn.matches('.remove-btn')) {
//         e.preventDefault();
//         const id = parseInt(removeBtn.parentElement.dataset.id);
//         fetch('/books/book', {
//             method: 'DELETE',
//             headers: {
//                 'Content-Type': 'application/json;charset=utf-8'
//             },
//             body: JSON.stringify({id})
//         }).then(response => response.json())
//         .then(({wasRemoved}) => {
//             if (wasRemoved) {
//                 removeBook(id);
//             } else {
//                 alert('Could not remove the book, sorry');
//             }
//         });
//     }
// });

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

// (async function () {
//     let subject = new Subject({
//         name: 'hello',
//         code: 'hi'
//     });

//     const startPipe = subject.pipe().throttle();

//     const decode = startPipe.pipe().map(c => c.name === 'hello' ? 'greeting' : 'farewell');
//     const codeUpper = startPipe;

//     setTimeout(function() {
//         subject.state = {
//             name: 'goodbay',
//             code: 'see you'
//         };
//         setTimeout(function() {
//             subject.state = {
//                 name: 'hello',
//                 code: 'hi there'
//             };
//         }, 3000);
//     }, 3000);

    
//     (async function() {
//         for await (let {code} of codeUpper) {
//             console.log(`code: ${code}`);
//         }
//     })();
//     (async function() {
//         for await (let type of decode) {
//             console.log(`type: ${type}`);
//         }
//     })();

//     // for await (let [type, upper] of decode.combineLatest(codeUpper)) {
//     //     console.log(`type: ${type}, upper: ${upper}`);
//     // }
// })();

let resolveRef = null;

function waitTime(timeout = 1000) {
    return new Promise(r => setTimeout(r, timeout));
}

function waitClick(good = true) {
    return new Promise((resolve, reject) => {
        resolveRef = good ? resolve : reject;
    });
}

// async function* generate() {
//     let i = 1;
//     while (true) {
//         await wait();
//         yield i++;
//     }
// }

// (async function () {
//     // Listener
//     for await (let i of generate()) {
//         console.log(i);
//     }
// })();

// function allocateMemory(fillWith) {
//     const size = 1e6;
//     const arr = new Array(size);
//     for (let i = 0; i < size; i++) {
//         arr[i] = fillWith;
//     }
//     return arr;
// }

async function* createValueProducer() {
    try {
        await waitClick(true);
        yield 1;

        await waitClick(true);
        yield 2;

        await waitClick(true);
        yield 3;
    } finally {
        console.log('finally in generator');
    }
}

async function forEach(stream, onEachFn, onErrorFn) {
    const iterator = stream[Symbol.asyncIterator]();
    
    let nextValue;
    let index = 0;
    try {
        nextValue = await iterator.next();
    } catch (err) {
        // iterator.return();
        onErrorFn(err);
        return;
    }
    
    while (!nextValue.done) {
        let onEachResult;
        try {
            onEachResult = onEachFn.call(undefined, nextValue.value, index++);
        } catch (err) {
            try {
                iterator.throw(err);
            } catch (iterErr) {
                console.log('throw back: ' + iterErr);
            }
            break;
        }

        if (onEachResult !== undefined && !onEachResult) {
            iterator.return();
            break;
        }

        try {
            nextValue = await iterator.next();
        } catch (err) {
            // iterator.return();
            onErrorFn(err);
            break;
        }
    }
}

function onAllocateClick() {
    const stream = createValueProducer();
    forEach(stream, (v, i) => {
        if (i === 1) {
            throw new Error('index is 1 error');
        } else {
            console.log(`for each at ${i}: ${v}`);
        }
    }, err => {
        console.error(`for each: ${err}`);
    });
}

document.querySelector('#allocate').addEventListener('click', onAllocateClick);

document.querySelector('#resolve').addEventListener('click', e => {
    if (resolveRef) {
        resolveRef('resolved alright');
        resolveRef = null;
    }
});

document.querySelector('#tearDown').addEventListener('click', e => {
    const allocateEl = document.querySelector('#allocate');
    if (allocateEl) {
        allocateEl.removeEventListener('click', onAllocateClick);
        allocateEl.remove();
    }
});

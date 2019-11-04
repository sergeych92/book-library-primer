const addForm = document.querySelector('.library form');

addForm.querySelector('input[name=code]').addEventListener('input', e => {
    console.log(e.target.value);
    const code = e.target.value;
    (async () => {
        let req = await fetch(`/books/codeExists/${code}`);
        let json = await req.json();
        e.target.setCustomValidity(json.exists ? 'The code already exists' : '');
    })()
});

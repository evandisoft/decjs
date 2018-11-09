This is a library that uses the ES6 [Proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) feature to easily make UI's in declarative javascript.


Here is an example:

```javascript
let c=decjs.create,eles={},s=decjs.ElementProxies(eles)


// This creates a div in the body element of class 'maindiv' that has an input, a label, and a button.
// It saves references for the input and the button. The references can be retrieved even if the 
// input or the button are arbitrarily nested.
decjs.body.div({class:'maindiv'},
    s.nameInput=c.input({value:"Input!"}),
    c.label("Click this button:"),
    s.doneButton=c.button("Click me!")
)

// The references to the input and the button were copied over to the 'eles' object automatically.
// 's' is a proxy object that handle's 'set property' calls in a special way.
eles.doneButton.onclick=function(){
    decjs.body.div(c.label("Input was "),c.label(eles.nameInput.value))
}
```

More features and information is in `tutorial.html`. (The tutorial is in the source code. You can run it to verify the examples work.)

This is still a work in progress. I'm certain that almost any conceivable feature could be implemented, but I'm
not yet sure exactly what features are desired in practice, or how they should be structured. I will come back
to this after I've created a few projects with it.
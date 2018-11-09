/*
Copyright 2018 Evan Dickinson

Permission is hereby granted, free of charge, to any person obtaining a copy of 
this software and associated documentation files (the "Software"), to deal in the 
Software without restriction, including without limitation the rights to use, copy, 
modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, 
and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies 
or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, 
INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR 
PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE 
FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, 
ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

var decjs = (function () {
    function newElementHolderProxy(e,overrides) {
        if(e===undefined){
            e=document.createDocumentFragment()
        } // TODO: I dont know exactly how well documentFragments fit in here.
        if(overrides===undefined){
            overrides={}
        }
        return new Proxy(ElementHolder(e,overrides), createNewElementHandler)
    }

    // 'overrides' is a mapping of props to functions that return new widgets.
    // Each property in 'overrides' overrides the default 'create a new element by property name' behavior
    // for that property.
    function override(overrides){
        return newElementHolderProxy(undefined,overrides)
    }

    // call 'handler' after creation of any element that is in the list
    // The handler takes an element as argument.
    function initList(list,handler){
        let initSet=new Set(list)
        let overrideProxy=new Proxy({},{
                has:function(target,prop){
                    return initSet.has(prop)
                },
                get:function(target,prop){
                    return newElementHolderProxy()[prop](handler)
                }
            }
        )
        return newElementHolderProxy(undefined,overrideProxy)
    }

    // call 'handler' on all elements created by this proxy
    function initAll(handler){
        let overrideProxy=new Proxy({},{
                has:function(target,prop){
                    return true
                },
                get:function(target,prop){
                    return newElementHolderProxy()[prop](handler)
                }
            }
        )
        return newElementHolderProxy(undefined,overrideProxy)
    }


    function ElementHolder(e,overrides) {
        function processArguments(args){
            for (let argument of args) {
                // if it proxies the name __Html_ElementHolder_Instance__, it is the html-creator proxy, and not an init function
                if (typeof (argument) === 'function') {
                    if (argument.name === '__Html_ElementHolder_Instance__') {
                        let elementHolderProxy = argument
                        elementHolderProxy.__Html_ElementHolder_Instance_e__ === undefined ||
                            e.appendChild(getRootElement(elementHolderProxy.__Html_ElementHolder_Instance_e__))
                    }
                    else {
                        let initFunction = argument
                        initFunction(e)
                    }
                }
                else if (Array.isArray(argument)){
                    processArguments(argument)
                }
                else if (argument instanceof HTMLElement){
                    e.appendChild(argument)
                }
                else if (typeof (argument) === 'object') { // if not a function, this is an attribute list
                    let attributeList = argument
                    for (let attributeName in attributeList) {
                        // let currentVal=e.getAttribute(attributeName)
                        // let newVal=attributeList[attributeName]
                        // if(currentVal!=null){
                        //     newVal=currentVal+" "+newVal
                        // }
                        // e.setAttribute(attributeName, newVal)
                        e.setAttribute(attributeName,attributeList[attributeName])
                    }
                }
                else if (typeof (argument) === 'string') {
                    e.innerHTML += argument
                    //let classname=argument
                    //e.classList.add(classname)
                }
            }
        }

        function __Html_ElementHolder_Instance__() {
            processArguments(arguments)
            
            return newElementHolderProxy(e)
        }
        __Html_ElementHolder_Instance__.__Html_ElementHolder_Instance_e__ = e
        __Html_ElementHolder_Instance__.__Html_ElementHolder_Instance_overrides__=overrides

        return __Html_ElementHolder_Instance__
    }

    function getRootElement(e) {
        while (e.parentElement !== null) {
            e = e.parentElement
        }

        return e
    }

    const createNewElementHandler = {
        get: function (target, property) {
            if (property in target) {
                return target[property]
            } 
            
            let newElement

            if(property in target.__Html_ElementHolder_Instance_overrides__){
                newElement=target.__Html_ElementHolder_Instance_overrides__[property]().__Html_ElementHolder_Instance_e__
            } else {
                newElement = document.createElement(property)
            }

            if (target.__Html_ElementHolder_Instance_e__ !== undefined) {
                target.__Html_ElementHolder_Instance_e__.appendChild(getRootElement(newElement))
            }

            return newElementHolderProxy(newElement,target.__Html_ElementHolder_Instance_overrides__)
        }
    }

    // whenever the returned object gets a property assigned to an htmlproxy, the _elements argument
    // will get a property with the same name but assigned to that htmlproxy's underlying html Element
    // example: 
    // var objectContainingHtmlElements={}
    // var objectContainingElementHolderProxies=ElementProxies(objectContainingHtmlElements)
    // objectContainingElementHolderProxies.mydiv=create.div
    // console.log(objectContainingHtmlElements.mydiv) // prints out the div that was contained in the 
    //                                                 //    corresponding proxy
    const defaultOptions = { autoGenDOMClassnames: false }
    function ElementProxies(_elements, options) {
        if (!options) {
            options = defaultOptions
        }
        return new Proxy({}, {
            set: function (target, prop, value) {
                target[prop] = value
                _elements[prop] = value.__Html_ElementHolder_Instance_e__
                if (options.autoGenDOMClassnames) {
                    _elements[prop].classList.add(prop)
                }
            }
        })
    }

    function getElement(prox) {
        return prox.__Html_ElementHolder_Instance_e__
    }

    let decjs = {}
    decjs.proxy = newElementHolderProxy
    decjs.body = newElementHolderProxy(document.body)
    decjs.create = newElementHolderProxy()
    decjs.newElementHolderProxy=newElementHolderProxy
    decjs.getElement = getElement
    decjs.ElementProxies = ElementProxies
    decjs.override=override
    decjs.initList=initList
    decjs.initAll=initAll
    return decjs
}())

/*//module.exports=
let toExport={
    // p merely wraps an html Element
    P: newElementHolderProxy
    ,
    body: newElementHolderProxy(document.body)
    ,// 'create' creates a new Element
    create: newElementHolderProxy()
    ,
    getElement: getElement
    ,
    ElementProxies
}//*/


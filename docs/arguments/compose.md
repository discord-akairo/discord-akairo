# Composing Types

### Union Types

Akairo allows the creation of union types, where the input can match one of many types.  
You can import the `Argument` class, where there is the `Argument.union` static method.  

```js
{
    id: 'numOrName',
    type: Argument.union('integer', 'string')
}
```

The above argument will try matching using `integer` first, then `string`.  
So, it is recommended that you go from most to least specific types.  

### Product Types

A product type in Akairo casts the input to multiple types.  
The static method `Argument.product` lets us create one of these.  
The type will parse the input into an array containing the values respective to the given types.  

```js
{
    id: 'numAndName',
    type: Argument.product('integer', 'string')
}
```

The above argument will give an array where the first element was parsed using `integer`, and the second using `string`.  
If any of the types fail, the entire argument fails.  

### Validation

Extra validation can be done on the parsed value using `Argument.validate`.  
For numbers and things with a length or size, `Argument.range` is a convenient method as well.  

```js
{
    id: 'content',
    type: Argument.validate('string', (m, p, str) => str.length < 2000)
}
```

This argument ensures that the input is less than 2000 characters in length.  
If it is over 2000 characters, the input is considered invalid.  

```js
{
    id: 'number',
    type: Argument.range('number', 0, 100)
}
```

The `range` method ensures that the parsed value is within a certain range.  
Here, `number` will be between 0 and 100, exclusive.  
To make the upper bound inclusive, simply pass `true` to the 4th argument in the range function.  

### We're Going Functional

Types can be composed together using `Argument.compose`.  
For example, the result of `Argument.compose(type1, type2)` is a type that uses the first type, then the result of that is passed the second.  
A use case of this function is for preprocessing before casting:  

```js
{
    id: 'lowercaseChars',
    type: Argument.compose('lowercase', 'charCodes')
}
```

For more complicated types compositions and validations, it will be a lot easier to use type functions.  
See the [Using Functions](./functions.md) section for more information.  

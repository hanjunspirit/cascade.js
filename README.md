# Cascade.js

Cascade.js is a Javascript library for managing **relational but not derived** states.

Cascade.js is intended for complicated web page states.



#Example

Consider the example below:

We have 2 states:

 1. The size of clothes: "S" or "M"
 2. The color of clothes: "Green" or "Red" for size "S", and "Green" or "Black" for size M


When we update the size state, we have to update the color to maintain consistency.



# Usage

```javascript

	var Cascade = require('./cascade');

	var cascadeObj = new Cascade();
	
	cascadeObj.define('size', [], function(){
		return Cascade.types.Enum(['S', 'M']);
	});
	
	cascadeObj.define('color', ['size'], function(size){
		var colors = {
			S : ['Green', 'Red'],
			M : ['Green', 'Black'],
		};
		return Cascade.types.Enum(colors[size]);
	});
	
	cascadeObj.setState('size', 'S');
	cascadeObj.setState('color', 'Red');
	console.log(cascadeObj.getStates()); //{size: "S", color: "Red"}
	
	cascadeObj.setState('size', 'M');
	console.log(cascadeObj.getStates()); //{size: "M", color: "Green"}


```


# API reference

###cascadeObj.define(name, dependencies, factory);

- **name** : The name of the state
- **dependencies** : Dependencies the state depends
- **factory** : Takes the values of its dependencies. Return the definition of its value(Cascade.types.*)


### Cascade.types.*
- Cascade.types.Enum  The Enum data type.

You can implement your own data types. For example,

```javascript

	function onAdapt(currentValue, min, max){
		if(typeof currentValue !== 'number'){
			return min;
		}else{
			currentValue = Math.round(currentValue);
			
			if(currentValue <= min){
				return min;
			}
			
			if(currentValue >= max){
				return max;
			}
			
			return currentValue;
		}
	};
	
	function onSetValue(newValue, oldValue, min, max){
		if(typeof newValue !== 'number'){
			return onAdapt(oldValue, min, max);
		}
		
		return onAdapt(newValue, min, max);
	};
	
	Cascade.extendDataType('Interger', onAdapt, onSetValue);
	
	
	cascadeObj.define('aNumber', [], function(){
		return Cascade.types.Interger(0, 100);
	});
	
	
	cascadeObj.setState('aNumber', 56);
	console.log(cascadeObj.getState('aNumber')); //56
	cascadeObj.setState('aNumber', "aaaa"); //useless
	console.log(cascadeObj.getState('aNumber')); //56
	cascadeObj.setState('aNumber', 4547);//automatically set to the max value 100
	console.log(cascadeObj.getState('aNumber')); //100

```

### Cascade.extendDataType(name, onAdapt, onSetValue);


- name : The name of the data type. You can call it with `Cascade.types[name]`
- onAdapt : Take the previous value(or undefined in initialization) of the state and the data passed to `Cascade.types[name]` function. Return a new valid value.
- onSetValue : Take the newValue, oldvalue and the data passed to `Cascade.types[name]` function. Return a valid value


### cascadeObj.getState(name)

Return the value the state.

 
### cascadeObj.getStates()

Return all the states values.


### cascadeObj.derive(name, dependencies, factory);

Define a derived data.

- name : The name of the derived data.
- dependencies : Dependencies the state depends.
- factory : Takes the values of its dependencies. Return the derived data value.

For example

```javascript

	cascadeObj.derive('derivedData', ['size', 'color'], function(size, color){
		return 'The size is ' + size + ', the color is ' + color;
	});
	
	console.log(cascadeObj.getState('derivedData')); //The size is M, the color is Green

```

- You can use cascadeObj.getState(name) to get the value of the derived data.
- You can't use cascadeObj.setState(name) to set the value of the derived data.It should only be computed by its dependencies values.
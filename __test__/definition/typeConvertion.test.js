var Cascade = require('../../dist/cascade');
var Interger = require('../../dist/types/interger');

test('test Fixed and Enum', () => {
	var cascadeObj = new Cascade();
	cascadeObj.define('switch', null, () => Cascade.types.Enum(['On', 'Off']));
	
	cascadeObj.define('test', ['switch'], turn => {
		if(turn === 'On'){
			return Cascade.types.Fixed('The switch is On');
		}else{
			return Cascade.types.Enum(['a', 'b', 'c', 'd']);
		}
	});
	
	expect(cascadeObj.getState('switch')).toBe('On');
	
	expect(cascadeObj.getState('test')).toBe('The switch is On');
	
	cascadeObj.setState('switch', 'Off');
	expect(cascadeObj.getState('test')).toBe('a');
	
	cascadeObj.setState('test', 'b')
	expect(cascadeObj.getState('test')).toBe('b');
	
	cascadeObj.setState('switch', 'On');
	expect(cascadeObj.getState('test')).toBe('The switch is On');
});


test('test Ingerger and Enum', () => {
	var cascadeObj = new Cascade();
	cascadeObj.define('switch', null, () => Cascade.types.Enum(['On', 'Off']));
	
	cascadeObj.define('test', ['switch'], turn => {
		if(turn === 'On'){
			return Interger(1, 10);
		}else{
			return Cascade.types.Enum([2, 3, 5, 11]);
		}
	});
	
	expect(cascadeObj.getState('test')).toBe(1);
	
	cascadeObj.setState('switch', 'Off');
	expect(cascadeObj.getState('test')).toBe(2);
	
	cascadeObj.setState('switch', 'On');
	expect(cascadeObj.getState('test')).toBe(2);
	
	cascadeObj.setState('switch', 'Off');
	expect(cascadeObj.getState('test')).toBe(2);
});


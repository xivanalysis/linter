/**
 * @fileoverview Modules should not depend on other modules that they are not using.
 * @author ackwell
 */
'use strict'

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const RuleTester = require('eslint').RuleTester
const rule = require('../../../lib/rules/no-unused-dependencies')

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

RuleTester.setDefaultConfig({
	parser: 'babel-eslint',
	parserOptions: {
		ecmaVersion: 6,
		sourceType: 'module',
	},
})

const ruleTester = new RuleTester()
ruleTester.run('no-unused-dependencies', rule, {
	valid: [
		`
import Module from 'parser/core/module'

export default class Something extends Module {
	static handle = 'something'
	static dependencies = [
		...Module.dependencies,
		'somethingElse',
	]
	constructor(...args) {
		super(...args)
		this.somethingElse.use()
	}
}
		`,
		`
const notAClass = {
	dependencies: [],
	method () { this.notADep }
}
		`,
		`
import Module from 'parser/core/module'
// silly example of nested classes but verifies that the scoping system works
class A extends Module {
	static dependencies = ['foo']
	static B = class B extends Module {
		static dependencies = ['bar']

		method () {
			this.bar
		}
	}

	method () {
		this.foo
	}
}
		`,
	],

	invalid: [
		{
			code: `
import Module from 'parser/core/module'

export default class Something extends Module {
	static handle = 'something'
	static dependencies = [
		...Module.dependencies,
		'unused',
		'somethingElse',
	]
	constructor(...args) {
		super(...args)
		this.somethingElse.use()
	}
}
			`,
			errors: [{
				message: 'Dependency \'unused\' is unused',
				type: 'Literal',
			}],
		},
	],
})

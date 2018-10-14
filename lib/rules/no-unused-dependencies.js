/**
 * @fileoverview Modules should not depend on other modules that they are not using.
 * @author ackwell
 */
'use strict'

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = {
	meta: {
		docs: {
			description: 'Modules should not depend on other modules that they are not using.',
			category: 'xivanalysis',
			recommended: false,
		},
		fixable: null, // or "code" or "whitespace"
		schema: [],
	},

	create: function(context) {
		// Used during parsing to keep track of state
		/** @type {{}[]} */
		const scopeStack = []
		/** @type {WeakMap<{}, { dependencies: Set<{ value: string }>; usedClassProps: Set<string> }>} */
		const deps = new WeakMap()

		return {
			// As we enter a class, clear out the state
			ClassBody () {
				const scope = context.getScope()
				scopeStack.push(scope)
				deps.set(scope, {
					dependencies: new Set(),
					usedClassProps: new Set(),
				})
			},

			// As we exit the class body, compare deps to what was used
			'ClassBody:exit' () {
				const {dependencies, usedClassProps} = deps.get(scopeStack.pop())

				dependencies.forEach(dep => {
					if (!usedClassProps.has(dep.value)) {
						context.report(dep, `Dependency '${dep.value}' is unused`)
					}
				})
			},

			// Find the dependencies prop if it exists
			ClassProperty (node) {
				// Only care about static dependencies
				if (!node.static || node.key.name !== 'dependencies') { return }

				// we should only reach this actually inside a ClassBody so should have at least one scope there
				const scope = scopeStack[scopeStack.length - 1]
				const {dependencies} = deps.get(scope)

				// Value is an ArrayExpression, grab all the Literal elements from it
				node.value.elements.forEach(elem => {
					if (elem.type !== 'Literal') { return }
					dependencies.add(elem)
				})
			},

			// Deps are exposed as `this.<handle>`, track all member access on `this`
			MemberExpression (node) {
				// if not inside a class just return
				if (scopeStack.length < 1 || node.object.type !== 'ThisExpression') {
					return
				}
				const scope = scopeStack[scopeStack.length - 1]
				const {usedClassProps} = deps.get(scope)
				usedClassProps.add(node.property.name)
			},
		}
	},
}

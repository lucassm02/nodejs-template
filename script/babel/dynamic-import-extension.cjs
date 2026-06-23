module.exports = function dynamicImportExtension({ types: t }) {
  return {
    name: 'dynamic-import-extension',
    visitor: {
      CallExpression(path) {
        if (!path.node.callee || path.node.callee.type !== 'Import') return;

        const argument = path.get('arguments.0');
        if (!argument.node) return;

        if (argument.isStringLiteral()) {
          argument.node.value = resolveDynamicImportPath(argument.node.value);
          return;
        }

        path.replaceWith(makeDeferredRequire(t, argument.node));
        path.skip();
      }
    }
  };
};

function resolveDynamicImportPath(path) {
  if (!path.startsWith('./') && !path.startsWith('../')) return path;

  const extensionIndex = path.lastIndexOf('.');
  if (extensionIndex === -1 || path.includes('/', extensionIndex)) {
    return `${path}.js`;
  }

  if (path.endsWith('.ts') || path.endsWith('.tsx')) {
    return path.replace(/\.tsx?$/, '.js');
  }

  return path;
}

function makeDeferredRequire(t, argument) {
  return t.callExpression(
    t.memberExpression(
      t.callExpression(
        t.memberExpression(t.identifier('Promise'), t.identifier('resolve')),
        []
      ),
      t.identifier('then')
    ),
    [
      t.arrowFunctionExpression(
        [],
        t.callExpression(t.identifier('require'), [argument])
      )
    ]
  );
}

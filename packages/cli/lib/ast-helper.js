// Copyright IBM Corp. 2018,2019. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

const {tsquery} = require('@phenomnomnominal/tsquery');
const {syntaxKindName} = tsquery;
const debug = require('./debug')('ast-query');

/**
 * Parse the file using the possible formats specified in the arrays
 * rootNodesFindID and childNodesFindID
 * @param {string} fileContent with a model.ts class
 */
exports.getIdFromModel = function(fileContent) {
  const ast = tsquery.ast(fileContent);
  for (const queryName in QUERIES) {
    debug('Trying %s', queryName);
    const {query, getModelPropertyDeclaration} = QUERIES[queryName];

    const idFieldAssignments = tsquery(ast, query);

    for (const node of idFieldAssignments) {
      const fieldName = node.name.escapedText;
      if (debug.enabled) {
        debug(
          '  trying prop metadata field "%s" with value `%s`',
          fieldName,
          getNodeSource(node),
        );
      }

      if (!isPrimaryKeyFlag(node.initializer)) continue;

      const propDeclarationNode = getModelPropertyDeclaration(node);
      const modelPropertyName = propDeclarationNode.name.escapedText;
      if (debug.enabled) {
        debug(
          'Found primary key `%s` with id flag set to `%s`',
          modelPropertyName,
          getNodeSource(node),
        );
      }

      return modelPropertyName;
    }
  }

  // no primary key was found
  return null;

  function getNodeSource(node) {
    return fileContent.slice(node.pos, node.end).trim();
  }
};

const QUERIES = {
  'default format generated by lb4 model': {
    //   @property({id: true|1})
    //   id: number
    query:
      // Find all class properties decorated with `@property()`
      'ClassDeclaration>PropertyDeclaration>Decorator:has([name="id"])>' +
      // Find object-literal argument passed to `@property` decorator
      'CallExpression>ObjectLiteralExpression>' +
      // Find all assignments to `id` property (metadata field)
      'PropertyAssignment:has([name="id"])',

    getModelPropertyDeclaration(node) {
      return node.parent.parent.parent.parent;
    },
  },

  'model JSON definition inside the @model decorator': {
    //   @model({properties: {id: {type:number, id:true|1}}})
    query:
      // Find all classes decorated with `@model()`
      'ClassDeclaration>Decorator:has([name="model"])>' +
      // Find object-literal argument passed to `@model` decorator
      'CallExpression>ObjectLiteralExpression>' +
      // Find {properties:{...}} initializer
      'PropertyAssignment:has([name="properties"])>ObjectLiteralExpression>' +
      // Find all model properties, e.g. {name: {required: true}}
      'PropertyAssignment>ObjectLiteralExpression>' +
      // Find all assignments to `id` property (metadata field)
      'PropertyAssignment:has([name="id"])',
    getModelPropertyDeclaration(node) {
      return node.parent.parent;
    },
  },

  'model JSON definition inside a static model property "definition"': {
    //   static definition = {properties: {id: {type:number, id:true|1}}}
    query:
      // Find all classes with static property `definition`
      // TODO: check for "static" modifier
      'ClassDeclaration>PropertyDeclaration:has([name="definition"])>' +
      // Find object-literal argument used to initialize `definition`
      'ObjectLiteralExpression>' +
      // Find {properties:{...}} initializer
      'PropertyAssignment:has([name="properties"])>ObjectLiteralExpression>' +
      // Find all model properties, e.g. {name: {required: true}}
      'PropertyAssignment>ObjectLiteralExpression>' +
      // Find all assignments to `id` property (metadata field)
      'PropertyAssignment:has([name="id"])',

    getModelPropertyDeclaration(node) {
      return node.parent.parent;
    },
  },
};

function isPrimaryKeyFlag(idInitializer) {
  const kindName = syntaxKindName(idInitializer.kind);

  if (debug.enabled) {
    debug(
      'Checking primary key flag initializer, kind: %s node:',
      kindName,
      require('util').inspect(
        {...idInitializer, parent: '[removed for brevity]'},
        {depth: null},
      ),
    );
  }

  // {id: true}
  if (kindName === 'TrueKeyword') return true;

  // {id: number}
  if (kindName === 'NumericLiteral') {
    const ix = +idInitializer.text;
    // the value must be a non-zero number, e.g. {id: 1}
    return ix !== 0 && !isNaN(ix);
  }

  return false;
}

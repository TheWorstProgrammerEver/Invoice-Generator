import fs from 'node:fs/promises'
import path from 'node:path'
import ts from 'typescript'

const rootTypeName = 'InvoiceUrlPayload'
const sourcePath = 'src/types/invoiceDraft.ts'
const outputPath = 'public/invoice-url-payload.schema.json'

const readSource = async () => {
  const text = await fs.readFile(sourcePath, 'utf8')

  return ts.createSourceFile(sourcePath, text, ts.ScriptTarget.Latest, true)
}

const nodeLabel = (node) => ts.SyntaxKind[node.kind]

const propertyName = (name) => {
  if (ts.isIdentifier(name) || ts.isStringLiteral(name) || ts.isNumericLiteral(name)) {
    return name.text
  }

  throw new Error(`Unsupported property name ${nodeLabel(name)} in ${sourcePath}`)
}

const literalValue = (literal) => {
  if (ts.isStringLiteral(literal) || ts.isNumericLiteral(literal)) {
    return ts.isNumericLiteral(literal) ? Number(literal.text) : literal.text
  }

  if (literal.kind === ts.SyntaxKind.TrueKeyword) {
    return true
  }

  if (literal.kind === ts.SyntaxKind.FalseKeyword) {
    return false
  }

  throw new Error(`Unsupported literal ${nodeLabel(literal)} in ${sourcePath}`)
}

const collectTypeAliases = (sourceFile) => {
  const aliases = new Map()

  for (const statement of sourceFile.statements) {
    if (ts.isTypeAliasDeclaration(statement)) {
      aliases.set(statement.name.text, statement)
    }
  }

  return aliases
}

const createSchemaBuilder = (aliases) => {
  const schemaForType = (node) => {
    if (node.kind === ts.SyntaxKind.StringKeyword) {
      return { type: 'string' }
    }

    if (node.kind === ts.SyntaxKind.NumberKeyword) {
      return { type: 'number' }
    }

    if (node.kind === ts.SyntaxKind.BooleanKeyword) {
      return { type: 'boolean' }
    }

    if (ts.isLiteralTypeNode(node)) {
      return { const: literalValue(node.literal) }
    }

    if (ts.isArrayTypeNode(node)) {
      return { type: 'array', items: schemaForType(node.elementType) }
    }

    if (ts.isTypeReferenceNode(node)) {
      const name = node.typeName.getText()

      if (!aliases.has(name)) {
        throw new Error(`Unknown type reference ${name} in ${sourcePath}`)
      }

      return { $ref: `#/$defs/${name}` }
    }

    if (ts.isTypeLiteralNode(node)) {
      return schemaForTypeLiteral(node)
    }

    if (ts.isUnionTypeNode(node)) {
      const concreteTypes = node.types.filter((typeNode) => (
        typeNode.kind !== ts.SyntaxKind.UndefinedKeyword
      ))

      if (concreteTypes.length === 1) {
        return schemaForType(concreteTypes[0])
      }

      return { anyOf: concreteTypes.map(schemaForType) }
    }

    throw new Error(`Unsupported type ${nodeLabel(node)} in ${sourcePath}`)
  }

  const schemaForTypeLiteral = (node) => {
    const properties = {}
    const required = []

    for (const member of node.members) {
      if (!ts.isPropertySignature(member) || !member.type) {
        throw new Error(`Unsupported object member in ${sourcePath}`)
      }

      const name = propertyName(member.name)
      const isUndefinedUnion = ts.isUnionTypeNode(member.type) && member.type.types.some((typeNode) => (
        typeNode.kind === ts.SyntaxKind.UndefinedKeyword
      ))

      properties[name] = schemaForType(member.type)

      if (!member.questionToken && !isUndefinedUnion) {
        required.push(name)
      }
    }

    return {
      type: 'object',
      additionalProperties: false,
      required,
      properties
    }
  }

  return schemaForType
}

const buildSchema = async () => {
  const sourceFile = await readSource()
  const aliases = collectTypeAliases(sourceFile)
  const root = aliases.get(rootTypeName)

  if (!root) {
    throw new Error(`Could not find ${rootTypeName} in ${sourcePath}`)
  }

  const schemaForType = createSchemaBuilder(aliases)
  const defs = {}

  for (const [name, alias] of aliases.entries()) {
    if (name !== rootTypeName) {
      defs[name] = schemaForType(alias.type)
    }
  }

  return {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    $id: '/invoice-url-payload.schema.json',
    title: rootTypeName,
    description: 'Generated from the TypeScript type used by invoice draft URLs.',
    'x-generated-from': `${sourcePath}#${rootTypeName}`,
    ...schemaForType(root.type),
    $defs: defs
  }
}

const schema = await buildSchema()

await fs.mkdir(path.dirname(outputPath), { recursive: true })
await fs.writeFile(outputPath, `${JSON.stringify(schema, null, 2)}\n`)

console.log(`Generated ${outputPath}`)

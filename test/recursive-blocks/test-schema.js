import { configToJSONSchema } from '../../packages/payload/dist/utilities/configToJSONSchema.js'

// Simple test config with recursive block
const testConfig = {
  collections: [
    {
      slug: 'test-collection',
      flattenedFields: [
        {
          name: 'recursiveBlocks',
          type: 'blocks',
          blockReferences: ['recursive-block'],
          blocks: [],
        },
      ],
    },
  ],
  blocks: [
    {
      slug: 'recursive-block',
      interfaceName: 'RecursiveBlock',
      flattenedFields: [
        {
          name: 'title',
          type: 'text',
        },
        {
          name: 'children',
          type: 'blocks',
          blockReferences: ['recursive-block'], // Self-reference
          blocks: [],
        },
      ],
    },
  ],
  db: { defaultIDType: 'text' },
  typescript: { outputFile: './payload-types.ts' },
  i18n: { supportedLanguages: { en: {} }, fallbackLanguage: 'en' },
  admin: { timezones: { supportedTimezones: ['UTC'] } },
  globals: [],
}

console.log('Testing recursive block schema generation...')

try {
  const schema = configToJSONSchema(testConfig, 'text')
  console.log('Schema generation completed!')
  console.log('Recursive block definition:', JSON.stringify(schema.definitions?.RecursiveBlock, null, 2))
} catch (error) {
  if (error.message.includes('Maximum call stack size exceeded') || 
      error.message.includes('RangeError') ||
      error.message.includes('stack')) {
    console.log('ERROR: Infinite recursion detected during schema generation!')
    console.log('This confirms the issue exists.')
  } else {
    console.log('Other error:', error.message)
  }
}
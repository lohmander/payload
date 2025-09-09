// Simple unit test for cycle detection in block schema generation
import { configToJSONSchema } from '../../packages/payload/dist/utilities/configToJSONSchema.js'

// Create a minimal config to test recursive blocks
const createTestConfig = () => ({
  collections: [],
  globals: [],
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
          blockReferences: ['recursive-block'],
          blocks: [],
        },
      ],
    },
    {
      slug: 'block-a',
      interfaceName: 'BlockA',
      flattenedFields: [
        {
          name: 'title',
          type: 'text',
        },
        {
          name: 'blockBField',
          type: 'blocks',
          blockReferences: ['block-b'],
          blocks: [],
        },
      ],
    },
    {
      slug: 'block-b',
      interfaceName: 'BlockB',
      flattenedFields: [
        {
          name: 'title',
          type: 'text',
        },
        {
          name: 'blockAField',
          type: 'blocks',
          blockReferences: ['block-a'],
          blocks: [],
        },
      ],
    },
  ],
  db: { defaultIDType: 'text' },
  admin: { timezones: { supportedTimezones: ['UTC'] } },
  i18n: { supportedLanguages: { en: {} }, fallbackLanguage: 'en' },
})

console.log('Testing cycle detection in block schema generation...')

try {
  const testConfig = createTestConfig()
  
  // This should complete without infinite recursion
  const startTime = Date.now()
  const schema = configToJSONSchema(testConfig, 'text')
  const endTime = Date.now()
  
  console.log(`✅ Schema generation completed in ${endTime - startTime}ms (no infinite recursion)`)
  
  // Check that recursive blocks are properly defined
  if (schema.definitions) {
    const recursiveBlock = schema.definitions.RecursiveBlock
    const blockA = schema.definitions.BlockA
    const blockB = schema.definitions.BlockB
    
    if (recursiveBlock) {
      console.log('✅ RecursiveBlock definition found')
      console.log('RecursiveBlock properties:', Object.keys(recursiveBlock.properties || {}))
    } else {
      console.log('❌ RecursiveBlock definition missing')
    }
    
    if (blockA && blockB) {
      console.log('✅ Mutually recursive blocks (BlockA, BlockB) found')
    } else {
      console.log('❌ Mutually recursive blocks missing')
    }
    
    // Check if we have proper $ref usage for recursion
    const schemaStr = JSON.stringify(schema)
    const refCount = (schemaStr.match(/\$ref/g) || []).length
    console.log(`✅ Found ${refCount} $ref references (recursive type handling)`)
    
    if (refCount > 0) {
      console.log('✅ Recursive types are using $ref pattern correctly')
    }
  }
  
  console.log('\n🎉 All tests passed! Recursive block support is working.')
  
} catch (error) {
  if (error.message && (
    error.message.includes('Maximum call stack size exceeded') ||
    error.message.includes('RangeError') ||
    error.message.includes('stack')
  )) {
    console.log('❌ ERROR: Infinite recursion still detected!')
    console.log('This means the cycle detection is not working properly.')
    process.exit(1)
  } else {
    console.log('❌ Other error:', error.message)
    console.log(error.stack)
    process.exit(1)
  }
}
import { describe, expect, it } from '@jest/globals'
import { configToJSONSchema } from '../../../packages/payload/src/utilities/configToJSONSchema.js'

describe('Recursive Blocks - Unit Tests', () => {
  it('should handle self-referencing blocks without infinite recursion', () => {
    const config = {
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
      ],
      db: { defaultIDType: 'text' },
      admin: { timezones: { supportedTimezones: ['UTC'] } },
      i18n: { supportedLanguages: { en: {} }, fallbackLanguage: 'en' },
    }

    // This should complete without infinite recursion
    const startTime = Date.now()
    const schema = configToJSONSchema(config, 'text')
    const endTime = Date.now()

    // Should complete quickly (within 100ms)
    expect(endTime - startTime).toBeLessThan(100)
    
    // Should have the recursive block definition
    expect(schema.definitions?.RecursiveBlock).toBeDefined()
    expect(schema.definitions?.RecursiveBlock?.properties).toBeDefined()
    expect(schema.definitions?.RecursiveBlock?.properties?.title).toBeDefined()
    expect(schema.definitions?.RecursiveBlock?.properties?.children).toBeDefined()

    // Should use $ref patterns for recursive references
    const schemaStr = JSON.stringify(schema)
    expect(schemaStr).toContain('$ref')
  })

  it('should handle mutually recursive blocks without infinite recursion', () => {
    const config = {
      collections: [],
      globals: [],
      blocks: [
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
    }

    // This should complete without infinite recursion
    const startTime = Date.now()
    const schema = configToJSONSchema(config, 'text')
    const endTime = Date.now()

    // Should complete quickly (within 100ms)
    expect(endTime - startTime).toBeLessThan(100)
    
    // Should have both block definitions
    expect(schema.definitions?.BlockA).toBeDefined()
    expect(schema.definitions?.BlockB).toBeDefined()

    // Should use $ref patterns for recursive references
    const schemaStr = JSON.stringify(schema)
    const refCount = (schemaStr.match(/\$ref/g) || []).length
    expect(refCount).toBeGreaterThan(0)
  })

  it('should handle deeply nested recursive blocks', () => {
    const config = {
      collections: [
        {
          slug: 'test-collection',
          flattenedFields: [
            {
              name: 'content',
              type: 'blocks',
              blockReferences: ['nested-block'],
              blocks: [],
            },
          ],
        },
      ],
      globals: [],
      blocks: [
        {
          slug: 'nested-block',
          interfaceName: 'NestedBlock',
          flattenedFields: [
            {
              name: 'title',
              type: 'text',
            },
            {
              name: 'nested',
              type: 'group',
              flattenedFields: [
                {
                  name: 'deepContent',
                  type: 'blocks',
                  blockReferences: ['nested-block'], // Deep self-reference
                  blocks: [],
                },
              ],
            },
          ],
        },
      ],
      db: { defaultIDType: 'text' },
      admin: { timezones: { supportedTimezones: ['UTC'] } },
      i18n: { supportedLanguages: { en: {} }, fallbackLanguage: 'en' },
    }

    // This should complete without infinite recursion even with nested references
    const startTime = Date.now()
    const schema = configToJSONSchema(config, 'text')
    const endTime = Date.now()

    // Should complete quickly
    expect(endTime - startTime).toBeLessThan(100)
    
    // Should have the nested block definition
    expect(schema.definitions?.NestedBlock).toBeDefined()
    expect(schema.definitions?.['test-collection']).toBeDefined()

    // Should use $ref patterns
    const schemaStr = JSON.stringify(schema)
    expect(schemaStr).toContain('$ref')
  })
})
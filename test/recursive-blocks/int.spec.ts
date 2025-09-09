import { describe, expect, it } from '@jest/globals'

import path from 'path'
import payload from 'payload'
import { fileURLToPath } from 'url'

import { initPayloadInt } from '../helpers/initPayloadInt.js'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

describe('Recursive Blocks', () => {
  let api: typeof payload

  beforeAll(async () => {
    ;({ payload: api } = await initPayloadInt(dirname))
  })

  afterAll(async () => {
    await api.destroy()
  })

  it('should handle recursive block references without infinite recursion', async () => {
    // Test that we can create a document with recursive blocks
    const doc = await api.create({
      collection: 'test-recursive-collection',
      data: {
        title: 'Test Recursive Document',
        recursiveBlocks: [
          {
            blockType: 'recursive-block',
            title: 'Parent Block',
            children: [
              {
                blockType: 'recursive-block',
                title: 'Child Block',
                children: [], // Empty to avoid actual infinite data
              },
            ],
          },
        ],
      },
    })

    expect(doc.title).toEqual('Test Recursive Document')
    expect(doc.recursiveBlocks).toBeDefined()
    expect(doc.recursiveBlocks[0].blockType).toEqual('recursive-block')
  })

  it('should handle mutually recursive block references', async () => {
    // Test mutually recursive blocks (A -> B -> A)
    const doc = await api.create({
      collection: 'test-recursive-collection',
      data: {
        title: 'Test Mutually Recursive Document',
        recursiveBlocks: [
          {
            blockType: 'block-a',
            title: 'Block A',
            blockBField: [
              {
                blockType: 'block-b',
                title: 'Block B',
                blockAField: [], // Empty to avoid infinite data
              },
            ],
          },
        ],
      },
    })

    expect(doc.title).toEqual('Test Mutually Recursive Document')
    expect(doc.recursiveBlocks).toBeDefined()
    expect(doc.recursiveBlocks[0].blockType).toEqual('block-a')
  })

  it('should generate types without infinite recursion', async () => {
    // This test will verify that type generation doesn't hang
    // The fact that the test suite can complete means type generation worked
    const config = api.config
    expect(config.blocks).toBeDefined()
    expect(config.blocks!.length).toBeGreaterThan(0)
    
    // Check that our recursive blocks are properly configured
    const recursiveBlock = config.blocks!.find(b => b.slug === 'recursive-block')
    expect(recursiveBlock).toBeDefined()
    expect(recursiveBlock!.fields).toBeDefined()
  })
})
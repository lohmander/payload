import type { Block } from 'payload'

export const RecursiveBlock: Block = {
  slug: 'recursive-block',
  interfaceName: 'RecursiveBlock',
  fields: [
    {
      name: 'title',
      type: 'text',
    },
    {
      name: 'children',
      type: 'blocks',
      blockReferences: ['recursive-block'], // Self-reference
    },
  ],
}

export const BlockA: Block = {
  slug: 'block-a',
  interfaceName: 'BlockA',
  fields: [
    {
      name: 'title',
      type: 'text',
    },
    {
      name: 'blockBField',
      type: 'blocks',
      blockReferences: ['block-b'],
    },
  ],
}

export const BlockB: Block = {
  slug: 'block-b',
  interfaceName: 'BlockB',
  fields: [
    {
      name: 'title',
      type: 'text',
    },
    {
      name: 'blockAField',
      type: 'blocks',
      blockReferences: ['block-a'], // Creates cycle: A -> B -> A
    },
  ],
}
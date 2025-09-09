import path from 'path'
import { fileURLToPath } from 'url'

import { buildConfigWithDefaults } from '../buildConfigWithDefaults.js'
import { RecursiveBlock, BlockA, BlockB } from './blocks.js'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfigWithDefaults({
  collections: [
    {
      slug: 'test-recursive-collection',
      fields: [
        {
          name: 'title',
          type: 'text',
        },
        {
          name: 'recursiveBlocks',
          type: 'blocks',
          blockReferences: ['recursive-block', 'block-a', 'block-b'],
        },
      ],
    },
  ],
  blocks: [RecursiveBlock, BlockA, BlockB],
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
})
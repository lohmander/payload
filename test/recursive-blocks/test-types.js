import { generateTypes } from '../../packages/payload/dist/bin/generateTypes.js'
import config from './config.js'

// Test recursive type generation
console.log('Testing recursive type generation...')

try {
  await generateTypes(config)
  console.log('Type generation completed successfully')
} catch (error) {
  if (error.message.includes('Maximum call stack size exceeded') || 
      error.message.includes('RangeError') ||
      error.message.includes('stack')) {
    console.log('ERROR: Infinite recursion detected during type generation!')
    console.log('Error:', error.message)
  } else {
    console.log('Other error:', error.message)
  }
}
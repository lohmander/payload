import path from 'path'
import { fileURLToPath } from 'url'
import { generateTypes } from 'payload'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

// Set up a minimal config to test recursive block type generation
process.env.PAYLOAD_CONFIG_PATH = path.resolve(dirname, 'config.ts')

try {
  console.log('Testing recursive block type generation...')
  
  // This should not cause infinite recursion anymore
  await generateTypes()
  
  console.log('✅ Type generation completed successfully!')
  
  // Check if the generated types file exists
  const typesPath = path.resolve(dirname, 'payload-types.ts')
  const fs = await import('fs')
  
  if (fs.existsSync(typesPath)) {
    const content = fs.readFileSync(typesPath, 'utf-8')
    console.log('✅ Types file generated successfully')
    
    // Check for recursive references
    if (content.includes('RecursiveBlock') && content.includes('BlockA') && content.includes('BlockB')) {
      console.log('✅ All block interfaces found in generated types')
    } else {
      console.log('❌ Missing expected block interfaces')
    }
    
    // Look for recursive type patterns
    if (content.includes('$ref')) {
      console.log('✅ Found $ref patterns (indicates recursive references handled)')
    }
    
  } else {
    console.log('❌ Types file was not generated')
  }
  
} catch (error) {
  if (error.message && (
    error.message.includes('Maximum call stack size exceeded') ||
    error.message.includes('RangeError') ||
    error.message.includes('stack')
  )) {
    console.log('❌ ERROR: Infinite recursion still detected during type generation!')
    console.log('Error:', error.message)
  } else {
    console.log('❌ Other error:', error.message)
  }
}
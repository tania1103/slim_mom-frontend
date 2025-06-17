const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Starting custom build process...');

// Run the regular build command
try {
  console.log('📦 Building React application...');
  execSync('react-scripts build', { stdio: 'inherit' });
} catch (error) {
  // If the error is about the .eslintrc.json file, continue
  if (error.message.includes('.eslintrc.json')) {
    console.log('⚠️ Encountered .eslintrc.json lock issue, continuing build...');
  } else {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

// Check if build directory exists
if (!fs.existsSync(path.resolve(__dirname, 'build'))) {
  console.error('❌ Build directory not found!');
  process.exit(1);
}

// Copy the eslintrc file if it wasn't copied successfully
const eslintSrc = path.resolve(__dirname, 'public', '.eslintrc.json');
const eslintDest = path.resolve(__dirname, 'build', '.eslintrc.json');

if (fs.existsSync(eslintSrc) && !fs.existsSync(eslintDest)) {
  try {
    console.log('📄 Manually copying .eslintrc.json...');
    const eslintContent = fs.readFileSync(eslintSrc);
    fs.writeFileSync(eslintDest, eslintContent);
    console.log('✅ .eslintrc.json copied successfully!');
  } catch (err) {
    console.warn('⚠️ Failed to copy .eslintrc.json, but build continued:', err.message);
  }
}

console.log('✅ Build process completed successfully!');

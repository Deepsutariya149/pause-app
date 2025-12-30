const fs = require('fs');
const path = require('path');

/**
 * Script to generate app icons and splash screen from SVG
 * This script uses sharp to convert SVG to PNG
 * 
 * Run: node scripts/generate-icons.js
 */

async function generateIcons() {
  try {
    // Check if sharp is available
    let sharp;
    try {
      sharp = require('sharp');
    } catch (error) {
      console.error('❌ Error: sharp is not installed.');
      console.log('📦 Installing sharp...');
      const { execSync } = require('child_process');
      execSync('npm install --save-dev sharp', { stdio: 'inherit' });
      sharp = require('sharp');
    }

    const assetsDir = path.join(__dirname, '../assets');
    const svgPath = path.join(assetsDir, 'pause_icon_only.svg');
    
    // Check if SVG exists
    if (!fs.existsSync(svgPath)) {
      throw new Error(`SVG file not found: ${svgPath}`);
    }

    console.log('🎨 Generating icons from pause_icon_only.svg...\n');

    // Read SVG content
    const svgBuffer = fs.readFileSync(svgPath);

    // Generate icon.png (1024x1024) - Main app icon
    const iconPath = path.join(assetsDir, 'icon.png');
    await sharp(svgBuffer)
      .resize(1024, 1024, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 } // Transparent background
      })
      .png()
      .toFile(iconPath);
    console.log('✅ Generated: icon.png (1024x1024)');

    // Generate adaptive-icon.png (1024x1024) - Android adaptive icon foreground
    // For adaptive icons, we want the icon centered with some padding
    const adaptiveIconPath = path.join(assetsDir, 'adaptive-icon.png');
    await sharp(svgBuffer)
      .resize(1024, 1024, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 } // Transparent background
      })
      .png()
      .toFile(adaptiveIconPath);
    console.log('✅ Generated: adaptive-icon.png (1024x1024)');

    // Generate splash screen (2048x2048 recommended for high DPI)
    // Splash screen should have the icon centered on a gradient background
    const splashPath = path.join(assetsDir, 'splash-icon.png');
    
    // Create gradient background matching the icon's gradient colors
    const gradientSvg = `
      <svg width="2048" height="2048" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="splashGradient" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stop-color="#8E7CC3"/>
            <stop offset="100%" stop-color="#4AA3FF"/>
          </linearGradient>
        </defs>
        <rect width="2048" height="2048" fill="url(#splashGradient)"/>
      </svg>
    `;

    // Resize icon to fit nicely in splash (about 800x800 to leave padding)
    const resizedIcon = await sharp(svgBuffer)
      .resize(800, 800, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png()
      .toBuffer();

    // Composite: gradient background + centered icon
    await sharp(Buffer.from(gradientSvg))
      .composite([
        {
          input: resizedIcon,
          top: 624, // Center vertically (2048/2 - 800/2 = 624)
          left: 624, // Center horizontally (2048/2 - 800/2 = 624)
          blend: 'over'
        }
      ])
      .png()
      .toFile(splashPath);
    console.log('✅ Generated: splash-icon.png (2048x2048)');

    // Generate favicon (32x32 for web)
    const faviconPath = path.join(assetsDir, 'favicon.png');
    await sharp(svgBuffer)
      .resize(32, 32, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png()
      .toFile(faviconPath);
    console.log('✅ Generated: favicon.png (32x32)');

    console.log('\n🎉 All icons generated successfully!');
    console.log('\n📝 Next steps:');
    console.log('   1. Icons are ready in the assets folder');
    console.log('   2. Run: npx expo prebuild --clean (if using bare workflow)');
    console.log('   3. Or rebuild your app to see the new icons');
    
  } catch (error) {
    console.error('❌ Error generating icons:', error.message);
    process.exit(1);
  }
}

generateIcons();


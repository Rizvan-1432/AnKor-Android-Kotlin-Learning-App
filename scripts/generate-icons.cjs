const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Создаем простую иконку с помощью Canvas API
const createIcon = async (size) => {
  const canvas = {
    width: size,
    height: size,
    data: Buffer.alloc(size * size * 4) // RGBA
  };

  // Заполняем фон градиентом
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const index = (y * size + x) * 4;
      
      // Создаем градиент от синего к темно-синему
      const gradient = x / size;
      const r = Math.floor(59 + (30 - 59) * gradient); // 59 -> 30
      const g = Math.floor(130 + (64 - 130) * gradient); // 130 -> 64
      const b = Math.floor(246 + (175 - 246) * gradient); // 246 -> 175
      
      canvas.data[index] = r;     // R
      canvas.data[index + 1] = g; // G
      canvas.data[index + 2] = b; // B
      canvas.data[index + 3] = 255; // A
    }
  }

  // Добавляем белый круг в центре
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = size * 0.3;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
      if (distance <= radius) {
        const index = (y * size + x) * 4;
        canvas.data[index] = 255;     // R
        canvas.data[index + 1] = 255; // G
        canvas.data[index + 2] = 255; // B
        canvas.data[index + 3] = 255; // A
      }
    }
  }

  // Добавляем букву "A" в центре
  const letterSize = size * 0.2;
  const letterX = centerX - letterSize / 2;
  const letterY = centerY - letterSize / 2;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (x >= letterX && x < letterX + letterSize && 
          y >= letterY && y < letterY + letterSize) {
        // Простая буква "A"
        const localX = x - letterX;
        const localY = y - letterY;
        
        if ((localY > letterSize * 0.2 && localY < letterSize * 0.8) &&
            (localX > letterSize * 0.3 && localX < letterSize * 0.7) &&
            (localY < letterSize * 0.5 || localX > letterSize * 0.4)) {
          const index = (y * size + x) * 4;
          canvas.data[index] = 59;     // R (синий)
          canvas.data[index + 1] = 130; // G
          canvas.data[index + 2] = 246; // B
          canvas.data[index + 3] = 255; // A
        }
      }
    }
  }

  return canvas;
};

const generateIcons = async () => {
  try {
    // Создаем директорию если не существует
    const assetsDir = path.join(__dirname, '../public/src/assets');
    if (!fs.existsSync(assetsDir)) {
      fs.mkdirSync(assetsDir, { recursive: true });
    }

    // Генерируем иконки разных размеров
    const sizes = [192, 512];
    
    for (const size of sizes) {
      console.log(`Генерируем иконку ${size}x${size}...`);
      
      const icon = await createIcon(size);
      
      // Конвертируем в PNG с помощью sharp
      const pngBuffer = await sharp(icon.data, {
        raw: {
          width: size,
          height: size,
          channels: 4
        }
      }).png().toBuffer();
      
      const filename = `icon-${size}.png`;
      const filepath = path.join(assetsDir, filename);
      
      fs.writeFileSync(filepath, pngBuffer);
      console.log(`✅ Создана иконка: ${filename}`);
    }

    console.log('🎉 Все иконки созданы успешно!');
  } catch (error) {
    console.error('❌ Ошибка при создании иконок:', error);
  }
};

generateIcons();

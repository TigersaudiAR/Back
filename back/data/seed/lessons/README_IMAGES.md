# Lesson Images Setup

## 📸 Thumbnail Images

The lessons system references thumbnail images in the `/public/images/lessons/` directory.

### Current Status

⚠️ **Note**: The thumbnail paths in `lessons-enhanced.json` are **placeholders** and the actual images do not exist yet.

### Required Images

To enable lesson thumbnails, create the following image files:

```
back/public/images/lessons/
├── aqidah-1.jpg    (أركان الإيمان الستة)
├── aqidah-2.jpg    (أسماء الله الحسنى)
├── fiqh-1.jpg      (أركان الإسلام الخمسة)
├── fiqh-2.jpg      (الطهارة والوضوء)
├── sirah-1.jpg     (مولد النبي ﷺ)
├── quran-1.jpg     (مقدمة في التجويد)
├── akhlaq-1.jpg    (آداب المسلم)
└── hadith-1.jpg    (الأربعون النووية)
```

### Recommendations

**Image Specifications:**
- Format: JPG or PNG
- Size: 800x450px (16:9 ratio)
- Max file size: 200KB per image
- Content: Islamic-appropriate imagery related to lesson topic

**Alternative Solutions:**

1. **Use Placeholder Service**
   - Update paths to use `https://via.placeholder.com/800x450`
   - Or use `https://picsum.photos/800/450`

2. **Use Islamic Icons/Graphics**
   - Create simple graphics using Canva or similar
   - Use Islamic calligraphy or patterns

3. **Remove Thumbnails (Temporary)**
   - Remove or comment out `thumbnail` field in JSON
   - System will work without images

### Example Update

To use placeholders temporarily, update the JSON:

```json
"thumbnail": "https://via.placeholder.com/800x450/10b981/ffffff?text=أركان+الإيمان"
```

Or remove the field entirely:
```json
// Remove this line:
// "thumbnail": "/public/images/lessons/aqidah-1.jpg",
```

### Future Enhancement

Consider integrating with:
- **Unsplash API** for stock photos
- **Cloudinary** for image management
- **AWS S3** for file storage

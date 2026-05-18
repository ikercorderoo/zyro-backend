import multer from 'multer';
import { uploadFile } from '@uploadcare/upload-client';

// Use memory storage instead of disk to avoid Railway's ephemeral filesystem issues
const storage = multer.memoryStorage();

// Filter for images only
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};

export const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

export const handleUpload = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }
    
    try {
        // Upload the file buffer to Uploadcare
        const result = await uploadFile(req.file.buffer, {
            publicKey: '0d03410721703a146c8a',
            store: 'auto',
            fileName: req.file.originalname
        });

        // The permanent URL from Uploadcare
        const fileUrl = result.cdnUrl;
        console.log('--- UPLOAD SUCCESS ---');
        console.log('File name:', req.file.originalname);
        console.log('Uploaded URL:', fileUrl);
        console.log('----------------------');

        res.status(201).json({ 
            message: 'File uploaded successfully to cloud storage',
            url: fileUrl 
        });
    } catch (error) {
        console.error('Uploadcare error:', error);
        res.status(500).json({ 
            message: 'Error uploading to cloud storage',
            error: error.message 
        });
    }
};

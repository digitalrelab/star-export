# Media Export Functionality

## Overview

The Star Export application now supports downloading media content (images and videos) along with metadata from supported platforms. This guide explains how the media export functionality works and how to use it.

## Supported Platforms

### YouTube
- **Media Types**: Thumbnails (high and medium quality)
- **File Formats**: JPG
- **Max File Size**: 2048MB
- **Content**: Video thumbnails from your channel

### Instagram
- **Media Types**: Images, Videos, Stories
- **File Formats**: JPG, PNG, MP4, MOV
- **Max File Size**: 1024MB
- **Content**: All your posts, stories, and carousel media

### Facebook
- **Media Types**: Photos, Videos from posts
- **File Formats**: JPG, PNG, GIF, MP4, MOV
- **Max File Size**: 1024MB
- **Content**: Photos and videos from your posts and uploads

## How It Works

### 1. Export Request
When you start an export with "Include media files" checked:
- The system fetches metadata first (as usual)
- Extracts media URLs from the platform responses
- Downloads media files concurrently (3 files at a time)
- Organizes files by platform and media type
- Creates a ZIP archive containing both metadata and media

### 2. File Organization
Downloaded files are organized as follows:
```
export-{jobId}/
├── {platform}-export-{jobId}.json  # Metadata
└── media/
    ├── images/
    │   └── {platform}/
    │       ├── {date}_{id}.{ext}
    │       └── {id}.{ext}.meta.json
    └── videos/
        └── {platform}/
            ├── {date}_{id}.{ext}
            └── {id}.{ext}.meta.json
```

### 3. Metadata Files
Each media file includes a corresponding `.meta.json` file with:
- Original ID from the platform
- Platform name
- Download timestamp
- Original caption/description
- File dimensions (when available)

## Usage

### Frontend
1. Select a platform that supports media export
2. Choose your export format
3. Check "Include media files (images and videos)"
4. Review the information panel about file types and sizes
5. Click "Start Export"

### API
```typescript
const exportRequest = {
  platform: 'instagram',
  format: 'json',
  includeMedia: true
};

const response = await apiService.startExport(exportRequest);
```

## Technical Implementation

### Backend Services

#### MediaDownloadService
- **Concurrent Downloads**: Uses semaphore pattern for controlled concurrency
- **Retry Logic**: Automatic retry with exponential backoff
- **Progress Tracking**: Real-time progress callbacks
- **File Safety**: Sanitizes filenames and checks existing files

#### Platform Services Extensions
Each platform service now includes:
- `extractMediaItems()` method to parse media URLs
- Support for different media types (images/videos)
- Metadata extraction for each media item

#### Export Process Updates
- Progress stages now include media download step (90-95%)
- Archive creation for exports with media
- Enhanced error handling for media download failures

### Frontend Updates

#### Enhanced UI
- Checkbox to enable media export
- Information panel with supported formats and limits
- Dynamic progress indicators during media download

#### Type Safety
- Updated `ExportRequest` interface with `includeMedia` flag
- Enhanced progress tracking types
- Platform configuration with media support flags

## Performance Considerations

### Download Limits
- **Concurrency**: 3 simultaneous downloads to avoid overwhelming servers
- **Retry Logic**: Maximum 3 retries per file with exponential backoff
- **File Size Limits**: Platform-specific limits to prevent excessive downloads

### Storage
- Files are temporarily stored in `exports/{jobId}/` directory
- Archives are created for downloads with media
- Cleanup should be implemented for old exports

### Rate Limiting
- Respects platform API rate limits
- Uses appropriate User-Agent headers
- Implements delay between requests when needed

## Error Handling

### Download Failures
- Failed downloads are tracked and reported
- Export continues even if some media files fail
- Failed file list is included in progress reporting

### Storage Issues
- Graceful handling of disk space issues
- Automatic directory creation
- File permission checks

## Security Considerations

### File Safety
- Filename sanitization to prevent directory traversal
- File type validation based on platform specifications
- Maximum file size enforcement

### Access Control
- User authentication required for all downloads
- Job ownership verification
- Secure file serving with proper headers

## Future Enhancements

### Planned Features
1. **Selective Media Export**: Choose specific media types or date ranges
2. **Quality Options**: Different quality levels for images/videos
3. **Cloud Storage**: Direct upload to user's cloud storage
4. **Incremental Updates**: Only download new media since last export
5. **Bandwidth Limiting**: User-configurable download speed limits

### Performance Improvements
1. **Streaming Archives**: Create ZIP files on-the-fly during download
2. **CDN Integration**: Cache frequently accessed media
3. **Parallel Processing**: Multi-threaded download processing
4. **Compression**: Optional image compression for smaller exports

## Troubleshooting

### Common Issues
1. **Slow Downloads**: Check network connection and platform rate limits
2. **Missing Media**: Some platforms may restrict certain file access
3. **Large File Sizes**: Consider metadata-only export for large accounts
4. **Archive Errors**: Ensure sufficient disk space for export creation

### Debug Information
- Check server logs for detailed download progress
- Monitor export job status for failure details
- Review platform-specific API responses for media availability
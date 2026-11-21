import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { resumeApi, extractErrorMessage } from '../../services/resumeApi';
import { validateResumeFile } from '../../utils/resumeFormat';
import './UploadResume.css';

const UploadResume = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [notice, setNotice] = useState(null);
  const [recentResult, setRecentResult] = useState(null);

  const addFiles = (incomingFiles) => {
    const normalized = incomingFiles.map((file) => {
      // Files the backend would reject are flagged immediately instead of failing after upload
      const validationError = validateResumeFile(file);

      return {
        clientId: `${Date.now()}-${Math.round(Math.random() * 1e9)}`,
        file,
        status: validationError ? 'error' : 'ready',
        uploadedResume: null,
        parsedResume: null,
        parsedData: null,
        error: validationError,
      };
    });

    const rejectedCount = normalized.filter((item) => item.status === 'error').length;

    setFiles((prev) => [...prev, ...normalized]);
    setNotice(
      rejectedCount > 0
        ? {
            type: 'warning',
            text: `${normalized.length - rejectedCount} file(s) added. ${rejectedCount} file(s) cannot be uploaded; see the list below.`,
          }
        : { type: 'info', text: `${normalized.length} file${normalized.length === 1 ? '' : 's'} added.` }
    );
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    addFiles(droppedFiles);
  };

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    addFiles(selectedFiles);
    e.target.value = '';
  };

  const updateFile = (clientId, updates) => {
    setFiles((prev) =>
      prev.map((item) => (item.clientId === clientId ? { ...item, ...updates } : item))
    );
  };

  const removeFile = (clientId) => {
    setFiles((prev) => prev.filter((item) => item.clientId !== clientId));
  };

  const clearCompleted = () => {
    setFiles((prev) => prev.filter((item) => item.status === 'ready' || item.status === 'uploading' || item.status === 'parsing'));
  };

  // Uploads then parses one file. Errors are recorded on the item so the rest of the batch continues.
  const processFile = async (item) => {
    updateFile(item.clientId, {
      status: 'uploading',
      error: null,
    });

    let uploadedResume = item.uploadedResume;

    try {
      // A retry after a failed parse reuses the already uploaded file
      if (!uploadedResume?.id) {
        const uploadedResponse = await resumeApi.uploadResume(item.file);
        uploadedResume = uploadedResponse.data || null;
        updateFile(item.clientId, { uploadedResume });
      }

      updateFile(item.clientId, { status: 'parsing' });

      const response = await resumeApi.parseUploadedResume(uploadedResume.id);
      const parsedResume = response.data || null;

      updateFile(item.clientId, {
        status: 'parsed',
        parsedResume,
        parsedData: parsedResume?.data || null,
      });

      return parsedResume;
    } catch (error) {
      updateFile(item.clientId, {
        status: 'error',
        uploadedResume,
        error: extractErrorMessage(error),
      });

      return null;
    }
  };

  const processBatch = async () => {
    const targetItems = files.filter((item) => item.status === 'ready');

    if (targetItems.length === 0) {
      setNotice({ type: 'warning', text: 'No ready files are available to upload and parse.' });
      return;
    }

    setIsProcessing(true);
    setNotice(null);

    let succeeded = 0;

    for (const item of targetItems) {
      const result = await processFile(item);
      if (result) {
        succeeded += 1;
        setRecentResult(result);
      }
    }

    const failed = targetItems.length - succeeded;

    setNotice(
      failed === 0
        ? {
            type: 'success',
            text: `${succeeded} resume${succeeded === 1 ? '' : 's'} uploaded and parsed successfully.`,
          }
        : {
            type: succeeded > 0 ? 'warning' : 'error',
            text: `${succeeded} parsed, ${failed} failed. Check the errors below; failed uploads can be retried.`,
          }
    );

    setIsProcessing(false);
  };

  const retryFile = (clientId) => {
    updateFile(clientId, { status: 'ready', error: null });
  };

  const readyCount = files.filter((item) => item.status === 'ready').length;
  const parsingCount = files.filter((item) => item.status === 'parsing').length;
  const parsedCount = files.filter((item) => item.status === 'parsed').length;
  const hasSelectableFiles = files.some((item) => item.status === 'ready');

  const renderStatus = (status) => {
    switch (status) {
      case 'ready':
        return 'Ready';
      case 'uploading':
        return 'Uploading';
      case 'uploaded':
        return 'Uploaded';
      case 'parsing':
        return 'Parsing';
      case 'parsed':
        return 'Parsed';
      case 'error':
        return 'Failed';
      default:
        return 'Queued';
    }
  };

  return (
    <div className="upload-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Upload Resumes</h1>
          <p className="page-subtitle">
            Each file is uploaded to the parser service and then parsed into a candidate profile.
          </p>
        </div>
        <div className="upload-stats">
          <span className="stat-chip">Ready: {readyCount}</span>
          <span className="stat-chip">Parsing: {parsingCount}</span>
          <span className="stat-chip">Parsed: {parsedCount}</span>
        </div>
      </div>

      <div className="upload-container card">
        <div 
          className={`drop-zone ${isDragging ? 'drag-active' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="drop-icon">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
          </div>
          <h3>Select files or drag and drop here</h3>
          <p>Supported formats: PDF, DOCX (Max 5 MB per file)</p>

          <input
            type="file"
            id="file-upload"
            multiple
            className="file-input-hidden"
            onChange={handleFileSelect}
            accept=".pdf,.docx"
          />
          <label htmlFor="file-upload" className="secondary-button browse-btn">
            Browse Files
          </label>
        </div>

        <div className="upload-toolbar">
          <button
            className="primary-button"
            onClick={() => processBatch()}
            disabled={isProcessing || !hasSelectableFiles}
          >
            {isProcessing ? 'Uploading and parsing...' : 'Upload & Parse'}
          </button>
          <button
            className="text-button"
            onClick={clearCompleted}
            disabled={isProcessing}
          >
            Clear finished items
          </button>
        </div>
      </div>

      {notice && (
        <div className={`notice notice-${notice.type}`}>
          {notice.text}
        </div>
      )}

      {files.length > 0 && (
        <div className="file-list-container card">
          <div className="card-header">
            <h2>Selected Files ({files.length})</h2>
            <button className="text-button" onClick={() => setFiles([])} disabled={isProcessing}>
              Clear All
            </button>
          </div>
          <div className="card-body">
            <ul className="upload-file-list">
              {files.map((item) => (
                <li key={item.clientId} className="file-item">
                  <div className="file-info">
                    <div className="file-type-icon">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                    </div>
                    <div>
                      <div className="file-name">{item.file.name}</div>
                      <div className="file-size">{(item.file.size / 1024 / 1024).toFixed(2)} MB</div>
                      <div className="file-meta">
                        <span className={`status-pill status-${item.status}`}>{renderStatus(item.status)}</span>
                        {item.uploadedResume?.id && <span className="meta-text">ID: {item.uploadedResume.id}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="file-actions">
                    {item.status === 'parsed' && item.parsedResume?.id && (
                      <Link className="text-button" to={`/results/${item.parsedResume.id}`}>
                        View profile
                      </Link>
                    )}
                    {item.status === 'error' && !validateResumeFile(item.file) && (
                      <button className="text-button" onClick={() => retryFile(item.clientId)} disabled={isProcessing}>
                        Retry
                      </button>
                    )}
                    <button className="icon-button delete" onClick={() => removeFile(item.clientId)} disabled={isProcessing} aria-label="Remove file">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a1 1 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                  </div>
                  {item.error && <div className="item-error">{item.error}</div>}
                </li>
              ))}
            </ul>
          </div>
          <div className="card-footer upload-footer">
            <div className="footer-note">
              {isProcessing ? 'Processing resumes against the parser service...' : 'Files are processed one at a time: upload first, then parse.'}
            </div>
            <button className="text-button" onClick={() => setRecentResult(null)} disabled={!recentResult}>
              Clear latest response
            </button>
          </div>
        </div>
      )}

      {recentResult && (
        <div className="card result-preview">
          <div className="card-header">
            <h2>Latest Service Response</h2>
          </div>
          <div className="card-body">
            <div className="result-grid">
              <div>
                <div className="result-label">Name</div>
                <div className="result-value">{recentResult.data?.personalInfo?.name || 'Not provided'}</div>
              </div>
              <div>
                <div className="result-label">Email</div>
                <div className="result-value">{recentResult.data?.personalInfo?.email || 'Not provided'}</div>
              </div>
              <div>
                <div className="result-label">Phone</div>
                <div className="result-value">{recentResult.data?.personalInfo?.phone || 'Not provided'}</div>
              </div>
              <div>
                <div className="result-label">Skills</div>
                <div className="result-value">
                  {(recentResult.data?.skills || []).length} extracted
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadResume;

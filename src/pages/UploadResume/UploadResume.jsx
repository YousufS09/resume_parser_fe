import React, { useState } from 'react';
import './UploadResume.css';

const UploadResume = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState([]);

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
    setFiles((prev) => [...prev, ...droppedFiles]);
  };

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles((prev) => [...prev, ...selectedFiles]);
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="upload-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Upload Resumes</h1>
          <p className="page-subtitle">Drag and drop resume files to parse and extract candidate data.</p>
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
          <p>Supported formats: PDF, DOCX, TXT (Max 10MB per file)</p>
          
          <input 
            type="file" 
            id="file-upload" 
            multiple 
            className="file-input-hidden"
            onChange={handleFileSelect}
            accept=".pdf,.docx,.doc,.txt"
          />
          <label htmlFor="file-upload" className="secondary-button browse-btn">
            Browse Files
          </label>
        </div>
      </div>

      {files.length > 0 && (
        <div className="file-list-container card">
          <div className="card-header">
            <h2>Selected Files ({files.length})</h2>
            <button className="text-button" onClick={() => setFiles([])}>Clear All</button>
          </div>
          <div className="card-body">
            <ul className="upload-file-list">
              {files.map((file, index) => (
                <li key={index} className="file-item">
                  <div className="file-info">
                    <div className="file-type-icon">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                    </div>
                    <div>
                      <div className="file-name">{file.name}</div>
                      <div className="file-size">{(file.size / 1024 / 1024).toFixed(2)} MB</div>
                    </div>
                  </div>
                  <button className="icon-button delete" onClick={() => removeFile(index)}>
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div className="card-footer align-right">
            <button className="primary-button large-btn">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="18" height="18" style={{marginRight: '8px'}}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
              Parse {files.length} {files.length === 1 ? 'Resume' : 'Resumes'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadResume;
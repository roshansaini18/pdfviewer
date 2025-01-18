import React, { useState} from 'react';

const PDFViewerModal = ({ isOpen, onClose, fileUrl }) => {
    const [zoom, setZoom] = useState(100);
    const [isFullscreen, setIsFullscreen] = useState(false);
  
    if (!isOpen) return null;
  
    const handleZoomIn = () => {
      setZoom(prev => Math.min(prev + 25, 200));
    };
  
    const handleZoomOut = () => {
      setZoom(prev => Math.max(prev - 25, 50));
    };
  
    const handleFullscreen = () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } else {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    };
  
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center">
        <div className="bg-gray-800  flex flex-col">
          {/* PDF Viewer */}
          <div className="flex-1 relative bg-white">
            <iframe 
              src={`${fileUrl}#zoom=${zoom}`} 
              className="w-full h-full" 
              title="PDF Viewer"
              style={{ transform: `scale(${zoom/100})`, transformOrigin: 'top left' }}
            />
          </div>
  
          {/* Navigation Controls */}
          <div className="bg-gray-700 p-3 flex items-center justify-center space-x-6">
            {/* Menu Button */}
            <button className="p-2 text-white hover:bg-gray-600 rounded">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
  
            {/* Previous Page */}
            <button className="p-2 text-white hover:bg-gray-600 rounded">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
  
            {/* Page Number */}
            <span className="text-white">1/1</span>
  
            {/* Next Page */}
            <button className="p-2 text-white hover:bg-gray-600 rounded">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
  
            {/* Zoom Out */}
            <button 
              onClick={handleZoomOut}
              className="p-2 text-white hover:bg-gray-600 rounded"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </button>
  
            {/* Zoom Percentage */}
            <span className="text-white w-16 text-center">{zoom}%</span>
  
            {/* Zoom In */}
            <button 
              onClick={handleZoomIn}
              className="p-2 text-white hover:bg-gray-600 rounded"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
  
            {/* Fullscreen */}
            <button 
              onClick={handleFullscreen}
              className="p-2 text-white hover:bg-gray-600 rounded"
            >
              {isFullscreen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9h6v6H9z" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
              )}
            </button>
  
            {/* Close Button */}
            <button 
              onClick={onClose}
              className="p-2 text-white hover:bg-gray-600 rounded"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  };

export default Pdfviewer

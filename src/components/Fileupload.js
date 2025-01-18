import axios from 'axios';
import React, { useRef, useState, useEffect,useCallback } from "react";
import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.6.172/pdf.worker.min.js";
const PDFViewer = ({ pdfUrl, onClose }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const pageRefs = useRef({});
  const [pdf, setPdf] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [scale, setScale] = useState(1.5);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState("scroll");

  // Initialize PDF.js worker
  useEffect(() => {
    if (typeof pdfjsLib !== "undefined") {
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
    }
  }, []);

  // Load PDF document
  useEffect(() => {
    const loadPdf = async () => {
      try {
        setIsLoading(true);
        const loadingTask = pdfjsLib.getDocument(pdfUrl);
        const loadedPdf = await loadingTask.promise;
        setPdf(loadedPdf);
        setNumPages(loadedPdf.numPages);
        setIsLoading(false);
      } catch (error) {
        console.error("Error loading PDF:", error);
        setIsLoading(false);
      }
    };

    loadPdf();
  }, [pdfUrl]);

  const renderPage = async (pageNumber, canvasEl) => {
    if (!pdf || !canvasEl || pageNumber < 1 || pageNumber > pdf.numPages) return;

    try {
      const page = await pdf.getPage(pageNumber);
      const rotation = page.rotate;
      const viewport = page.getViewport({ scale, rotation });

      const context = canvasEl.getContext("2d");

      // Set canvas dimensions
      canvasEl.width = viewport.width;
      canvasEl.height = viewport.height;

      // Render PDF page
      await page.render({
        canvasContext: context,
        viewport,
      }).promise;

      // Mark the canvas as rendered
      canvasEl.dataset.rendered = "true";
    } catch (error) {
      console.error(`Error rendering page ${pageNumber}:`, error);
    }
  };

  // Handle scroll mode page rendering
  useEffect(() => {
    if (!pdf || viewMode !== "scroll") return;

    const renderVisiblePages = () => {
      Object.entries(pageRefs.current).forEach(([pageNum, canvas]) => {
        if (!canvas.dataset.rendered) {
          const rect = canvas.getBoundingClientRect();
          const isVisible = rect.top < window.innerHeight && rect.bottom >= 0;
          if (isVisible) {
            renderPage(parseInt(pageNum), canvas);
          }
        }
      });
    };

    renderVisiblePages();

    // Add scroll event listener
    const container = containerRef.current;
    container.addEventListener("scroll", renderVisiblePages);
    return () => container.removeEventListener("scroll", renderVisiblePages);
  }, [pdf, viewMode, scale]);

  // Handle single page mode rendering
  useEffect(() => {
    if (pdf && viewMode === "single" && canvasRef.current) {
      renderPage(currentPage, canvasRef.current);
    }
  }, [pdf, currentPage, scale, viewMode]);

  const goToNextPage = () => {
    if (currentPage < numPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current.parentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const zoomIn = () => setScale((prev) => Math.min(prev + 0.25, 5));
  const zoomOut = () => setScale((prev) => Math.max(prev - 0.25, 0.5));

  const toggleViewMode = () => {
    setViewMode((prev) => (prev === "scroll" ? "single" : "scroll"));
    Object.values(pageRefs.current).forEach((canvas) => {
      if (canvas) canvas.dataset.rendered = "false";
    });
  };

  return (
    <div
      style={{
        position: "relative",
        height: isFullscreen ? "100vh" : "90vh",
        width: isFullscreen ? "100%" : "70%",
        margin: "auto",
        backgroundColor: "rgb(241, 238, 238)",
        padding: "20px",
        borderRadius: isFullscreen ? "0" : "10px",
        border: isFullscreen ? "none" : "1px solid black",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        transition: "all 0.3s ease",
      }}
    >
      <div
        style={{
          position: "sticky",
          top: "0",
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "transparent",
          color: "white",
          padding: "10px",
          borderRadius: "5px",
          zIndex: 1000,
          marginBottom: "10px",
        }}
      >
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <button onClick={goToPreviousPage} disabled={currentPage === 1}>
            Previous
          </button>
          <span>Page {currentPage} of {numPages || "..."}</span>
          <button onClick={goToNextPage} disabled={currentPage === numPages}>
            Next
          </button>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <button onClick={toggleViewMode}>
            {viewMode === "scroll" ? "Single Page" : "Scroll Mode"}
          </button>
          <button onClick={zoomOut}>-</button>
          <span>{(scale * 100).toFixed()}%</span>
          <button onClick={zoomIn}>+</button>
          <button onClick={toggleFullscreen}>
            {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          </button>
          <button
            onClick={onClose}
            style={{
              background: "red",
              color: "white",
              border: "none",
              borderRadius: "50%",
              width: "30px",
              height: "30px",
              cursor: "pointer",
              fontSize: "18px",
              fontWeight: "bold",
            }}
          >
            ✖
          </button>
        </div>
      </div>

      <div
        ref={containerRef}
        style={{
          flex: 1,
          width: "100%",
          overflow: "auto",
          background: "#f0f0f0",
          borderRadius: "5px",
          padding: "20px",
          position: "relative",
        }}
      >
        {isLoading ? (
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              background: "rgba(0,0,0,0.7)",
              color: "white",
              padding: "10px 20px",
              borderRadius: "5px",
            }}
          >
            Loading PDF...
          </div>
        ) : viewMode === "single" ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: "100%",
              background: "white",
              padding: "20px",
              borderRadius: "5px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }}
          >
            <canvas
              ref={canvasRef}
              style={{
                maxWidth: "100%",
                maxHeight: "100%",
              }}
            />
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {Array.from({ length: numPages }, (_, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  justifyContent: "center",
                  background: "white",
                  padding: "20px",
                  borderRadius: "5px",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                }}
              >
                <canvas
                  ref={(el) => (pageRefs.current[index + 1] = el)}
                  data-page-number={index + 1}
                  style={{
                    maxWidth: "100%",
                    height: "auto",
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};






const FileUpload = () => {
  const [file, setFile] = useState(null);
  const [cover, setCover] = useState(null);
  const [title, setTitle] = useState('');
  const [writer, setWriter] = useState('');
  const [message, setMessage] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchBy, setSearchBy] = useState('title'); // 'title' or 'writer'
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedFileUrl, setSelectedFileUrl] = useState('');

  // Fetch uploaded files
  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await axios.get('http://localhost:5000/files');
        setUploadedFiles(response.data);
      } catch (error) {
        console.error('Error fetching files:', error);
      }
    };

    fetchFiles();
  }, []);

  const handleFileChange = (event) => setFile(event.target.files[0]);
  const handleCoverChange = (event) => setCover(event.target.files[0]);

  const handleUpload = async () => {
    if (!file || !cover || !title || !writer) {
      setMessage('Please fill out all fields and select both files.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('cover', cover);
    formData.append('title', title);
    formData.append('writer', writer);

    try {
      await axios.post('http://localhost:5000/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setMessage('File uploaded successfully!');
      setFile(null);
      setCover(null);
      setTitle('');
      setWriter('');
      // Refresh file list
      const response = await axios.get('http://localhost:5000/files');
      setUploadedFiles(response.data);
    } catch (error) {
      console.error('Error uploading file:', error);
      setMessage('Failed to upload file.');
    }
  };

  const handleViewClick = (fileUrl) => {
    setSelectedFileUrl(fileUrl);
    setViewerOpen(true);
  };

  // Filter files based on search term
  const filteredFiles = uploadedFiles.filter((file) => {
    const searchTermLower = searchTerm.toLowerCase();
    if (searchBy === 'title') {
      return file.title.toLowerCase().includes(searchTermLower);
    } else {
      return file.writer.toLowerCase().includes(searchTermLower);
    }
  });

  return (
    <div>
      {!viewerOpen ? (
        <>
          <h1 className="text-2xl font-bold mb-4">Upload PDF with Metadata</h1>

          <div className="space-y-4 mb-6">
            <div>
              <input
                type="file"
                onChange={handleFileChange}
                accept="application/pdf"
                className="mb-2 block"
              />
              <input
                type="file"
                onChange={handleCoverChange}
                accept="image/*"
                className="mb-2 block"
              />
            </div>

            <div className="space-y-2">
              <input
                type="text"
                placeholder="Enter Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-2 border rounded"
              />
              <input
                type="text"
                placeholder="Enter Writer"
                value={writer}
                onChange={(e) => setWriter(e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>

            <button
              onClick={handleUpload}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Upload
            </button>

            {message && <p className="text-sm text-gray-600">{message}</p>}
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Search Files</h2>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Search files..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-grow p-2 border rounded"
              />
              <select
                value={searchBy}
                onChange={(e) => setSearchBy(e.target.value)}
                className="p-2 border rounded"
              >
                <option value="title">By Title</option>
                <option value="writer">By Writer</option>
              </select>
            </div>
          </div>

          <h2 className="text-xl font-semibold mb-4">Uploaded Files:</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredFiles.map((file, index) => (
              <div key={index} className="border rounded p-4 flex flex-col items-start">
                <img
                  src={file.coverUrl}
                  alt="Cover"
                  className="h-14 w-14 object-cover mb-2 rounded"
                />
                <h3 className="font-semibold text-sm">{file.title}</h3>
                <p className="text-gray-600 text-sm">Writer: {file.writer}</p>
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => handleViewClick(file.fileUrl)}
                    className="text-blue-500 hover:text-blue-600 text-sm"
                  >
                    View PDF
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div style={{ 
          display: "flex", 
          paddingTop:"20px",
          paddingBottom:"20px",
          justifyContent: "center", 
          alignItems: "center", 
          backgroundColor: "#36454F"  // Light grey
      }}>
        <PDFViewer pdfUrl={selectedFileUrl}
          />
      </div>
      
      
      
      )}
    </div>
  );
};

export default FileUpload;

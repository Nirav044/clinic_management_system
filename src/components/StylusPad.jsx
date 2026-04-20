import { useRef, useState, useEffect, useCallback } from 'react';
import { Eraser, Download, RotateCcw, Palette, Minus, Plus, PenTool } from 'lucide-react';

const COLORS = ['#0f172a', '#4f46e5', '#0ea5e9', '#10b981', '#f59e0b', '#f43f5e'];
const SIZES = [2, 4, 6, 10];

const StylusPad = ({ onSave, width, height = 320 }) => {
    const canvasRef = useRef(null);
    const containerRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [color, setColor] = useState('#0f172a');
    const [brushSize, setBrushSize] = useState(3);
    const [isEraser, setIsEraser] = useState(false);
    const [history, setHistory] = useState([]);
    const [historyIndex, setHistoryIndex] = useState(-1);

    // Initialize canvas
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const container = containerRef.current;
        const w = width || container.offsetWidth;
        const dpr = window.devicePixelRatio || 1;

        canvas.width = w * dpr;
        canvas.height = height * dpr;
        canvas.style.width = `${w}px`;
        canvas.style.height = `${height}px`;

        const ctx = canvas.getContext('2d');
        ctx.scale(dpr, dpr);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, w, height);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // Save initial blank state
        saveToHistory();
    }, []);

    const saveToHistory = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const dataUrl = canvas.toDataURL();
        setHistory(prev => {
            const newHistory = prev.slice(0, historyIndex + 1);
            newHistory.push(dataUrl);
            return newHistory;
        });
        setHistoryIndex(prev => prev + 1);
    }, [historyIndex]);

    const getCoords = (e) => {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();

        if (e.touches && e.touches[0]) {
            return {
                x: e.touches[0].clientX - rect.left,
                y: e.touches[0].clientY - rect.top
            };
        }
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    };

    const startDrawing = (e) => {
        e.preventDefault();
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const { x, y } = getCoords(e);

        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.strokeStyle = isEraser ? '#ffffff' : color;
        ctx.lineWidth = isEraser ? brushSize * 4 : brushSize;
        setIsDrawing(true);
    };

    const draw = (e) => {
        if (!isDrawing) return;
        e.preventDefault();
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const { x, y } = getCoords(e);

        ctx.lineTo(x, y);
        ctx.stroke();
    };

    const stopDrawing = () => {
        if (isDrawing) {
            setIsDrawing(false);
            saveToHistory();
        }
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const container = containerRef.current;
        const w = width || container.offsetWidth;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, w, height);
        saveToHistory();
    };

    const undo = () => {
        if (historyIndex <= 0) return;
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        const img = new Image();
        img.onload = () => {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            const container = containerRef.current;
            const w = width || container.offsetWidth;
            ctx.clearRect(0, 0, w, height);
            ctx.drawImage(img, 0, 0, w, height);
        };
        img.src = history[newIndex];
    };

    const downloadImage = () => {
        const canvas = canvasRef.current;
        const link = document.createElement('a');
        link.download = `doctor-note-${Date.now()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    };

    const getImageData = () => {
        const canvas = canvasRef.current;
        return canvas ? canvas.toDataURL('image/png') : null;
    };

    // Expose getImageData via onSave callback when it changes
    useEffect(() => {
        if (onSave) {
            onSave(getImageData);
        }
    }, [onSave]);

    return (
        <div className="stylus-pad" ref={containerRef}>
            {/* Toolbar */}
            <div className="stylus-toolbar">
                <div className="stylus-tools-left">
                    <button
                        className={`stylus-tool ${!isEraser ? 'active' : ''}`}
                        onClick={() => setIsEraser(false)}
                        title="Pen"
                    >
                        <PenTool size={15} />
                    </button>
                    <button
                        className={`stylus-tool ${isEraser ? 'active' : ''}`}
                        onClick={() => setIsEraser(true)}
                        title="Eraser"
                    >
                        <Eraser size={15} />
                    </button>

                    <div className="stylus-divider" />

                    {/* Color Picker */}
                    <div className="stylus-colors">
                        {COLORS.map(c => (
                            <button
                                key={c}
                                className={`color-dot ${color === c && !isEraser ? 'active' : ''}`}
                                style={{ background: c }}
                                onClick={() => { setColor(c); setIsEraser(false); }}
                                title={c}
                            />
                        ))}
                    </div>

                    <div className="stylus-divider" />

                    {/* Brush Size */}
                    <div className="stylus-sizes">
                        {SIZES.map(s => (
                            <button
                                key={s}
                                className={`size-dot ${brushSize === s ? 'active' : ''}`}
                                onClick={() => setBrushSize(s)}
                                title={`${s}px`}
                            >
                                <span style={{ width: s + 4, height: s + 4, borderRadius: '50%', background: 'currentColor', display: 'block' }} />
                            </button>
                        ))}
                    </div>
                </div>

                <div className="stylus-tools-right">
                    <button className="stylus-tool" onClick={undo} title="Undo">
                        <RotateCcw size={15} />
                    </button>
                    <button className="stylus-tool" onClick={clearCanvas} title="Clear All">
                        <Eraser size={15} />
                        <span className="tool-label">Clear</span>
                    </button>
                    <button className="stylus-tool primary" onClick={downloadImage} title="Download as PNG">
                        <Download size={15} />
                    </button>
                </div>
            </div>

            {/* Canvas */}
            <canvas
                ref={canvasRef}
                className="stylus-canvas"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
            />

            <p className="stylus-hint">
                <PenTool size={12} /> Draw with mouse, touchscreen, or stylus
            </p>
        </div>
    );
};

export default StylusPad;

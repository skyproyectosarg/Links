const { useState, useEffect, useCallback } = React;

const materialsList = ['PLA', 'PETG', 'ABS', 'ASA', 'TPU', 'PET', 'NYLON', 'PC', 'Otros'];

const Icon = ({ name, size = 20, className = "" }) => {
    useEffect(() => {
        if (window.lucide) window.lucide.createIcons();
    }, [name]);
    return <i data-lucide={name} style={{ width: size, height: size }} className={className}></i>;
};

const TechInfo = ({ term, info }) => {
    const [show, setShow] = useState(false);
    return (
        <span 
            className="relative inline-block group cursor-help border-b border-dashed border-[#8b5cf6] text-white font-bold px-1 rounded-sm hover:bg-[#8b5cf6]/10 transition-colors"
            onMouseEnter={() => setShow(true)}
            onMouseLeave={() => setShow(false)}
        >
            {term}
            {show && (
                <span className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 tech-tooltip p-4 bg-slate-900 border border-slate-700 rounded-2xl leading-relaxed text-slate-200 z-[100] animate-in fade-in slide-in-from-bottom-2">
                    <span className="flex items-center gap-2 font-black text-[#8b5cf6] uppercase mb-2">
                        <Icon name="info" size={14} className="text-[#8b5cf6]" /> {term}
                    </span>
                    {info}
                    <span className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-700"></span>
                </span>
            )}
        </span>
    );
};

const App = () => {
    const [activeTab, setActiveTab] = useState('calculators');
    const [activeCalc, setActiveCalc] = useState('flow');
    const [material, setMaterial] = useState('PLA');
    const [history, setHistory] = useState([]);
    const [expandedStep, setExpandedStep] = useState(-1);
    const [copied, setCopied] = useState(false);
    const [saved, setSaved] = useState(false);
    const [symptom, setSymptom] = useState(null);

    const [flowData, setFlowData] = useState({ current: 0.98, modifier: 5 });
    const [paData, setPaData] = useState({ start: 0, step: 0.02, height: 10 });
    const [volData, setVolData] = useState({ start: 5, step: 0.5, height: 20 });
    const [vfaData, setVfaData] = useState({ start: 100, step: 20, level: 3 });
    const [shrinkData, setShrinkData] = useState({ target: 100, measured: 99.2 });

    useEffect(() => {
        const presets = {
            PLA: { flow: 0.98, paStep: 0.02, volStart: 5, volStep: 0.5 },
            PETG: { flow: 0.95, paStep: 0.04, volStart: 3, volStep: 0.3 },
            ABS: { flow: 0.94, paStep: 0.04, volStart: 5, volStep: 0.5 },
            TPU: { flow: 1.00, paStep: 0.08, volStart: 1, volStep: 0.1 },
            Otros: { flow: 1.00, paStep: 0.02, volStart: 5, volStep: 0.5 }
        };
        const config = presets[material] || presets.Otros;
        setFlowData(p => ({ ...p, current: config.flow }));
        setPaData(p => ({ ...p, step: config.paStep }));
        setVolData(p => ({ ...p, start: config.volStart, step: config.volStep }));
    }, [material]);

    const getCurrentResult = useCallback(() => {
        const p = (v) => isNaN(parseFloat(v)) ? 0 : parseFloat(v);
        switch(activeCalc) {
            case 'flow': return (p(flowData.current) * (100 + p(flowData.modifier)) / 100).toFixed(4);
            case 'pa': return (p(paData.start) + (p(paData.height) * p(paData.step))).toFixed(4);
            case 'vol': return (p(volData.start) + (p(volData.height) * p(volData.step))).toFixed(2);
            case 'vfa': return (p(vfaData.start) + (p(vfaData.step) * (Math.max(1, parseInt(vfaData.level)) - 1))).toFixed(0);
            case 'shrink': return ((p(shrinkData.target) / p(shrinkData.measured)) * 100).toFixed(2);
            default: return "0.0000";
        }
    }, [activeCalc, flowData, paData, volData, vfaData, shrinkData]);

    const saveToHistory = () => {
        const res = getCurrentResult();
        const newItem = {
            id: Date.now(),
            type: activeCalc.toUpperCase(),
            material,
            value: res + (activeCalc === 'shrink' ? '%' : ''),
            date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setHistory(prev => [newItem, ...prev].slice(0, 10));
        setSaved(true);
        setTimeout(() => setSaved(false), 1500);
    };

    const guideItems = [
        { title: "1. Torre de Temperatura", icon: "thermometer", content: "Determine el rango térmico ideal. Inicie en el máximo del fabricante y baje cada 5°C. Busque la mejor adhesión de capas y puentes limpios sin hilos." },
        { title: "2. Relación de Flujo", icon: "activity", content: "Ajuste el volumen real de extrusión. Pass 1: superficie cerrada sin rebabas en bordes. Pass 2: ajuste fino para terminación lisa y sólida." },
        { title: "3. Pressure Advance", icon: "settings-2", content: "Compensa la elasticidad del filamento. Crucial para esquinas nítidas sin abultamientos. Direct Drive: 0.012-0.045. Bowden: 0.12-0.55." },
        { title: "4. Velocidad Volumétrica", icon: "gauge", content: "El techo físico de su Hotend en mm³/s. Por encima de este valor habrá subextrusión. V6: ~15, Volcano: ~30, Bambu HF: ~32." },
        { title: "5. Test de Vibraciones (VFA)", icon: "zap", content: "Evite marcas visuales de motores. Imprima una pared de 20 a 200 mm/s. Identifique la velocidad donde la superficie es más brillante y lisa." },
        { title: "6. Scarf Seams", icon: "sparkles", content: "Técnica de laminado en rampa gradual que solapa el inicio y fin del perímetro para borrar visualmente la cicatriz de la costura." },
        { title: "7. Encogimiento y Escala", icon: "maximize", content: "Compensación de contracción física. Los polímeros encogen al enfriar. ABS/ASA (0.7%), PLA (0.1%). Use este cálculo para piezas dimensionales." },
        { title: "8. Diagnóstico de Humedad", icon: "wind", content: "PLA (45°C), PETG (65°C), Nylon (80°C). Burbujeo en el nozzle o hilos constantes son señal de filamento húmedo." }
    ];

    return (
        <div className="min-h-screen bg-[#0a0f18] text-slate-100 selection:bg-[#8b5cf6]/30">
            <div className="max-w-5xl mx-auto p-4 md:p-8">
                <header className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4 border-b border-slate-800 pb-8 text-left">
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 bg-[#8b5cf6] rounded-2xl flex items-center justify-center shadow-lg text-white transform rotate-3">
                            <Icon name="layers" size={32} />
                        </div>
                        <div className="text-left">
                            <h1 className="text-4xl font-black tracking-tighter bg-gradient-to-r from-[#8b5cf6] to-violet-300 bg-clip-text text-transparent uppercase italic">Sky Toolbox</h1>
                            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest italic">Herramientas para makers</p>
                        </div>
                    </div>
                    <nav className="flex bg-slate-900/80 p-1.5 rounded-xl border border-slate-800 shadow-inner">
                        <button onClick={() => setActiveTab('calculators')} className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'calculators' ? 'bg-[#8b5cf6] text-white shadow-md' : 'text-slate-400'}`}>Calculadoras</button>
                        <button onClick={() => setActiveTab('guide')} className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'guide' ? 'bg-[#8b5cf6] text-white shadow-md' : 'text-slate-400'}`}>Ayuda</button>
                    </nav>
                </header>

                {activeTab === 'calculators' ? (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in">
                        <div className="lg:col-span-3 space-y-5">
                            <div className="bg-slate-900/50 p-5 rounded-2xl border border-slate-800 text-left">
                                <label className="text-xs font-black uppercase text-slate-500 tracking-widest mb-3 block italic">Filamento:</label>
                                <select value={material} onChange={(e) => setMaterial(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-[#8b5cf6] transition-all cursor-pointer">
                                    {materialsList.map(m => <option key={m} value={m}>{m}</option>)}
                                </select>
                            </div>
                            <div className="flex lg:flex-col gap-3 overflow-x-auto no-scrollbar pb-3">
                                {[
                                    { id: 'flow', label: 'Flujo', icon: "activity" },
                                    { id: 'pa', label: 'Presión (PA)', icon: "settings-2" },
                                    { id: 'vol', label: 'Caudal', icon: "gauge" },
                                    { id: 'vfa', label: 'VFA', icon: "zap" },
                                    { id: 'shrink', label: 'Escala', icon: "maximize" },
                                ].map((c) => (
                                    <button key={c.id} onClick={() => setActiveCalc(c.id)} className={`flex-shrink-0 flex items-center gap-4 p-4 rounded-xl border transition-all ${activeCalc === c.id ? 'bg-[#8b5cf6]/10 border-[#8b5cf6] text-[#8b5cf6]' : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'}`}>
                                        <Icon name={c.icon} size={20} /> <span className="font-bold text-sm uppercase tracking-tighter">{c.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="lg:col-span-9 space-y-8">
                            <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 md:p-10 backdrop-blur-md relative shadow-2xl overflow-visible">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="space-y-8 text-left">
                                        <h3 className="text-2xl font-bold flex items-center gap-4 uppercase tracking-tighter text-slate-100 italic"><Icon name="cpu" className="text-[#8b5cf6]" /> Entrada de Datos</h3>
                                        <div className="space-y-6">
                                            {activeCalc === 'flow' && (<><InputGroup label="Flujo Actual" value={flowData.current} onChange={(v) => setFlowData({...flowData, current: v})} help="Slicer config" /><InputGroup label="Modificador del Bloque" value={flowData.modifier} onChange={(v) => setFlowData({...flowData, modifier: v})} help="Bloque impreso" /></>)}
                                            {activeCalc === 'pa' && (<><InputGroup label="Valor Inicial" value={paData.start} onChange={(v) => setPaData({...paData, start: v})} /><InputGroup label="Paso (Step)" value={paData.step} onChange={(v) => setPaData({...paData, step: v})} /><InputGroup label="Altura Medida" value={paData.height} onChange={(v) => setPaData({...paData, height: v})} /></>)}
                                            {activeCalc === 'vol' && (<><InputGroup label="Inicio (mm³/s)" value={volData.start} onChange={(v) => setVolData({...volData, start: v})} /><InputGroup label="Paso" value={volData.step} onChange={(v) => setVolData({...volData, step: v})} /><InputGroup label="Altura Fallo" value={volData.height} onChange={(v) => setVolData({...volData, height: v})} /></>)}
                                            {activeCalc === 'vfa' && (<><InputGroup label="Velocidad Inicial" value={vfaData.start} onChange={(v) => setVfaData({...vfaData, start: v})} /><InputGroup label="Incremento" value={vfaData.step} onChange={(v) => setVfaData({...vfaData, step: v})} /><InputGroup label="Nivel" value={vfaData.level} onChange={(v) => setVfaData({...vfaData, level: v})} /></>)}
                                            {activeCalc === 'shrink' && (<><InputGroup label="Medida en Slicer (mm)" value={shrinkData.target} onChange={(v) => setShrinkData({...shrinkData, target: v})} /><InputGroup label="Medida con Calibre (mm)" value={shrinkData.measured} onChange={(v) => setShrinkData({...shrinkData, measured: v})} /></>)}
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-center justify-center text-center p-8 bg-[#8b5cf6]/5 rounded-3xl border-2 border-dashed border-[#8b5cf6]/20 min-h-[320px] relative shadow-inner">
                                        <p className="text-[#8b5cf6] text-xs font-black uppercase tracking-widest mb-2 font-mono">Valor Sugerido</p>
                                        <div className="text-5xl md:text-7xl font-black text-white leading-tight tabular-nums tracking-tighter drop-shadow-xl">
                                            {getCurrentResult()}{activeCalc === 'shrink' && '%'}
                                        </div>
                                        <div className="flex gap-3 w-full max-w-[280px] mt-10">
                                            <button onClick={() => { navigator.clipboard.writeText(getCurrentResult()); setCopied(true); setTimeout(() => setCopied(false), 2000); }} className={`flex-1 flex items-center justify-center gap-3 px-5 py-4.5 rounded-2xl font-bold transition-all shadow-xl ${copied ? 'bg-green-500 text-white' : 'bg-[#8b5cf6] text-white hover:bg-violet-400'}`}>
                                                <Icon name={copied ? "check" : "clipboard"} size={22} /> {copied ? 'Copiado' : 'Copiar'}
                                            </button>
                                            <button onClick={saveToHistory} className={`p-4.5 rounded-2xl transition-all border shadow-lg ${saved ? 'bg-green-600 border-green-500 text-white' : 'bg-slate-800 text-slate-300 border-slate-700'}`}>
                                                <Icon name={saved ? "check" : "save"} size={22} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-900/40 p-8 rounded-3xl border border-slate-800 shadow-inner">
                                <h4 className="text-sm font-black uppercase text-slate-500 flex items-center gap-2 mb-5 italic"><Icon name="rotate-ccw" size={16} /> Historial</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {history.length > 0 ? history.map(item => (
                                        <div key={item.id} className="flex justify-between items-center p-4 bg-slate-950/50 rounded-xl border border-slate-800 text-left">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black text-[#8b5cf6] uppercase">{item.type}</span>
                                                <span className="text-white font-mono font-bold text-base tracking-tight">{item.value}</span>
                                            </div>
                                            <span className="text-[10px] text-slate-600 uppercase font-bold">{item.date}</span>
                                        </div>
                                    )) : <p className="text-sm text-slate-600 italic py-3 text-center w-full uppercase tracking-widest">Sin datos guardados</p>}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-5 animate-in fade-in duration-500 pb-24">
                        <div className="grid grid-cols-1 gap-5 text-left">
                            {guideItems.map((step, idx) => (
                                <DocStep key={idx} title={step.title} iconName={step.icon} expanded={expandedStep === idx} onClick={() => setExpandedStep(expandedStep === idx ? -1 : idx)}>
                                    <div className="text-slate-400 leading-relaxed">{step.content}</div>
                                </DocStep>
                            ))}
                        </div>
                        <div className="bg-gradient-to-r from-violet-900/20 to-slate-900/30 p-10 rounded-3xl border border-[#8b5cf6]/30 flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl">
                            <div className="flex items-start gap-5 text-left">
                                <div className="p-4 bg-slate-800 rounded-2xl text-[#8b5cf6]"><Icon name="book-open" size={28} /></div>
                                <div className="space-y-2">
                                    <h4 className="text-2xl font-bold text-white italic">Manual de Calibración</h4>
                                    <p className="text-base text-slate-400 max-w-md">Documentación técnica oficial de OrcaSlicer condensada para configuración profesional.</p>
                                </div>
                            </div>
                            <a href="https://github.com/OrcaSlicer/OrcaSlicer/wiki/Calibration" target="_blank" rel="noreferrer" className="flex items-center gap-4 bg-[#8b5cf6] text-white px-10 py-4 rounded-xl font-bold hover:bg-violet-400 transition-all shadow-lg">
                                Wiki GitHub <Icon name="external-link" size={20} />
                            </a>
                        </div>
                    </div>
                )}
                
                <footer className="mt-14 pt-10 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between text-slate-500 pb-16 font-mono">
                    <div className="flex items-center gap-2 uppercase tracking-tighter">Sky Toolbox @ sky3darg</div>
                    <div className="text-[10px] uppercase font-black">© 2026 Sky 3D | by skydev</div>
                </footer>
            </div>
        </div>
    );
};

const DocStep = ({ title, iconName, expanded, onClick, children }) => (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden text-left transition-all">
        <button onClick={onClick} className="w-full flex items-center justify-between p-7 text-left group">
            <div className="flex items-center gap-5">
                <div className="p-4 bg-slate-800 rounded-xl text-[#8b5cf6] group-hover:bg-[#8b5cf6]/20 transition-colors"><Icon name={iconName} size={24} /></div>
                <div>
                    <h3 className="font-bold text-lg uppercase tracking-tighter italic group-hover:text-[#8b5cf6] transition-colors">{title}</h3>
                    <p className="text-xs text-[#8b5cf6] uppercase font-black italic">Guía Técnica</p>
                </div>
            </div>
            <Icon name={expanded ? "chevron-up" : "chevron-down"} size={24} className="text-slate-500" />
        </button>
        {expanded && <div className="p-7 pt-0 border-t border-slate-800/50 bg-slate-900/40 animate-in slide-in-from-top-1">{children}</div>}
    </div>
);

const InputGroup = ({ label, value, onChange, help }) => {
    const handleChange = (e) => {
        const val = e.target.value;
        if (/^-?\d*\.?\d*$/.test(val) || val === "") onChange(val);
    };
    return (
        <div className="space-y-2 group text-left">
            <label className="text-xs font-black uppercase text-slate-500 font-mono italic">{label}</label>
            <input type="text" value={value} onChange={handleChange} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/50 transition-all font-mono" />
            {help && <p className="text-[10px] text-slate-700 italic font-bold uppercase">{help}</p>}
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);

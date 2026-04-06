const { useState, useEffect, useCallback, useRef } = React;

const materialsList = ['PLA', 'PETG', 'ABS', 'ASA', 'TPU', 'PET', 'NYLON', 'PC', 'Otros'];

const Icon = ({ name, size = 20, className = "" }) => {
    const iconRef = useRef(null);
    useEffect(() => {
        if (window.lucide && iconRef.current) {
            try {
                window.lucide.createIcons({
                    icons: { [name]: window.lucide.icons[name] },
                    nameAttr: 'data-lucide'
                });
            } catch (e) { }
        }
    }, [name]);
    return <i key={name} ref={iconRef} data-lucide={name} style={{ width: size, height: size, display: 'inline-block' }} className={className}></i>;
};

const TechInfo = ({ term, info }) => {
    const [show, setShow] = useState(false);
    return (
        <span className="relative inline-block group cursor-help border-b border-dashed border-[#8b5cf6] text-white font-bold px-1 rounded-sm hover:bg-[#8b5cf6]/10 transition-colors"
              onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)} onClick={() => setShow(!show)}>
            {term}
            {show && (
                <span className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 tech-tooltip p-4 bg-slate-900 border border-slate-700 rounded-2xl leading-relaxed text-slate-200 animate-in fade-in slide-in-from-bottom-2">
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
    const [lang, setLang] = useState('es');
    const [activeTab, setActiveTab] = useState('calculators');
    const [activeCalc, setActiveCalc] = useState('flow');
    const [copied, setCopied] = useState(false);
    const [saved, setSaved] = useState(false);
    const [expandedStep, setExpandedStep] = useState(-1);
    const [material, setMaterial] = useState('PLA');
    const [symptom, setSymptom] = useState(null);
    const [history, setHistory] = useState([]);

    const [flowData, setFlowData] = useState({ current: 0.98, modifier: 5 });
    const [paData, setPaData] = useState({ start: 0, step: 0.02, height: 10 });
    const [volData, setVolData] = useState({ start: 5, step: 0.5, height: 20 });
    const [vfaData, setVfaData] = useState({ start: 100, step: 20, level: 3 });
    const [shrinkData, setShrinkData] = useState({ target: 100, measured: 99.2 });

    const getCurrentResult = useCallback(() => {
        const p = (v) => isNaN(parseFloat(v)) ? 0 : parseFloat(v);
        if (activeCalc === 'flow') return (p(flowData.current) * (100 + p(flowData.modifier)) / 100).toFixed(4);
        if (activeCalc === 'pa') return (p(paData.start) + (p(paData.height) * p(paData.step))).toFixed(4);
        if (activeCalc === 'vol') return (p(volData.start) + (p(volData.height) * p(volData.step))).toFixed(2);
        if (activeCalc === 'vfa') return (p(vfaData.start) + (p(vfaData.step) * (Math.max(1, parseInt(vfaData.level)) - 1))).toFixed(0);
        if (activeCalc === 'shrink') return p(shrinkData.measured) === 0 ? "0.00" : ((p(shrinkData.target) / p(shrinkData.measured)) * 100).toFixed(2);
        return "0.0000";
    }, [activeCalc, flowData, paData, volData, vfaData, shrinkData]);

    const saveToHistory = () => {
        const res = getCurrentResult();
        const newItem = { id: Date.now(), type: activeCalc.toUpperCase(), material, value: res + (activeCalc === 'shrink' ? '%' : ''), date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
        setHistory(prev => [newItem, ...prev].slice(0, 10));
        setSaved(true);
        setTimeout(() => setSaved(false), 1500);
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
    };

    const tips = {
        v6: { es: "Hotend clásico de E3D. Zona de fusión corta (~12mm). Ideal para precisión pero limitado en caudal máximo.", en: "Classic E3D hotend. Short melt zone (~12mm). Great for precision but limited in max flow." },
        volcano: { es: "Hotend de alta capacidad. Bloque vertical con zona de fusión de ~20mm. Permite duplicar la velocidad de extrusión.", en: "High capacity hotend. Vertical block with ~20mm melt zone. Allows doubling extrusion speed." },
        bambu: { es: "Hotend con calentador cerámico 360° y zona de fundido optimizada para CoreXY de ultra-velocidad.", en: "Hotend with 360° ceramic heater and melt zone optimized for ultra-high speed CoreXY." },
        scarf: { es: "Técnica de laminado en rampa gradual que solapa el inicio y fin del perímetro para borrar visualmente la cicatriz.", en: "Gradual ramp slicing technique that overlaps perimeter start and end to visually erase the scar." },
        order: { es: "El Scarf Seam requiere una base de paredes internas previa. Use siempre el orden Interior-Exterior.", en: "Scarf Seam requires a previous internal wall base. Always use Inner-Outer wall order." }
    };

    const t = {
        es: {
            subtitle: "Herramientas para makers", navCalcs: "Calculadoras", navGuide: "Ayuda", sidebarFlow: "Flujo", sidebarPA: "Presión", sidebarVol: "Caudal", sidebarVFA: "VFA", sidebarShrink: "Escala", inputTitle: "Entrada de Datos", resTitle: "Valor Sugerido", copyBtn: "Copiar", copiedBtn: "¡Listo!", guideLink: "Manual técnico completo", guideBadge: "Guía Técnica", matLabel: "Filamento:", recentResults: "Historial", clearAll: "Borrar", noHistory: "Sin datos",
            dryingTable: [
                { mat: 'PLA', temp: '45-50°C', time: '4-6h', desc: 'Evita el velo de hilos finos (angel hair).' },
                { mat: 'PETG', temp: '60-65°C', time: '6-8h', desc: 'Crítico para evitar el goteo constante.' },
                { mat: 'ABS/ASA', temp: '70-80°C', time: '6h+', desc: 'Elimina micro-burbujas en las paredes.' },
                { mat: 'Nylon/TPU', temp: '75-85°C', time: '12h+', desc: 'Obligatorio: Higroscópicos en pocas horas.' },
            ],
            wikiTitle: "Manual de Calibración", wikiSub: "Documentación técnica oficial condensada para configuración profesional.", wikiBtn: "Wiki GitHub"
        }
    };

    const guideItems = [
        { title: "1. Torre de Temperatura", icon: "thermometer", content: (
            <div className="space-y-4 text-left">
                <p className="text-slate-300 text-base md:text-lg leading-relaxed font-semibold">El cimiento de la calibración. Determina el límite térmico del polímero.</p>
                <div className="p-5 bg-slate-800/30 rounded-xl border border-slate-800 text-sm md:text-base text-slate-400 leading-relaxed">
                    • <strong>Rangos:</strong> PLA (190-230°C), PETG (235-260°C), ABS/ASA (245-275°C).<br/>
                    • <strong>Método:</strong> Inicie al máximo recomendado y decrezca cada 5°C. La temperatura ideal mantiene adhesión irrompible y puentes rectos.
                </div>
            </div>
        )},
        { title: "2. Relación de Flujo", icon: "activity", content: (
            <div className="space-y-4 text-left">
                <p className="text-slate-300 text-base md:text-lg leading-relaxed font-semibold">Ajusta el volumen real de plástico respecto al comando del Slicer.</p>
                <div className="p-5 bg-slate-800/30 rounded-xl border border-slate-800 text-sm md:text-base text-slate-400 leading-relaxed">
                    • <strong>Pass 1:</strong> Imprima bloques de -20 a +10. Busque superficie cerrada sin rebabas.<br/>
                    • <strong>Inspección:</strong> Use luz rasante. Si hay huecos, falta flujo; si hay crestas, sobra plástico.
                </div>
            </div>
        )},
        { title: "3. Avance de Presión (PA)", icon: "settings-2", content: (
            <div className="space-y-4 text-left">
                <p className="text-slate-300 text-base md:text-lg leading-relaxed font-semibold">Compensa la elasticidad del filamento para esquinas perfectas.</p>
                <div className="p-5 bg-slate-800/30 rounded-xl border border-slate-800 text-sm md:text-base text-slate-400 leading-relaxed">
                    • <strong>Qué hace:</strong> Elimina esquinas abultadas y evita hilos al final de perímetros.<br/>
                    • <strong>Valores Guía:</strong> Direct Drive (0.012 - 0.045), Bowden (0.12 - 0.55).
                </div>
            </div>
        )},
        { title: "4. Límite de Velocidad Volumétrica", icon: "gauge", content: (
            <div className="space-y-4 text-left">
                <p className="text-slate-300 text-base md:text-lg leading-relaxed font-semibold">El techo físico real de su Hotend expresado en mm³/s.</p>
                <div className="p-5 bg-slate-800/30 rounded-xl border border-slate-800 text-sm md:text-base text-slate-400 space-y-4 shadow-inner">
                    <div className="flex flex-col border-l-2 border-[#8b5cf6]/30 pl-3">
                        <TechInfo term="Hotend V6" info={tips.v6.es} /> <span className="text-white font-mono mt-1">12 - 15 mm³/s</span>
                    </div>
                    <div className="flex flex-col border-l-2 border-[#8b5cf6]/30 pl-3">
                        <TechInfo term="Hotend Volcano" info={tips.volcano.es} /> <span className="text-white font-mono mt-1">24 - 32 mm³/s</span>
                    </div>
                    <div className="flex flex-col border-l-2 border-[#8b5cf6]/30 pl-3">
                        <TechInfo term="Bambu Lab HF" info={tips.bambu.es} /> <span className="text-white font-mono mt-1">28 - 36 mm³/s</span>
                    </div>
                </div>
            </div>
        )},
        { title: "5. Test de Vibraciones (VFA)", icon: "zap", content: (
            <div className="space-y-4 text-left">
                <p className="text-slate-300 text-base md:text-lg leading-relaxed font-semibold">Vertical Fine Artifacts: marcas visuales por resonancia de motores.</p>
                <div className="p-5 bg-slate-800/30 rounded-xl border border-slate-800 text-sm md:text-base text-slate-400 leading-relaxed">
                    • <strong>Método:</strong> Imprima pared aumentando 20mm/s cada 10mm de altura.<br/>
                    • <strong>Objetivo:</strong> Identificar la velocidad donde la pared se ve como un espejo liso y usarla en perímetros externos.
                </div>
            </div>
        )},
        { title: "6. Costuras Invisibles (Scarf Seams)", icon: "sparkles", content: (
            <div className="space-y-4 text-sm md:text-base text-slate-400 leading-relaxed text-left">
                <p className="text-slate-300 text-base md:text-lg font-bold uppercase italic">Tecnología para borrar la cicatriz Z.</p>
                <div className="p-5 bg-slate-800/30 rounded-2xl border border-slate-800 space-y-4 shadow-inner">
                    <p>• <strong>Scarf Flow:</strong> 100% ideal. Ajustar +/- 5% según resultado visual.</p>
                    <p>• <strong>Orden de Paredes:</strong> <TechInfo term="Crucial" info={tips.order.es} /> El Scarf Joint requiere paredes internas previas para sostener la rampa.</p>
                </div>
            </div>
        )},
        { title: "7. Encogimiento y Escala", icon: "maximize", content: (
            <div className="space-y-6 text-left">
                <div className="flex gap-4 items-start bg-slate-900/50 p-5 rounded-xl border border-slate-800 shadow-inner text-base">
                    <Icon name="alert-triangle" className="text-amber-500 shrink-0 mt-1" size={24} />
                    <p className="text-slate-300 font-medium">Si las paredes miden bien pero la pieza es chica, es contracción térmica, no flujo.</p>
                </div>
                <div className="p-5 bg-slate-800/30 rounded-xl border border-slate-800 text-sm md:text-base text-slate-400 leading-relaxed space-y-4">
                    <ul className="space-y-2">
                        <li>• <strong>PLA / PETG:</strong> 0.1% - 0.2% (Despreciable).</li>
                        <li>• <strong>ABS / ASA:</strong> 0.6% - 0.9% (Compensar escala).</li>
                        <li>• <strong>Nylon / PC:</strong> 1.0% - 1.6% (Contracción extrema).</li>
                    </ul>
                </div>
            </div>
        )},
        { title: "8. Diagnóstico de Humedad", icon: "wind", content: (
            <div className="space-y-6 text-left">
                <div className="bg-slate-950/50 p-6 rounded-xl border border-slate-800 shadow-xl">
                    <h4 className="font-bold text-[#8b5cf6] mb-5 uppercase flex items-center gap-2 italic"><Icon name="droplets" size={20} /> Diagnosticador</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <button onClick={() => setSymptom('stringing')} className={`p-4 rounded-xl border text-left transition-all ${symptom === 'stringing' ? 'bg-[#8b5cf6] border-[#8b5cf6] text-white' : 'bg-slate-900 border-slate-800'}`}>
                            <span className="text-sm block font-bold uppercase">Velo / Stringing</span>
                        </button>
                        <button onClick={() => setSymptom('popping')} className={`p-4 rounded-xl border text-left transition-all ${symptom === 'popping' ? 'bg-[#8b5cf6] border-[#8b5cf6] text-white' : 'bg-slate-900 border-slate-800'}`}>
                            <span className="text-sm block font-bold uppercase">Popping / Burbujas</span>
                        </button>
                    </div>
                    {symptom && (
                        <div className="mt-5 p-5 bg-[#8b5cf6]/10 rounded-lg border border-[#8b5cf6]/30 text-sm italic animate-in fade-in">
                            {symptom === 'stringing' ? 'Puede ser retracción o humedad leve. Calibre Pressure Advance antes de secar.' : 'HUMEDAD CRÍTICA. Vapor de agua saliendo del nozzle. Secado obligatorio inmediato.'}
                        </div>
                    )}
                </div>
                <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/40">
                    <table className="w-full text-left text-xs md:text-sm">
                        <thead className="bg-slate-800 text-slate-300">
                            <tr><th className="p-3">Material</th><th className="p-3">Temp</th><th className="p-3">Tiempo</th></tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            {t.es.dryingTable.map((item, idx) => (
                                <tr key={idx}><td className="p-3 font-bold text-[#8b5cf6]">{item.mat}</td><td className="p-3">{item.temp}</td><td className="p-3">{item.time}</td></tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        )}
    ];

    return (
        <div className="min-h-screen bg-[#0a0f18] text-slate-100 font-sans">
            <div className="max-w-5xl mx-auto p-4 md:p-8">
                <header className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4 border-b border-slate-800 pb-8 text-left">
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 bg-[#8b5cf6] rounded-2xl flex items-center justify-center shadow-lg text-white"><Icon name="layers" size={32} /></div>
                        <div>
                            <h1 className="text-4xl font-black bg-gradient-to-r from-[#8b5cf6] to-violet-300 bg-clip-text text-transparent uppercase italic tracking-tighter">Sky Toolbox</h1>
                            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Herramientas para makers</p>
                        </div>
                    </div>
                    <nav className="flex bg-slate-900/80 p-1.5 rounded-xl border border-slate-800 shadow-inner">
                        <button onClick={() => setActiveTab('calculators')} className={`flex-1 px-5 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'calculators' ? 'bg-[#8b5cf6] text-white shadow-md' : 'text-slate-400'}`}>Calculadoras</button>
                        <button onClick={() => setActiveTab('guide')} className={`flex-1 px-5 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'guide' ? 'bg-[#8b5cf6] text-white shadow-md' : 'text-slate-400'}`}>Ayuda</button>
                    </nav>
                </header>

                {activeTab === 'calculators' ? (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-500">
                        <div className="lg:col-span-3 space-y-5">
                            <div className="bg-slate-900/50 p-5 rounded-2xl border border-slate-800 shadow-inner text-left">
                                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-2 block italic">Filamento</label>
                                <select value={material} onChange={(e) => setMaterial(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm font-bold text-white outline-none">
                                    {materialsList.map(m => <option key={m} value={m}>{m}</option>)}
                                </select>
                            </div>
                            <div className="flex lg:flex-col gap-3 overflow-x-auto no-scrollbar pb-3">
                                {[
                                    { id: 'flow', label: 'Flujo', icon: 'activity' },
                                    { id: 'pa', label: 'Presión', icon: 'settings-2' },
                                    { id: 'vol', label: 'Caudal', icon: 'gauge' },
                                    { id: 'vfa', label: 'VFA', icon: 'zap' },
                                    { id: 'shrink', label: 'Escala', icon: 'maximize' }
                                ].map((c) => (
                                    <button key={c.id} onClick={() => setActiveCalc(c.id)} className={`flex-shrink-0 flex items-center gap-4 p-4 rounded-xl border transition-all ${activeCalc === c.id ? 'bg-[#8b5cf6]/10 border-[#8b5cf6]/50 text-[#8b5cf6]' : 'bg-slate-900 border-slate-800 text-slate-400'}`}>
                                        <Icon name={c.icon} size={20} /> <span className="font-bold text-sm uppercase tracking-tighter">{c.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="lg:col-span-9 space-y-8">
                            <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 md:p-10 backdrop-blur-md shadow-2xl grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div className="space-y-8 text-left">
                                    <h3 className="text-2xl font-bold flex items-center gap-4 uppercase italic text-slate-100"><Icon name="cpu" size={24} className="text-[#8b5cf6]" /> Datos</h3>
                                    <div className="space-y-6">
                                        {activeCalc === 'flow' && (<><InputGroup label="Flujo Actual" value={flowData.current} onChange={(v) => setFlowData({...flowData, current: v})} help="Slicer config" /><InputGroup label="Modificador Bloque" value={flowData.modifier} onChange={(v) => setFlowData({...flowData, modifier: v})} help="Valor impreso" /></>)}
                                        {activeCalc === 'pa' && (<><InputGroup label="Valor Inicial" value={paData.start} onChange={(v) => setPaData({...paData, start: v})} /><InputGroup label="Paso" value={paData.step} onChange={(v) => setPaData({...paData, step: v})} /><InputGroup label="Altura Medida" value={paData.height} onChange={(v) => setPaData({...paData, height: v})} /></>)}
                                        {activeCalc === 'vol' && (<><InputGroup label="Inicio (mm³/s)" value={volData.start} onChange={(v) => setVolData({...volData, start: v})} /><InputGroup label="Paso" value={volData.step} onChange={(v) => setVolData({...volData, step: v})} /><InputGroup label="Altura Fallo" value={volData.height} onChange={(v) => setVolData({...volData, height: v})} /></>)}
                                        {activeCalc === 'vfa' && (<><InputGroup label="Velocidad Inicial" value={vfaData.start} onChange={(v) => setVfaData({...vfaData, start: v})} /><InputGroup label="Incremento" value={vfaData.step} onChange={(v) => setVfaData({...vfaData, step: v})} /><InputGroup label="Nivel" value={vfaData.level} onChange={(v) => setVfaData({...vfaData, level: v})} /></>)}
                                        {activeCalc === 'shrink' && (<><InputGroup label="Medida Slicer" value={shrinkData.target} onChange={(v) => setShrinkData({...shrinkData, target: v})} /><InputGroup label="Medida Real (Fría)" value={shrinkData.measured} onChange={(v) => setShrinkData({...shrinkData, measured: v})} /></>)}
                                    </div>
                                </div>
                                <div className="flex flex-col items-center justify-center text-center p-8 bg-[#8b5cf6]/5 rounded-3xl border-2 border-dashed border-[#8b5cf6]/20 min-h-[320px] shadow-inner">
                                    <p className="text-[#8b5cf6] text-xs font-black uppercase tracking-widest mb-2 font-mono">Sugerido</p>
                                    <div className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white transition-all tabular-nums drop-shadow-xl">
                                        {getCurrentResult()}{activeCalc === 'shrink' && '%'}
                                    </div>
                                    <div className="flex gap-3 w-full max-w-[280px] mt-10">
                                        <button onClick={() => copyToClipboard(getCurrentResult())} className={`flex-1 flex items-center justify-center gap-3 px-5 py-4 rounded-2xl font-bold transition-all transform active:scale-95 ${copied ? 'bg-green-500 text-white' : 'bg-[#8b5cf6] hover:bg-violet-400 text-white'}`}>
                                            <Icon name={copied ? 'check-circle-2' : 'clipboard'} size={22} /> <span className="text-base">{copied ? 'Listo' : 'Copiar'}</span>
                                        </button>
                                        <button onClick={saveToHistory} className={`p-4 rounded-2xl border transition-all ${saved ? 'bg-green-600 text-white' : 'bg-slate-800 text-slate-300 border-slate-700'}`}>
                                            <Icon name={saved ? "check-circle-2" : "save"} size={22} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-900/40 p-8 rounded-3xl border border-slate-800 shadow-inner">
                                <div className="flex items-center justify-between mb-5 text-left">
                                    <h4 className="text-sm font-black uppercase text-slate-500 flex items-center gap-2 italic"><Icon name="rotate-ccw" size={16} /> Historial</h4>
                                    {history.length > 0 && <button onClick={() => setHistory([])} className="text-xs font-black uppercase text-red-500/60 flex items-center gap-2"><Icon name="trash" size={14} /> Borrar</button>}
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {history.length > 0 ? history.map(item => (
                                        <div key={item.id} className="flex justify-between items-center p-4 bg-slate-950/50 rounded-xl border border-slate-800/50 relative text-left">
                                            <div className="flex flex-col"><span className="text-[10px] font-black text-[#8b5cf6] uppercase">{item.type}</span><span className="text-xs text-slate-500">{item.material} • {item.date}</span></div>
                                            <div className="flex items-center gap-4"><span className="text-white font-mono font-bold text-base">{item.value}</span><button onClick={() => setHistory(prev => prev.filter(i => i.id !== item.id))} className="text-slate-600 hover:text-red-500"><Icon name="trash" size={14} /></button></div>
                                        </div>
                                    )) : <p className="text-sm text-slate-600 italic py-3 text-center w-full uppercase">Vacío</p>}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-5 animate-in fade-in duration-500 pb-24">
                        <div className="grid grid-cols-1 gap-5 text-left">
                            {guideItems.map((step, idx) => (
                                <DocStep key={idx} title={step.title} iconName={step.icon} badge="Guía Técnica" expanded={expandedStep === idx} onClick={() => setExpandedStep(expandedStep === idx ? -1 : idx)}>{step.content}</DocStep>
                            ))}
                        </div>
                        <div className="bg-gradient-to-r from-violet-900/20 to-slate-900/30 p-10 rounded-3xl border border-[#8b5cf6]/30 flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl">
                            <div className="flex items-start gap-5 text-left">
                                <div className="p-4 bg-slate-800 rounded-2xl text-[#8b5cf6]"><Icon name="book-open" size={28} /></div>
                                <div className="space-y-2 text-left">
                                    <h4 className="text-2xl font-bold text-white italic">Wiki de Calibración</h4>
                                    <p className="text-base text-slate-400 max-w-md">Documentación oficial de SoftFever para perfiles de alta calidad.</p>
                                </div>
                            </div>
                            <a href="https://github.com/OrcaSlicer/OrcaSlicer/wiki/Calibration" target="_blank" rel="noreferrer" className="flex items-center gap-4 bg-[#8b5cf6] text-white px-10 py-4 rounded-xl font-bold hover:bg-violet-400 transition-all group">
                                Abrir Wiki <Icon name="external-link" size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                            </a>
                        </div>
                    </div>
                )}
                <footer className="mt-14 pt-10 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-8 text-slate-500 pb-16">
                    <div className="flex flex-col gap-2 text-left"><div className="flex items-center gap-2 font-mono text-sm text-slate-400 font-bold uppercase"><span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></span> Sky Toolbox @ sky3darg</div><p className="text-xs uppercase font-black italic text-slate-600">by skydev</p></div>
                    <div className="flex flex-col md:items-end gap-4 text-xs italic text-right text-slate-600"><div className="flex gap-8 text-xs font-black uppercase not-italic mb-1"><a href="https://bambulab.com" target="_blank" rel="noreferrer">Bambu Lab</a><a href="https://github.com/SoftFever/OrcaSlicer" target="_blank" rel="noreferrer">OrcaSlicer</a></div>© 2026 Sky 3D</div>
                </footer>
            </div>
        </div>
    );
};

const DocStep = ({ title, iconName, badge, expanded, onClick, children }) => (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl transition-all hover:border-slate-700 shadow-lg">
        <button onClick={onClick} className="w-full flex items-center justify-between p-7 text-left group">
            <div className="flex items-center gap-5"><div className="p-4 bg-slate-800 rounded-xl group-hover:bg-[#8b5cf6]/20 transition-colors"><Icon name={iconName} size={24} className="text-[#8b5cf6]" /></div><div><h3 className="font-bold text-lg md:text-xl uppercase italic text-slate-100">{title}</h3><p className="text-xs text-[#8b5cf6] uppercase font-black">{badge}</p></div></div>
            <div className="shrink-0 ml-3">{expanded ? <Icon name="chevron-up" className="text-slate-500" size={24} /> : <Icon name="chevron-down" className="text-slate-500" size={24} />}</div>
        </button>
        {expanded && <div className="p-7 pt-0 border-t border-slate-800/50 bg-slate-900/40 text-left animate-in slide-in-from-top-2">{children}</div>}
    </div>
);

const InputGroup = ({ label, value, onChange, help }) => {
    const handleChange = (e) => {
        const val = e.target.value;
        if (/^-?\d*\.?\d*$/.test(val) || val === "") onChange(val);
    };
    return (
        <div className="space-y-2 group text-left">
            <label className="text-xs font-black uppercase text-slate-500 tracking-wider font-mono">{label}</label>
            <input type="text" inputMode="decimal" value={value} onChange={handleChange} autoComplete="off" className="w-full bg-slate-950 border border-slate-700 rounded-xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/50 transition-all font-mono" />
            {help && <p className="text-[10px] text-slate-700 italic font-bold uppercase">{help}</p>}
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);

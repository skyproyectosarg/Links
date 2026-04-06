const { useState, useEffect, useCallback, useRef } = React;

const materialsList = ['PLA', 'PETG', 'ABS', 'ASA', 'TPU', 'PET', 'NYLON', 'PC', 'Otros'];

// Componente de Icono blindado contra mutaciones del DOM
const Icon = ({ name, size = 20, className = "" }) => {
    const iconRef = useRef(null);
    useEffect(() => {
        if (window.lucide && iconRef.current) {
            try {
                window.lucide.createIcons({
                    icons: { [name]: window.lucide.icons[name] },
                    nameAttr: 'data-lucide'
                });
            } catch (e) { console.warn("Esperando librerías..."); }
        }
    }, [name]);

    return <i ref={iconRef} data-lucide={name} style={{ width: size, height: size, display: 'inline-block' }} className={className}></i>;
};

const TechInfo = ({ term, info }) => {
    const [show, setShow] = useState(false);
    return (
        <span 
            className="relative inline-block group cursor-help border-b border-dashed border-[#8b5cf6] text-white font-bold px-1 rounded-sm hover:bg-[#8b5cf6]/10 transition-colors"
            onMouseEnter={() => setShow(true)}
            onMouseLeave={() => setShow(false)}
            onClick={() => setShow(!show)}
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

    useEffect(() => {
        const materialPresets = {
            PLA: { flow: 0.98, paStep: 0.02, volStart: 5, volStep: 0.5 },
            PETG: { flow: 0.95, paStep: 0.04, volStart: 3, volStep: 0.3 },
            ABS: { flow: 0.94, paStep: 0.04, volStart: 5, volStep: 0.5 },
            ASA: { flow: 0.94, paStep: 0.04, volStart: 5, volStep: 0.5 },
            TPU: { flow: 1.00, paStep: 0.08, volStart: 1, volStep: 0.1 },
            Otros: { flow: 1.00, paStep: 0.02, volStart: 5, volStep: 0.5 }
        };
        const config = materialPresets[material] || materialPresets.Otros;
        setFlowData(prev => ({ ...prev, current: config.flow }));
        setPaData(prev => ({ ...prev, step: config.paStep }));
        setVolData(prev => ({ ...prev, start: config.volStart, step: config.volStep }));
    }, [material]);

    const getCurrentResult = useCallback(() => {
        const parseValue = (val) => {
            const f = parseFloat(val);
            return isNaN(f) ? 0 : f;
        };
        
        if (activeCalc === 'flow') return (parseValue(flowData.current) * (100 + parseValue(flowData.modifier)) / 100).toFixed(4);
        if (activeCalc === 'pa') return (parseValue(paData.start) + (parseValue(paData.height) * parseValue(paData.step))).toFixed(4);
        if (activeCalc === 'vol') return (parseValue(volData.start) + (parseValue(volData.height) * parseValue(volData.step))).toFixed(2);
        if (activeCalc === 'vfa') return (parseValue(vfaData.start) + (parseValue(vfaData.step) * (Math.max(1, parseInt(vfaData.level)) - 1))).toFixed(0);
        if (activeCalc === 'shrink') {
            const target = parseValue(shrinkData.target);
            const measured = parseValue(shrinkData.measured);
            if (measured === 0) return "0.00";
            return ((target / measured) * 100).toFixed(2);
        }
        return "0.0000";
    }, [activeCalc, flowData, paData, volData, vfaData, shrinkData]);

    const saveToHistory = () => {
        const res = getCurrentResult();
        const newItem = {
            id: Date.now(),
            type: activeCalc.toUpperCase(),
            material: material,
            value: res + (activeCalc === 'shrink' ? '%' : ''),
            date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setHistory(prev => [newItem, ...prev].slice(0, 10));
        setSaved(true);
        setTimeout(() => setSaved(false), 1500);
    };

    const deleteItem = (id) => setHistory(prev => prev.filter(item => item.id !== id));
    const clearHistory = () => setHistory([]);

    const copyToClipboard = (text) => {
        if (!text || text === "Error") return;
        navigator.clipboard.writeText(text).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    const goToHelp = (calcType) => {
        const calcToHelpIndex = { flow: 1, pa: 2, vol: 3, vfa: 4, shrink: 6 };
        setExpandedStep(calcToHelpIndex[calcType] || 0);
        setActiveTab('guide');
        window.scrollTo({ top: 0, behavior: 'smooth' });
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
            subtitle: "Herramientas para makers", navCalcs: "Calculadoras", navGuide: "Ayuda", sidebarFlow: "Flujo", sidebarPA: "Presión (PA)", sidebarVol: "Caudal", sidebarVFA: "VFA", sidebarShrink: "Escala", inputTitle: "Entrada de Datos", resTitle: "Valor Sugerido", copyBtn: "Copiar", copiedBtn: "¡Copiado!", guideLink: "Ver manual técnico completo", guideBadge: "Guía Técnica", matLabel: "Filamento:", recentResults: "Guardados / Historial", clearAll: "Borrar Todo", noHistory: "Sin datos guardados",
            stepTitles: ["1. Torre de Temperatura", "2. Relación de Flujo", "3. Avance de Presión", "4. Límite Volumétrico", "5. Test VFA", "6. Costuras Invisibles", "7. Encogimiento", "8. Humedad"],
            moistureTitle: "Diagnóstico de Humedad", dryingTable: [{ mat: 'PLA', temp: '45-50°C', time: '4-6h', desc: 'Evita hilos finos.' }, { mat: 'PETG', temp: '60-65°C', time: '6-8h', desc: 'Evita el goteo.' }, { mat: 'ABS/ASA', temp: '70-80°C', time: '6h+', desc: 'Elimina burbujas.' }, { mat: 'Nylon/TPU', temp: '75-85°C', time: '12h+', desc: 'Obligatorio.' }],
            wikiTitle: "Manual de Calibración", wikiSub: "Documentación técnica oficial de OrcaSlicer condensada.", wikiBtn: "Wiki GitHub"
        },
        en: {
            subtitle: "Tools for makers", navCalcs: "Calculators", navGuide: "Help", sidebarFlow: "Flow", sidebarPA: "Pressure (PA)", sidebarVol: "Flow Max", sidebarVFA: "VFA", sidebarShrink: "Scaling", inputTitle: "Data Input", resTitle: "Suggested Value", copyBtn: "Copy", copiedBtn: "Copied!", guideLink: "View technical manual", guideBadge: "Technical Guide", matLabel: "Filament:", recentResults: "Saved / History", clearAll: "Clear All", noHistory: "No saved data",
            stepTitles: ["1. Temperature Tower", "2. Flow Ratio Calibration", "3. Pressure Advance (PA)", "4. Volumetric Limit", "5. VFA Test", "6. Scarf Seams", "7. Shrinkage", "8. Moisture"],
            moistureTitle: "Moisture Diagnoser", dryingTable: [{ mat: 'PLA', temp: '45-50°C', time: '4-6h', desc: 'Prevents stringing.' }, { mat: 'PETG', temp: '60-65°C', time: '6-8h', desc: 'Avoids oozing.' }, { mat: 'ABS/ASA', temp: '70-80°C', time: '6h+', desc: 'Removes bubbles.' }, { mat: 'Nylon/TPU', temp: '75-85°C', time: '12h+', desc: 'Mandatory.' }],
            wikiTitle: "Calibration Manual", wikiSub: "Official technical documentation.", wikiBtn: "Wiki GitHub"
        }
    };

    const guideItems = [
        { title: t[lang].stepTitles[0], icon: "thermometer", content: ( <div className="space-y-4 text-left"><p className="text-slate-300 text-base md:text-lg leading-relaxed font-semibold">Base de toda calibración exitosa.</p><div className="p-5 bg-slate-800/30 rounded-xl border border-slate-800 text-sm md:text-base text-slate-400">PLA (190-230°C), PETG (235-260°C). Inicie al máximo y baje cada 5°C.</div></div> ) },
        { title: t[lang].stepTitles[1], icon: "activity", content: ( <div className="space-y-4 text-left"><p className="text-slate-300 text-base md:text-lg leading-relaxed font-semibold">Ajusta el volumen real de plástico.</p><div className="p-5 bg-slate-800/30 rounded-xl border border-slate-800 text-sm md:text-base text-slate-400">Busque la superficie 100% cerrada pero sin rebabas.</div></div> ) },
        { title: t[lang].stepTitles[2], icon: "settings-2", content: ( <div className="space-y-4 text-left"><p className="text-slate-300 text-base md:text-lg leading-relaxed font-semibold">Nitidez en las esquinas.</p><div className="p-5 bg-slate-800/30 rounded-xl border border-slate-800 text-sm md:text-base text-slate-400">Elimina esquinas abultadas. Direct Drive (0.012 - 0.045).</div></div> ) },
        { title: t[lang].stepTitles[3], icon: "gauge", content: ( <div className="space-y-4 text-left"><p className="text-slate-300 text-base md:text-lg leading-relaxed font-semibold">El techo físico de su Hotend.</p><div className="p-5 bg-slate-800/30 rounded-xl border border-slate-800 text-sm md:text-base text-slate-400 space-y-4 shadow-inner"><TechInfo term="V6" info={tips.v6[lang]} />: 12-15 mm³/s | <TechInfo term="HF" info={tips.bambu[lang]} />: 28-36 mm³/s.</div></div> ) },
        { title: t[lang].stepTitles[4], icon: "zap", content: ( <div className="space-y-4 text-left"><p className="text-slate-300 text-base md:text-lg leading-relaxed font-semibold">Elimina resonancias de los motores.</p><div className="p-5 bg-slate-800/30 rounded-xl border border-slate-800 text-sm md:text-base text-slate-400">Busque la velocidad donde la pared parezca un espejo.</div></div> ) },
        { title: t[lang].stepTitles[5], icon: "sparkles", content: ( <div className="space-y-4 text-sm md:text-base text-slate-400 leading-relaxed text-left"><p className="text-slate-300 text-base md:text-lg font-bold uppercase italic">Borrando la cicatriz Z.</p><div className="p-5 bg-slate-800/30 rounded-2xl border border-slate-800 space-y-4 italic"><p>Requiere orden de paredes <TechInfo term="Interior-Exterior" info={tips.order[lang]} />.</p></div></div> ) },
        { title: t[lang].stepTitles[6], icon: "maximize", content: ( <div className="space-y-6 text-left"><div className="flex gap-4 items-start bg-slate-900/50 p-5 rounded-xl border border-slate-800 shadow-inner text-base"><Icon name="alert-triangle" className="text-amber-500 shrink-0 mt-1" size={24} /><div><p className="text-slate-100 text-lg font-bold uppercase mb-2 italic">Contracción Térmica</p><p className="text-slate-300 leading-relaxed font-medium">Si el cubo mide 99.2mm en lugar de 100mm, es física, no flujo.</p></div></div></div> ) },
        { title: t[lang].stepTitles[7], icon: "wind", content: ( <div className="space-y-6 text-left"><div className="bg-slate-950/50 p-6 rounded-xl border border-slate-800 shadow-xl"><h4 className="font-bold text-[#8b5cf6] mb-5 uppercase flex items-center gap-2 italic"><Icon name="droplets" size={20} className="text-[#8b5cf6]" /> {t[lang].moistureTitle}</h4><div className="grid grid-cols-1 sm:grid-cols-2 gap-4"><button onClick={() => setSymptom('stringing')} className={`p-5 rounded-xl border text-left transition-all ${symptom === 'stringing' ? 'bg-[#8b5cf6] border-[#8b5cf6] text-white font-bold shadow-[0_0_20px_rgba(139,92,246,0.3)]' : 'bg-slate-900 border-slate-800 hover:border-[#8b5cf6]/40'}`}><span className="text-sm block uppercase font-bold">Velo</span></button><button onClick={() => setSymptom('popping')} className={`p-5 rounded-xl border text-left transition-all ${symptom === 'popping' ? 'bg-[#8b5cf6] border-[#8b5cf6] text-white font-bold shadow-[0_0_20px_rgba(139,92,246,0.3)]' : 'bg-slate-900 border-slate-800 hover:border-[#8b5cf6]/40'}`}><span className="text-sm block uppercase font-bold">Popping</span></button></div>{symptom && ( <div className="mt-5 p-5 bg-[#8b5cf6]/10 rounded-lg border border-[#8b5cf6]/30 text-sm md:text-base leading-relaxed italic text-slate-100 animate-in fade-in">Diagnóstico: {symptom === 'stringing' ? 'PA o Humedad.' : 'HUMEDAD CRÍTICA.'}</div> )}</div></div> ) }
    ];

    return (
        <div className="min-h-screen bg-[#0a0f18] text-slate-100 font-sans selection:bg-[#8b5cf6]/30">
            <div className="max-w-5xl mx-auto p-4 md:p-8">
                <header className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4 border-b border-slate-800 pb-8 text-left">
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 bg-[#8b5cf6] rounded-2xl flex items-center justify-center shadow-lg shadow-[#8b5cf6]/30 text-white transform rotate-3 hover:rotate-0 transition-transform duration-300">
                            <Icon name="layers" size={32} />
                        </div>
                        <div>
                            <h1 className="text-4xl font-black tracking-tighter bg-gradient-to-r from-[#8b5cf6] to-violet-300 bg-clip-text text-transparent uppercase italic">Sky Toolbox</h1>
                            <p className="text-slate-500 text-xs md:text-sm font-bold uppercase tracking-widest">{t[lang].subtitle}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <button onClick={() => setLang(lang === 'es' ? 'en' : 'es')} className="flex-1 md:flex-none flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-black hover:border-[#8b5cf6] transition-all uppercase">
                            <Icon name="languages" size={16} className="text-[#8b5cf6]" /> {lang === 'es' ? 'English' : 'Español'}
                        </button>
                        <nav className="flex-1 md:flex-none flex bg-slate-900/80 p-1.5 rounded-xl border border-slate-800 shadow-inner">
                            <button onClick={() => setActiveTab('calculators')} className={`flex-1 px-5 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'calculators' ? 'bg-[#8b5cf6] text-white shadow-md' : 'text-slate-400 hover:text-white'}`}>{t[lang].navCalcs}</button>
                            <button onClick={() => setActiveTab('guide')} className={`flex-1 px-5 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'guide' ? 'bg-[#8b5cf6] text-white shadow-md' : 'text-slate-400 hover:text-white'}`}>{t[lang].navGuide}</button>
                        </nav>
                    </div>
                </header>

                {activeTab === 'calculators' ? (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-500">
                        <div className="lg:col-span-3 space-y-5">
                            <div className="bg-slate-900/50 p-5 rounded-2xl border border-slate-800 shadow-inner text-left">
                                <label className="text-xs font-black uppercase text-slate-500 tracking-widest mb-3 block font-mono italic">{t[lang].matLabel}</label>
                                <select value={material} onChange={(e) => setMaterial(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-[#8b5cf6] transition-all cursor-pointer">
                                    {materialsList.map(m => <option key={m} value={m}>{m}</option>)}
                                </select>
                            </div>
                            <div className="flex lg:flex-col gap-3 overflow-x-auto no-scrollbar pb-3 lg:pb-0">
                                {[
                                    { id: 'flow', label: t[lang].sidebarFlow, icon: "activity" },
                                    { id: 'pa', label: t[lang].sidebarPA, icon: "settings-2" },
                                    { id: 'vol', label: t[lang].sidebarVol, icon: "gauge" },
                                    { id: 'vfa', label: t[lang].sidebarVFA, icon: "zap" },
                                    { id: 'shrink', label: t[lang].sidebarShrink, icon: "maximize" },
                                ].map((c) => (
                                    <button key={c.id} onClick={() => setActiveCalc(c.id)} className={`flex-shrink-0 flex items-center gap-4 p-4 rounded-xl border transition-all ${activeCalc === c.id ? 'bg-[#8b5cf6]/10 border-[#8b5cf6]/50 text-[#8b5cf6] shadow-inner' : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'}`}>
                                        <Icon name={c.icon} size={20} /> <span className="font-bold text-sm uppercase tracking-tighter">{c.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="lg:col-span-9 space-y-8">
                            <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 md:p-10 backdrop-blur-md relative shadow-2xl">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="space-y-8 text-left">
                                        <h3 className="text-2xl font-bold flex items-center gap-4 uppercase tracking-tighter text-slate-100 italic"><Icon name="cpu" size={24} className="text-[#8b5cf6]" /> {t[lang].inputTitle}</h3>
                                        <div className="space-y-6">
                                            {activeCalc === 'flow' && (<><InputGroup label="Flujo Actual" value={flowData.current} onChange={(v) => setFlowData({...flowData, current: v})} help="Slicer config" /><InputGroup label="Modificador" value={flowData.modifier} onChange={(v) => setFlowData({...flowData, modifier: v})} help="Bloque impreso" /></>)}
                                            {activeCalc === 'pa' && (<><InputGroup label="Valor Inicial" value={paData.start} onChange={(v) => setPaData({...paData, start: v})} /><InputGroup label="Paso" value={paData.step} onChange={(v) => setPaData({...paData, step: v})} /><InputGroup label="Altura Medida" value={paData.height} onChange={(v) => setPaData({...paData, height: v})} /></>)}
                                            {activeCalc === 'vol' && (<><InputGroup label="Inicio (mm³/s)" value={volData.start} onChange={(v) => setVolData({...volData, start: v})} /><InputGroup label="Paso" value={volData.step} onChange={(v) => setVolData({...volData, step: v})} /><InputGroup label="Altura Fallo" value={volData.height} onChange={(v) => setVolData({...volData, height: v})} /></>)}
                                            {activeCalc === 'vfa' && (<><InputGroup label="Velocidad Inicial" value={vfaData.start} onChange={(v) => setVfaData({...vfaData, start: v})} /><InputGroup label="Incremento" value={vfaData.step} onChange={(v) => setVfaData({...vfaData, step: v})} /><InputGroup label="Nivel" value={vfaData.level} onChange={(v) => setVfaData({...vfaData, level: v})} /></>)}
                                            {activeCalc === 'shrink' && (<><InputGroup label="Medida Slicer" value={shrinkData.target} onChange={(v) => setShrinkData({...shrinkData, target: v})} /><InputGroup label="Medida Real" value={shrinkData.measured} onChange={(v) => setShrinkData({...shrinkData, measured: v})} /></>)}
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-center justify-center text-center p-8 bg-[#8b5cf6]/5 rounded-3xl border-2 border-dashed border-[#8b5cf6]/20 min-h-[320px] shadow-inner">
                                        <p className="text-[#8b5cf6] text-xs font-black uppercase tracking-widest mb-2">{t[lang].resTitle}</p>
                                        <button onClick={() => goToHelp(activeCalc)} className="text-xs text-slate-500 hover:text-[#8b5cf6] uppercase font-bold tracking-tighter mb-5 flex items-center gap-2 transition-colors underline italic"><Icon name="book-open" size={14} /> {t[lang].guideLink}</button>
                                        <div className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white leading-tight transition-all tabular-nums tracking-tighter drop-shadow-xl">{getCurrentResult()}{activeCalc === 'shrink' && '%'}</div>
                                        <div className="flex gap-3 w-full max-w-[280px] mt-10">
                                            <button onClick={() => copyToClipboard(getCurrentResult())} className={`flex-1 flex items-center justify-center gap-3 px-5 py-4.5 rounded-2xl font-bold transition-all transform active:scale-95 shadow-xl ${copied ? 'bg-green-500 text-white border-green-500' : 'bg-[#8b5cf6] hover:bg-violet-400 text-white'}`}>{copied ? <Icon name="check-circle-2" size={22} /> : <Icon name="clipboard" size={22} />} <span className="text-base">{copied ? t[lang].copiedBtn : t[lang].copyBtn}</span></button>
                                            <button onClick={saveToHistory} className={`p-4.5 rounded-2xl transition-all border shadow-lg group ${saved ? 'bg-green-600 border-green-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border-slate-700'}`}><Icon name={saved ? "check-circle-2" : "save"} size={22} className="group-active:scale-90 transition-transform" /></button>
                                        </div>
                                        <p className="mt-5 text-[10px] text-slate-500 italic uppercase font-black tracking-widest opacity-40">* {material} profile optimized</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-900/40 p-8 rounded-3xl border border-slate-800 shadow-inner">
                                <div className="flex items-center justify-between mb-5 px-1 text-left">
                                    <h4 className="text-sm font-black uppercase text-slate-500 tracking-widest flex items-center gap-2 font-mono italic"><Icon name="rotate-ccw" size={16} className="text-[#8b5cf6]" /> {t[lang].recentResults}</h4>
                                    {history.length > 0 && <button onClick={clearHistory} className="text-xs font-black uppercase text-red-500/60 hover:text-red-500 flex items-center gap-2 transition-colors group"><Icon name="trash" size={14} className="group-hover:scale-110 transition-transform" /> {t[lang].clearAll}</button>}
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {history.length > 0 ? history.map(item => (
                                        <div key={item.id} className="flex justify-between items-center p-4 bg-slate-950/50 rounded-xl border border-slate-800/50 hover:border-[#8b5cf6]/40 transition-colors group relative text-left">
                                            <div className="flex flex-col"><span className="text-[10px] font-black text-[#8b5cf6] uppercase tracking-tighter">{item.type}</span><span className="text-xs text-slate-500 font-medium">{item.material} • {item.date}</span></div>
                                            <div className="flex items-center gap-4"><span className="text-white font-mono font-bold text-base tracking-tight">{item.value}</span><button onClick={() => deleteItem(item.id)} className="p-2 rounded-lg text-slate-600 hover:text-red-500 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"><Icon name="trash" size={14} /></button></div>
                                        </div>
                                    )) : <p className="text-sm text-slate-600 italic py-3 font-sans text-center w-full uppercase tracking-widest">{t[lang].noHistory}</p>}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-5 pb-24">
                        <div className="grid grid-cols-1 gap-5 text-left">
                            {guideItems.map((step, idx) => (
                                <DocStep key={idx} title={step.title} iconName={step.icon} badge={t[lang].guideBadge} expanded={expandedStep === idx} onClick={() => setExpandedStep(expandedStep === idx ? -1 : idx)}>{step.content}</DocStep>
                            ))}
                        </div>
                        <div className="bg-gradient-to-r from-violet-900/20 to-slate-900/30 p-10 rounded-3xl border border-[#8b5cf6]/30 flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl">
                            <div className="flex items-start gap-5 text-left"><div className="p-4 bg-slate-800 rounded-2xl shadow-inner text-[#8b5cf6]"><Icon name="book-open" size={28} /></div><div className="space-y-2 text-left"><h4 className="text-2xl font-bold text-white tracking-tight italic">{t[lang].wikiTitle}</h4><p className="text-base text-slate-400 max-w-md leading-relaxed">{t[lang].wikiSub}</p></div></div>
                            <a href="https://github.com/OrcaSlicer/OrcaSlicer/wiki/Calibration" target="_blank" rel="noreferrer" className="flex items-center gap-4 bg-[#8b5cf6] text-white px-10 py-4 rounded-xl font-bold hover:bg-violet-400 transition-all shadow-lg hover:shadow-[#8b5cf6]/30 group text-base">{t[lang].wikiBtn} <Icon name="external-link" size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /></a>
                        </div>
                    </div>
                )}
                <footer className="mt-14 pt-10 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-8 text-slate-500 pb-16">
                    <div className="flex flex-col gap-2 text-left"><div className="flex items-center gap-2 font-mono text-sm text-slate-400 font-bold uppercase tracking-tighter"><span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></span> Sky Toolbox @ sky3darg</div><p className="text-xs uppercase font-black tracking-widest italic text-slate-600">by skydev</p></div>
                    <div className="flex flex-col md:items-end gap-4 text-xs font-medium italic text-right text-slate-600"><div className="flex gap-8 text-xs font-black uppercase tracking-widest not-italic mb-1 text-slate-600"><a href="https://bambulab.com" target="_blank" rel="noreferrer" className="hover:text-[#8b5cf6] transition-colors">Bambu Lab</a><a href="https://github.com/SoftFever/OrcaSlicer" target="_blank" rel="noreferrer" className="hover:text-[#8b5cf6] transition-colors">OrcaSlicer</a></div>© 2026 Sky 3D</div>
                </footer>
            </div>
        </div>
    );
};

const DocStep = ({ title, iconName, badge, expanded, onClick, children }) => (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl transition-all hover:border-slate-700 shadow-lg group">
        <button onClick={onClick} className="w-full flex items-center justify-between p-7 text-left group">
            <div className="flex items-center gap-5"><div className="p-4 bg-slate-800 rounded-xl shadow-inner group-hover:bg-[#8b5cf6]/20 transition-colors"><Icon name={iconName} size={24} className="text-[#8b5cf6]" /></div><div><h3 className="font-bold text-lg md:text-xl leading-tight uppercase tracking-tighter text-slate-100 italic group-hover:text-[#8b5cf6] transition-colors">{title}</h3><p className="text-xs text-[#8b5cf6] uppercase font-black tracking-widest">{badge}</p></div></div>
            <div className="shrink-0 ml-3">{expanded ? <Icon name="chevron-up" className="text-slate-500" size={24} /> : <Icon name="chevron-down" className="text-slate-500" size={24} />}</div>
        </button>
        {expanded && <div className="p-7 pt-0 border-t border-slate-800/50 bg-slate-900/40 animate-in slide-in-from-top-2 shadow-inner text-left">{children}</div>}
    </div>
);

const InputGroup = ({ label, value, onChange, help }) => {
    const handleChange = (e) => {
        const val = e.target.value;
        if (/^-?\d*\.?\d*$/.test(val) || val === "") onChange(val);
    };
    return (
        <div className="space-y-2 group text-left">
            <div className="flex justify-between items-center px-1"><label className="text-xs md:text-sm font-black uppercase text-slate-500 tracking-wider group-focus-within:text-[#8b5cf6] transition-colors font-mono tracking-tighter">{label}</label></div>
            <input type="text" inputMode="decimal" value={value} onChange={handleChange} autoComplete="off" className="w-full bg-slate-950 border border-slate-700 rounded-xl px-5 py-4 text-base md:text-lg text-white focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/50 focus:border-[#8b5cf6] transition-all font-mono shadow-inner" />
            {help && <p className="text-xs text-slate-700 px-1 italic font-bold uppercase tracking-tighter">{help}</p>}
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);

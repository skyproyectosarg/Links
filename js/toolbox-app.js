const { useState, useEffect, useCallback, useRef } = React;
const h = React.createElement;

const materialsList = ['PLA', 'PETG', 'ABS', 'ASA', 'TPU', 'PET', 'NYLON', 'PC', 'Otros'];

const Icon = ({ name, size = 20, className = "" }) => {
    const iconRef = useRef(null);
    useEffect(() => {
        if (window.lucide && iconRef.current) {
            window.lucide.createIcons({
                icons: { [name]: window.lucide.icons[name] },
                nameAttr: 'data-lucide'
            });
        }
    }, [name]);
    return h('i', {
        ref: iconRef,
        'data-lucide': name,
        style: { width: size, height: size, display: 'inline-block' },
        className: className
    });
};

const TechInfo = ({ term, info }) => {
    const [show, setShow] = useState(false);
    return h('span', {
        className: "relative inline-block group cursor-help border-b border-dashed border-[#8b5cf6] text-white font-bold px-1 rounded-sm hover:bg-[#8b5cf6]/10 transition-colors",
        onMouseEnter: () => setShow(true),
        onMouseLeave: () => setShow(false),
        onClick: () => setShow(!show)
    }, term, show && h('span', {
        className: "absolute bottom-full mb-3 left-1/2 -translate-x-1/2 tech-tooltip p-4 bg-slate-900 border border-slate-700 rounded-2xl leading-relaxed text-slate-200 z-[100] animate-in fade-in slide-in-from-bottom-2"
    }, 
        h('span', { className: "flex items-center gap-2 font-black text-[#8b5cf6] uppercase mb-2" }, 
            h(Icon, { name: "info", size: 14, className: "text-[#8b5cf6]" }), term
        ),
        info,
        h('span', { className: "absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-700" })
    ));
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
        const p = (val) => isNaN(parseFloat(val)) ? 0 : parseFloat(val);
        if (activeCalc === 'flow') return (p(flowData.current) * (100 + p(flowData.modifier)) / 100).toFixed(4);
        if (activeCalc === 'pa') return (p(paData.start) + (p(paData.height) * p(paData.step))).toFixed(4);
        if (activeCalc === 'vol') return (p(volData.start) + (p(volData.height) * p(volData.step))).toFixed(2);
        if (activeCalc === 'vfa') return (p(vfaData.start) + (p(vfaData.step) * (Math.max(1, parseInt(vfaData.level)) - 1))).toFixed(0);
        if (activeCalc === 'shrink') return p(shrinkData.measured) === 0 ? "0.00" : ((p(shrinkData.target) / p(shrinkData.measured)) * 100).toFixed(2);
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

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    const tips = {
        v6: "Hotend clásico de E3D. Zona de fusión corta (~12mm). Ideal para precisión pero limitado en caudal máximo.",
        volcano: "Hotend de alta capacidad. Bloque vertical con zona de fusión de ~20mm. Permite duplicar la velocidad de extrusión.",
        bambu: "Hotend con calentador cerámico 360° y zona de fundido optimizada para CoreXY de ultra-velocidad.",
        order: "El Scarf Seam requiere una base de paredes internas previa. Use siempre el orden Interior-Exterior."
    };

    const t = {
        es: {
            subtitle: "Herramientas para makers", navCalcs: "Calculadoras", navGuide: "Ayuda",
            sidebarFlow: "Flujo", sidebarPA: "Presión (PA)", sidebarVol: "Caudal", sidebarVFA: "VFA", sidebarShrink: "Escala",
            inputTitle: "Entrada de Datos", resTitle: "Valor Sugerido", copyBtn: "Copiar", copiedBtn: "¡Copiado!",
            guideLink: "Ver manual técnico completo", guideBadge: "Guía Técnica", matLabel: "Filamento:",
            recentResults: "Guardados / Historial", clearAll: "Borrar Todo", noHistory: "Sin datos guardados",
            wikiTitle: "Manual de Calibración", wikiSub: "Documentación técnica oficial de OrcaSlicer condensada para configuración profesional.", wikiBtn: "Wiki GitHub",
            moistureTitle: "Diagnosticador de Humedad",
            stepTitles: ["1. Torre de Temperatura (Temp Tower)", "2. Relación de Flujo (Flow Ratio)", "3. Avance de Presión (Pressure Advance)", "4. Límite de Velocidad Volumétrica", "5. Test de Vibraciones (VFA)", "6. Costuras Invisibles (Scarf Seams)", "7. Encogimiento y Escala (Física Térmica)", "8. Diagnóstico de Humedad y Secado"]
        }
    };

    const dryingData = [
        { mat: 'PLA', temp: '45-50°C', time: '4-6h', desc: 'Evita el velo de hilos finos (angel hair).' },
        { mat: 'PETG', temp: '60-65°C', time: '6-8h', desc: 'Crítico para evitar el goteo constante.' },
        { mat: 'ABS/ASA', temp: '70-80°C', time: '6h+', desc: 'Elimina micro-burbujas en las paredes.' },
        { mat: 'Nylon/TPU', temp: '75-85°C', time: '12h+', desc: 'Obligatorio: Higroscópicos en pocas horas.' }
    ];

    const guideItems = [
        { title: t.es.stepTitles[0], icon: "thermometer", content: h('div', { className: "space-y-4 text-left" }, h('p', { className: "text-slate-300 text-base md:text-lg leading-relaxed font-semibold" }, "Este es el cimiento de cualquier calibración exitosa. Antes de tocar flujos o velocidades, debemos conocer el límite térmico del polímero específico."), h('div', { className: "p-5 bg-slate-800/30 rounded-xl border border-slate-800 text-sm md:text-base text-slate-400 leading-relaxed" }, "• Rangos técnicos típicos: PLA (190-230°C), PETG (235-260°C), ABS/ASA (245-275°C), TPU (215-240°C).", h('br'), "• Metodología profesional: Inicie la torre en el valor máximo recomendado por el fabricante y decrezca cada 5°C.", h('br'), "• Criterios de éxito: La temperatura ideal es la más baja posible que mantenga una adhesión de capas irrompible manualmente.")) },
        { title: t.es.stepTitles[1], icon: "activity", content: h('div', { className: "space-y-4 text-left" }, h('p', { className: "text-slate-300 text-base md:text-lg leading-relaxed font-semibold" }, "El Ratio de Flujo ajusta el volumen real de plástico respecto al comando del Slicer."), h('div', { className: "p-5 bg-slate-800/30 rounded-xl border border-slate-800 text-sm md:text-base text-slate-400 leading-relaxed" }, "• Pass 1 (Grueso): Imprima bloques de -20 a +10. Busque el que tenga la superficie 100% cerrada.", h('br'), "• Nota de inspección: Use luz lateral rasante. Si ve huecos, falta flujo. Si ve crestas, sobra flujo.")) },
        { title: t.es.stepTitles[2], icon: "settings-2", content: h('div', { className: "space-y-4 text-left" }, h('p', { className: "text-slate-300 text-base md:text-lg leading-relaxed font-semibold" }, "El Pressure Advance (PA) compensa la elasticidad del filamento. Es vital para la nitidez en esquinas."), h('div', { className: "p-5 bg-slate-800/30 rounded-xl border border-slate-800 text-sm md:text-base text-slate-400 leading-relaxed" }, "• Qué soluciona: Elimina esquinas abultadas, evita hilos al final de perímetros.", h('br'), "• Valores guía: Direct Drive (0.012 - 0.045), Bowden (0.12 - 0.55).")) },
        { title: t.es.stepTitles[3], icon: "gauge", content: h('div', { className: "space-y-4 text-left" }, h('p', { className: "text-slate-300 text-base md:text-lg leading-relaxed font-semibold" }, "Determina el límite físico real de su Hotend (mm³/s)."), h('div', { className: "p-5 bg-slate-800/30 rounded-xl border border-slate-800 text-sm md:text-base text-slate-400 space-y-4 shadow-inner" }, h('div', { className: "flex flex-col border-l-2 border-[#8b5cf6]/30 pl-3" }, h(TechInfo, { term: "Hotend V6", info: tips.v6 }), h('span', { className: "text-white font-mono text-base mt-1" }, "12 - 15 mm³/s")), h('div', { className: "flex flex-col border-l-2 border-[#8b5cf6]/30 pl-3" }, h(TechInfo, { term: "Hotend Volcano", info: tips.volcano }), h('span', { className: "text-white font-mono text-base mt-1" }, "24 - 32 mm³/s")), h('div', { className: "flex flex-col border-l-2 border-[#8b5cf6]/30 pl-3" }, h(TechInfo, { term: "Bambu Lab HF", info: tips.bambu }), h('span', { className: "text-white font-mono text-base mt-1" }, "28 - 36 mm³/s")))) },
        { title: t.es.stepTitles[4], icon: "zap", content: h('div', { className: "space-y-4 text-left" }, h('p', { className: "text-slate-300 text-base md:text-lg leading-relaxed font-semibold" }, "Las Vertical Fine Artifacts (VFA) son marcas visuales causadas por la resonancia."), h('div', { className: "p-5 bg-slate-800/30 rounded-xl border border-slate-800 text-sm md:text-base text-slate-400 leading-relaxed" }, "• Metodología: Imprima una pared aumentando la velocidad 20mm/s cada 10mm de altura.", h('br'), "• Acción: Identifique el escalón donde la pared se ve como un espejo liso y use esa velocidad.")) },
        { title: t.es.stepTitles[5], icon: "sparkles", content: h('div', { className: "space-y-4 text-sm md:text-base text-slate-400 leading-relaxed text-left" }, h('p', { className: "text-slate-300 text-base md:text-lg font-bold uppercase tracking-tighter" }, "Tecnología revolucionaria para borrar la cicatriz de la costura mediante rampas."), h('div', { className: "p-5 bg-slate-800/30 rounded-2xl border border-slate-800 space-y-4 shadow-inner" }, h('p', null, "• Scarf Flow: 100% ideal. Si hay hueco, suba a 105%."), h('p', null, "• Orden de Paredes: ", h(TechInfo, { term: "Crucial", info: tips.order }), " Requiere paredes internas previas."))) },
        { title: t.es.stepTitles[6], icon: "maximize", content: h('div', { className: "space-y-6 text-left" }, h('div', { className: "flex gap-4 items-start bg-slate-900/50 p-5 rounded-xl border border-slate-800 shadow-inner text-base" }, h(Icon, { name: "alert-triangle", className: "text-amber-500 shrink-0 mt-1", size: 24 }), h('div', null, h('p', { className: "text-slate-100 text-lg font-bold uppercase mb-2 italic" }, "Física de Polímeros vs Configuración"), h('p', { className: "text-slate-300 leading-relaxed font-medium" }, "Si su cubo de 100mm mide 99.2mm tras enfriarse, es contracción térmica, no subextrusión."))), h('div', { className: "p-5 bg-slate-800/30 rounded-xl border border-slate-800 text-sm md:text-base text-slate-400 leading-relaxed space-y-4" }, h('ul', { className: "space-y-3" }, h('li', null, "• PLA / PETG: 0.1% - 0.2%."), h('li', null, "• ABS / ASA: 0.6% - 0.9%."), h('li', null, "• Nylon / PC: 1.0% - 1.6%.")))) },
        { title: t.es.stepTitles[7], icon: "wind", content: h('div', { className: "space-y-6 text-left" }, h('div', { className: "bg-slate-950/50 p-6 rounded-xl border border-slate-800 shadow-xl" }, h('h4', { className: "font-bold text-[#8b5cf6] mb-5 uppercase tracking-tighter flex items-center gap-2 text-base md:text-lg italic" }, h(Icon, { name: "droplets", size: 20 }), t.es.moistureTitle), h('div', { className: "grid grid-cols-1 sm:grid-cols-2 gap-4" }, h('button', { onClick: () => setSymptom('stringing'), className: `p-5 rounded-xl border text-left transition-all ${symptom === 'stringing' ? 'bg-[#8b5cf6] border-[#8b5cf6] text-white font-bold' : 'bg-slate-900 border-slate-800'}` }, h('span', { className: "text-sm block uppercase font-bold" }, "Velo / Stringing")), h('button', { onClick: () => setSymptom('popping'), className: `p-5 rounded-xl border text-left transition-all ${symptom === 'popping' ? 'bg-[#8b5cf6] border-[#8b5cf6] text-white font-bold' : 'bg-slate-900 border-slate-800'}` }, h('span', { className: "text-sm block uppercase font-bold" }, "Popping / Burbujas"))), symptom && h('div', { className: "mt-5 p-5 bg-[#8b5cf6]/10 rounded-lg border border-[#8b5cf6]/30 text-sm md:text-base leading-relaxed italic text-slate-100" }, symptom === 'stringing' ? "Diagnóstico: Puede ser retracción o humedad leve. Calibre su Pressure Advance." : "Diagnóstico: HUMEDAD CRÍTICA. El filamento requiere secado inmediato.")), h('div', { className: "overflow-hidden rounded-xl border border-slate-800 shadow-xl bg-slate-900/40" }, h('table', { className: "w-full text-left text-sm" }, h('thead', { className: "bg-slate-800 text-slate-300 font-bold uppercase text-xs" }, h('tr', null, h('th', { className: "p-4" }, "Material"), h('th', { className: "p-4" }, "Temp"), h('th', { className: "p-4" }, "Tiempo"))), h('tbody', { className: "divide-y divide-slate-800/50" }, dryingData.map((item, idx) => h('tr', { key: idx, className: "hover:bg-[#8b5cf6]/5" }, h('td', { className: "p-4 font-bold text-[#8b5cf6]" }, item.mat), h('td', { className: "p-4 font-mono" }, item.temp), h('td', { className: "p-4 font-mono" }, item.time))))))) }
    ];

    const InputGroup = ({ label, value, onChange, help }) => h('div', { className: "space-y-2 group text-left" }, h('div', { className: "flex justify-between items-center px-1" }, h('label', { className: "text-xs md:text-sm font-black uppercase text-slate-500 tracking-wider group-focus-within:text-[#8b5cf6] transition-colors font-mono" }, label)), h('input', { type: "text", inputMode: "decimal", value: value, onChange: (e) => { const v = e.target.value; if (/^-?\d*\.?\d*$/.test(v) || v === "") onChange(v); }, autoComplete: "off", className: "w-full bg-slate-950 border border-slate-700 rounded-xl px-5 py-4 text-base md:text-lg text-white focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/50 focus:border-[#8b5cf6] transition-all font-mono shadow-inner" }), help && h('p', { className: "text-xs text-slate-700 px-1 italic font-bold uppercase tracking-tighter" }, help));

    const DocStep = ({ title, iconName, badge, expanded, onClick, children }) => h('div', { className: "bg-slate-900/80 border border-slate-800 rounded-2xl transition-all hover:border-slate-700 shadow-lg relative overflow-visible group" }, h('button', { onClick: onClick, className: "w-full flex items-center justify-between p-7 text-left group" }, h('div', { className: "flex items-center gap-5" }, h('div', { className: "p-4 bg-slate-800 rounded-xl shadow-inner group-hover:bg-[#8b5cf6]/20 transition-colors" }, h(Icon, { name: iconName, className: "text-[#8b5cf6]", size: 24 })), h('div', null, h('h3', { className: "font-bold text-lg md:text-xl leading-tight uppercase tracking-tighter text-slate-100 italic group-hover:text-[#8b5cf6] transition-colors" }, title), h('p', { className: "text-xs text-[#8b5cf6] uppercase font-black tracking-widest" }, badge))), h('div', { className: "shrink-0 ml-3" }, h(Icon, { name: expanded ? "chevron-up" : "chevron-down", className: "text-slate-500", size: 24 }))), expanded && h('div', { className: "p-7 pt-0 border-t border-slate-800/50 bg-slate-900/40 animate-in slide-in-from-top-2 overflow-visible shadow-inner text-left" }, children));

    return h('div', { className: "min-h-screen bg-[#0a0f18] text-slate-100 font-sans" }, h('div', { className: "max-w-5xl mx-auto p-4 md:p-8" }, h('header', { className: "flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4 border-b border-slate-800 pb-8 text-left" }, h('div', { className: "flex items-center gap-5" }, h('div', { className: "w-14 h-14 bg-[#8b5cf6] rounded-2xl flex items-center justify-center shadow-lg shadow-[#8b5cf6]/30 text-white transform rotate-3 hover:rotate-0 transition-transform" }, h(Icon, { name: "layers", size: 32 })), h('div', null, h('h1', { className: "text-4xl font-black tracking-tighter bg-gradient-to-r from-[#8b5cf6] to-violet-300 bg-clip-text text-transparent uppercase italic" }, "Sky Toolbox"), h('p', { className: "text-slate-500 text-xs md:text-sm font-bold uppercase tracking-widest" }, t.es.subtitle))), h('nav', { className: "flex bg-slate-900/80 p-1.5 rounded-xl border border-slate-800 shadow-inner" }, h('button', { onClick: () => setActiveTab('calculators'), className: `flex-1 px-5 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'calculators' ? 'bg-[#8b5cf6] text-white shadow-md' : 'text-slate-400 hover:text-white'}` }, t.es.navCalcs), h('button', { onClick: () => setActiveTab('guide'), className: `flex-1 px-5 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'guide' ? 'bg-[#8b5cf6] text-white shadow-md' : 'text-slate-400 hover:text-white'}` }, t.es.navGuide))), activeTab === 'calculators' ? h('div', { className: "grid grid-cols-1 lg:grid-cols-12 gap-8" }, h('div', { className: "lg:col-span-3 space-y-5" }, h('div', { className: "bg-slate-900/50 p-5 rounded-2xl border border-slate-800 shadow-inner text-left" }, h('label', { className: "text-xs font-black uppercase text-slate-500 tracking-widest mb-3 block italic" }, t.es.matLabel), h('select', { value: material, onChange: (e) => setMaterial(e.target.value), className: "w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-[#8b5cf6] transition-all cursor-pointer" }, materialsList.map(m => h('option', { key: m, value: m }, m)))), h('div', { className: "flex lg:flex-col gap-3 overflow-x-auto no-scrollbar pb-3 lg:pb-0" }, [{ id: 'flow', label: t.es.sidebarFlow, icon: "activity" }, { id: 'pa', label: t.es.sidebarPA, icon: "settings-2" }, { id: 'vol', label: t.es.sidebarVol, icon: "gauge" }, { id: 'vfa', label: t.es.sidebarVFA, icon: "zap" }, { id: 'shrink', label: t.es.sidebarShrink, icon: "maximize" }].map((c) => h('button', { key: c.id, onClick: () => setActiveCalc(c.id), className: `flex-shrink-0 flex items-center gap-4 p-4 rounded-xl border transition-all ${activeCalc === c.id ? 'bg-[#8b5cf6]/10 border-[#8b5cf6]/50 text-[#8b5cf6] shadow-inner' : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'}` }, h(Icon, { name: c.icon, size: 20 }), h('span', { className: "font-bold text-sm uppercase tracking-tighter" }, c.label))))), h('div', { className: "lg:col-span-9 space-y-8" }, h('div', { className: "bg-slate-900/50 border border-slate-800 rounded-3xl p-6 md:p-10 backdrop-blur-md relative shadow-2xl" }, h('div', { className: "grid grid-cols-1 md:grid-cols-2 gap-10" }, h('div', { className: "space-y-8 text-left" }, h('h3', { className: "text-2xl font-bold flex items-center gap-4 uppercase tracking-tighter text-slate-100 italic" }, h(Icon, { name: "cpu", className: "text-[#8b5cf6]", size: 24 }), t.es.inputTitle), h('div', { className: "space-y-6" }, activeCalc === 'flow' && h(React.Fragment, null, h(InputGroup, { label: "Flujo Actual", value: flowData.current, onChange: (v) => setFlowData({ ...flowData, current: v }), help: "Slicer config" }), h(InputGroup, { label: "Modificador", value: flowData.modifier, onChange: (v) => setFlowData({ ...flowData, modifier: v }), help: "Bloque impreso" })), activeCalc === 'pa' && h(React.Fragment, null, h(InputGroup, { label: "Valor Inicial", value: paData.start, onChange: (v) => setPaData({ ...paData, start: v }) }), h(InputGroup, { label: "Paso", value: paData.step, onChange: (v) => setPaData({ ...paData, step: v }) }), h(InputGroup, { label: "Altura", value: paData.height, onChange: (v) => setPaData({ ...paData, height: v }) })), activeCalc === 'vol' && h(React.Fragment, null, h(InputGroup, { label: "Inicio (mm³/s)", value: volData.start, onChange: (v) => setVolData({ ...volData, start: v }) }), h(InputGroup, { label: "Paso", value: volData.step, onChange: (v) => setVolData({ ...volData, step: v }) }), h(InputGroup, { label: "Altura Fallo", value: volData.height, onChange: (v) => setVolData({ ...volData, height: v }) })), activeCalc === 'vfa' && h(React.Fragment, null, h(InputGroup, { label: "Velocidad Inicial", value: vfaData.start, onChange: (v) => setVfaData({ ...vfaData, start: v }) }), h(InputGroup, { label: "Incremento", value: vfaData.step, onChange: (v) => setVfaData({ ...vfaData, step: v }) }), h(InputGroup, { label: "Nivel", value: vfaData.level, onChange: (v) => setVfaData({ ...vfaData, level: v }) })), activeCalc === 'shrink' && h(React.Fragment, null, h(InputGroup, { label: "Medida en Slicer", value: shrinkData.target, onChange: (v) => setShrinkData({ ...shrinkData, target: v }) }), h(InputGroup, { label: "Medida con Calibre", value: shrinkData.measured, onChange: (v) => setShrinkData({ ...shrinkData, measured: v }) })))), h('div', { className: "flex flex-col items-center justify-center text-center p-8 bg-[#8b5cf6]/5 rounded-3xl border-2 border-dashed border-[#8b5cf6]/20 min-h-[320px] relative shadow-inner" }, h('p', { className: "text-[#8b5cf6] text-xs font-black uppercase tracking-widest mb-2 font-mono" }, t.es.resTitle), h('button', { onClick: () => goToHelp(activeCalc), className: "text-xs text-slate-500 hover:text-[#8b5cf6] uppercase font-bold tracking-tighter mb-5 flex items-center gap-2 transition-colors underline decoration-[#8b5cf6]/30 italic" }, h(Icon, { name: "book-open", size: 14 }), t.es.guideLink), h('div', { className: "text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white leading-tight transition-all tabular-nums tracking-tighter drop-shadow-xl" }, getCurrentResult(), activeCalc === 'shrink' && '%'), h('div', { className: "flex gap-3 w-full max-w-[280px] mt-10" }, h('button', { onClick: () => copyToClipboard(getCurrentResult()), className: `flex-1 flex items-center justify-center gap-3 px-5 py-4.5 rounded-2xl font-bold transition-all transform active:scale-95 shadow-xl ${copied ? 'bg-green-500 text-white' : 'bg-[#8b5cf6] hover:bg-violet-400 text-white shadow-[#8b5cf6]/30'}` }, h(Icon, { name: copied ? "check-circle-2" : "clipboard", size: 22 }), h('span', { className: "text-base" }, copied ? t.es.copiedBtn : t.es.copyBtn)), h('button', { onClick: saveToHistory, className: `p-4.5 rounded-2xl transition-all border shadow-lg group ${saved ? 'bg-green-600 border-green-500 text-white' : 'bg-slate-800 text-slate-300 border-slate-700'}` }, h(Icon, { name: saved ? "check-circle-2" : "save", size: 22 })))))), h('div', { className: "bg-slate-900/40 p-8 rounded-3xl border border-slate-800 shadow-inner" }, h('div', { className: "flex items-center justify-between mb-5 px-1 text-left" }, h('h4', { className: "text-sm font-black uppercase text-slate-500 tracking-widest flex items-center gap-2 italic" }, h(Icon, { name: "rotate-ccw", size: 16 }), t.es.recentResults), history.length > 0 && h('button', { onClick: clearHistory, className: "text-xs font-black uppercase text-red-500/60 hover:text-red-500 flex items-center gap-2" }, h(Icon, { name: "trash", size: 14 }), t.es.clearAll)), h('div', { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" }, history.length > 0 ? history.map(item => h('div', { key: item.id, className: "flex justify-between items-center p-4 bg-slate-950/50 rounded-xl border border-slate-800/50 hover:border-[#8b5cf6]/40 transition-colors group relative text-left" }, h('div', { className: "flex flex-col" }, h('span', { className: "text-[10px] font-black text-[#8b5cf6] uppercase tracking-tighter" }, item.type), h('span', { className: "text-xs text-slate-500 font-medium" }, item.material, " • ", item.date)), h('div', { className: "flex items-center gap-4" }, h('span', { className: "text-white font-mono font-bold text-base tracking-tight" }, item.value), h('button', { onClick: () => deleteItem(item.id), className: "p-2 rounded-lg text-slate-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all" }, h(Icon, { name: "trash", size: 14 }))))) : h('p', { className: "text-sm text-slate-600 italic py-3 text-center w-full uppercase" }, t.es.noHistory))))) : h('div', { className: "space-y-5 pb-24" }, h('div', { className: "grid grid-cols-1 gap-5 text-left" }, guideItems.map((step, idx) => h(DocStep, { key: idx, title: step.title, iconName: step.icon, badge: t.es.guideBadge, expanded: expandedStep === idx, onClick: () => setExpandedStep(expandedStep === idx ? -1 : idx) }, step.content))), h('div', { className: "bg-gradient-to-r from-violet-900/20 to-slate-900/30 p-10 rounded-3xl border border-[#8b5cf6]/30 flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl" }, h('div', { className: "flex items-start gap-5 text-left" }, h('div', { className: "p-4 bg-slate-800 rounded-2xl shadow-inner text-[#8b5cf6]" }, h(Icon, { name: "book-open", size: 28 })), h('div', { className: "space-y-2 text-left" }, h('h4', { className: "text-2xl font-bold text-white italic" }, t.es.wikiTitle), h('p', { className: "text-base text-slate-400 max-w-md leading-relaxed" }, t.es.wikiSub))), h('a', { href: "https://github.com/OrcaSlicer/OrcaSlicer/wiki/Calibration", target: "_blank", rel: "noreferrer", className: "flex items-center gap-4 bg-[#8b5cf6] text-white px-10 py-4 rounded-xl font-bold hover:bg-violet-400 transition-all shadow-lg group text-base" }, t.es.wikiBtn, h(Icon, { name: "external-link", size: 20, className: "group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" })))), h('footer', { className: "mt-14 pt-10 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-8 text-slate-500 pb-16" }, h('div', { className: "flex flex-col gap-2 text-left" }, h('div', { className: "flex items-center gap-2 font-mono text-sm text-slate-400 font-bold uppercase tracking-tighter" }, h('span', { className: "w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" }), " Sky Toolbox @ sky3darg"), h('p', { className: "text-xs uppercase font-black tracking-widest italic text-slate-600" }, "by skydev")), h('div', { className: "flex flex-col md:items-end gap-4 text-xs font-medium italic text-right text-slate-600" }, h('div', { className: "flex gap-8 text-xs font-black uppercase tracking-widest not-italic mb-1 text-slate-600" }, h('a', { href: "https://bambulab.com", target: "_blank", rel: "noreferrer", className: "hover:text-[#8b5cf6] transition-colors" }, "Bambu Lab"), h('a', { href: "https://github.com/SoftFever/OrcaSlicer", target: "_blank", rel: "noreferrer", className: "hover:text-[#8b5cf6] transition-colors" }, "OrcaSlicer")), "© 2026 Sky 3D"))));
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(h(App));

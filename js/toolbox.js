const toolRepo = {
    calc3d: `
        <h2>Sky 3D Scale</h2>
        <div class="tool-help">
            <strong>Ayuda:</strong> Introducí el peso total que indica tu laminador (Slicer) y el costo actual del rollo. El cálculo incluye el costo neto por gramo aplicado a la pieza.
        </div>
        <div class="tool-form">
            <label>Peso de la pieza (gr):</label>
            <input type="number" id="peso" placeholder="Ej: 150">
            <label>Precio del filamento por Kg ($):</label>
            <input type="number" id="precio" placeholder="Ej: 21000">
            <button class="btn-run" onclick="ejecutarCalc3D()">Calcular Costo</button>
        </div>
        <div id="res-3d" class="result-box hidden"></div>
    `,
    diametro: `
        <h2>Cálculo de Diámetro</h2>
        <div class="tool-help">
            <strong>Ayuda:</strong> Esta herramienta utiliza la constante matemática π (3.14159...) para obtener el diámetro exacto a partir de una medición de circunferencia (perímetro). Ideal para diseño mecánico en Fusion 360.
        </div>
        <div class="tool-form">
            <label>Perímetro medido (mm):</label>
            <input type="number" id="peri" placeholder="Ej: 314.16">
            <button class="btn-run" onclick="ejecutarDiametro()">Calcular Diámetro</button>
        </div>
        <div id="res-dia" class="result-box hidden"></div>
    `
};

function showTool(id) {
    const home = document.getElementById('home-view');
    const toolView = document.getElementById('tool-view');
    const render = document.getElementById('tool-render');

    home.classList.add('hidden');
    toolView.classList.remove('hidden');
    render.innerHTML = toolRepo[id];
}

function goHome() {
    document.getElementById('tool-view').classList.add('hidden');
    document.getElementById('home-view').classList.remove('hidden');
}

function ejecutarCalc3D() {
    const p = parseFloat(document.getElementById('peso').value);
    const pr = parseFloat(document.getElementById('precio').value);
    const out = document.getElementById('res-3d');
    
    if(p > 0 && pr > 0) {
        const total = (pr / 1000) * p;
        out.innerHTML = `<h3>Costo del Material: $${total.toFixed(2)}</h3>
                         <p style="font-size: 0.8rem; color: #8b949e;">* No incluye energía ni amortización.</p>`;
        out.classList.remove('hidden');
    }
}

function ejecutarDiametro() {
    const p = parseFloat(document.getElementById('peri').value);
    const out = document.getElementById('res-dia');
    
    if(p > 0) {
        const diam = p / Math.PI;
        out.innerHTML = `<h3>Diámetro Resultante: ${diam.toFixed(4)} mm</h3>`;
        out.classList.remove('hidden');
    }
}

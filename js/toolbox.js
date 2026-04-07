const toolRepo = {
    calc3d: `
        <h2>Sky 3D Scale</h2>
        <p>Cotizador de material por peso bruto.</p>
        <div class="tool-form">
            <label>Peso de la pieza (gr):</label>
            <input type="number" id="peso" placeholder="Ej: 100">
            <label>Precio del filamento por Kg ($):</label>
            <input type="number" id="precio" placeholder="Ej: 19500">
            <button class="btn-run" onclick="ejecutarCalc3D()">Calcular Costo</button>
        </div>
        <div id="res-3d" class="result-box hidden"></div>
    `,
    diametro: `
        <h2>Cálculo de Diámetro</h2>
        <p>Precisión técnica basada en el perímetro medido.</p>
        <div class="tool-form">
            <label>Perímetro (mm):</label>
            <input type="number" id="peri" placeholder="Ej: 314.16">
            <button class="btn-run" onclick="ejecutarDiametro()">Calcular mm</button>
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
        out.innerHTML = `<h3>Costo estimado: $${total.toFixed(2)}</h3>`;
        out.classList.remove('hidden');
    }
}

function ejecutarDiametro() {
    const p = parseFloat(document.getElementById('peri').value);
    const out = document.getElementById('res-dia');
    
    if(p > 0) {
        const diam = p / Math.PI;
        out.innerHTML = `<h3>Diámetro: ${diam.toFixed(2)} mm</h3>`;
        out.classList.remove('hidden');
    }
}

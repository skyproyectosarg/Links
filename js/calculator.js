function format(val) {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(val);
}

function calcular() {
    const pKg = parseFloat(document.getElementById('precioKg').value) || 0;
    const ckwh = parseFloat(document.getElementById('ckwh').value) || 0;
    const watts = parseFloat(document.getElementById('watts').value) || 0;
    const vMaq = parseFloat(document.getElementById('vMaq').value) || 0;
    const vUtil = parseFloat(document.getElementById('vUtil').value) || 1;
    const hMes = parseFloat(document.getElementById('hMes').value) || 1;
    const hImp = parseFloat(document.getElementById('hImp').value) || 0;
    const mImp = parseFloat(document.getElementById('mImp').value) || 0;
    const peso = parseFloat(document.getElementById('peso').value) || 0;
    const multi = parseFloat(document.getElementById('multi').value) || 1;

    const tTotal = hImp + (mImp / 60);

    const costoMat = (pKg / 1000) * peso;
    const costoElec = (watts / 1000) * tTotal * ckwh;
    const amortizacion = (vMaq / vUtil) * tTotal;
    const costoTotal = costoMat + costoElec + amortizacion;
    const precioFinal = costoTotal * multi;

    document.getElementById('outCostoTotal').innerText = format(costoTotal);
    document.getElementById('outProfit').innerText = format(precioFinal - costoTotal);
    document.getElementById('outFinal').innerText = format(precioFinal);
}

window.onload = () => {
    if(typeof lucide !== 'undefined') lucide.createIcons();
    calcular();
};

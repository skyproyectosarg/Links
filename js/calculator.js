function format(val) {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(val);
}

function calcular() {
    const pKg = parseFloat(document.getElementById('precioKg').value) || 0;
    const ckwh = parseFloat(document.getElementById('ckwh').value) || 0;
    const watts = parseFloat(document.getElementById('watts').value) || 0;
    const fail = (parseFloat(document.getElementById('failRate').value) / 100) || 0;
    const vMaq = parseFloat(document.getElementById('vMaq').value) || 0;
    const vUtil = parseFloat(document.getElementById('vUtil').value) || 1;
    const gFijos = parseFloat(document.getElementById('gFijos').value) || 0;
    const hMes = parseFloat(document.getElementById('hMes').value) || 1;
    const vHH = parseFloat(document.getElementById('vHH').value) || 0;
    const tMan = parseFloat(document.getElementById('tMan').value) || 0;
    const cMant = parseFloat(document.getElementById('cMant').value) || 0;
    const hImp = parseFloat(document.getElementById('hImp').value) || 0;
    const mImp = parseFloat(document.getElementById('mImp').value) || 0;
    const peso = parseFloat(document.getElementById('peso').value) || 0;
    const multi = parseFloat(document.getElementById('multi').value) || 1;
    const mlP = parseFloat(document.getElementById('mlPerc').value) / 100 || 0;
    const mlF = parseFloat(document.getElementById('mlFijo').value) || 0;

    const tTotal = hImp + (mImp / 60);

    const costoMat = ((pKg / 1000) * peso) * (1 + fail);
    const costoElec = (watts / 1000) * tTotal * ckwh;
    const amortMant = ((vMaq / vUtil) + cMant) * tTotal;
    const laborFijos = ((vHH / 60) * tMan) + ((gFijos / hMes) * tTotal);

    const costoTotal = costoMat + costoElec + amortMant + laborFijos;
    const precioFinal = costoTotal * multi;
    const precioML = (precioFinal + mlF) / (1 - mlP);

    document.getElementById('outMat').innerText = format(costoMat);
    document.getElementById('outElec').innerText = format(costoElec);
    document.getElementById('outAmort').innerText = format(amortMant);
    document.getElementById('outLabor').innerText = format(laborFijos);
    document.getElementById('outCostoTotal').innerText = format(costoTotal);
    document.getElementById('outProfit').innerText = format(precioFinal - costoTotal);
    document.getElementById('outFinal').innerText = format(precioFinal);
    document.getElementById('outML').innerText = format(precioML);
}

if (typeof lucide !== 'undefined') {
    lucide.createIcons();
}

document.addEventListener('DOMContentLoaded', () => {
    const triggers = document.querySelectorAll('.info-trigger');
    
    triggers.forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            const tooltip = trigger.nextElementSibling;
            
            document.querySelectorAll('.tooltip').forEach(t => {
                if (t !== tooltip) t.classList.remove('active');
            });

            tooltip.classList.toggle('active');
        });
    });

    document.addEventListener('click', () => {
        document.querySelectorAll('.tooltip').forEach(t => t.classList.remove('active'));
    });
});

window.onload = calcular;

const ctx = document.getElementById('chart').getContext('2d');
let chart;

function calculateF(func, x) {
    if (func === 'x^2') return (x * x * x) / 3;
    if (func === 'x') return (x * x) / 2;
    if (func === 'sin(x)') return -Math.cos(x) + Math.cos(0);
    return 0;
}

function evaluateFunc(func, x) {
    if (func === 'x^2') return x * x;
    if (func === 'x') return x;
    if (func === 'sin(x)') return Math.sin(x);
    return 0;
}

function updateChart() {
    const func = document.getElementById('functionSelect').value;
    const h = parseFloat(document.getElementById('hRange').value);
    const x = 2;
    const data = [];
    for (let t = 0; t <= 5; t += 0.1) {
        data.push({ x: t, y: evaluateFunc(func, t) });
    }

    const F_x = calculateF(func, x);
    const F_xh = calculateF(func, x + h);
    const limit = (F_xh - F_x) / h;
    document.getElementById('limitResult').textContent = `極限值: ${limit.toFixed(2)} (應趨近 f(${x}) = ${evaluateFunc(func, x).toFixed(2)})`;

    const areaData = data.filter(d => d.x >= x && d.x <= x + h);
    areaData.unshift({ x: x, y: 0 });
    areaData.push({ x: x + h, y: 0 });

    if (chart) chart.destroy();
    chart = new Chart(ctx, {
        type: 'line',
        data: {
            datasets: [{
                label: `f(x) = ${func}`,
                data: data,
                borderColor: 'blue',
                fill: false
            }, {
                label: '區間 [x, x+h]',
                data: areaData,
                borderColor: 'rgba(0, 255, 0, 0.2)',
                backgroundColor: 'rgba(0, 255, 0, 0.2)',
                fill: true
            }]
        },
        options: { scales: { x: { type: 'linear', position: 'bottom' } } }
    });
}

function checkLevel4() {
    alert('恭喜！你獲得了微積分大師獎盃！');
}

document.getElementById('hRange').addEventListener('input', updateChart);
document.getElementById('functionSelect').addEventListener('change', updateChart);
updateChart();
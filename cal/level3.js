const ctx = document.getElementById('chart').getContext('2d');
let chart;

function updateChart() {
    const xi = parseFloat(document.getElementById('xiRange').value);
    const x = 2, h = 1;
    const data = [];
    for (let t = 0; t <= 5; t += 0.1) {
        data.push({ x: t, y: t * t });
    }

    const integral = ((x + h) * (x + h) * (x + h) - x * x * x) / 3; // ∫x² dx from x to x+h
    const meanValue = xi * xi * h;
    document.getElementById('meanValueResult').textContent = `積分值: ${integral.toFixed(2)}, f(${xi.toFixed(1)})h = ${meanValue.toFixed(2)}`;

    const areaData = data.filter(d => d.x >= x && d.x <= x + h); // 積分區間
    areaData.unshift({ x: x, y: 0 }); // 從 (x, 0) 開始
    areaData.push({ x: x + h, y: 0 }); // 回到 (x+h, 0)

    if (chart) chart.destroy();
    chart = new Chart(ctx, {
        type: 'line',
        data: {
            datasets: [{
                label: 'f(x) = x²',
                data: data,
                borderColor: 'blue',
                fill: false
            }, {
                label: '積分區間',
                data: areaData,
                borderColor: 'rgba(0, 255, 0, 0.2)',
                backgroundColor: 'rgba(0, 255, 0, 0.2)',
                fill: true
            }, {
                label: 'ξ',
                data: [{ x: xi, y: xi * xi }],
                type: 'scatter',
                pointRadius: 5,
                backgroundColor: 'red'
            }]
        },
        options: { scales: { x: { type: 'linear', position: 'bottom' } } }
    });
}

function checkLevel3() {
    alert('恭喜！你獲得了中位數寶石！');
}

document.getElementById('xiRange').addEventListener('input', updateChart);
updateChart();
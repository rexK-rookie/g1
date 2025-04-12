const ctx = document.getElementById('chart').getContext('2d');
let chart;

function calculateIntegral(func, x) {
    if (func === 'x^2') return (x * x * x) / 3;
    if (func === 'x') return (x * x) / 2;
    if (func === 'sin(x)') return -Math.cos(x) + Math.cos(0);
    return 0;
}

function updateChart() {
    const func = document.getElementById('functionSelect').value;
    const x = parseFloat(document.getElementById('xRange').value);
    const data = [];
    for (let t = 0; t <= 5; t += 0.1) {
        let y = func === 'x^2' ? t * t : func === 'x' ? t : Math.sin(t);
        data.push({ x: t, y });
    }

    const area = calculateIntegral(func, x);
    document.getElementById('areaResult').textContent = `積分面積 F(${x.toFixed(1)}) = ${area.toFixed(2)}`;

    const areaData = data.filter(d => d.x <= x); // 積分區域數據
    areaData.unshift({ x: 0, y: 0 }); // 從原點開始填充
    areaData.push({ x: x, y: 0 }); // 回到x軸

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
                label: '積分區域',
                data: areaData,
                borderColor: 'rgba(0, 0, 255, 0.2)',
                backgroundColor: 'rgba(0, 0, 255, 0.2)',
                fill: true // 明確填充
            }]
        },
        options: { scales: { x: { type: 'linear', position: 'bottom' } } }
    });
}

function checkLevel1() {
    alert('恭喜！你獲得了積分徽章！');
}

document.getElementById('xRange').addEventListener('input', updateChart);
document.getElementById('functionSelect').addEventListener('change', updateChart);
updateChart();
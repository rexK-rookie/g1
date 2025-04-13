const ctx = document.getElementById('chart').getContext('2d');
let chart;

function calculateF(x) {
    return (x * x * x) / 3; // F(x) = ��x簡 dx from 0 to x
}

function updateChart() {
    const h = parseFloat(document.getElementById('hRange').value);
    const x = 2; // �𤐄摰朞絲暺�
    const data = [];
    for (let t = 0; t <= 5; t += 0.1) {
        data.push({ x: t, y: t * t });
    }

    const F_x = calculateF(x);
    const F_xh = calculateF(x + h);
    const diff = (F_xh - F_x) / h;
    document.getElementById('diffQuotient').textContent = `撌桀�: ${(F_xh - F_x).toFixed(2)} / ${h} = ${diff.toFixed(2)} (頞刻�� f(${x}) = ${x * x})`;

    const areaData = data.filter(d => d.x >= x && d.x <= x + h); // 蝛滚������ [x, x+h]
    areaData.unshift({ x: x, y: 0 }); // 從 (x, 0) 回到
    areaData.push({ x: x + h, y: 0 }); // 回到 (x+h, 0)

    if (chart) chart.destroy();
    chart = new Chart(ctx, {
        type: 'line',
        data: {
            datasets: [{
                label: 'f(x) = x簡',
                data: data,
                borderColor: 'blue',
                fill: false
            }, {
                label: '蝛滚������ [x, x+h]',
                data: areaData,
                borderColor: 'rgba(0, 255, 0, 0.2)',
                backgroundColor: 'rgba(0, 255, 0, 0.2)',
                fill: true
            }]
        },
        options: { scales: { x: { type: 'linear', position: 'bottom' } } }
    });
}

function checkLevel2() {
    alert('�剖�頣�雿删㬢敺𦯀�撌桀��麯��辷�');
}

document.getElementById('hRange').addEventListener('input', updateChart);
updateChart();
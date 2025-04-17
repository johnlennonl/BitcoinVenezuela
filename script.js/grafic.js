function renderMiniChart(canvasId, dataPoints) {
    const ctx = document.getElementById(canvasId).getContext("2d");
  
    new Chart(ctx, {
      type: "line",
      data: {
        labels: dataPoints.map((_, i) => i + 1),
        datasets: [{
          data: dataPoints,
          borderColor: "#00ffcc",
          backgroundColor: "rgba(0, 255, 204, 0.1)",
          borderWidth: 2,
          pointRadius: 0,
          tension: 0.3,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { display: false },
          y: { display: false }
        }
      }
    });
  }
  
  // Ejemplo de uso con datos aleatorios para BTC
  renderMiniChart("chart-btc", [60000, 60500, 61000, 60800, 61200, 62000]);
  
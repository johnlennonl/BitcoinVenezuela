// Helper: get/set cookies
function setCookie(name, value, days) {
    let expires = "";
    if (days) {
      const date = new Date();
      date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
      expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
  }
  
  function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(";");
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) == " ") c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  }
  
  const cryptoSection = document.getElementById("crypto-section");
  const cryptoPrices = document.getElementById("crypto-prices");
  let cryptoInterval = null;
  
  function showCryptoSection() {
    cryptoSection.style.display = "block";
    fetchDolarPrices(); // 👈 agrega esto
    fetchAndDisplayCrypto();
    if (cryptoInterval) clearInterval(cryptoInterval);
    cryptoInterval = setInterval(() => {
      fetchAndDisplayCrypto();
      fetchDolarPrices();
    }, 60000); // Actualiza cada 60 segundos
  }
  
  function hideCryptoSection() {
    cryptoSection.style.display = "none";
    if (cryptoInterval) clearInterval(cryptoInterval);
  }
  
  function handleAcceptCookies() {
    setCookie("crypto_cookies_accepted", "yes", 365);
    localStorage.setItem("crypto_cookies_accepted", "yes"); // ✅ Guardar en localStorage
    showCryptoSection();
  }
  
  function handleRejectCookies() {
    setCookie("crypto_cookies_accepted", "no", 365);
    localStorage.setItem("crypto_cookies_accepted", "no"); // ✅ Guardar en localStorage
    hideCryptoSection();
  }
  window.addEventListener("DOMContentLoaded", function () {
  const acceptedLocal = localStorage.getItem("crypto_cookies_accepted");
  const acceptedCookie = getCookie("crypto_cookies_accepted");

  const accepted = acceptedLocal || acceptedCookie;

  if (accepted === "yes") {
    showCryptoSection();
  } else if (accepted === "no") {
    hideCryptoSection();
  } else {
    Swal.fire({
      title: "🍪 Este sitio usa cookies",
      text: "¿Aceptas el uso de cookies para mostrar precios de criptomonedas?",
      icon: "info",
      showCancelButton: true,
      confirmButtonText: "Aceptar",
      cancelButtonText: "Rechazar",
      background: "#1f1f1f",
      color: "#fff"
    }).then((result) => {
      if (result.isConfirmed) {
        handleAcceptCookies();
      } else {
        handleRejectCookies();
      }
    });
  }
});

  
  // Fetch crypto prices from CoinGecko API
  async function fetchAndDisplayCrypto() {
    const url =
      "https://api.coingecko.com/api/v3/coins/markets" +
      "?vs_currency=usd" +
      "&order=market_cap_desc" +
      "&per_page=20" +
      "&page=1" +
      "&sparkline=true";  // <-- aquí cambiamos a true
  
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error("API error");
      const data = await res.json();
  
      // 1) Generar el HTML con un <canvas> por coin
      let html = "";
      data.forEach((coin) => {
        html += `
          <div class="col-12 col-md-6 col-lg-4">
            <div class="card shadow-sm animate__animated animate__fadeInUp">
              <div class="card-body">
                <div class="d-flex align-items-center mb-2">
                  <img src="${coin.image}" alt="${coin.name}" width="32" height="32" class="me-3" />
                  <div>
                    <h5 class="card-title mb-0">${coin.name} (${coin.symbol.toUpperCase()})</h5>
                    <small class="text-white-opacity-50 ">Rank #${coin.market_cap_rank}</small>
                  </div>
                </div>
                <p class="card-text mb-2">
                  USD: <strong>${coin.current_price.toLocaleString("en-US", {
                    style: "currency",
                    currency: "USD"
                  })}</strong>
                </p>
                <!-- canvas donde irá el sparkline -->
                <div style="height:50px;">
                  <canvas id="sparkline-${coin.id}"></canvas>
                </div>
              </div>
            </div>
          </div>
        `;      });
      cryptoPrices.innerHTML = html;
  
      // 2) Renderizar un chart por cada canvas usando los datos sparkline
      data.forEach((coin) => {
        const ctx = document
          .getElementById(`sparkline-${coin.id}`)
          .getContext("2d");
  
        new Chart(ctx, {
          type: "line",
          data: {
            labels: coin.sparkline_in_7d.price.map((_, i) => i), // índice
            datasets: [
              {
                data: coin.sparkline_in_7d.price,
                fill: true,
                tension: 0.3,
                borderWidth: 1.5,
                pointRadius: 0,
                borderColor: "rgba(0,255,224,0.9)",
                backgroundColor: "rgba(0,255,224,0.2)"
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
              x: { display: false },
              y: { display: false }
            },
            elements: {
              line: { borderCapStyle: "round" }
            }
          }
        });
      });
    } catch (e) {
      cryptoPrices.innerHTML =
        '<div class="col-12"><div class="alert alert-danger">No se pudieron obtener los precios de criptomonedas.</div></div>';
    }
  }
  
  

  async function fetchDolarPrices() {
    const dolarPrices = document.getElementById("dolar-prices");
    const usdInput = document.getElementById("usd-input");
    const convertedValues = document.getElementById("converted-values");
  
    try {
      const res = await fetch("https://ve.dolarapi.com/v1/dolares");
      if (!res.ok) throw new Error("No se pudo obtener el dólar");
      const data = await res.json();
  
      // Buscar precios
      const oficial = data.find((d) => d.nombre.toLowerCase() === "oficial");
      const paralelo = data.find((d) => d.nombre.toLowerCase() === "paralelo");
  
      let html = `
        <div class="row">
          <div class="col-md-6 mb-3">
            <div class="card text-white bg-dark shadow-sm p-3">
              <h5 class="card-title">🇻🇪 Dolar Banco Central 
              </h5>
              <p class="card-text fs-4">${oficial ? oficial.promedio.toLocaleString("es-VE", {
                style: "currency",
                currency: "VES"
              }) : "No disponible"}</p>
            </div>
          </div>
          <div class="col-md-6 mb-3">
            <div class="card text-white bg-dark shadow-sm p-3">
              <h5 class="card-title">🟢 Dólar Paralelo</h5>
              <p class="card-text fs-4">${paralelo ? paralelo.promedio.toLocaleString("es-VE", {
                style: "currency",
                currency: "VES"
              }) : "No disponible"}</p>
            </div>
          </div>
        </div>
      `;
  
      dolarPrices.innerHTML = html;
  
      // Conversión
      usdInput.addEventListener("input", () => {
        const usd = parseFloat(usdInput.value);
        if (isNaN(usd)) {
          convertedValues.innerHTML = "";
          return;
        }
  
        let convertHtml = "";
        if (oficial)
          convertHtml += `<p
        >🇻🇪 Oficial: ${(usd * oficial.promedio).toLocaleString("es-VE", {
            style: "currency",
            currency: "VES"
          })}</p>`;
        if (paralelo)
          convertHtml += `<p
        >🟢 Paralelo: ${(usd * paralelo.promedio).toLocaleString("es-VE", {
            style: "currency",
            currency: "VES"
          })}</->`;
  
        convertedValues.innerHTML = convertHtml;
      });
    } catch (e) {
      dolarPrices.innerHTML =
        '<div class="alert alert-danger">No se pudo obtener el precio del dólar.</div>';
    }
  }
  
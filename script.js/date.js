function renderDolarTitle() {
    const titleContainer = document.getElementById("dolar-title-container");
  
    const today = new Date();
    const options = { day: "2-digit", month: "long"
        , year: "numeric" };
    const formattedDate = today.toLocaleDateString("es-VE", options);
  
    titleContainer.innerHTML = `<h3 class="mb-4 text-start
    text-2xl font-bold text-gray-800 dark:text-white
    ">💱 Precio del dólar en Venezuela 🗓
     ${formattedDate}</h3>`;
  }
  
  // Ejecutar al cargar la página
  document.addEventListener("DOMContentLoaded", renderDolarTitle);
  
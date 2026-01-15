// ================== DOM ELEMENTS ==================
const fromDropdown = document.querySelector("#select-from-currency");
const searchFrom = document.querySelector("#searchFrom");

const ToDropdown = document.querySelector("#select-to-currency");
const searchTo = document.querySelector("#searchTo");

const amountInput = document.querySelector("#amount");
const convertBtn = document.querySelector("#convert-btn");
const dateInput = document.querySelector("#date");
const resultDisplay = document.querySelector(".result");


const state = {

    previousDate: null,
    data: null
};

// ================== INIT ==================
dateInput.max = new Date().toISOString().split("T")[0];

let currencyOptions = currencyOptionsHTML();
document.querySelectorAll(".select-currency").forEach(select => {
    select.innerHTML = currencyOptions;
});

// ================== SEARCH FILTER ==================
searchFrom.addEventListener("input", () => {
    loadOptions(searchFrom, fromDropdown);
});

searchTo.addEventListener("input", () => {
    loadOptions(searchTo, ToDropdown);
});

// ================== DROPDOWN CLICK ==================
fromDropdown.addEventListener("click", () => {
    loadOptions(searchFrom, fromDropdown);
    const img = document.querySelector(".from-country-flag img");
    updateFlag(img, fromDropdown);
});

ToDropdown.addEventListener("click", () => {
    loadOptions(searchTo, ToDropdown);
    const img = document.querySelector(".to-country-flag img");
    updateFlag(img, ToDropdown);
});

// ================== CONVERT BUTTON ==================
convertBtn.addEventListener("click", async() => {
    const data = await getData();

    if (!data || !data.eur) {
        console.error("Currency data not available");
        return;
    }

    const amount = amountInput.value || 1;
    const fromCurrency = fromDropdown.selectedOptions[0].text.toLowerCase();
    const toCurrency = ToDropdown.selectedOptions[0].text.toLowerCase();

    const rateFrom = data.eur[fromCurrency];
    const rateTo = data.eur[toCurrency];

    if (!rateFrom || !rateTo) {
        console.error("Invalid currency selection");
        return;
    }

    const result = (amount / rateFrom) * rateTo;
    if (result > 1) {
        document.querySelector(".result-container").style.backgroundColor = "#ffd6d6";
    } else {
        document.querySelector(".result-container").style.backgroundColor = "#d1ffd6";
    }
    resultDisplay.textContent = result.toFixed(4);
});

// ================== API ==================
async function exchangeRates(date) {
    const baseURL = date ?
        `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@${date}/v1/currencies/eur.json` :
        `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/eur.json`;

    const response = await fetch(baseURL);
    return await response.json();
}

// ================== DATA HANDLER (FIXED) ==================
async function getData() {
    const date = dateInput.value || new Date().toISOString().split("T")[0];

    // Use cached data if date is same
    if (state.previousDate === date && state.data) {
        return state.data;
    }

    // Fetch new data
    const data = await exchangeRates(date);

    // Update state AFTER promise resolves
    state.previousDate = date;
    state.data = data;

    return data;
}

// ================== FLAG UPDATE ==================
function updateFlag(img, dropdown) {
    if (!img) return;
    img.src = `https://flagsapi.com/${dropdown.value}/flat/64.png`;
}

// ================== OPTIONS HTML ==================
function currencyOptionsHTML() {
    let html = "";

    Object.entries(countryList).forEach(([currency, countryCode]) => {
        html += currency === "INR" ?
            `<option value="${countryCode}" selected>${currency}</option>` :
            `<option value="${countryCode}">${currency}</option>`;
    });

    return html;
}

// ================== FILTER OPTIONS ==================
function loadOptions(search, dropdown) {
    const query = search.value.toLowerCase();

    Array.from(dropdown.options).forEach(option => {
        option.style.display = !query || option.text.toLowerCase().includes(query) ?
            "block" :
            "none";
    });
}
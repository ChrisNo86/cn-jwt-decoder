const jwtInput = document.querySelector("#jwtInput");
const headerOutput = document.querySelector("#headerOutput");
const payloadOutput = document.querySelector("#payloadOutput");
const statusOutput = document.querySelector("#statusOutput");
const copyButtons = document.querySelectorAll(".copy-btn");

jwtInput.addEventListener("input", decodeToken);

copyButtons.forEach(button => {
    button.addEventListener("click", () => {
        copyContent(button.dataset.copy);
    });
});

function decodeToken() {
    const token = jwtInput.value.trim();

    if (!token) {
        resetOutputs();
        return;
    }

    try {
        const [header, payload] = token.split(".");

        showHeader(header);
        showPayload(payload);
        showExpiration(payload);

    } catch {
        showError();
    }
}

function showHeader(value) {
    headerOutput.textContent = formatJson(parseJwtPart(value));
}

function showPayload(value) {
    payloadOutput.textContent = formatJson(parseJwtPart(value));
}

function showExpiration(value) {
    const payload = parseJwtPart(value);

    if (!payload.exp) {
        statusOutput.textContent = "No expiration found.";
        return;
    }

    const expiry = new Date(payload.exp * 1000);
    const expired = expiry < new Date();

    statusOutput.textContent = expired
        ? `Expired: ${expiry}`
        : `Valid until: ${expiry}`;
}

function parseJwtPart(part) {
    const base64 = part.replace(/-/g, "+")
        .replace(/_/g, "/");

    return JSON.parse(atob(base64));
}

function formatJson(data) {
    return JSON.stringify(data, null, 2);
}

function copyContent(id) {
    const element = document.getElementById(id);

    navigator.clipboard.writeText(
        element.textContent
    );
}

function resetOutputs() {
    headerOutput.textContent = "Waiting...";
    payloadOutput.textContent = "Waiting...";
    statusOutput.textContent = "No token loaded.";
}

function showError() {
    statusOutput.textContent = "Invalid JWT.";
}
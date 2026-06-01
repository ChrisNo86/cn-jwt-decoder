const jwtInput = document.querySelector("#jwtInput");
const headerOutput = document.querySelector("#headerOutput");
const payloadOutput = document.querySelector("#payloadOutput");
const statusOutput = document.querySelector("#statusOutput");
const copyButtons = document.querySelectorAll(".copy-btn");
const exampleBtn = document.querySelector("#exampleBtn");
const clearBtn = document.querySelector("#clearBtn");
const detailsOutput = document.querySelector("#detailsOutput");

jwtInput.addEventListener("input", decodeToken);
exampleBtn.addEventListener(
    "click",
    loadExampleToken
);

clearBtn.addEventListener(
    "click",
    clearDecoder
);
exampleBtn.addEventListener("click", () => {
    const exampleToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNzE0NjI4ODAwLCJleHAiOjE3MTQ2Mjk0MDB9.iQy4oQ87mP83w34yU4U8u4l4b3i3i3i3i3i3i3i3i3i3i3";

    jwtInput.value = exampleToken;
    decodeToken();
});

clearBtn.addEventListener("click", () => {
    jwtInput.value = "";
    resetOutputs();
});

copyButtons.forEach(button => {

    button.addEventListener(
        "click",
        () => {
            copyContent(
                button.dataset.copy,
                button
            );
        }
    );

});
function clearDecoder() {
    jwtInput.value = "";
    resetOutputs();
    detailsOutput.textContent =
        "Waiting...";
}
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
        const payloadData =
            parseJwtPart(payload);

        showDetails(payloadData);
        showExpiration(payload);

    } catch {
        showError();
    }
}
function showDetails(payload) {
    const issuedAt = payload.iat
        ? new Date(payload.iat * 1000)
        : "N/A";

    const expiresAt = payload.exp
        ? new Date(payload.exp * 1000)
        : "N/A";

    detailsOutput.innerHTML = `
        <p>Issued At: ${issuedAt}</p>
        <p>Expires At: ${expiresAt}</p>
    `;
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

async function copyContent(id, button) {

    const element =
        document.getElementById(id);

    await navigator.clipboard.writeText(
        element.textContent
    );

    const original =
        button.textContent;

    button.textContent = "Copied ✓";

    setTimeout(() => {
        button.textContent = original;
    }, 1500);
}
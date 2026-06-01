const jwtInput =
    document.querySelector("#jwtInput");

const headerOutput =
    document.querySelector("#headerOutput");

const payloadOutput =
    document.querySelector("#payloadOutput");

const statusOutput =
    document.querySelector("#statusOutput");

const statusBadge =
    document.querySelector("#statusBadge");

const detailsOutput =
    document.querySelector("#detailsOutput");

const exampleBtn =
    document.querySelector("#exampleBtn");

const clearBtn =
    document.querySelector("#clearBtn");

const copyButtons =
    document.querySelectorAll(".copy-btn");

initialize();

function initialize() {
    bindEvents();
    loadTokenFromUrl();
}

function bindEvents() {
    jwtInput.addEventListener(
        "input",
        decodeToken
    );

    exampleBtn.addEventListener(
        "click",
        loadExampleToken
    );

    clearBtn.addEventListener(
        "click",
        clearDecoder
    );

    copyButtons.forEach(button => {
        button.addEventListener(
            "click",
            () => handleCopy(button)
        );
    });
}

function decodeToken() {
    const token = jwtInput.value.trim();

    if (!token) {
        resetOutputs();
        return;
    }

    try {
        const [header, payload] =
            token.split(".");

        const headerData =
            parseJwtPart(header);

        const payloadData =
            parseJwtPart(payload);

        renderHeader(headerData);
        renderPayload(payloadData);
        renderStatus(payloadData);
        renderDetails(headerData, payloadData);

        updateUrl(token);

    } catch {
        showError();
    }
}

function parseJwtPart(part) {
    const normalized =
        part.replace(/-/g, "+")
            .replace(/_/g, "/");

    return JSON.parse(atob(normalized));
}

function renderHeader(data) {
    headerOutput.textContent =
        JSON.stringify(data, null, 2);
}

function renderPayload(data) {
    payloadOutput.textContent =
        JSON.stringify(data, null, 2);
}

function renderStatus(payload) {

    if (!payload.exp) {
        statusBadge.textContent =
            "NO EXP";

        statusOutput.textContent =
            "Token has no expiration.";
        return;
    }

    const expiresAt =
        new Date(payload.exp * 1000);

    const expired =
        expiresAt < new Date();

    statusBadge.textContent =
        expired ? "EXPIRED" : "VALID";

    statusOutput.textContent =
        expired
            ? `Expired on ${expiresAt}`
            : `Valid until ${expiresAt}`;
}

function renderDetails(
    header,
    payload
) {

    const issuedAt =
        formatDate(payload.iat);

    const expiresAt =
        formatDate(payload.exp);

    detailsOutput.innerHTML = `
        <div class="details-grid">

            <div class="details-item">
                Algorithm: ${header.alg ?? "Unknown"}
            </div>

            <div class="details-item">
                Type: ${header.typ ?? "Unknown"}
            </div>

            <div class="details-item">
                Issued At: ${issuedAt}
            </div>

            <div class="details-item">
                Expires At: ${expiresAt}
            </div>

        </div>
    `;
}

function formatDate(value) {

    if (!value) {
        return "N/A";
    }

    return new Date(
        value * 1000
    ).toLocaleString();
}

async function handleCopy(button) {

    const target =
        document.getElementById(
            button.dataset.copy
        );

    await navigator.clipboard.writeText(
        target.textContent
    );

    const label =
        button.textContent;

    button.textContent =
        "Copied ✓";

    setTimeout(() => {
        button.textContent = label;
    }, 1500);
}

function loadExampleToken() {

    jwtInput.value =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiQ04gSW50ZXJhY3RpdmUgU3lzdGVtcyIsImlhdCI6MTcxNzIwMDAwMCwiZXhwIjoyMjAwMDAwMDAwfQ.signature";

    decodeToken();
}

function clearDecoder() {
    jwtInput.value = "";
    resetOutputs();
    history.replaceState(
        {},
        "",
        location.pathname
    );
}

function updateUrl(token) {

    const url =
        new URL(location.href);

    url.searchParams.set(
        "token",
        token
    );

    history.replaceState(
        {},
        "",
        url
    );
}

function loadTokenFromUrl() {

    const token =
        new URLSearchParams(
            location.search
        ).get("token");

    if (!token) {
        return;
    }

    jwtInput.value = token;
    decodeToken();
}

function resetOutputs() {

    headerOutput.textContent =
        "Waiting...";

    payloadOutput.textContent =
        "Waiting...";

    detailsOutput.textContent =
        "Waiting...";

    statusBadge.textContent =
        "WAITING";

    statusOutput.textContent =
        "No token loaded.";
}

function showError() {

    statusBadge.textContent =
        "INVALID";

    statusOutput.textContent =
        "Invalid JWT token.";
}
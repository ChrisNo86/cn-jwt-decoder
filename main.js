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

    const token =
        jwtInput.value.trim();

    if (!token) {
        resetOutputs();
        return;
    }

    try {

        const parts =
            token.split(".");

        if (parts.length < 2) {
            throw new Error();
        }

        const headerData =
            parseJwtPart(parts[0]);

        const payloadData =
            parseJwtPart(parts[1]);

        renderHeader(headerData);
        renderPayload(payloadData);
        renderStatus(payloadData);
        renderDetails(
            headerData,
            payloadData
        );

        updateUrl(token);

    } catch (error) {

        console.error(error);

        showError();

    }

}

function parseJwtPart(part) {

    let normalized =
        part.replace(/-/g, "+")
            .replace(/_/g, "/");

    while (normalized.length % 4) {
        normalized += "=";
    }

    const decoded =
        decodeURIComponent(
            Array
                .from(atob(normalized))
                .map(char =>
                    `%${char.charCodeAt(0)
                        .toString(16)
                        .padStart(2, "0")}`
                )
                .join("")
        );

    return JSON.parse(decoded);
}

function renderHeader(data) {

    headerOutput.innerHTML =
        createHighlightedJson(data);
}

function renderPayload(data) {

    payloadOutput.innerHTML =
        createHighlightedJson(data);
}

function createHighlightedJson(data) {

    const json =
        JSON.stringify(data, null, 2);

    return json
        .replace(
            /"([^"]+)":/g,
            '<span class="json-key">"$1"</span>:'
        )
        .replace(
            /: "([^"]*)"/g,
            ': <span class="json-string">"$1"</span>'
        )
        .replace(
            /: (\d+)/g,
            ': <span class="json-number">$1</span>'
        )
        .replace(/\n/g, "<br>")
        .replace(/ {2}/g, "&nbsp;&nbsp;");
}

function renderStatus(payload) {

    statusBadge.className =
        "status-badge";

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

    if (expired) {

        statusBadge.classList.add(
            "status-invalid"
        );

        statusBadge.textContent =
            "EXPIRED";

        statusOutput.textContent =
            `Expired on ${expiresAt.toLocaleString()}`;

        return;
    }

    statusBadge.classList.add(
        "status-valid"
    );

    statusBadge.textContent =
        "VALID";

    statusOutput.textContent =
        `Valid until ${expiresAt.toLocaleString()}`;
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
                <span>Algorithm</span>
                <strong>${header.alg ?? "Unknown"}</strong>
            </div>

            <div class="details-item">
                <span>Type</span>
                <strong>${header.typ ?? "Unknown"}</strong>
            </div>

            <div class="details-item">
                <span>Issued At</span>
                <strong>${issuedAt}</strong>
            </div>

            <div class="details-item">
                <span>Expires At</span>
                <strong>${expiresAt}</strong>
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

    try {

        await navigator.clipboard.writeText(
            target.textContent
        );

        const original =
            button.textContent;

        button.textContent =
            "Copied ✓";

        setTimeout(() => {

            button.textContent =
                original;

        }, 1500);

    } catch {

        button.textContent =
            "Failed";

    }
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

    jwtInput.value =
        token;

    decodeToken();
}

function resetOutputs() {

    headerOutput.textContent =
        "Waiting...";

    payloadOutput.textContent =
        "Waiting...";

    detailsOutput.textContent =
        "Waiting...";

    statusBadge.className =
        "status-badge";

    statusBadge.textContent =
        "WAITING";

    statusOutput.textContent =
        "No token loaded.";
}

function showError() {

    statusBadge.className =
        "status-badge status-invalid";

    statusBadge.textContent =
        "INVALID";

    statusOutput.textContent =
        "Invalid JWT token.";

    headerOutput.textContent =
        "Waiting...";

    payloadOutput.textContent =
        "Waiting...";

    detailsOutput.textContent =
        "Waiting...";
}
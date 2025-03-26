let currentUser = "Andrew Fuller";

function documentLoaded() {
    let buttons = document.querySelectorAll(".sidebar-button");

    buttons.forEach(button => {
        button.addEventListener("mousedown", handleMouseDown);
    });
}

function handleMouseDown(event) {
    event.preventDefault();

    let buttonId = event.target.id;
    let startX = event.clientX;
    let startY = event.clientY;
    let clone = createCloneElement(buttonId, startX, startY);

    if (!clone) return;

    let offsetX = 0, offsetY = 0;

    function onMouseMove(moveEvent) {
        moveClone(moveEvent, clone, offsetX, offsetY);
    }

    function onMouseUp(event) {
        const targetElement = event.target.closest(".e-pv-page-div");

        if (clone && targetElement) {
            addFormField(buttonId, clone);
        }

        if (clone) {
            document.body.removeChild(clone);
        }

        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
    }

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
}

// Creates a clone element based on the button type
function createCloneElement(buttonId, startX, startY) {
    let zoomFactor = 1;
    let clone = document.createElement("div");
    clone.style.position = "absolute"; // Ensuring absolute positioning

    let fieldSizes = {
        default: { width: 200, height: 24 },
        signature: { height: 66 },
        button: { height: 40 },
        checkbox: { width: 20, height: 20 },
        radio: { width: 20, height: 20, borderRadius: "50%" },
        listbox: { height: 66 }
    };

    let size = fieldSizes.default;
    if (buttonId.includes("signature")) size = fieldSizes.signature;
    else if (buttonId.includes("button")) size = fieldSizes.button;
    else if (buttonId.includes("checkbox")) size = fieldSizes.checkbox;
    else if (buttonId.includes("radio")) size = fieldSizes.radio;
    else if (buttonId.includes("listbox")) size = fieldSizes.listbox;

    clone.style.width = (size.width || 200) * zoomFactor + "px";
    clone.style.height = (size.height || 24) * zoomFactor + "px";
    if (size.borderRadius) clone.style.borderRadius = size.borderRadius;
    clone.classList.add("clone");

    clone.style.backgroundColor = currentUser === "Andrew Fuller" ? "#ffefef" : "#eff7ef";

    // Set initial position
    clone.style.left = `${startX}px`;
    clone.style.top = `${startY}px`;

    document.body.appendChild(clone);
    return clone;
}

// Moves the clone element as the user drags
function moveClone(event, clone, offsetX, offsetY) {
    clone.style.left = `${event.clientX - offsetX}px`;
    clone.style.top = `${event.clientY - offsetY}px`;
}

// Finalizes the position of the cloned element and sends it to Blazor
function addFormField(buttonId, clone) {
    const pdfPage = document.querySelector(".e-pv-page-div");

    if (pdfPage) {
        const pdfRect = pdfPage.getBoundingClientRect();
        const cloneRect = clone.getBoundingClientRect();

        const left = cloneRect.left - pdfRect.left;
        const top = cloneRect.top - pdfRect.top;

        const adjustedLeft = Math.max(0, left);
        const adjustedTop = Math.max(0, top);

        DotNet.invokeMethodAsync("E-SignApp", "AddFormField", buttonId, adjustedLeft, adjustedTop)
            .catch(error => console.error("Error calling Blazor method:", error));
    }
}

function updateCurrentUser(userName) {
    currentUser = userName;
}
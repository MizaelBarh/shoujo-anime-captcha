const CREWMATE_FILES = [
    "27 Remarkable INFP Anime Characters.png",
    "Jinshi.png",
    "anime_ himouto! umaru-chan.png",
    "crewmate.png",
    "crewmate2.png",
    "crewmate3.png",
    "crewmate4.png",
    "crewmate5.png",
    "download (1).png",
    "download (2).png",
    "download (3).png",
    "download.png",
    "— #アニメ _  Day 18 💭_What's your thoughts about her___ 🌻 Kaoruko Waguri • Kaoru Hana Wa Rin To Saku __#animeicons #animecaps #アニメ #anime #kaoruhanawarintosaku #kaorukowaguri #icons _#fyp #aesthetic.png",
    "☆.png",
    "𑂴⠀ ֺ  𝒟elιcat︪︩̱e ៶ maomao.png",
    "𝑩𝒐𝒂 𝑯𝒂𝒏𝒄𝒐𝒄𝒌.png",
    "𝒑𝒓𝒊𝒏𝒄𝒆𝒔𝒔 𝒎𝒐𝒏𝒐𝒏𝒐𝒌𝒆.png",
    "🌿✨Tarou (Miyo) icon🌿✨.png"
];

const IMPOSTER_FILES = [
    "1.png",
    "Anime Icon_⊰_⊹ฺ.png",
    "Follow me for more!.png",
    "Weibo_ 吸天地之猫气.png",
    "Xavier I, Love and Deepspace.png",
    "Zayne - Love and Deepspace.png",
    "cute pictures.png",
    "download (1).png",
    "download (2).png",
    "download.png",
    "imposter1.png",
    "imposter2.png",
    "imposter3.png",
    "imposter4.png",
    "sylus grumpy crow! 🍷.png",
    "★.png",
    "𝐋𝐨𝐯𝐞 𝐀𝐧𝐝 𝐃𝐞𝐞𝐩𝐬𝐩𝐚𝐜𝐞_.png",
    "🌨️.png"
];

let selectedIds = [];
let status = "idle";
let images = [];
let timeLeft = 30;
let timerInterval = null;

const imageGrid = document.getElementById("image-grid");
const timerText = document.getElementById("timer-text");
const timerBox = document.getElementById("timer-box");
const verifyBtn = document.getElementById("verify-btn");
const failureOverlay = document.getElementById("failure-overlay");
const successModal = document.getElementById("success-modal");
const failureModal = document.getElementById("failure-modal");
const continueBtn = document.getElementById("continue-btn");
const tryAgainBtn = document.getElementById("try-again-btn");

function getRandomItems(array, count) {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

function generateLevel() {
    const selectedCrewmates = getRandomItems(CREWMATE_FILES, 5).map((file, index) => ({
        id: `c-${index}-${Date.now()}`,
        url: `crewmate/${file}`, // Browser handles partial encoding but explicit verify is good
        isCorrect: true
    }));

    const selectedImposters = getRandomItems(IMPOSTER_FILES, 4).map((file, index) => ({
        id: `i-${index}-${Date.now()}`,
        url: `imposter/${file}`,
        isCorrect: false
    }));

    const allImages = [...selectedCrewmates, ...selectedImposters];
    return allImages.sort(() => Math.random() - 0.5);
}

function initGame() {
    images = generateLevel();
    renderGrid();
}

function renderGrid() {
    imageGrid.innerHTML = "";
    images.forEach(img => {
        const div = document.createElement("div");
        div.className = `grid-item ${selectedIds.includes(img.id) ? "selected" : ""}`;
        div.onclick = () => toggleSelect(img.id);

        const image = document.createElement("img");
        // Encode URI component to handle special characters and spaces
        const pathParts = img.url.split('/');
        image.src = `${pathParts[0]}/${encodeURIComponent(pathParts[1])}`;
        image.alt = "captcha";

        const overlay = document.createElement("div");
        overlay.className = "check-overlay";
        overlay.innerHTML = '<div class="check-badge"><i data-lucide="check"></i></div>';

        div.appendChild(image);
        div.appendChild(overlay);
        imageGrid.appendChild(div);
    });
    lucide.createIcons();
}

function toggleSelect(id) {
    if (status !== "idle") return;
    if (selectedIds.includes(id)) {
        selectedIds = selectedIds.filter(i => i !== id);
    } else {
        selectedIds.push(id);
    }
    renderGrid();
}

function startTimer() {
    clearInterval(timerInterval);
    timeLeft = 30;
    updateTimerUI();
    timerInterval = setInterval(() => {
        timeLeft--;
        updateTimerUI();
        if (timeLeft <= 0) {
            handleFailure();
        }
    }, 1000);
}

const formCard = document.getElementById("form-card");
const captchaCard = document.getElementById("captcha-card");
const formSubmitBtn = document.getElementById("form-submit-btn");

function updateTimerUI() {
    timerText.textContent = `${timeLeft}s`;
    if (timeLeft <= 3) {
        timerBox.classList.add("warning");
    } else {
        timerBox.classList.remove("warning");
    }
}

function handleVerify() {
    if (status !== "idle") return;
    clearInterval(timerInterval);

    const correctIds = images.filter(img => img.isCorrect).map(img => img.id);
    // Ensure we have correct IDs to check against. If 0 correct images, logic holds (selected must be 0)
    // but in this game there are always some Correct images.
    const isSuccess = selectedIds.length === correctIds.length &&
        selectedIds.every(id => correctIds.includes(id));

    if (isSuccess) {
        handleSuccess();
    } else {
        handleFailure();
    }
}

function handleSuccess() {
    status = "success";
    successModal.classList.remove("hidden");
    confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#A855F7", "#EC4899", "#8B5CF6"],
    });
}

function handleFailure() {
    status = "failure";
    clearInterval(timerInterval);
    failureOverlay.classList.add("active");
    failureModal.classList.remove("hidden");
    verifyBtn.disabled = true;
}

function resetCaptcha() {
    selectedIds = [];
    status = "idle";
    failureOverlay.classList.remove("active");
    successModal.classList.add("hidden");
    failureModal.classList.add("hidden");
    verifyBtn.disabled = false;

    // If resetting from success/failure, do we go back to form?
    // User flow: Form -> Captcha -> Success. 
    // "Try Again" implies retrying captcha.
    // "Continue" -> Reset to Form? Or just close modal?
    // Let's assume reset means retry captcha.
    initGame();
    startTimer();
}

function showCaptcha() {
    // Validate form? (simple check)
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;

    if (!name || !email) {
        alert("Please fill in all fields!");
        return;
    }

    formCard.classList.add("hidden");
    captchaCard.classList.remove("hidden");

    // Start the game now
    initGame();
    startTimer();
}

verifyBtn.onclick = handleVerify;
tryAgainBtn.onclick = resetCaptcha;

// Continue button should probably go somewhere else or reset the whole flow
continueBtn.onclick = () => {
    // Reset to form
    successModal.classList.add("hidden");
    captchaCard.classList.add("hidden");
    formCard.classList.remove("hidden");
    // Clear form? 
    document.getElementById("name").value = "";
    document.getElementById("email").value = "";
};

formSubmitBtn.onclick = showCaptcha;

// Initial state: Form is visible, Game is NOT running
// Don't start timer yet.
// initGame(); // Pre-load? No, load on show.


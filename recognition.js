var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition
var SpeechRecognitionEvent = SpeechRecognitionEvent || webkitSpeechRecognitionEvent


var recognition = new SpeechRecognition();
recognition.continuous = true;
recognition.lang = 'en-US'; //no-NO
recognition.start();

var diagnostic = document.querySelector('.output');

recognition.onresult = function (event) {
    var text = event.results[event.results.length - 1][0].transcript;
    diagnostic.textContent = text;
    console.log('Confidence: ' + event.results[0][0].confidence);
    speak();
}


recognition.onend = function () {
    console.log("recognitoon ended")
    setTimeout(() => {
        recognition.start();
    }, 1000);
}

recognition.onnomatch = function (event) {
    diagnostic.textContent = "I didn't recognise that color.";
}

recognition.onerror = function (event) {
    console.log(event);
    diagnostic.textContent = 'Error occurred in recognition: ' + event.error;
}

const synth = window.speechSynthesis;
const voiceSelect = document.querySelector("select");

let voices = [];
function populateVoiceList() {
    voices = synth.getVoices();
    const selectedIndex =
        voiceSelect.selectedIndex < 0 ? 0 : voiceSelect.selectedIndex;
    voiceSelect.innerHTML = "";

    for (let i = 0; i < voices.length; i++) {
        const option = document.createElement("option");
        option.textContent = `${voices[i].name} (${voices[i].lang})`;
        option.setAttribute("data-lang", voices[i].lang);
        option.setAttribute("data-name", voices[i].name);
        voiceSelect.appendChild(option);
    }
    voiceSelect.selectedIndex = selectedIndex;
}

populateVoiceList();
if (speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = populateVoiceList;
}

function speak() {
    if (synth.speaking) {
        console.error("speechSynthesis.speaking");
        return;
    }

    if (diagnostic.textContent !== "") {
        const utterThis = new SpeechSynthesisUtterance(diagnostic.textContent);

        utterThis.onend = function (event) {
            console.log("SpeechSynthesisUtterance.onend");
        };

        utterThis.onerror = function (event) {
            debugger;
            console.error("SpeechSynthesisUtterance.onerror");
        };

        const selectedOption =
            voiceSelect.selectedOptions[0].getAttribute("data-name");

        for (let i = 0; i < voices.length; i++) {
            if (voices[i].name === selectedOption) {
                utterThis.voice = voices[i];
                break;
            }
        }
        recognition.stop();
        synth.speak(utterThis);
    }
}

voiceSelect.onchange = function () {
    speak();
};
const inputEcriture = document.getElementById("inputEcriture");
const btnValiderMot = document.getElementById("btnValiderMot");
const zoneProposition = document.querySelector(".zoneProposition");
const zoneScore = document.querySelector(".zoneScore span");
const optionSource = document.querySelectorAll(".optionSource");

async function demarrer() {
    const source = await chargerPropositions();
    afficherNoteSource(source);
    lancerJeu();
    document.getElementById("btnStart").disabled = false;
}

demarrer();
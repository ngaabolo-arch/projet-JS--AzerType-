const DUREE_MOT = 3;      // secondes par mot
const DUREE_PHRASE = 5;   // secondes par phrase

//affichage du resultat obtenu
function afficherResultat(score, nbProposition, zoneScore){
    zoneScore.textContent = score + "/" + nbProposition;
}

function afficherProposition(proposition) {
    let zoneProposition = document.querySelector (".zoneProposition");
    zoneProposition.innerText = proposition;
}

function afficherFin(score, total, trouves, rates) {
    document.getElementById("finScore").textContent = score + "/" + total;

    // message selon la moyenne (la moitié du total)
    const message = document.getElementById("messageFin");
    if (score < total / 2) {
        message.textContent = "Ton niveau n'est vraiment pas bon";
    } else {
        message.textContent = "You can do better";
    }

    const ulTrouves = document.getElementById("listeTrouves");
    const ulRates = document.getElementById("listeRates");
    ulTrouves.textContent = "";
    ulRates.textContent = "";

    trouves.forEach((mot) => {
        const li = document.createElement("li");
        li.textContent = mot;
        ulTrouves.appendChild(li);
    });

    rates.forEach((erreur) => {
        const li = document.createElement("li");
        const saisi = erreur.saisi === "" ? "(rien)" : erreur.saisi;
        li.textContent = "Tapé : « " + saisi + " » → Correct : « " + erreur.attendu + " »";
        ulRates.appendChild(li);
    });

    document.getElementById("popupFin").classList.remove("cache");
}

function lancerJeu() {
    let score = 0;
    let i = 0;
    let trouves = [];
    let rates = [];
    let minuteur = null;
    let tempsRestant = 0;

    const btnValiderMot = document.getElementById("btnValiderMot");
    const inputEcriture = document.getElementById("inputEcriture");
    const zoneScore = document.querySelector(".zoneScore span");

    const mots = document.getElementById("mots");
    const phrases = document.getElementById("phrases");

    const popupFin = document.getElementById("popupFin");
    const popupDebut = document.getElementById("popupDebut");

    const zoneChrono = document.querySelector(".zoneChrono");
    const spanTemps = document.getElementById("tempsRestant");

    let listeDeProposition = listeMot;

    function dureeActuelle() {
        return listeDeProposition === listePhrase ? DUREE_PHRASE : DUREE_MOT;
    }

    function afficherTemps() {
        spanTemps.textContent = tempsRestant;
        zoneChrono.classList.toggle("urgent", tempsRestant <= 1);
    }

    function arreterChrono() {
        clearInterval(minuteur);
        minuteur = null;
    }

    function demarrerChrono() {
        arreterChrono();
        tempsRestant = dureeActuelle();
        afficherTemps();

        minuteur = setInterval(() => {
            tempsRestant--;
            afficherTemps();
            if (tempsRestant <= 0) {
                valider(); // temps écoulé : on valide ce qui est saisi
            }
        }, 1000);
    }

    function reinitialiser(nouvelleListe) {
        listeDeProposition = nouvelleListe;
        score = 0;
        i = 0;
        trouves = [];
        rates = [];
        inputEcriture.value = "";
        btnValiderMot.disabled = false;
        afficherResultat(score, listeDeProposition.length, zoneScore);
        afficherProposition(listeDeProposition[i]);
        demarrerChrono();
        inputEcriture.focus();
    }

    function valider() {
        const attendu = listeDeProposition[i];
        const saisi = inputEcriture.value;

        if (saisi === attendu) {
            score++;
            trouves.push(attendu);
        } else {
            rates.push({ saisi: saisi, attendu: attendu });
        }

        i++;
        inputEcriture.value = "";
        afficherResultat(score, listeDeProposition.length, zoneScore);

        if (listeDeProposition[i] === undefined) {
            arreterChrono();
            afficherProposition("Le jeu est fini");
            btnValiderMot.disabled = true;
            afficherFin(score, listeDeProposition.length, trouves, rates);
        } else {
            afficherProposition(listeDeProposition[i]);
            demarrerChrono();
            inputEcriture.focus();
        }
    }

    // Au chargement : on prépare l'écran mais le jeu n'est pas lancé
    reinitialiser(listeMot);
    arreterChrono();

    mots.addEventListener("change", () => reinitialiser(listeMot));
    phrases.addEventListener("change", () => reinitialiser(listePhrase));

    btnValiderMot.addEventListener("click", valider);

    // Fenêtre de début : YES, start lance la partie
    document.getElementById("btnStart").addEventListener("click", () => {
        popupDebut.classList.add("cache");
        reinitialiser(listeDeProposition);
    });

    document.getElementById("btnPartir").addEventListener("click", () => {
        window.location.href = "about:blank";
    });

    // Fenêtre de fin
    document.getElementById("btnRecommencer").addEventListener("click", () => {
        popupFin.classList.add("cache");
        reinitialiser(listeDeProposition);
    });

    document.getElementById("btnSortir").addEventListener("click", () => {
        popupFin.classList.add("cache");
        popupDebut.classList.remove("cache");
    });
}
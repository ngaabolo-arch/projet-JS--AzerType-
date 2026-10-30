const DUREE_MOT = 3;      // secondes par mot
const DUREE_PHRASE = 5;   // secondes par phrase

let sourceDonnees = "local"; // "serveur" ou "local"

// Charge les mots et phrases depuis l'API ; renvoie "serveur" ou "local"
async function chargerPropositions() {
    const controleur = new AbortController();
    const minuteur = setTimeout(() => controleur.abort(), 5000);

    try {
        const reponse = await fetch(URL_API, {
            signal: controleur.signal,
            cache: "no-store"
        });
        if (!reponse.ok) throw new Error("Réponse invalide");

        const donnees = await reponse.json();
        const motsOk = Array.isArray(donnees.mots) && donnees.mots.length > 0;
        const phrasesOk = Array.isArray(donnees.phrases) && donnees.phrases.length > 0;
        if (!motsOk || !phrasesOk) throw new Error("Données vides");

        listeMot = donnees.mots;
        listePhrase = donnees.phrases;
        sourceDonnees = "serveur";
        return "serveur";
    } catch (erreur) {
        // on garde les listes de config.js
        sourceDonnees = "local";
        return "local";
    } finally {
        clearTimeout(minuteur);
    }
}

function afficherNoteSource(source) {
    document.querySelectorAll(".noteSource").forEach((note) => {
        if (note.id === "messageEnregistrement") return;
        if (source === "serveur") {
            note.textContent = "Mots et phrases récupérés depuis le serveur.";
            note.className = "noteSource ok";
        } else {
            note.textContent = "Serveur indisponible : mots et phrases chargés depuis le fichier local.";
            note.className = "noteSource secours";
        }
    });
}

// Envoie le score au serveur (lève une erreur en cas d'échec)
async function enregistrerScore(pseudo, score, total, mode) {
    const donnees = new URLSearchParams({
        pseudo: pseudo,
        score: score,
        total: total,
        mode: mode
    });
    const reponse = await fetch(URL_ENREGISTRER, {
        method: "POST",
        body: donnees
    });
    if (!reponse.ok) throw new Error("Enregistrement refusé");
}

// Affiche le Top 10 du mode donné
async function chargerClassement(mode) {
    const ul = document.getElementById("listeClassement");
    ul.textContent = "";

    try {
        const reponse = await fetch(URL_CLASSEMENT + "?mode=" + mode, {
            cache: "no-store"
        });
        if (!reponse.ok) throw new Error("Réponse invalide");
        const lignes = await reponse.json();

        if (lignes.length === 0) {
            const li = document.createElement("li");
            li.textContent = "Aucun score pour l'instant";
            ul.appendChild(li);
            return;
        }

        lignes.forEach((ligne, index) => {
            const li = document.createElement("li");
            li.textContent = (index + 1) + ". " + ligne.pseudo + " — " + ligne.score + "/" + ligne.total;
            ul.appendChild(li);
        });
    } catch (erreur) {
        const li = document.createElement("li");
        li.textContent = "Classement indisponible";
        ul.appendChild(li);
    }
}

//affichage du resultat obtenu
function afficherResultat(score, nbProposition, zoneScore){
    zoneScore.textContent = score + "/" + nbProposition;
}

function afficherProposition(proposition) {
    let zoneProposition = document.querySelector (".zoneProposition");
    zoneProposition.innerText = proposition;
}

function afficherFin(score, total, trouves, rates, mode) {
    document.getElementById("finScore").textContent = score + "/" + total;

    // message selon la moyenne (la moitié du total)
    const message = document.getElementById("messageFin");
    if (score < total / 2) {
        message.textContent = "Ton niveau n'est vraiment pas bon";
    } else {
        message.textContent = "You can do better";
    }

    // zone pseudo + classement : seulement si le serveur est disponible
    const zoneEnregistrement = document.getElementById("zoneEnregistrement");
    const zoneClassement = document.getElementById("zoneClassement");
    const messageEnregistrement = document.getElementById("messageEnregistrement");

    document.getElementById("inputPseudo").value = "";
    document.getElementById("btnEnregistrer").disabled = false;

    if (sourceDonnees === "serveur") {
        zoneEnregistrement.classList.remove("cache");
        zoneClassement.classList.remove("cache");
        messageEnregistrement.textContent = "";
        messageEnregistrement.className = "noteSource";
        chargerClassement(mode);
    } else {
        zoneEnregistrement.classList.add("cache");
        zoneClassement.classList.add("cache");
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

    const inputPseudo = document.getElementById("inputPseudo");
    const btnEnregistrer = document.getElementById("btnEnregistrer");
    const messageEnregistrement = document.getElementById("messageEnregistrement");

    let listeDeProposition = listeMot;

    function modeActuel() {
        return listeDeProposition === listePhrase ? "phrase" : "mot";
    }

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
            afficherFin(score, listeDeProposition.length, trouves, rates, modeActuel());
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
    btnEnregistrer.addEventListener("click", async () => {
        const pseudo = inputPseudo.value.trim();

        if (pseudo === "" || pseudo.length > 20) {
            messageEnregistrement.textContent = "Entre un pseudo de 1 à 20 caractères.";
            messageEnregistrement.className = "noteSource secours";
            return;
        }

        btnEnregistrer.disabled = true; // évite d'enregistrer deux fois
        try {
            await enregistrerScore(pseudo, score, listeDeProposition.length, modeActuel());
            messageEnregistrement.textContent = "Score enregistré !";
            messageEnregistrement.className = "noteSource ok";
            await chargerClassement(modeActuel());
        } catch (erreur) {
            messageEnregistrement.textContent = "Échec de l'enregistrement. Réessaie.";
            messageEnregistrement.className = "noteSource secours";
            btnEnregistrer.disabled = false;
        }
    });

    document.getElementById("btnRecommencer").addEventListener("click", () => {
        popupFin.classList.add("cache");
        reinitialiser(listeDeProposition);
    });

    document.getElementById("btnSortir").addEventListener("click", () => {
        popupFin.classList.add("cache");
        popupDebut.classList.remove("cache");
    });
}
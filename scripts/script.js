//function for the choice of a word or a phrase by the user
/* function ChoixDuMot(){
    let choix = "";
    while (choix !== "mot" && choix !== "phrase"){
    console.log("Je suis dans le while");
    choix = prompt ("Dis, tu veux <mot> ou <phrase>: ");
    console.log("Tu as saisi :", choix);
    }

    return choix;

}
*/

//function containing what happens ones the user choosed the word/phrase
/* function lancerBoucleJeu( listeDeProposition){
    let score =0;
    for ( let i=0; i<listeDeProposition.length; i++){

        let mottape = prompt ("entrez le mot: " + listeDeProposition[i]);

        if (mottape === listeDeProposition[i]){
            console.log("Bravo")
            score ++;
        }else{
            console.log ("t'es null");
        } 
    }
    
return score;
}
*/

//affichage du resultat obtenu
function afficherResultat(score, nbProposition, zoneScore){
    zoneScore.textContent = score + "/" + nbProposition;
}

function afficherProposition(proposition) {
    let zoneProposition = document.querySelector (".zoneProposition");
    zoneProposition.innerText = proposition;
}

function lancerJeu() {
    let score = 0;
    let i = 0;

    const btnValiderMot = document.getElementById("btnValiderMot");
    const inputEcriture = document.getElementById("inputEcriture");
    const zoneScore = document.querySelector(".zoneScore span");

    const mots = document.getElementById("mots");
    const phrases = document.getElementById("phrases");

    let listeDeProposition = listeMot;

    afficherProposition(listeDeProposition[i]);

    mots.addEventListener("change", () => {
        listeDeProposition = listeMot;
        i = 0;
        afficherProposition(listeDeProposition[i]);
        btnValiderMot.disabled = false;
    });

    phrases.addEventListener("change", () => {
        listeDeProposition = listePhrase;
        i = 0;
        afficherProposition(listeDeProposition[i]);
        btnValiderMot.disabled = false;
    });

    btnValiderMot.addEventListener("click", () => {

        if (inputEcriture.value === listeDeProposition[i]) {
            score++;
        }

        i++;

        inputEcriture.value = "";

        if (listeDeProposition[i] === undefined) {
            afficherProposition("Le jeu est fini");
            btnValiderMot.disabled = true;
        } else {
            afficherProposition(listeDeProposition[i]);
        }

        afficherResultat(score, listeDeProposition.length, zoneScore);
    });
}

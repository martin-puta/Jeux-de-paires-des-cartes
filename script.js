document.addEventListener('DOMContentLoaded', () => {
    const gameBoard = document.getElementById('game-board');
    const statusMessage = document.getElementById('status-message');
    const player1ScoreEl = document.getElementById('player1-score');
    const player2ScoreEl = document.getElementById('player2-score');
    const restartButton = document.getElementById('restart-button');
    const fireworksContainer = document.getElementById('fireworks-container');
    const timerDisplay = document.getElementById('timer-display');

    
    const modeSelector = document.getElementById('mode-selector');
    const modeSoloButton = document.getElementById('mode-solo');
    const modeDuoButton = document.getElementById('mode-duo');

    const cardSymbols = ['🧠', '🚀', '💡', '🤖', '💻', '⭐', '🔥', '🌍'];
    const cards = [...cardSymbols, ...cardSymbols];
    
    // État du jeu
    let score = { 1: 0, 2: 0 };
    let currentPlayer = 1; 
    let cardsFlipped = []; 
    let lockBoard = false;
    let gameMode = null; 
    let timerInterval = null;
    let seconds = 0;

    
    function launchFireworks() {
        const numFireworks = 15;
        fireworksContainer.innerHTML = ''; 

        for (let i = 0; i < numFireworks; i++) {
            const firework = document.createElement('div');
            firework.classList.add('firework');
            
            const left = Math.random() * 100;
            const duration = 1.2 + Math.random() * 0.8;
            const delay = Math.random() * 0.5;

            firework.style.left = `${left}vw`;
            firework.style.animationDuration = `${duration}s`;
            firework.style.animationDelay = `${delay}s`;
            
            const colors = ['#FF4500', '#FFFF00', '#00BFFF', '#FF1493'];
            const randomColor = colors[Math.floor(Math.random() * colors.length)];
            firework.style.background = `radial-gradient(circle, #fff, ${randomColor})`;
            
            fireworksContainer.appendChild(firework);
        }
        
        setTimeout(() => {
            fireworksContainer.innerHTML = '';
        }, 2500);
    }

    /**
     * Mélange le tableau d'éléments (Algorithme Fisher-Yates).
     */
    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    function setStatusMessage(message) {
        statusMessage.textContent = message;
    }


    function startTimer() {
        clearInterval(timerInterval);
        seconds = 0;
        timerInterval = setInterval(() => {
            seconds++;
            timerDisplay.textContent = `Temps: ${seconds}s`;
        }, 1000);
    }

    function stopTimer() {
        clearInterval(timerInterval);
    }

    
    function initializeGame() {
        shuffle(cards);
        gameBoard.innerHTML = '';
        score = { 1: 0, 2: 0 };
        currentPlayer = 1;
        cardsFlipped = [];
        lockBoard = false;
        
        if (gameMode === 'solo') {
            player2ScoreEl.classList.add('hidden');
            player1ScoreEl.textContent = `Paires trouvées: 0`;
            timerDisplay.classList.remove('hidden');
            setStatusMessage(`Trouvez les paires le plus vite possible !`);
            startTimer();
        } else { // mode 'duo'
            player2ScoreEl.classList.remove('hidden');
            player1ScoreEl.textContent = `Joueur 1: 0`;
            player2ScoreEl.textContent = `Joueur 2: 0`;
            timerDisplay.classList.add('hidden');
            setStatusMessage(`C'est le tour du Joueur ${currentPlayer}.`);
            stopTimer();
        }
        
        updateScoreDisplay();
        launchFireworks();

        cards.forEach((symbol, index) => {
            const card = document.createElement('div');
            card.classList.add('card', 'card-face-down');
            card.dataset.symbol = symbol;
            card.dataset.index = index;
            card.textContent = '❓'; 
            card.addEventListener('click', flipCard);
            gameBoard.appendChild(card);
        });
    }
    
    function updateScoreDisplay() {
        if (gameMode === 'solo') {
            player1ScoreEl.textContent = `Paires trouvées: ${score[1]}`;
        } else { // 'duo'
            player1ScoreEl.textContent = `Joueur 1: ${score[1]}`;
            player2ScoreEl.textContent = `Joueur 2: ${score[2]}`;

            player1ScoreEl.classList.toggle('active', currentPlayer === 1);
            player2ScoreEl.classList.toggle('active', currentPlayer === 2);
        }
    }

    /**
     * Gère le clic sur une carte.
     */
    function flipCard() {
        if (lockBoard || this.classList.contains('matched') || cardsFlipped.includes(this)) {
            return;
        }

        this.classList.remove('card-face-down');
        this.classList.add('card-face-up');
        this.textContent = this.dataset.symbol;
        cardsFlipped.push(this);

        if (cardsFlipped.length === 2) {
            lockBoard = true;
            checkForMatch();
        }
    }

    /**
     * Vérifie si les deux cartes retournées forment une paire.
     */
    function checkForMatch() {
        const [card1, card2] = cardsFlipped;
        const isMatch = card1.dataset.symbol === card2.dataset.symbol;

        if (isMatch) {
            handleMatch(card1, card2);
        } else {
            handleMismatch(card1, card2);
        }
    }

    /**
     * Gère le cas où une paire est trouvée.
     */
    function handleMatch(card1, card2) {
      
        let playerForScore = (gameMode === 'solo') ? 1 : currentPlayer;

        setStatusMessage(`🎉 Paire trouvée ! Rejouez.`);
        if (gameMode === 'duo') {
            setStatusMessage(`🎉 Paire trouvée par Joueur ${currentPlayer} ! Rejouez.`);
        }
        
        score[playerForScore]++;
        card1.classList.add('matched');
        card2.classList.add('matched');
        card1.removeEventListener('click', flipCard);
        card2.removeEventListener('click', flipCard);
        
        cardsFlipped = [];
        lockBoard = false;
        
        updateScoreDisplay();
        checkGameOver();
    }

    /**
     * Gère le cas où les cartes ne correspondent pas.
     */
    function handleMismatch(card1, card2) {
        if (gameMode === 'duo') {
            setStatusMessage(`❌ Pas de paire. Tour au Joueur ${3 - currentPlayer}.`);
        } else { // mode 'solo'
            setStatusMessage(`❌ Pas de paire.`);
        }
        
        setTimeout(() => {
            card1.classList.remove('card-face-up');
            card1.classList.add('card-face-down');
            card1.textContent = '❓';

            card2.classList.remove('card-face-up');
            card2.classList.add('card-face-down');
            card2.textContent = '❓';

            // Change de joueur UNIQUEMENT en mode DUO
            if (gameMode === 'duo') {
                currentPlayer = 3 - currentPlayer;
                setStatusMessage(`C'est le tour du Joueur ${currentPlayer}.`);
            }

            updateScoreDisplay();
            cardsFlipped = [];
            lockBoard = false;
        }, 1500);
    }

    function checkGameOver() {
        const matchedCards = document.querySelectorAll('.matched').length;
        if (matchedCards === cards.length) {
            lockBoard = true;
            stopTimer(); // Arrête le temps quel que soit le mode
            
            let message;
            if (gameMode === 'solo') {
                message = `Incroyable ! Vous avez fini en ${seconds} secondes !`;
            } else { // 'duo'
                if (score[1] > score[2]) {
                    message = `🏆 Joueur 1 GAGNE avec ${score[1]} paires !`;
                } else if (score[2] > score[1]) {
                    message = `🏆 Joueur 2 GAGNE avec ${score[2]} paires !`;
                } else {
                    message = "Égalité ! Quel match serré !";
                }
            }
            setStatusMessage(`🥳 FIN DU JEU ! ${message}`);
            
            launchFireworks(); 
        }
    }

    

    function setGameMode(mode) {
        gameMode = mode;
        modeSelector.classList.add('hidden');
        initializeGame();
    }

    modeSoloButton.addEventListener('click', () => setGameMode('solo'));
    modeDuoButton.addEventListener('click', () => setGameMode('duo'));
    
    
    restartButton.addEventListener('click', () => {
       
        if (gameMode === 'solo') {
            initializeGame();
        } else {
            stopTimer();
            modeSelector.classList.remove('hidden');
            gameMode = null;
        }
    });

    modeSelector.classList.remove('hidden');
});
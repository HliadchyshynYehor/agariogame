(function () {
    const statusEl = document.getElementById('status');
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    const gameOverScreen = document.getElementById('gameOverScreen');
    const restartButton = document.getElementById('restartButton');
    const startScreen = document.getElementById('startScreen');
    const startButton = document.getElementById('startButton');
    const usernameInput = document.getElementById('usernameInput');
    const colorInput = document.getElementById('colorInput');
    const menuError = document.getElementById('menuError');
    const playerNameEl = document.getElementById('playerName');
    const leaderboardList = document.getElementById('leaderboardList');

    let players = [];
    let foods = [];

    let myId = null;
    let myUsername = null;
    let myColor = '#4CC9F0';

    let camX = 0;
    let camY = 0;

    let playerWs = null;
    let foodWs = null;

    const MOVE_SPEED = 15;
    let connected = false;

    let lastSavedSize = 10;

    const input = {
        xAxis: 0,
        yAxis: 0
    };

    const keys = new Set();

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    window.addEventListener('resize', resize);
    resize();

    async function registerUser(username) {
        const response = await fetch('/api/users/register?username=' + encodeURIComponent(username), {
            method: 'POST'
        });

        if (!response.ok) {
            throw new Error('Registration failed');
        }

        return await response.json();
    }

    async function saveScore(size) {
        if (!myUsername) {
            return;
        }

        try {
            await fetch(
                '/api/users/score?username=' +
                encodeURIComponent(myUsername) +
                '&size=' +
                encodeURIComponent(size),
                {
                    method: 'POST'
                }
            );
        } catch (e) {
            console.error('Score save failed', e);
        }
    }

    async function loadLeaderboard() {
        try {
            const response = await fetch('/api/users/leaderboard');

            if (!response.ok) {
                return;
            }

            const users = await response.json();

            leaderboardList.innerHTML = '';

            users.forEach(user => {
                const li = document.createElement('li');
                li.textContent = user.username + ' - ' + user.maxSize;
                leaderboardList.appendChild(li);
            });
        } catch (e) {
            console.error('Leaderboard load failed', e);
        }
    }

    async function toText(data) {
        if (data instanceof Blob) {
            return await data.text();
        }

        return String(data);
    }

    function startGameSockets() {
        const protocol = location.protocol === 'https:' ? 'wss' : 'ws';
        const playerWsUrl = protocol + '://' + location.host + '/player';
        const foodWsUrl = protocol + '://' + location.host + '/food';

        playerWs = new WebSocket(playerWsUrl);
        foodWs = new WebSocket(foodWsUrl);

        playerWs.binaryType = 'blob';
        foodWs.binaryType = 'blob';

        playerWs.addEventListener('open', () => {
            connected = true;
            statusEl.textContent = 'Connected';

            playerWs.send(JSON.stringify({
                type: 'init',
                username: myUsername,
                color: myColor
            }));
        });

        playerWs.addEventListener('close', () => {
            connected = false;
            statusEl.textContent = 'Disconnected';
        });

        playerWs.addEventListener('error', (e) => {
            statusEl.textContent = 'Error';
            console.error('Player WebSocket error', e);
        });

        playerWs.addEventListener('message', async (ev) => {
            const text = await toText(ev.data);
            if (text === 'gameOver') {
                connected = false;
                statusEl.textContent = 'Game Over';
                gameOverScreen.style.display = 'flex';

                if (playerWs) {
                    playerWs.close();
                }

                if (foodWs) {
                    foodWs.close();
                }

                return;
            }

            if (text.startsWith('self:')) {
                myId = text.slice('self:'.length);
                return;
            }

            try {
                const arr = JSON.parse(text);

                if (Array.isArray(arr)) {
                    players = arr.map(p => {
                        const existing = players.find(pl => pl.id === p.id);

                        if (existing) {
                            existing.targetX = p.x ?? existing.targetX;
                            existing.targetY = p.y ?? existing.targetY;
                            existing.targetRadius = p.radius ?? existing.targetRadius;
                            existing.name = p.name ?? existing.name;
                            existing.color = p.color ?? existing.color;

                            existing.x = p.x ?? existing.x;
                            existing.y = p.y ?? existing.y;
                            existing.radius = p.radius ?? existing.radius;

                            return existing;
                        }

                        const startX = p.x ?? 0;
                        const startY = p.y ?? 0;
                        const startRadius = p.radius ?? 10;

                        return {
                            ...p,
                            x: startX,
                            y: startY,
                            radius: startRadius,
                            targetX: startX,
                            targetY: startY,
                            targetRadius: startRadius,
                            displayX: startX,
                            displayY: startY,
                            displayRadius: startRadius,
                            color: p.color ?? '#4CC9F0'
                        };
                    });

                    const me = players.find(p => p.id === myId);

                    if (me) {
                        document.getElementById('size').textContent = me.radius;

                        if (me.radius > lastSavedSize) {
                            lastSavedSize = me.radius;
                            saveScore(me.radius);
                        }
                    }

                    return;
                }
            } catch (err) {
            }

            if (text.startsWith('playerUpdate:')) {
                const parts = text.split(':');

                if (parts.length >= 3) {
                    const id = parts[1];
                    const radius = parseInt(parts[2], 10);

                    if (id === myId && !Number.isNaN(radius)) {
                        document.getElementById('size').textContent = radius;

                        if (radius > lastSavedSize) {
                            lastSavedSize = radius;
                            saveScore(radius);
                        }

                        const me = players.find(p => p.id === myId);
                        if (me) {
                            me.targetRadius = radius;
                            me.radius = radius;
                        }
                    }
                }
            }
        });

        foodWs.addEventListener('open', () => {
            console.log('Food socket open');

            try {
                foodWs.send('get');
            } catch (e) {
            }
        });

        foodWs.addEventListener('close', () => {
            console.log('Food socket closed');
        });

        foodWs.addEventListener('error', (e) => {
            console.error('Food WebSocket error', e);
        });

        foodWs.addEventListener('message', async (ev) => {
            const text = await toText(ev.data);

            try {
                const parsed = JSON.parse(text);

                if (Array.isArray(parsed)) {
                    foods = parsed.map(f => ({
                        x: f.x ?? 0,
                        y: f.y ?? 0,
                        size: f.size ?? 5
                    }));
                }
            } catch (e) {
                console.error('Food parse failed', e);
            }
        });
    }

    startButton.addEventListener('click', async () => {
        const username = usernameInput.value.trim();


        if (username.length < 2) {
            menuError.textContent = 'Nickname must have at least 2 characters';
            return;
        }

        try {
            await registerUser(username);

            myUsername = username;
            myColor = colorInput.value;
            lastSavedSize = 10;

            playerNameEl.textContent = myUsername;
            startScreen.style.display = 'none';

            startGameSockets();
            loadLeaderboard();
        } catch (e) {
            menuError.textContent = 'Could not register player';
            console.error(e);
        }
    });

    restartButton.addEventListener('click', () => {
        window.location.reload();
    });

    window.addEventListener('keydown', (e) => {
        keys.add(e.key.toLowerCase());
    });

    window.addEventListener('keyup', (e) => {
        keys.delete(e.key.toLowerCase());
    });

    function updateInput() {
        input.xAxis = 0;
        input.yAxis = 0;

        if (keys.has('w') || keys.has('arrowup')) {
            input.yAxis -= MOVE_SPEED;
        }

        if (keys.has('s') || keys.has('arrowdown')) {
            input.yAxis += MOVE_SPEED;
        }

        if (keys.has('a') || keys.has('arrowleft')) {
            input.xAxis -= MOVE_SPEED;
        }

        if (keys.has('d') || keys.has('arrowright')) {
            input.xAxis += MOVE_SPEED;
        }

        if (connected && playerWs && playerWs.readyState === WebSocket.OPEN) {
            playerWs.send(JSON.stringify(input));
        }
    }

    function requestFoodUpdate() {
        if (foodWs && foodWs.readyState === WebSocket.OPEN) {
            foodWs.send('get');
        }
    }

    function worldToScreenX(x) {
        return x - camX + canvas.width / 2;
    }

    function worldToScreenY(y) {
        return y - camY + canvas.height / 2;
    }

    function drawGrid() {
        const gridSize = 100;

        ctx.strokeStyle = 'rgba(255,255,255,0.06)';
        ctx.lineWidth = 1;

        const startX = Math.floor((camX - canvas.width / 2) / gridSize) * gridSize;
        const endX = camX + canvas.width / 2;

        const startY = Math.floor((camY - canvas.height / 2) / gridSize) * gridSize;
        const endY = camY + canvas.height / 2;

        for (let x = startX; x < endX; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(worldToScreenX(x), 0);
            ctx.lineTo(worldToScreenX(x), canvas.height);
            ctx.stroke();
        }

        for (let y = startY; y < endY; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, worldToScreenY(y));
            ctx.lineTo(canvas.width, worldToScreenY(y));
            ctx.stroke();
        }
    }

    function drawFood() {
        const foodColors = [
            '#90be6d',
            '#f94144',
            '#f3722c',
            '#f9c74f',
            '#43aa8b',
            '#577590',
            '#4cc9f0',
            '#b5179e'
        ];

        foods.forEach(food => {
            const colorIndex = Math.abs(food.x + food.y) % foodColors.length;

            ctx.beginPath();
            ctx.arc(
                worldToScreenX(food.x),
                worldToScreenY(food.y),
                food.size,
                0,
                Math.PI * 2
            );

            ctx.fillStyle = foodColors[colorIndex];
            ctx.fill();
        });
    }

    function drawPlayers() {
        players.forEach(player => {
            if (player.displayX == null) {
                player.displayX = player.x ?? 0;
            }

            if (player.displayY == null) {
                player.displayY = player.y ?? 0;
            }

            if (player.displayRadius == null) {
                player.displayRadius = player.radius ?? 10;
            }

            const targetX = player.targetX ?? player.x ?? 0;
            const targetY = player.targetY ?? player.y ?? 0;
            const targetRadius = player.targetRadius ?? player.radius ?? 10;

            player.displayX += (targetX - player.displayX) * 0.18;
            player.displayY += (targetY - player.displayY) * 0.18;
            player.displayRadius += (targetRadius - player.displayRadius) * 0.18;

            ctx.beginPath();
            ctx.arc(
                worldToScreenX(player.displayX),
                worldToScreenY(player.displayY),
                player.displayRadius,
                0,
                Math.PI * 2
            );

            ctx.fillStyle = player.color || '#4CC9F0';
            ctx.fill();

            ctx.strokeStyle = 'rgba(255,255,255,0.7)';
            ctx.lineWidth = 2;
            ctx.stroke();

            ctx.fillStyle = '#ffffff';
            ctx.font = '14px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(
                player.name || 'Player',
                worldToScreenX(player.displayX),
                worldToScreenY(player.displayY) - player.displayRadius - 8
            );
        });
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const me = players.find(p => p.id === myId);

        if (me) {
            if (me.displayX == null) {
                me.displayX = me.x ?? 0;
            }

            if (me.displayY == null) {
                me.displayY = me.y ?? 0;
            }

            camX += (me.displayX - camX) * 0.12;
            camY += (me.displayY - camY) * 0.12;
        }

        drawGrid();
        drawFood();
        drawPlayers();

        requestAnimationFrame(draw);
    }

    setInterval(() => {
        updateInput();
    }, 50);

    setInterval(() => {
        requestFoodUpdate();
    }, 200);

    setInterval(() => {
        loadLeaderboard();
    }, 3000);

    draw();
})();
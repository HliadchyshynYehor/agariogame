(function () {
    const statusEl = document.getElementById('status');
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    let players = [];
    let foods = [];

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    window.addEventListener('resize', resize);
    resize();

    const protocol = (location.protocol === 'https:') ? 'wss' : 'ws';
    const playerWsUrl = protocol + '://' + location.host + '/player';
    const foodWsUrl = protocol + '://' + location.host + '/food';

    const playerWs = new WebSocket(playerWsUrl);
    const foodWs = new WebSocket(foodWsUrl);
    const MOVE_SPEED = 15;

    let connected = false;

    playerWs.addEventListener('open', () => {
        connected = true;
        statusEl.textContent = 'Connected (player)';
    });
    playerWs.addEventListener('close', () => {
        connected = false;
        statusEl.textContent = 'Disconnected (player)';
    });
    playerWs.addEventListener('error', (e) => {
        statusEl.textContent = 'Error (player)';
        console.error('Player WebSocket error', e);
    });

    playerWs.addEventListener('message', (ev) => {
        const data = ev.data;

        try {
            const arr = JSON.parse(data);
            if (Array.isArray(arr)) {
                const next = arr.map(p => {
                    const existing = players.find(pl => pl.id === p.id);
                    if (existing) {
                        existing.targetRadius = (p.radius != null) ? p.radius : existing.targetRadius ?? ((existing.radius != null) ? existing.radius : 10);
                        existing.targetX = (p.x != null) ? p.x : existing.targetX ?? ((existing.x != null) ? existing.x : 0);
                        existing.targetY = (p.y != null) ? p.y : existing.targetY ?? ((existing.y != null) ? existing.y : 0);
                        existing.x = p.x != null ? p.x : existing.x;
                        existing.y = p.y != null ? p.y : existing.y;
                        existing.radius = p.radius != null ? p.radius : existing.radius;
                        existing.name = p.name != null ? p.name : existing.name;
                        // preserve/update color
                        existing.color = p.color != null ? p.color : existing.color;
                        return existing;
                    }
                    return {
                        ...p,
                        targetRadius: (p.radius != null) ? p.radius : 10,
                        displayRadius: (p.radius != null) ? p.radius : 10,
                        targetX: (p.x != null) ? p.x : 0,
                        targetY: (p.y != null) ? p.y : 0,
                        displayX: (p.x != null) ? p.x : 0,
                        displayY: (p.y != null) ? p.y : 0,
                        // ensure a default color when none provided so drawing doesn't break
                        color: (p.color != null) ? p.color : '#4CC9F0'
                    };
                });
                players = next;
                return;
            }
        } catch (err) {
        }

        if (typeof data === 'string' && data.startsWith('playerUpdate:')) {
            let payload = data;
            const prefix = 'playerUpdate:';
            while (payload.startsWith(prefix)) {
                payload = payload.substring(prefix.length);
            }
            const parts = payload.split(':');
            if (parts.length >= 2) {
                const id = parts[0];
                const radius = parseInt(parts[1], 10);
                document.getElementById("size").textContent = radius;
                if (!Number.isNaN(radius)) {
                    const p = players.find(pl => pl.id === id);
                    if (p) {
                        p.targetRadius = radius;
                    } else {
                        players.push({
                            id,
                            x: 0,
                            y: 0,
                            radius: radius,
                            name: null,
                            targetRadius: radius,
                            displayRadius: radius,
                            targetX: 0,
                            targetY: 0,
                            displayX: 0,
                            displayY: 0
                        });
                    }
                }
            }
            return;
        }

        console.warn('Unknown player message:', data);
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

    foodWs.addEventListener('message', (ev) => {
        const data = ev.data;
        try {
            const parsed = JSON.parse(data);
            if (Array.isArray(parsed)) {
                foods = parsed.map(f => ({x: f.x || 0, y: f.y || 0, size: f.size || 5}));
                return;
            }
        } catch (e) {
        }

        const regex = /x=\s*([-]?\d+),\s*y=\s*([-]?\d+),\s*size=\s*(\d+)/g;
        const matches = [];
        let m;
        while ((m = regex.exec(data)) !== null) {
            matches.push({x: parseInt(m[1], 10), y: parseInt(m[2], 10), size: parseInt(m[3], 10)});
        }
        foods = matches;
    });

    const input = {xAxis: 0, yAxis: 0};
    const keyMap = {
        ArrowUp: () => (input.yAxis = -MOVE_SPEED),
        ArrowDown: () => (input.yAxis = MOVE_SPEED),
        ArrowLeft: () => (input.xAxis = -MOVE_SPEED),
        ArrowRight: () => (input.xAxis = MOVE_SPEED),
        w: () => (input.yAxis = -MOVE_SPEED),
        s: () => (input.yAxis = MOVE_SPEED),
        a: () => (input.xAxis = -MOVE_SPEED),
        d: () => (input.xAxis = MOVE_SPEED)
    };

    const keysDown = new Set();
    window.addEventListener('keydown', (e) => {
        if (keyMap[e.key]) {
            if (!keysDown.has(e.key)) {
                keysDown.add(e.key);
            }
            recomputeAxis();
            e.preventDefault();
        }
    });
    window.addEventListener('keyup', (e) => {
        if (keyMap[e.key]) {
            keysDown.delete(e.key);
            recomputeAxis();
            e.preventDefault();
        }
    });

    function recomputeAxis() {
        if (keysDown.has('ArrowLeft') || keysDown.has('a')) input.xAxis = -MOVE_SPEED;
        else if (keysDown.has('ArrowRight') || keysDown.has('d')) input.xAxis = MOVE_SPEED;
        else input.xAxis = 0;

        if (keysDown.has('ArrowUp') || keysDown.has('w')) input.yAxis = -MOVE_SPEED;
        else if (keysDown.has('ArrowDown') || keysDown.has('s')) input.yAxis = MOVE_SPEED;
        else input.yAxis = 0;
    }

    setInterval(() => {
        if (connected && playerWs.readyState === 1) {
            try {
                playerWs.send(JSON.stringify(input));
            } catch (e) {
                console.error('Failed to send input', e);
            }
        }
    }, 50);

    setInterval(() => {
        if (foodWs.readyState === 1) {
            try {
                foodWs.send('get');
            } catch (e) {
            }
        }
    }, 250);

    function worldToScreen(x, y) {
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;
        return {sx: cx + x, sy: cy + y};
    }

    // Helper: shade a hex color by a percentage (-1 to 1). Negative -> darker, Positive -> lighter
    function shadeHexColor(hex, percent) {
        if (!hex) return null;
        let h = (hex.startsWith('#')) ? hex.slice(1) : hex;
        if (h.length === 3) h = h.split('').map(ch => ch + ch).join('');
        if (h.length !== 6) return hex;
        const num = parseInt(h, 16);
        let r = (num >> 16) & 0xFF;
        let g = (num >> 8) & 0xFF;
        let b = num & 0xFF;
        r = Math.min(255, Math.max(0, Math.round(r * (1 + percent))));
        g = Math.min(255, Math.max(0, Math.round(g * (1 + percent))));
        b = Math.min(255, Math.max(0, Math.round(b * (1 + percent))));
        return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#0b0b0b';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        foods.forEach(f => {
            const x = (f.x != null) ? f.x : 0;
            const y = (f.y != null) ? f.y : 0;
            const r = (f.size != null) ? f.size : 5;
            const pos = worldToScreen(x, y);

            ctx.beginPath();
            ctx.fillStyle = '#A8E6CF';
            ctx.strokeStyle = '#2E8B57';
            ctx.lineWidth = 1;
            ctx.arc(pos.sx, pos.sy, r, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
        });

        const SMOOTHING_RADIUS = 0.15;
        players.forEach(p => {
            if (p.displayRadius == null) p.displayRadius = (p.targetRadius != null) ? p.targetRadius : ((p.radius != null) ? p.radius : 10);
            if (p.targetRadius == null) p.targetRadius = (p.radius != null) ? p.radius : p.displayRadius;
            p.displayRadius += (p.targetRadius - p.displayRadius) * SMOOTHING_RADIUS;
        });

        const SMOOTHING_POSITION = 0.1;
        players.forEach(p => {
            if (p.displayX == null) p.displayX = (p.targetX != null) ? p.targetX : 0;
            if (p.displayY == null) p.displayY = (p.targetY != null) ? p.targetY : 0;
            if (p.targetX == null) p.targetX = (p.x != null) ? p.x : p.displayX;
            if (p.targetY == null) p.targetY = (p.y != null) ? p.y : p.displayY;
            p.displayX += (p.targetX - p.displayX) * SMOOTHING_POSITION;
            p.displayY += (p.targetY - p.displayY) * SMOOTHING_POSITION;
        });

        players.forEach(p => {
            const x = (p.displayX != null) ? p.displayX : ((p.x != null) ? p.x : 0);
            const y = (p.displayY != null) ? p.displayY : ((p.y != null) ? p.y : 0);
            const r = (p.displayRadius != null) ? p.displayRadius : ((p.radius != null) ? p.radius : 10);
            const pos = worldToScreen(x, y);

            ctx.beginPath();
            // Use player's color if available, otherwise fall back to default
            ctx.fillStyle = (p.color != null) ? p.color : '#4CC9F0';
            // stroke is slightly darker variant of fill
            const strokeCol = shadeHexColor(p.color || '#4CC9F0', -0.25) || '#036';
            ctx.strokeStyle = strokeCol;
            ctx.lineWidth = 2;
            ctx.arc(pos.sx, pos.sy, r, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            if (p.name) {
                ctx.fillStyle = '#fff';
                ctx.font = Math.max(12, r / 1.2) + 'px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText(p.name, pos.sx, pos.sy - r - 6);
            }
        });

        requestAnimationFrame(draw);
    }

    requestAnimationFrame(draw);
})();

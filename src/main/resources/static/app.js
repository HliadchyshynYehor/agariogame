(function () {
    const statusEl = document.getElementById('status');
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    let players = [];
    let foods = [];

    let myId = null;
    let camX = 0, camY = 0;

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

    playerWs.binaryType = 'blob';
    foodWs.binaryType = 'blob';

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

    async function toText(data) {
        if (data instanceof Blob) return await data.text();
        return String(data);
    }

    playerWs.addEventListener('message', async (ev) => {
        const text = await toText(ev.data);

        if (text.startsWith('self:')) {
            myId = text.slice('self:'.length);
            return;
        }

        try {
            const arr = JSON.parse(text);
            if (Array.isArray(arr)) {
                const next = arr.map(p => {
                    const existing = players.find(pl => pl.id === p.id);
                    if (existing) {
                        existing.targetRadius = (p.radius != null) ? p.radius : (existing.targetRadius ?? (existing.radius ?? 10));
                        existing.targetX = (p.x != null) ? p.x : (existing.targetX ?? (existing.x ?? 0));
                        existing.targetY = (p.y != null) ? p.y : (existing.targetY ?? (existing.y ?? 0));
                        existing.x = (p.x != null) ? p.x : existing.x;
                        existing.y = (p.y != null) ? p.y : existing.y;
                        existing.radius = (p.radius != null) ? p.radius : existing.radius;
                        existing.name = (p.name != null) ? p.name : existing.name;
                        existing.color = (p.color != null) ? p.color : existing.color;
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
                        color: (p.color != null) ? p.color : '#4CC9F0'
                    };
                });
                players = next;
                return;
            }
        } catch (err) {
        }

        if (text.startsWith('playerUpdate:')) {
            let payload = text;
            const prefix = 'playerUpdate:';
            while (payload.startsWith(prefix)) payload = payload.substring(prefix.length);

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
                            displayY: 0,
                            color: '#4CC9F0'
                        });
                    }
                }
            }
            return;
        }

        console.warn('Unknown player message:', text);
    });

    foodWs.addEventListener('open', () => {
        console.log('Food socket open');
        try { foodWs.send('get'); } catch (e) {}
    });
    foodWs.addEventListener('close', () => console.log('Food socket closed'));
    foodWs.addEventListener('error', (e) => console.error('Food WebSocket error', e));

    foodWs.addEventListener('message', async (ev) => {
        const text = await toText(ev.data);

        try {
            const parsed = JSON.parse(text);
            if (Array.isArray(parsed)) {
                foods = parsed.map(f => ({ x: f.x ?? 0, y: f.y ?? 0, size: f.size ?? 5 }));
                return;
            }
        } catch (e) {}

        const regex = /x=\s*([-]?\d+),\s*y=\s*([-]?\d+),\s*size=\s*(\d+)/g;
        const matches = [];
        let m;
        while ((m = regex.exec(text)) !== null) {
            matches.push({ x: parseInt(m[1], 10), y: parseInt(m[2], 10), size: parseInt(m[3], 10) });
        }
        foods = matches;
    });

    const input = { xAxis: 0, yAxis: 0 };
    const keysDown = new Set();

    window.addEventListener('keydown', (e) => {
        const k = e.key;
        if (k === 'ArrowLeft' || k === 'a') keysDown.add('L');
        else if (k === 'ArrowRight' || k === 'd') keysDown.add('R');
        else if (k === 'ArrowUp' || k === 'w') keysDown.add('U');
        else if (k === 'ArrowDown' || k === 's') keysDown.add('D');
        else return;

        recomputeAxis();
        e.preventDefault();
    });

    window.addEventListener('keyup', (e) => {
        const k = e.key;
        if (k === 'ArrowLeft' || k === 'a') keysDown.delete('L');
        else if (k === 'ArrowRight' || k === 'd') keysDown.delete('R');
        else if (k === 'ArrowUp' || k === 'w') keysDown.delete('U');
        else if (k === 'ArrowDown' || k === 's') keysDown.delete('D');
        else return;

        recomputeAxis();
        e.preventDefault();
    });

    function recomputeAxis() {
        if (keysDown.has('L')) input.xAxis = -MOVE_SPEED;
        else if (keysDown.has('R')) input.xAxis = MOVE_SPEED;
        else input.xAxis = 0;

        if (keysDown.has('U')) input.yAxis = -MOVE_SPEED;
        else if (keysDown.has('D')) input.yAxis = MOVE_SPEED;
        else input.yAxis = 0;
    }

    setInterval(() => {
        if (connected && playerWs.readyState === 1) {
            try { playerWs.send(JSON.stringify(input)); } catch (e) {}
        }
    }, 50);

    setInterval(() => {
        if (foodWs.readyState === 1) {
            try { foodWs.send('get'); } catch (e) {}
        }
    }, 250);

    function shadeHexColor(hex, percent) {
        if (!hex) return null;
        let h = hex.startsWith('#') ? hex.slice(1) : hex;
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
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#0b0b0b';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const SMOOTHING_RADIUS = 0.15;
        players.forEach(p => {
            if (p.displayRadius == null) p.displayRadius = (p.targetRadius ?? p.radius ?? 10);
            if (p.targetRadius == null) p.targetRadius = (p.radius ?? p.displayRadius);
            p.displayRadius += (p.targetRadius - p.displayRadius) * SMOOTHING_RADIUS;
        });

        const SMOOTHING_POSITION = 0.1;
        players.forEach(p => {
            if (p.displayX == null) p.displayX = (p.targetX ?? 0);
            if (p.displayY == null) p.displayY = (p.targetY ?? 0);
            if (p.targetX == null) p.targetX = (p.x ?? p.displayX);
            if (p.targetY == null) p.targetY = (p.y ?? p.displayY);
            p.displayX += (p.targetX - p.displayX) * SMOOTHING_POSITION;
            p.displayY += (p.targetY - p.displayY) * SMOOTHING_POSITION;
        });

        let me = null;
        if (myId) me = players.find(p => p.id === myId) || null;
        if (!me && players.length > 0) me = players[0];

        if (me) {
            const targetCamX = (me.displayX ?? me.x ?? 0);
            const targetCamY = (me.displayY ?? me.y ?? 0);
            const CAM_SMOOTH = 0.12;
            camX += (targetCamX - camX) * CAM_SMOOTH;
            camY += (targetCamY - camY) * CAM_SMOOTH;
        }

        if (connected) {
            const idShort = myId ? myId.slice(0, 6) : 'null';
            statusEl.textContent = `Connected (player) id=${idShort} cam=(${camX.toFixed(0)},${camY.toFixed(0)})`;
        }

        ctx.setTransform(1, 0, 0, 1, canvas.width / 2 - camX, canvas.height / 2 - camY);

        foods.forEach(f => {
            const x = f.x ?? 0;
            const y = f.y ?? 0;
            const r = f.size ?? 5;

            ctx.beginPath();
            ctx.fillStyle = '#A8E6CF';
            ctx.strokeStyle = '#2E8B57';
            ctx.lineWidth = 1;
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
        });

        players.forEach(p => {
            const x = (p.displayX ?? p.x ?? 0);
            const y = (p.displayY ?? p.y ?? 0);
            const r = (p.displayRadius ?? p.radius ?? 10);

            ctx.beginPath();
            ctx.fillStyle = p.color ?? '#4CC9F0';
            ctx.strokeStyle = shadeHexColor(p.color || '#4CC9F0', -0.25) || '#036';
            ctx.lineWidth = 2;
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            if (p.name) {
                ctx.setTransform(1, 0, 0, 1, canvas.width / 2 - camX, canvas.height / 2 - camY);
                ctx.fillStyle = '#fff';
                ctx.font = Math.max(12, r / 1.2) + 'px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText(p.name, x, y - r - 6);
            }
        });

        requestAnimationFrame(draw);
    }

    requestAnimationFrame(draw);
})();

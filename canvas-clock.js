// Analog clock drawn with Canvas API
(() => {
    function $(sel) { return document.querySelector(sel); }
    
    const canvas = $('#analogClock');
    if (!canvas) return; 

    const ctx = canvas.getContext('2d');

    function getThemeColors() {
        const style = getComputedStyle(document.documentElement);
        return {
            background: style.getPropertyValue('--bg-color') || '#ffffff',
            face: style.getPropertyValue('--clock-face') || '#ffffff',
            border: style.getPropertyValue('--clock-border') || '#222222',
            hourHand: style.getPropertyValue('--hour-color') || '#111111',
            minuteHand: style.getPropertyValue('--minute-color') || '#111111',
            secondHand: style.getPropertyValue('--second-color') || '#d00',
            tick: style.getPropertyValue('--tick-color') || '#333'
        };
    }

    function resizeCanvasToDisplaySize(canvas) {
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        const width = Math.round(rect.width * dpr);
        const height = Math.round(rect.height * dpr);
        if (canvas.width !== width || canvas.height !== height) {
            canvas.width = width;
            canvas.height = height;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        }
    }

    function degToRad(deg) { return (deg * Math.PI) / 180; }

    function drawHand(angle, length, width, color) {
        ctx.save();
        ctx.rotate(angle);
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, -length);
        ctx.stroke();
        ctx.restore();
    }

    function drawCenter(radius, colors) {
        ctx.beginPath();
        ctx.fillStyle = colors.border;
        ctx.arc(0, 0, radius * 0.06, 0, Math.PI * 2);
        ctx.fill();
    }

    function drawClock() {
        resizeCanvasToDisplaySize(canvas);

        const rect = canvas.getBoundingClientRect();
        const w = rect.width;
        const h = rect.height;
        ctx.clearRect(0, 0, w, h);

        const colors = getThemeColors();

        const cx = w / 2;
        const cy = h / 2;
        const radius = Math.min(w, h) / 2 * 0.9;

        ctx.beginPath();
        ctx.fillStyle = colors.face;
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.lineWidth = Math.max(2, radius * 0.03);
        ctx.strokeStyle = colors.border;
        ctx.stroke();

        ctx.save();
        ctx.translate(cx, cy);

        for (let i = 0; i < 12; i++) {
            ctx.beginPath();
            const angle = degToRad(i * 30);
            const inner = radius * 0.82;
            const outer = radius * 0.95;
            ctx.moveTo(Math.cos(angle) * inner, Math.sin(angle) * inner);
            ctx.lineTo(Math.cos(angle) * outer, Math.sin(angle) * outer);
            ctx.lineWidth = Math.max(1, radius * 0.02);
            ctx.strokeStyle = colors.tick;
            ctx.stroke();
        }

        const now = new Date();
        const hours = now.getHours() % 12;
        const minutes = now.getMinutes();
        const seconds = now.getSeconds();
        const milliseconds = now.getMilliseconds();

        const secondAngle = degToRad((seconds + milliseconds / 1000) * 6);
        drawHand(secondAngle, radius * 0.7, radius * 0.01, colors.secondHand);

        const minuteAngle = degToRad((minutes + seconds / 60) * 6);
        drawHand(minuteAngle, radius * 0.6, radius * 0.04, colors.minuteHand);

        const hourAngle = degToRad((hours + minutes / 60) * 30);
        drawHand(hourAngle, radius * 0.4, radius * 0.06, colors.hourHand);

        drawCenter(radius, colors);

        ctx.restore();

        requestAnimationFrame(drawClock);
    }
    drawClock();
})();
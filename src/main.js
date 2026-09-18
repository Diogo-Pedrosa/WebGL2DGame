import { PlacementTile } from "./PlacementTile.js";
import {
    placementTilesData,
    placementTileSize,
    placementGridOffsetY,
} from "./placementTilesData.js";

const canvas = document.querySelector("#gameCanvas");
const gl = canvas.getContext("webgl2");

if (!gl) {
    throw new Error("WebGL2 não está disponível neste navegador.");
}

async function loadShaderSource(path) {
    const response = await fetch(path);

    if (!response.ok) {
        throw new Error(`Não foi possível carregar o shader: ${path}`);
    }

    return response.text();
}

function createShader(type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        const message = gl.getShaderInfoLog(shader);
        gl.deleteShader(shader);
        throw new Error(`Erro ao compilar shader: ${message}`);
    }

    return shader;
}

function createProgram(vertexSource, fragmentSource) {
    const vertexShader = createShader(gl.VERTEX_SHADER, vertexSource);
    const fragmentShader = createShader(gl.FRAGMENT_SHADER, fragmentSource);
    const program = gl.createProgram();

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        const message = gl.getProgramInfoLog(program);
        gl.deleteProgram(program);
        throw new Error(`Erro ao criar programa WebGL: ${message}`);
    }

    return program;
}

const [vertexSource, fragmentSource] = await Promise.all([
    loadShaderSource("shaders/sprite.vert"),
    loadShaderSource("shaders/sprite.frag"),
]);

const program = createProgram(vertexSource, fragmentSource);
const positionLocation = gl.getAttribLocation(program, "a_position");
const resolutionLocation = gl.getUniformLocation(program, "u_resolution");
const spritePositionLocation = gl.getUniformLocation(program, "u_position");
const spriteSizeLocation = gl.getUniformLocation(program, "u_size");
const rotationLocation = gl.getUniformLocation(program, "u_rotation");
const colorLocation = gl.getUniformLocation(program, "u_color");
const useTextureLocation = gl.getUniformLocation(program, "u_useTexture");
const isCircleLocation = gl.getUniformLocation(program, "u_isCircle");

const vertices = new Float32Array([
    0, 0,
    1, 0,
    0, 1,
    0, 1,
    1, 0,
    1, 1,
]);

const vertexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

gl.useProgram(program);
gl.enableVertexAttribArray(positionLocation);
gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
gl.uniform2f(resolutionLocation, canvas.width, canvas.height);

function loadTexture(path) {
    return new Promise((resolve, reject) => {
        const image = new Image();

        image.addEventListener("load", () => {
            const texture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texImage2D(
                gl.TEXTURE_2D,
                0,
                gl.RGBA,
                gl.RGBA,
                gl.UNSIGNED_BYTE,
                image,
            );
            resolve(texture);
        });

        image.addEventListener("error", () => {
            reject(new Error(`Não foi possível carregar a imagem: ${path}`));
        });

        image.src = path;
    });
}

function drawSprite(
    x,
    y,
    width,
    height,
    color,
    texture = null,
    rotation = 0,
    isCircle = false,
) {
    gl.uniform2f(spritePositionLocation, x, y);
    gl.uniform2f(spriteSizeLocation, width, height);
    gl.uniform1f(rotationLocation, rotation);
    gl.uniform4fv(colorLocation, color);
    gl.uniform1i(useTextureLocation, texture !== null);
    gl.uniform1i(isCircleLocation, isCircle);

    if (texture) {
        gl.bindTexture(gl.TEXTURE_2D, texture);
    }

    gl.drawArrays(gl.TRIANGLES, 0, 6);
}

const pathWaypoints = [
    { x: -30, y: 330 },
    { x: 260, y: 330 },
    { x: 260, y: 140 },
    { x: 570, y: 140 },
    { x: 570, y: 300 },
    { x: 400, y: 300 },
    { x: 400, y: 470 },
    { x: 790, y: 470 },
    { x: 790, y: 240 },
    { x: 990, y: 240 },
];

const buildSlots = [];

placementTilesData.forEach((row, rowIndex) => {
    row.forEach((value, columnIndex) => {
        if (value === 1) {
            buildSlots.push(new PlacementTile(
                columnIndex * placementTileSize,
                rowIndex * placementTileSize + placementGridOffsetY,
                placementTileSize,
            ));
        }
    });
});

let selectedBuildSlot = null;
let hoveredBuildSlot = null;

function getBuildSlotAtPointer(event) {
    const bounds = canvas.getBoundingClientRect();
    const x = (event.clientX - bounds.left - canvas.clientLeft)
        * canvas.width / canvas.clientWidth;
    const y = (event.clientY - bounds.top - canvas.clientTop)
        * canvas.height / canvas.clientHeight;

    return buildSlots.find((slot) => slot.containsPoint(x, y)) ?? null;
}

canvas.addEventListener("click", (event) => {
    const slot = getBuildSlotAtPointer(event);
    selectedBuildSlot = slot && !slot.occupied ? slot : null;
    document.querySelector("#buildStatus").textContent = selectedBuildSlot
        ? "Posição selecionada para colocar um xerife."
        : "Clique em um quadrado vazio para selecionar uma posição para o xerife.";
});

canvas.addEventListener("mousemove", (event) => {
    const slot = getBuildSlotAtPointer(event);
    hoveredBuildSlot = slot && !slot.occupied ? slot : null;
    canvas.style.cursor = hoveredBuildSlot ? "pointer" : "default";
});

canvas.addEventListener("mouseleave", () => {
    canvas.style.cursor = "default";
    hoveredBuildSlot = null;
});

function drawBuildSlots() {
    for (const slot of buildSlots) {
        slot.draw(drawSprite, slot === hoveredBuildSlot, slot === selectedBuildSlot);
    }
}

function drawPathSegment(start, end, width, color) {
    const deltaX = end.x - start.x;
    const deltaY = end.y - start.y;
    const length = Math.hypot(deltaX, deltaY);
    const angle = Math.atan2(deltaY, deltaX);
    const centerX = (start.x + end.x) / 2;
    const centerY = (start.y + end.y) / 2;

    drawSprite(
        centerX - length / 2,
        centerY - width / 2,
        length,
        width,
        color,
        null,
        angle,
    );
}

function drawPathJoint(point, width, color) {
    drawSprite(
        point.x - width / 2,
        point.y - width / 2,
        width,
        width,
        color,
        null,
        0,
        true,
    );
}

function drawPathLayer(waypoints, width, color) {
    for (let index = 0; index < waypoints.length - 1; index += 1) {
        drawPathSegment(waypoints[index], waypoints[index + 1], width, color);
    }

    for (const waypoint of waypoints) {
        drawPathJoint(waypoint, width, color);
    }
}

function drawPath(waypoints) {
    const borderColor = [0.29, 0.16, 0.08, 1];
    const dirtColor = [0.68, 0.43, 0.2, 1];

    drawPathLayer(waypoints, 82, borderColor);
    drawPathLayer(waypoints, 66, dirtColor);
}

const [backgroundTexture, banditTexture] = await Promise.all([
    loadTexture("assets/images/background.png"),
    loadTexture("assets/images/bandit.png"),
]);

const bandit = {
    x: pathWaypoints[0].x,
    y: pathWaypoints[0].y,
    width: 68,
    height: 105,
    speed: 70,
    nextWaypoint: 1,
};

function updateBandit(deltaTime) {
    let movement = bandit.speed * deltaTime;

    while (movement > 0 && bandit.nextWaypoint < pathWaypoints.length) {
        const target = pathWaypoints[bandit.nextWaypoint];
        const deltaX = target.x - bandit.x;
        const deltaY = target.y - bandit.y;
        const distance = Math.hypot(deltaX, deltaY);

        if (movement >= distance) {
            bandit.x = target.x;
            bandit.y = target.y;
            bandit.nextWaypoint += 1;
            movement -= distance;
        } else {
            bandit.x += (deltaX / distance) * movement;
            bandit.y += (deltaY / distance) * movement;
            movement = 0;
        }
    }
}

gl.viewport(0, 0, canvas.width, canvas.height);
gl.enable(gl.BLEND);
gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
gl.clearColor(0.79, 0.55, 0.29, 1.0);

let previousTime = null;

function gameLoop(currentTime) {
    const deltaTime = previousTime === null
        ? 0
        : Math.min((currentTime - previousTime) / 1000, 0.1);
    previousTime = currentTime;

    updateBandit(deltaTime);

    gl.clear(gl.COLOR_BUFFER_BIT);
    drawSprite(0, 0, canvas.width, canvas.height, [1, 1, 1, 1], backgroundTexture);
    drawPath(pathWaypoints);
    drawBuildSlots();
    drawSprite(
        bandit.x - bandit.width / 2,
        bandit.y - bandit.height,
        bandit.width,
        bandit.height,
        [1, 1, 1, 1],
        banditTexture,
    );

    requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);

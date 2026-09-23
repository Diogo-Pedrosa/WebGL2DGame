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

let bankMoney = 1000;
const bankMaxMoney = 1000;
const banditRobberyValue = 100;
let isGameOver = false;

let coins = 10;
const deputyCost = 2;
const sheriffUpgradeCost = 3;
const banditReward = 1;
let score = 0;
const banditScore = 100;

let coinsTextTexture = null;
let coinsTextWidth = 0;
let coinsTextHeight = 0;

function updateCoinsUI() {
    const tempCanvas = document.createElement('canvas');
    const ctx = tempCanvas.getContext('2d');
    const text = `Moedas: ${coins}`;
    ctx.font = "bold 28px Arial";
    tempCanvas.width = ctx.measureText(text).width + 8;
    tempCanvas.height = 36;

    ctx.font = "bold 28px Arial";
    ctx.fillStyle = "#ffd700"; // gold color
    ctx.textBaseline = "top";
    ctx.shadowColor = "black";
    ctx.shadowBlur = 3;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    ctx.fillText(text, 4, 4);

    if (coinsTextTexture) {
        gl.deleteTexture(coinsTextTexture);
    }

    coinsTextTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, coinsTextTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, tempCanvas);

    coinsTextWidth = tempCanvas.width;
    coinsTextHeight = tempCanvas.height;
}

let scoreTextTexture = null;
let scoreTextWidth = 0;
let scoreTextHeight = 0;

function updateScoreUI() {
    const tempCanvas = document.createElement("canvas");
    const ctx = tempCanvas.getContext("2d");
    const text = `Pontos: ${score}`;
    ctx.font = "bold 28px Arial";
    tempCanvas.width = ctx.measureText(text).width + 8;
    tempCanvas.height = 36;

    ctx.font = "bold 28px Arial";
    ctx.fillStyle = "white";
    ctx.textBaseline = "top";
    ctx.shadowColor = "black";
    ctx.shadowBlur = 3;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    ctx.fillText(text, 4, 4);

    if (scoreTextTexture) {
        gl.deleteTexture(scoreTextTexture);
    }

    scoreTextTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, scoreTextTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, tempCanvas);

    scoreTextWidth = tempCanvas.width;
    scoreTextHeight = tempCanvas.height;
}

let bankTextTexture = null;
let bankTextWidth = 0;
let bankTextHeight = 0;

function initBankTextTexture() {
    const tempCanvas = document.createElement("canvas");
    const ctx = tempCanvas.getContext("2d");
    const text = "BANCO";
    ctx.font = "bold 22px Georgia";
    tempCanvas.width = ctx.measureText(text).width + 8;
    tempCanvas.height = 30;

    ctx.font = "bold 22px Georgia";
    ctx.fillStyle = "#f6dfa0";
    ctx.textBaseline = "top";
    ctx.fillText(text, 4, 2);

    bankTextTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, bankTextTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, tempCanvas);

    bankTextWidth = tempCanvas.width;
    bankTextHeight = tempCanvas.height;
}

let bankMoneyTextTexture = null;
let bankMoneyTextWidth = 0;
let bankMoneyTextHeight = 0;

function updateBankMoneyTextTexture() {
    const tempCanvas = document.createElement('canvas');
    const ctx = tempCanvas.getContext('2d');
    const text = `Banco: $${bankMoney}`;
    ctx.font = "bold 20px Arial";
    tempCanvas.width = ctx.measureText(text).width + 8;
    tempCanvas.height = 24;

    ctx.font = "bold 20px Arial";
    ctx.fillStyle = "white";
    ctx.textBaseline = "top";
    ctx.shadowColor = "black";
    ctx.shadowBlur = 2;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 1;
    ctx.fillText(text, 2, 2);

    if (bankMoneyTextTexture) {
        gl.deleteTexture(bankMoneyTextTexture);
    }

    bankMoneyTextTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, bankMoneyTextTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, tempCanvas);

    bankMoneyTextWidth = tempCanvas.width;
    bankMoneyTextHeight = tempCanvas.height;
}

function drawBankMoneyBar() {
    const barWidth = 150;
    const barHeight = 20;
    const padding = 15;
    const gap = 10;
    const startX = canvas.width - barWidth - padding;
    const startY = padding;

    if (bankMoneyTextTexture) {
        drawSprite(startX - bankMoneyTextWidth - gap, startY, bankMoneyTextWidth, bankMoneyTextHeight, [1, 1, 1, 1], bankMoneyTextTexture);
    }

    const borderThickness = 3;
    const borderColor = [0.55, 0.35, 0.17, 1];
    drawSprite(startX - borderThickness, startY - borderThickness, barWidth + borderThickness * 2, borderThickness, borderColor);
    drawSprite(startX - borderThickness, startY + barHeight, barWidth + borderThickness * 2, borderThickness, borderColor);
    drawSprite(startX - borderThickness, startY, borderThickness, barHeight, borderColor);
    drawSprite(startX + barWidth, startY, borderThickness, barHeight, borderColor);

    drawSprite(startX, startY, barWidth, barHeight, [0.33, 0.33, 0.33, 1]);

    const percentage = Math.max(0, bankMoney / bankMaxMoney);
    let color = [0.3, 0.69, 0.31, 1];
    if (percentage <= 0.25) {
        color = [0.96, 0.26, 0.21, 1];
    } else if (percentage <= 0.5) {
        color = [1, 0.92, 0.23, 1];
    }

    if (percentage > 0) {
        drawSprite(startX, startY, barWidth * percentage, barHeight, color);
    }
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
    { x: 830, y: 240 },
];

const bank = {
    x: 780,
    y: 100,
    width: 180,
    height: 175,
};

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
const sheriffs = [];
const projectiles = [];

function createDeputy(slot) {
    return {
        type: 'deputy',
        x: slot.x + slot.size / 2,
        y: slot.y + slot.size,
        width: 48,
        height: 74,
        range: 250,
        damage: 13,
        fireRate: 0.8,
        timeSinceLastShot: 0,
    };
}

function upgradeToSheriff(tower) {
    tower.type = 'sheriff';
    tower.range = 250;
    tower.damage = 13;
    tower.fireRate = 1.4;
}

function getBuildSlotAtPointer(event) {
    const bounds = canvas.getBoundingClientRect();
    const x = (event.clientX - bounds.left - canvas.clientLeft)
        * canvas.width / canvas.clientWidth;
    const y = (event.clientY - bounds.top - canvas.clientTop)
        * canvas.height / canvas.clientHeight;

    return buildSlots.find((slot) => slot.containsPoint(x, y)) ?? null;
}

canvas.addEventListener("click", (event) => {
    if (isGameOver) return;

    const slot = getBuildSlotAtPointer(event);
    const statusText = document.querySelector("#buildStatus");

    if (!slot) {
        selectedBuildSlot = null;
        statusText.textContent = "Clique em um quadrado vazio para posicionar um Deputy (Custo: 2). Clique num Deputy para evoluir (Custo: 3).";
        return;
    }

    if (slot.occupied) {
        selectedBuildSlot = slot;
        const tower = slot.occupant;
        if (tower.type === 'deputy') {
            if (coins >= sheriffUpgradeCost) {
                coins -= sheriffUpgradeCost;
                updateCoinsUI();
                upgradeToSheriff(tower);
                statusText.textContent = "Evoluído para Sheriff!";
            } else {
                statusText.textContent = "Moedas insuficientes para evoluir (Custo: 3).";
            }
        } else {
            statusText.textContent = "Sheriff já está no nível máximo.";
        }
        return;
    }

    if (coins >= deputyCost) {
        coins -= deputyCost;
        updateCoinsUI();
        const deputy = createDeputy(slot);
        slot.occupant = deputy;
        sheriffs.push(deputy);
        selectedBuildSlot = slot;
        statusText.textContent = "Deputy posicionado.";
    } else {
        selectedBuildSlot = null;
        statusText.textContent = "Moedas insuficientes para posicionar Deputy (Custo: 2).";
    }
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

const [backgroundTexture, banditTexture, sheriffTexture, deputyTexture, bankTexture] = await Promise.all([
    loadTexture("assets/images/background.png"),
    loadTexture("assets/images/bandit.png"),
    loadTexture("assets/images/sheriff.png"),
    loadTexture("assets/images/deputy.png"),
    loadTexture("assets/images/bank.png"),
]);

const bandits = [];
let banditSpawnInterval = 2.5;
let banditSpawnTimer = banditSpawnInterval;
let banditBaseHealth = 100;
let difficultyTimer = 0;

function createBandit() {
    return {
        x: pathWaypoints[0].x,
        y: pathWaypoints[0].y,
        width: 68,
        height: 105,
        speed: 70,
        nextWaypoint: 1,
        health: banditBaseHealth,
        maxHealth: banditBaseHealth,
        alive: true,
        finished: false,
    };
}

function updateBandit(bandit, deltaTime) {
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

    if (bandit.nextWaypoint >= pathWaypoints.length) {
        bandit.finished = true;
    }
}

function updateBandits(deltaTime) {
    difficultyTimer += deltaTime;
    while (difficultyTimer >= 5) {
        difficultyTimer -= 5;
        banditSpawnInterval = Math.max(1.5, banditSpawnInterval - 0.1);
        banditBaseHealth = Math.min(200, banditBaseHealth + 10);
    }

    banditSpawnTimer += deltaTime;

    while (banditSpawnTimer >= banditSpawnInterval) {
        bandits.push(createBandit());
        banditSpawnTimer -= banditSpawnInterval;
    }

    for (let index = bandits.length - 1; index >= 0; index -= 1) {
        const bandit = bandits[index];

        if (bandit.alive) {
            updateBandit(bandit, deltaTime);
        }

        if (!bandit.alive || bandit.finished) {
            if (bandit.alive && bandit.finished) {
                bankMoney -= banditRobberyValue;
                if (bankMoney <= 0) {
                    bankMoney = 0;
                    isGameOver = true;
                    document.querySelector("#gameOverScreen").style.display = "flex";
                }
                updateBankMoneyTextTexture();
            }
            bandits.splice(index, 1);
        }
    }
}

function drawBanditHealthBar(bandit) {
    const barWidth = 60;
    const barHeight = 7;
    const healthPercentage = Math.max(0, bandit.health / bandit.maxHealth);
    const x = bandit.x - barWidth / 2;
    const y = bandit.y - bandit.height - 12;

    drawSprite(x, y, barWidth, barHeight, [0.25, 0.05, 0.05, 1]);
    drawSprite(x, y, barWidth * healthPercentage, barHeight, [0.1, 0.8, 0.2, 1]);
}

function drawBandits() {
    for (const bandit of bandits) {
        if (!bandit.alive) {
            continue;
        }

        drawSprite(
            bandit.x - bandit.width / 2,
            bandit.y - bandit.height,
            bandit.width,
            bandit.height,
            [1, 1, 1, 1],
            banditTexture,
        );
        drawBanditHealthBar(bandit);
    }
}

function getBanditCenter(bandit) {
    return {
        x: bandit.x,
        y: bandit.y - bandit.height / 2,
    };
}

function findClosestBandit(sheriff) {
    let closestBandit = null;
    let closestDistance = sheriff.range;

    for (const bandit of bandits) {
        if (!bandit.alive || bandit.finished) {
            continue;
        }

        const center = getBanditCenter(bandit);
        const distance = Math.hypot(center.x - sheriff.x, center.y - sheriff.y);

        if (distance <= closestDistance) {
            closestBandit = bandit;
            closestDistance = distance;
        }
    }

    return closestBandit;
}

function createProjectile(sheriff, target) {
    projectiles.push({
        x: sheriff.x,
        y: sheriff.y - sheriff.height / 2,
        size: 9,
        speed: 300,
        damage: sheriff.damage,
        target,
    });
}

function updateSheriffs(deltaTime) {
    for (const sheriff of sheriffs) {
        sheriff.timeSinceLastShot += deltaTime;
        const target = findClosestBandit(sheriff);
        const shootingInterval = 1 / sheriff.fireRate;

        if (target && sheriff.timeSinceLastShot >= shootingInterval) {
            createProjectile(sheriff, target);
            sheriff.timeSinceLastShot = 0;
        }
    }
}

function updateProjectiles(deltaTime) {
    for (let index = projectiles.length - 1; index >= 0; index -= 1) {
        const projectile = projectiles[index];
        const target = projectile.target;

        if (!target.alive || target.finished) {
            projectiles.splice(index, 1);
            continue;
        }

        const targetCenter = getBanditCenter(target);
        const deltaX = targetCenter.x - projectile.x;
        const deltaY = targetCenter.y - projectile.y;
        const distance = Math.hypot(deltaX, deltaY);
        const movement = projectile.speed * deltaTime;
        const targetRadius = Math.min(target.width, target.height) * 0.25;

        if (distance <= movement + targetRadius) {
            target.health -= projectile.damage;
            projectiles.splice(index, 1);

            if (target.health <= 0) {
                target.health = 0;
                target.alive = false;
                coins += banditReward;
                score += banditScore;
                updateCoinsUI();
                updateScoreUI();
            }

            continue;
        }

        projectile.x += (deltaX / distance) * movement;
        projectile.y += (deltaY / distance) * movement;
    }
}

function drawProjectiles() {
    for (const projectile of projectiles) {
        drawSprite(
            projectile.x - projectile.size / 2,
            projectile.y - projectile.size / 2,
            projectile.size,
            projectile.size,
            [1, 0.78, 0.15, 1],
            null,
            0,
            true,
        );
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

    if (!isGameOver) {
        updateBandits(deltaTime);
        updateSheriffs(deltaTime);
        updateProjectiles(deltaTime);
    }

    gl.clear(gl.COLOR_BUFFER_BIT);
    drawSprite(0, 0, canvas.width, canvas.height, [1, 1, 1, 1], backgroundTexture);
    drawPath(pathWaypoints);

    drawSprite(
        bank.x,
        bank.y,
        bank.width,
        bank.height,
        [1, 1, 1, 1],
        bankTexture,
    );

    const bankSignWidth = bankTextWidth + 22;
    const bankSignX = bank.x + (bank.width - bankSignWidth) / 2;
    drawSprite(bankSignX - 3, 61, bankSignWidth + 6, 37, [0.25, 0.12, 0.04, 1]);
    drawSprite(bankSignX, 64, bankSignWidth, 31, [0.48, 0.27, 0.09, 1]);

    if (bankTextTexture) {
        drawSprite(
            bank.x + (bank.width - bankTextWidth) / 2,
            65,
            bankTextWidth,
            bankTextHeight,
            [1, 1, 1, 1],
            bankTextTexture,
        );
    }

    drawBuildSlots();

    for (const sheriff of sheriffs) {
        const tex = sheriff.type === 'sheriff' ? sheriffTexture : deputyTexture;
        drawSprite(
            sheriff.x - sheriff.width / 2,
            sheriff.y - sheriff.height,
            sheriff.width,
            sheriff.height,
            [1, 1, 1, 1],
            tex,
        );
    }

    drawProjectiles();
    drawBandits();
    drawBankMoneyBar();

    if (coinsTextTexture) {
        drawSprite(20, 20, coinsTextWidth, coinsTextHeight, [1, 1, 1, 1], coinsTextTexture);
    }

    if (scoreTextTexture) {
        drawSprite(20, 60, scoreTextWidth, scoreTextHeight, [1, 1, 1, 1], scoreTextTexture);
    }

    requestAnimationFrame(gameLoop);
}

function resetGame() {
    bankMoney = bankMaxMoney;
    isGameOver = false;
    coins = 10;
    score = 0;
    updateCoinsUI();
    updateScoreUI();
    updateBankMoneyTextTexture();
    bandits.length = 0;
    projectiles.length = 0;
    sheriffs.length = 0;
    banditSpawnInterval = 2.5;
    banditBaseHealth = 100;
    difficultyTimer = 0;
    banditSpawnTimer = banditSpawnInterval;

    for (const slot of buildSlots) {
        slot.occupant = null;
    }

    selectedBuildSlot = null;
    hoveredBuildSlot = null;
    document.querySelector("#gameOverScreen").style.display = "none";
    document.querySelector("#buildStatus").textContent = "Clique em um quadrado vazio para posicionar um Deputy (Custo: 2). Clique num Deputy para evoluir (Custo: 3).";
}

document.querySelector("#restartButton").addEventListener("click", resetGame);

updateBankMoneyTextTexture();
initBankTextTexture();
updateCoinsUI();
updateScoreUI();
requestAnimationFrame(gameLoop);

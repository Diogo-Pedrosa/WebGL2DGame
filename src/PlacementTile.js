export class PlacementTile {
    constructor(x, y, size) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.occupant = null;
    }

    get occupied() {
        return this.occupant !== null;
    }

    containsPoint(x, y) {
        return x >= this.x && x < this.x + this.size
            && y >= this.y && y < this.y + this.size;
    }

    draw(drawSprite, hovered, selected) {
        const borderColor = selected
            ? [1, 0.78, 0.25, 1]
            : [0.35, 0.23, 0.12, 1];
        const fillColor = hovered
            ? [1, 0.88, 0.62, 1]
            : [0.88, 0.73, 0.48, 1];

        drawSprite(this.x, this.y, this.size, this.size, borderColor);
        drawSprite(this.x + 4, this.y + 4, this.size - 8, this.size - 8, fillColor);

        if (!this.occupied) {
            const centerX = this.x + this.size / 2;
            const centerY = this.y + this.size / 2;
            drawSprite(centerX - 10, centerY - 2, 20, 4, borderColor);
            drawSprite(centerX - 2, centerY - 10, 4, 20, borderColor);
        }
    }
}

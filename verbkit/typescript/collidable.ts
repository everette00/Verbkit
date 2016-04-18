/// <reference path="PixiTS/pixi.d.ts" />
/// <reference path="utils.ts" />
/// <reference path="gameobject.ts" />

class Collidable {
    debugGraphic:PIXI.Sprite;

    bounds:Rectangle = new Rectangle();

    applicable:GameObject[] = [];

    constructor(x:number, y:number, width:number, height:number) {
        this.debugGraphic = PIXI.Sprite.fromImage("img/pixel.png");

        this.debugGraphic.x = x;
        this.debugGraphic.y = y;
        this.debugGraphic.scale.x = width;
        this.debugGraphic.scale.y = height;

        this.bounds.x = x;
        this.bounds.y = y;
        this.bounds.width = width;
        this.bounds.height = height;
    }

    contact(gameObject:GameObject = undefined) {}
    connectedTo(gameObject:GameObject) {}
}

class SpringBoard extends Collidable {
    power:number = 0;

    connector:Connector = new Connector();

    constructor(x:number, y:number, width:number, height:number, power:number) {
        super(x, y, width, height);
        this.power = power;
    }

    automatic() {
        this.connector.active = true;
    }

    contact(gameObject:GameObject) {
        if(this.connector.active) {
            if(gameObject.bounds.intersects(this.bounds)) {
                gameObject.acceleration.y = this.power;
            }
        }

        super.contact(gameObject);
    }
}
class ConveyorBelt extends Collidable {
    power:number = 0;
    direction:number = 0;

    connector:Connector = new Connector();

    constructor(x:number, y:number, width:number, height:number, power:number, direction:number = 1) {
        super(x, y, width, height);
        this.power = power;
        this.direction = direction;

        this.connector.active = true;
    }


    contact(gameObject:GameObject) {
        if(gameObject.bounds.intersects(this.bounds)) {
            gameObject.graphic.y = this.bounds.y - gameObject.graphic.height;
            if(this.connector.active) {
                gameObject.graphic.x += (this.direction * this.power);
            }
        }

        super.contact(gameObject);
    }
}

class SpikeRow extends Collidable {
    damage:number = 0;

    constructor(x:number, y:number, width:number, height:number, damage:number = 1) {
        super(x, y, width, height);

        this.damage = damage;
        this.debugGraphic.tint = 0xff9809;
    }

    contact(gameObject:GameObject) {
        if(gameObject.bounds.intersects(this.bounds)) {
            gameObject.graphic.y = this.bounds.y - gameObject.graphic.height;
            if(gameObject instanceof Character && (<Character>gameObject).attributes["health"] !== undefined) {
                var n:number = <number>(<Character>gameObject).attributes["health"];
                n -= this.damage;

                (<Character>gameObject).attributes["health"] = n;
            }
        }
    }
}

class Teleportor extends Collidable {
    destination:Vector2 = new Vector2;

    constructor(x:number, y:number, width:number, height:number) {
        super(x, y, width, height);
    }

    setDestination(x:number, y:number) {

    }

    contact(gameObject:GameObject = undefined) {
        if(gameObject === undefined) {

        }
    }
}

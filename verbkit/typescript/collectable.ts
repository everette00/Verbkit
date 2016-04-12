/// <reference path="PixiTS/pixi.d.ts" />
/// <reference path="utils.ts" />
/// <reference path="gameobject.ts" />

class Collectable extends GameObject {
    collected:boolean = false;
    destroyable:boolean = false;
    destroyed:boolean = false;

    collector:GameObject;

    constructor(img:string, position:Vector2 = new Vector2()) {
        super(img);

        this.graphic = PIXI.Sprite.fromImage(img);
        this.position = position;
        this.graphic.x = position.x;
        this.graphic.y = position.y;
    }

    collect() {
        this.collected = true;
    }

    collectedBy(collector:GameObject) {
        this.collector = collector;
    }

    update() { super.update(); }
    
    static CollectedAll(collectable:Collectable[]):boolean {
        return collectable.length === 0;
    }
}

class Coin extends Collectable {
    constructor(x:number, y:number) {
        super("img/coin.png", vec2(x, y));
        this.graphic.scale.x = .25;
        this.graphic.scale.y = .25;
    }
}

class Key extends Collectable {
    doorToUnlock: Door;

    constructor(img:string, x:number, y:number) {
        super(img, vec2(x, y));
        this.graphic.scale.x = 32;
        this.graphic.scale.y = 32;
        this.graphic.tint = 0xeef902;


        this.destroyable = true;
    }

    unlocks(door:Door) {
        this.doorToUnlock = door;
    }

    update() {
        super.update();

        if(this.collector.bounds.intersects(this.doorToUnlock.bounds)) {
            this.doorToUnlock.closed = false;
            this.destroyed = true;
        }
    }
}

var aCoin = function(x:number, y:number):Coin {
    return new Coin(x, y);
}

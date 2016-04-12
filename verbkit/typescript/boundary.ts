/// <reference path="utils.ts" />
/// <reference path="PixiTS/pixi.d.ts" />
/// <reference path="gameobject.ts" />

class Boundary {
    debugGraphic:PIXI.Sprite;
    bounds:Rectangle;

    constructor(x:number, y:number, width:number, height:number) {
        this.debugGraphic = PIXI.Sprite.fromImage("img/pixel.png");
        this.debugGraphic.x = x;
        this.debugGraphic.y = y;
        this.debugGraphic.scale.x = width;
        this.debugGraphic.scale.y = height;

        this.bounds = new Rectangle(x, y, width, height);
    }

    interacts(gameObject:GameObject) { }


    static template(x:number, y:number, width:number, height:number):Boundary {
        return new Boundary(x, y, width, height);
    }
}

class Wall extends Boundary {
    constructor(x:number, y:number, width:number, height:number) {
        super(x, y, width, height);
        this.debugGraphic.tint = 0xff9990;
    }

    interacts(gameObject:GameObject) {
        var objCenter:Vector2 = vec2(gameObject.graphic.x + gameObject.graphic.width / 2,
            gameObject.graphic.y + gameObject.graphic.height / 2);

        if(gameObject.bounds.intersects(this.bounds)) {
            if(objCenter.y >= this.bounds.y && objCenter.y <= this.bounds.y + this.bounds.height) {
                if(gameObject.graphic.x + gameObject.graphic.width < this.bounds.x + this.bounds.width) {
                    gameObject.graphic.x = this.bounds.x - gameObject.graphic.width;
                } else if(gameObject.bounds.x > this.bounds.x) {
                    gameObject.graphic.x = this.bounds.x + this.bounds.width;
                }
            } else if(objCenter.x >= this.bounds.x && objCenter.x <= this.bounds.x + this.bounds.width) {
                if(gameObject.graphic.y + gameObject.graphic.height < this.bounds.x + this.bounds.height) {
                    gameObject.graphic.y = this.bounds.y + this.bounds.height;
                }
            }
        }
        super.interacts(gameObject);
    }
}

class Floor extends Boundary {
    constructor(x:number, y:number, width:number, height:number) {
        super(x, y, width, height);
        this.debugGraphic.tint = 0xff0000;
    }

    interacts(gameObject:GameObject) {
        if(gameObject.bounds.bottom().intersects(this.bounds.top())) {
            if(gameObject.graphic.x + gameObject.graphic.width >= this.bounds.x ||
                    gameObject.graphic.x <= this.bounds.x + this.bounds.width) {
                gameObject.graphic.y = this.bounds.y - gameObject.graphic.height;
            }
        }
        /*if(gameObject.bounds.intersects(this.bounds)) {
            if(gameObject.graphic.y < this.bounds.y && gameObject.acceleration.y <= 0) {
                gameObject.graphic.y = this.bounds.y - gameObject.graphic.height;
                if(typeof gameObject === "Player") {
                    if(!(<Player>gameObject).canJump) {
                        (<Player>gameObject).canJump = true; }
                }
            }
        }*/

        super.interacts(gameObject);
    }
}

class Ceiling extends Boundary {
    constructor(x:number, y:number, width:number, height:number) {
        super(x, y, width, height);
        this.debugGraphic.tint = 0x00ff00;
    }

    interacts(gameObject:GameObject) {
        if(gameObject.bounds.intersects(this.bounds)) {
            gameObject.graphic.y = this.bounds.y + this.bounds.height;
        }

        super.interacts(gameObject);
    }
}

class Platform extends Boundary {
    constructor(x:number, y:number, width:number) {
        super(x, y, width, 4);
        this.debugGraphic.tint = 0xff00ff;
    }

    interacts(gameObject:GameObject) {
        var bottom:Rectangle = new Rectangle(gameObject.graphic.x,
                gameObject.graphic.y + gameObject.graphic.height - 4, gameObject.graphic.width, 4);
        if(bottom.intersects(this.bounds)) {
            if(gameObject.graphic.x + gameObject.graphic.width >= this.bounds.x ||
                    gameObject.graphic.x <= this.bounds.x + this.bounds.width) {
                gameObject.graphic.y = this.bounds.y - gameObject.graphic.height;
            }
        }

        super.interacts(gameObject);
    }
}

class Elevator extends Floor {
    debugGraphic:PIXI.Sprite;

    connector:Connector = new Connector();

    current:Vector2 = new Vector2();
    start:Vector2 = new Vector2();
    end:Vector2 = new Vector2();
    direction:Vector2 = new Vector2();

    speed:number = 5;
    moveTo:number = 1;

    running:boolean = false;

    constructor(x:number, y:number, width:number, height:number) {
        super(x, y, width, height);

        this.startsAt(x, y);

        this.current.x = x;
        this.current.y = y;
    }

    startsAt(x, y) { this.start.x = x; this.start.y = y; return this; }
    endsAt(x, y) {
        this.end.x = x;
        this.end.y = y;
        this.direction = Vector2.direction(this.start, this.end);
        return this;
    }

    destination():Vector2 {
        return ([this.start, this.end])[this.moveTo];
    }

    interacts(gameObject:GameObject) {
        if(this.connector.active && !this.running) {
            this.running = true;

            if(this.moveTo === 0) {
                this.direction = Vector2.direction(this.end, this.start);
            } else {
                this.direction = Vector2.direction(this.start, this.end);
            }
        } else if(this.running) {
            this.debugGraphic.x -= this.direction.x * this.speed;
            this.debugGraphic.y -= this.direction.y * this.speed;
            this.current.x -= this.direction.x * this.speed;
            this.current.y -= this.direction.y * this.speed;
            this.bounds.x -= this.direction.x * this.speed;
            this.bounds.y -= this.direction.y * this.speed;

            if(Vector2.distance(this.current, this.destination()) <= this.speed / 2) {
                this.running = false;
                this.connector.active = false;
                this.moveTo = (this.moveTo === 1) ? 0 : 1;
            }
        }
        super.interacts(gameObject);
    }
}

class Door extends Wall {
    debugGraphic:PIXI.Sprite;
    locked:boolean = false;
    closed:boolean = true;

    connector:Connector = new Connector();

    constructor(x:number, y:number, width:number, height:number) {
        super(x, y, width, height);

        this.debugGraphic = PIXI.Sprite.fromImage("img/pixel.png");

        this.debugGraphic.x = this.bounds.x;
        this.debugGraphic.y = this.bounds.y;
        this.debugGraphic.scale.x = this.bounds.width;
        this.debugGraphic.scale.y = this.bounds.height;

        /*var d:Door = this;

        this.connection.activate = function() {
            d.activate();
        }*/
    }

    interacts(gameObject:GameObject) {
        if(this.connector.active && this.closed) {
            this.closed = false;
            this.debugGraphic.visible = false;
        } else if(!this.connector.active && !this.closed) {
            this.closed = true;
            this.debugGraphic.visible = true;
        }
        if(this.closed) {
            super.interacts(gameObject);
        }
    }
}

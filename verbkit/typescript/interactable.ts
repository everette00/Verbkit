/// <reference path="utils.ts" />
/// <reference path="PixiTS/pixi.d.ts" />
/// <reference path="gameobject.ts" />
/// <reference path="boundary.ts" />

class Connector {
    active:boolean = false;
    flip() {
        this.active = (this.active === false) ? true : false;
    }
}

class Interactable {
    debugGraphic:PIXI.Sprite;
    bounds:Rectangle = new Rectangle();

    connection: Connector;
    interacted:boolean = false;

    interactor:GameObject;

    constructor(x:number, y:number, width:number, height:number) {
        this.debugGraphic = PIXI.Sprite.fromImage("img/pixel.png");
        this.debugGraphic.x = x;
        this.debugGraphic.y = y;
        this.debugGraphic.width = width;
        this.debugGraphic.height = height;

        this.bounds = new Rectangle(x, y, width, height);
        var o = this;
        var loader = PIXI.loader;

        loader.reset();
        loader.add("img/pixel.png").once("complete", function() {
            o.bounds.x = o.debugGraphic.x;
            o.bounds.y = o.debugGraphic.y;
            o.bounds.width = o.debugGraphic.width;
            o.bounds.height = o.debugGraphic.height;
        });
        loader.load();
    }

    connect(connector:Connector) {
        this.connection = connector;
    }

    acceptedFrom(interactor:GameObject) {
        this.interactor = interactor;
    }

    update() { }

}

class Button extends Interactable {
    constructor(x:number, y:number, width:number, height:number) {
        super(x, y, width, height);
    }

    update() {
        super.update();
        if(this.interactor !== undefined) {
            if(this.interactor.bounds.intersects(this.bounds) && !this.interacted) {
                this.connection.flip();
                this.interacted = true;
            } else if(!this.interactor.bounds.intersects(this.bounds) && this.interacted) {
                this.interacted = false;
            }
        }
    }
}

class Lever extends Interactable {
    key:number = 0;
    previousKeyInput:boolean = false;
    currentKeyInput:boolean = false;

    constructor(x:number, y:number, width:number, height:number) {
        super(x, y, width, height);
    }

    interactsWith(key:number) {
        this.key = key;
    }

    update() {
        super.update();

        this.currentKeyInput = keyInput[this.key];

        if(this.interactor !== undefined) {
            if(this.interactor.bounds.intersects(this.bounds)) {
                if(!this.previousKeyInput && this.currentKeyInput) {
                    this.debugGraphic.tint = (this.debugGraphic.tint === 0xffffff) ?
                                                                    0xff9900 : 0xffffff;

                    this.connection.flip();
                }
            }
        }

        this.previousKeyInput = this.currentKeyInput;
    }

    /*interacts(gameObject:GameObject) {
        if(!this.interacted && gameObject.bounds.intersects(this.bounds) && keyInput[78]) {
            //this.interaction(gameObject);
            this.interacted = true;
            console.log("hello");
        }
    }*/
}

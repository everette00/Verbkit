/// <reference path="utils.ts" />
/// <reference path="PixiTS/pixi.d.ts" />
/// <reference path="weapon.ts" />

class GameObject {
    key:string = "";
    type:string = "";

    graphic:PIXI.Sprite;

    applyGravity:boolean = false;
    falling:boolean = false;

    collisionObjects:Array<GameObject> = [];
    typeCollision:Array<string> = [];

    weapons:Weapon[] = [];

    //collisionType:CollisionType = CollisionType.None;

    //movements:Movement[] = [];

    position:Vector2 = new Vector2();
    bounds:Rectangle = new Rectangle();

    gravity:number = 0;
    acceleration:Vector2 = new Vector2(1, 1);
    effectiveDirection:Vector2 = new Vector2();

    constructor(imgFile:string = "") {
        this.graphic = PIXI.Sprite.fromImage(imgFile);

        var o = this;
        var loader = PIXI.loader;

        loader.reset();
        loader.add(imgFile).once('complete', function() {
            o.bounds.x = o.graphic.x;
            o.bounds.y = o.graphic.y;
            o.bounds.width = o.graphic.width;
            o.bounds.height = o.graphic.height;
        });
        loader.load();
    }

    hasGravity(g:number = 9) {
        //this.movements.push(new Movement("gravity", vec2(0, 9)));
        this.gravity = g;
        return this;
    }

    hasWeapon(weapon:Weapon) {
        this.weapons.push(weapon);
        return this;
    }

    /*collidesAs(collisionType:CollisionType) {
        //this.collisionType = collisionType;

        return this;
    }*/

    collidesWith(gameObject:GameObject) {
        /*for(var i:number = 0; i < this.objectTypeCollisionList.length; i++) {
            if(this.objectCollisionList === gameObject)
                return this;
        }*/

        //this.objectCollisionList.push(gameObject);
        return this;
    }

    collidesWithAll(gameObject:GameObject) {
        /*for(var i:number = 0; i < this.objectTypeCollisionList.length; i++) {
            if(typeof this.objectCollisionList === typeof gameObject)
                return this;
        }*/

        //this.objectTypeCollisionList.push(gameObject);

        return this;
    }
    positionAt(x:number, y:number) {
        this.graphic.x = x;
        this.graphic.y = y;
        return this;
    }

    update() {
        /*for(var movement of this.movements) {
            this.graphic.x += movement.direction.x;
            this.graphic.y += movement.direction.y;
        }*/

        this.graphic.y += (this.gravity - this.acceleration.y);
        this.bounds.x = this.graphic.x;
        this.bounds.y = this.graphic.y;

        if(this.acceleration.y >= 0) {
            this.acceleration.y -= this.gravity;
        } else {
            this.effectiveDirection.y = -1;
        }
    }
}

class Character extends GameObject {
    attributes:{[key:string]: (number | boolean);} = {};

    hasAttribute(name:string, value:(number | boolean)) {
        this.attributes[name] = value;
        return this;
    }

    /*connectAttributes(attribute:string, reliant:string, flag:(number | boolean | Expression), effect:(number | boolean)) {
        this.attributes[attribute].reliant = this.attributes[reliant];
        this.attributes[attribute].relation = new AttributeCondition(flag, effect);
        return this;
    }*/

    update() {
        super.update();
        /*for(var k of this.keys) {
            if(this.attributes[k].reliant !== undefined) {
                this.attributes[k].value = this.attributes[k].relation.check(
                    this.attributes[k].reliant.value);
            }
        }*/
    }
}

class Player extends Character {
    canJump:boolean = true;

    inputMovements:InputMovement[] = [];

    constructor(imgFile:string) {
        super(imgFile);

        this.inputMovement(-3, 0, Keys.left);
        this.inputMovement(3, 0, Keys.right);
    }

    inputMovement(x:number, y:number, withKey:number, timeSpan:number = 0) {
        var d:Vector2 = vec2(x, y);
        this.inputMovements.push(new InputMovement("", d, withKey, timeSpan));

        return this;
    }

    update() {
        for(var inputMovement of this.inputMovements) {
            if(keyInput[inputMovement.key]) {
                this.graphic.x += inputMovement.direction.x;
                this.graphic.y += inputMovement.direction.y;
            }
        }

        if(keyInput[Keys.space]) {
            this.jump();
        }

        super.update();
    }

    jump() {
        if(!this.falling && this.canJump) {
            this.acceleration.y = (this.gravity * 4);
            this.effectiveDirection.y = -1;
        }
    }
}

class NPC extends Character {
    patrols:boolean = false;

    waypoints:Vector2[] = [];
    currentWaypoint:number = 1;

    walkingDirection:Vector2;

    constructor(imgFile:string) {
        super(imgFile);

        this.walkingDirection = Vector2.direction(
          vec2(this.graphic.x, this.graphic.y),
          this.waypoints[this.currentWaypoint]
        );
    }

    walkingPath(from:Vector2, to:Vector2) {
        this.waypoints.push(from);
        this.waypoints.push(to);
        this.patrols = true;
        return this;
    }

    getNewPatrollingDirection():Vector2 {
        var old:number = this.currentWaypoint;
        this.currentWaypoint = (this.currentWaypoint === 1) ? 0 : 1;
        return Vector2.direction(this.waypoints[old], this.waypoints[this.currentWaypoint]);
    }

    update() {
        super.update();

        /*if(Vector2.distance(vec2(this.graphic.x, this.graphic.y), this.waypoints[this.currentWaypoint]) <= 5) {
            this.walkingDirection = this.getNewPatrollingDirection();
        }*/
    }
}

class Opponent extends NPC {
    chasesPlayer:boolean = false;
    activeDistance:number = 0;

    target:GameObject;

    chases(gameObject:GameObject) {
        this.target = gameObject;
        return this;
    }

    viewDistance(distance:number) { this.activeDistance = distance; }


    update() {
        var p:Vector2 = vec2(this.graphic.x, this.graphic.y);
        var t:Vector2 = vec2(this.target.graphic.x, this.target.graphic.y);
        this.walkingDirection = Vector2.direction(p, t);

        this.graphic.x += this.walkingDirection.x * 1.5;
        this.graphic.y += this.walkingDirection.y * 1.5;
        super.update();

    }
}

/*class EnvironmentObject extends GameObject {
    environmentSystem:Environment[] = [];
    constructor() {super(); }
    includes(environment:Environment) {
        this.environmentSystem.push(environment);
        return this;
    }
}*/

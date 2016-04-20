/// <reference path="pixits/pixi.d.ts" />
/// <reference path="utils.ts" />

class Weapon {
    coolDown:number = 1;
    currentCoolDown:number = 1;
    onCoolDown:boolean = false;

    update() {
        if(this.onCoolDown) {
            this.currentCoolDown -= 0.1;

            if(this.currentCoolDown <= 0) {
                this.currentCoolDown = this.coolDown;
                this.onCoolDown = false;
            }
        }
    }

    speed(attacksPerSecond:number) {
        this.coolDown = 10 / attacksPerSecond;
        this.currentCoolDown = this.coolDown;
    }

    hit(gameObject:GameObject | GameObject[]):boolean { return false; }
}

class Projectile {
    graphic:PIXI.Sprite;
    bounds:Rectangle = new Rectangle();

    start:Vector2 = new Vector2();
    current:Vector2 = new Vector2();
    direction:Vector2 = new Vector2();

    speed:number = 1;
    reach:number = 0;
    alive:boolean = false;


    constructor(file:string, speed:number, reach:number) {
        this.graphic = PIXI.Sprite.fromImage(file);

        var loader = PIXI.loader;

        loader.reset();
        loader.add(file).once('complete', () => {
            this.graphic.width = 20;
            this.graphic.height = 20;

            this.bounds.width = 20;
            this.bounds.height = 20;
        });
        loader.load();

        this.speed = speed;
        this.reach = reach;
    }
}

class Gun extends Weapon {
    projectiles:Projectile[] = new Array();
    currentProjectile:number = 0;

    direction:Vector2 = new Vector2();

    constructor(bulletGraphicFile:string, numberOfBullets:number = 1, bulletSpeed:number = 1, bulletReach:number = 300) {
        super();
        for(var i = 0; i < numberOfBullets; i++) {
            this.projectiles.push(new Projectile(bulletGraphicFile, bulletSpeed, bulletReach));
        }
    }

    fire(from:Vector2) {
        if(this.onCoolDown) {
            return;
        }


        if(!this.projectiles[this.currentProjectile].alive) {
            this.projectiles[this.currentProjectile].start.x = from.x;
            this.projectiles[this.currentProjectile].start.y = from.y;

            this.projectiles[this.currentProjectile].current.x = from.x;
            this.projectiles[this.currentProjectile].current.y = from.y;

            this.projectiles[this.currentProjectile].graphic.x = from.x;
            this.projectiles[this.currentProjectile].graphic.y = from.y;

            this.projectiles[this.currentProjectile].direction.x = this.direction.x;
            this.projectiles[this.currentProjectile].direction.y = this.direction.y;

            this.projectiles[this.currentProjectile].alive = true;
            this.projectiles[this.currentProjectile].graphic.visible = true;
            this.currentProjectile++;

            this.onCoolDown = true;
        }

        if(this.currentProjectile === this.projectiles.length) {
            this.currentProjectile = 0;
        }
    }

    update() {
        for(var i:number = 0; i < this.projectiles.length; i++) {
            if(this.projectiles[i].alive) {
                this.projectiles[i].current.x += this.projectiles[i].direction.x * this.projectiles[i].speed;
                this.projectiles[i].current.y += this.projectiles[i].direction.y * this.projectiles[i].speed;

                this.projectiles[i].bounds.x = this.projectiles[i].current.x;
                this.projectiles[i].bounds.y = this.projectiles[i].current.y;

                this.projectiles[i].graphic.x = this.projectiles[i].current.x;
                this.projectiles[i].graphic.y = this.projectiles[i].current.y;

                if(Vector2.distance(this.projectiles[i].start, this.projectiles[i].current) >= this.projectiles[i].reach) {
                    this.projectiles[i].alive = false;
                }
            } else {
                this.projectiles[i].graphic.visible = false;
            }
        }
        super.update();
    }

    hit(gameObject:GameObject | GameObject[]):boolean {
        if(gameObject instanceof GameObject) {
            for(var i:number = 0; i < this.projectiles.length; i++) {
                if(!this.projectiles[i].alive) {
                    continue;
                }

                if(this.projectiles[i].bounds.intersects((<GameObject>gameObject).bounds)) {
                    this.projectiles[i].alive = false;
                    return true;
                }
            }
        } else {
            for(var i:number = 0; i < this.projectiles.length; i++) {
                for(var j:number = 0; j < (<GameObject[]>gameObject).length; j++) {
                    if(this.projectiles[i].bounds.intersects(gameObject[j].bounds)) {
                        if(!this.projectiles[i].alive) {
                            continue;
                        }

                        this.projectiles[i].alive = false;
                        return true;
                    }
                }
            }
        }
    }
}

var gun = function(graphic:string, numberOfBullets:number = 1, bulletSpeed:number = 1, bulletReach:number = 300) {
    return new Gun(graphic, numberOfBullets, bulletSpeed, bulletReach);
}

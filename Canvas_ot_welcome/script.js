
const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');

// settings

pixelRatio = (window.pixelRatio > 1) ? 2 : 1;


stageWidth = document.body.clientWidth;
stageHeight = document.body.clientHeight;

canvas.width = 1500;
canvas.height = 1500;

ctx.fillStyle = "white";
ctx.strokeStyle = "white";
ctx.lineWidth = 1;



class Particle {
        constructor(effect) {
                this.effect = effect;
                this.x = Math.floor(Math.random() * this.effect.width);
                this.y = Math.floor(Math.random() * this.effect.height);
        
                this.speedX;
                this.speedY;
                this.speedModifier = Math.floor( Math.random() * 2 + 1);
                this.history = [{
                        x: this.x,
                        y: this.y
                }];
                this.maxLength = Math.floor(Math.random() * 60 + 50);
                this.angle = 0;
                this.newAngle = 0;
                this.angleCorrector = Math.random() * 0.5 + 0.01;
                this.timer = this.maxLength * 2;

                this.colors = ["#4c026b", "#730d9e", "#9622c7","#b44ae0", "#cd72f2"];
                this.colors = ["#b8fff7", "#94f7ec", "#49d1c2", "#16ab9a", "#00ffe2"];
                this.color = this.colors[Math.floor(Math.random() * this.colors.length)];
        }
        draw(ctx) {
                ctx.beginPath();
                ctx.moveTo(this.history[0].x, this.history[0].y);
                for (let i = 0; i < this.history.length; i++) {
                        ctx.lineTo(this.history[i].x, this.history[i].y);
                }
                ctx.strokeStyle = this.color;
                ctx.stroke();
        }
        update() {
                this.timer--;
                if (this.timer >= 1) {
                        let x = Math.floor(this.x / this.effect.cellSize);
                        let y = Math.floor(this.y / this.effect.cellSize);
        
                        let index = y * this.effect.cols + x;

                        if (this.effect.flowField[index]) {
                                this.newAngle = this.effect.flowField[index].colorAngle;
                        
                                if (this.angle > this.newAngle) {
                                        this.angle -= this.angleCorrector;

                                } else if (this.angle< this.angleCorrector) {
                                        this.angle += this.angleCorrector;
                                } else {
                                        this.angle = this.newAngle;
                                }
                        }
        
                        this.speedX = Math.cos(this.angle);
                        this.speedY = Math.sin(this.angle);
                        this.x += this.speedX * this.speedModifier;
                        this.y += this.speedY * this.speedModifier;
        
                        this.history.push({
                                x: this.x,
                                y: this.y,
                        });
                        if (this.history.length > this.maxLength) {
                                this.history.shift();
                        }
                } else if (this.history.length > 1) {
                        this.history.shift();
                } else {
                        this.reset();
                }

        }

        reset() {
                let attempts = 0;
                let resetSuccess = false;

                while (attempts < 100 && !resetSuccess) {
                        attempts++;
                        let testIndex = Math.floor(Math.random() * this.effect.flowField.length);
                        if( this.effect.flowField[testIndex].alpha > 0) {
                                this.x = this.effect.flowField[testIndex].x;
                                this.y = this.effect.flowField[testIndex].y;
                                this.history = [{
                                        x: this.x,
                                        y: this.y
                                }];
                                this.timer = this.maxLength * 2;
                                resetSuccess = true;
                        }
                } 

                if (!resetSuccess) {
                        this.x = Math.random() * this.effect.width;
                        this.y = Math.random() * this.effect.height;
                        this.history = [{
                                x: this.x,
                                y: this.y
                        }];
                        this.timer = this.maxLength * 2;
                }

        }
}

class Effect {
        constructor(canvas, ctx) {
                this.canvas = canvas;
                this.ctx = ctx;
                this.width = canvas.width;
                this.height = canvas.height;
                this.particles = [];
                this.numberOfParticles = 3000;

                this.cellSize = 5;
                this.rows;
                this.cols;
                this.flowField = [];

                this.curve = 5;
                this.zoom = 0.07;

                
                
                this.debug = false;
                this.init();
        }

        drawText() {
                this.ctx.font = "350px Impact";
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';

                const gradient1 = this.ctx.createLinearGradient(0, 0, this.width, this.height);
                gradient1.addColorStop(0.2, 'rgb(255,255,255)');
                gradient1.addColorStop(0.4, 'rgb(255, 255, 0)');
                gradient1.addColorStop(0.6, 'rgb(0, 255, 255, 255');
                gradient1.addColorStop(0.8, 'rgb(0,0,255)');

                const gradient2 = this.ctx.createLinearGradient(0, 0, this.width, this.height);
                gradient2.addColorStop(0.2, 'rgb(255,255,0)');
                gradient2.addColorStop(0.4, 'rgb(200, 5, 50)');
                gradient2.addColorStop(0.6, 'rgb(150, 255, 255)');
                gradient2.addColorStop(0.8, 'rgb(255,255,150)');

                const gradient3 = this.ctx.createRadialGradient(
                        this.width * 0.5, this.height * 0.5, 10, this.width * 0.5, this.height * 0.5, this.width
                );
                gradient3.addColorStop(0.2, 'rgb(0, 0, 255)');
                gradient3.addColorStop(0.4, 'rgb(200, 255, 0)');
                gradient3.addColorStop(0.6, 'rgb(0, 0, 255');
                gradient3.addColorStop(0.8, 'rgb(0,0,0)');

                this.ctx.fillStyle = gradient1;
                this.ctx.fillText('Welcome', this.width * 0.5, this.height * 0.5, this.width);

        }

        init() {
                // cretae flow field
                this.rows = Math.floor(this.height / this.cellSize);
                this.cols = Math.floor(this.width / this.cellSize);
                this.flowField = [];

                // draw text
                this.drawText();


                //scan pixel data
                const pixels = this.ctx.getImageData(0, 0, this.width, this.height).data;
                console.log(pixels);

                for (let y = 0; y < this.height; y += this.cellSize) {
                        for (let x = 0; x < this.width; x += this.cellSize) {
                                const index = (y * this.width + x) * 4;
                                const red = pixels[index];
                                const green = pixels[index + 1];
                                const blue = pixels[index + 2];
                                const alpha = pixels[index + 3];
                                const grayscale = (red + green + blue) / 3;
                                const colorAngle = ((grayscale/255) * 6.28).toFixed(2);
                                console.log(red);
                                this.flowField.push({
                                        x: x,
                                        y: y,
                                        colorAngle: colorAngle,
                                        alpha: alpha,
                                })
                        }
                }

                


                // create particles
                for (let i = 0; i < this.numberOfParticles; i++) {
                        this.particles.push(new Particle(this));
                }
                this.particles.forEach(particle => particle.reset());
                
        }
        render(){
                if (this.debug) {
                        this.drawText();
                        
                }
                
                this.particles.forEach(particle => {
                        particle.draw(this.ctx);
                        particle.update();
                })
        }
}



const effect = new Effect(canvas, ctx);
console.log(effect);

function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        effect.render();
        requestAnimationFrame(animate);
}
animate();
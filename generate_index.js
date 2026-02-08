const fs = require('fs');
const path = require('path');

const as3Path = path.join('node_modules', 'as3js', 'lib', 'as3.js');
const runtimePath = path.join('node_modules', 'as3js', 'runtime.js');
const outputPath = path.join(__dirname, 'index.html');

try {
    const as3Content = fs.readFileSync(as3Path, 'utf8');
    const runtimeContent = fs.readFileSync(runtimePath, 'utf8');

    // Part 1: Header and UI
    const htmlHeader = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ActionScript 3 TDD Environment (2026)</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
        .cm-editor { height: 100%; }
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: #1f2937; }
        ::-webkit-scrollbar-thumb { background: #4b5563; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #6b7280; }
    </style>
</head>
<body class="bg-gray-900 text-white h-screen flex flex-col overflow-hidden">
    <header class="h-14 bg-gray-800 border-b border-gray-700 flex justify-between items-center px-6 shadow-md z-10">
        <div class="flex items-center space-x-2">
            <div class="w-3 h-3 rounded-full bg-red-500"></div>
            <div class="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div class="w-3 h-3 rounded-full bg-green-500"></div>
            <h1 class="ml-4 text-lg font-bold text-gray-100 tracking-wide">ActionScript 3 <span class="text-blue-400">Studio</span></h1>
        </div>
        <div class="flex space-x-3">
             <button onclick="runCode()" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded text-sm font-medium transition-colors flex items-center">Run</button>
            <button onclick="runTests()" class="bg-green-600 hover:bg-green-700 text-white px-4 py-1.5 rounded text-sm font-medium transition-colors flex items-center">Run Tests</button>
        </div>
    </header>

    <div class="flex-1 flex overflow-hidden">
        <div class="w-1/2 flex flex-col border-r border-gray-700 bg-gray-900">
            <div class="bg-gray-800 px-4 py-1 text-xs text-gray-400 uppercase tracking-wider font-semibold border-b border-gray-700 flex justify-between items-center">
                <span>Source.as</span>
                <span class="text-xs text-gray-500">AS3</span>
            </div>
            <textarea id="code-editor" class="flex-1 bg-[#1e1e1e] text-[#d4d4d4] p-4 font-mono text-sm resize-none focus:outline-none leading-relaxed" spellcheck="false"></textarea>
        </div>

        <div class="w-1/2 flex flex-col bg-gray-900">
            <div class="flex-1 flex flex-col border-b border-gray-700 min-h-[30%]">
                <div class="bg-gray-800 px-4 py-1 text-xs text-gray-400 uppercase tracking-wider font-semibold border-b border-gray-700 flex justify-between">
                    <span>Test Output</span>
                </div>
                <div id="test-output" class="flex-1 bg-[#1e1e1e] p-4 overflow-auto font-mono text-sm">
                    <div class="text-gray-500 italic">Ready to run tests...</div>
                </div>
            </div>

            <div class="flex-1 flex flex-col min-h-[30%]">
                <div class="bg-gray-800 px-4 py-1 text-xs text-gray-400 uppercase tracking-wider font-semibold border-b border-gray-700 flex justify-between">
                    <span>Console</span>
                    <button onclick="clearConsole()" class="hover:text-white transition-colors">Clear</button>
                </div>
                <div id="console-output" class="flex-1 bg-black p-4 overflow-auto font-mono text-xs text-green-400 border-t border-gray-800"></div>
            </div>
        </div>
    </div>
    <iframe id="sandbox" style="display:none;"></iframe>
`;

    fs.writeFileSync(outputPath, htmlHeader);

    // Part 2: Libraries
    fs.appendFileSync(outputPath, '<script>\n');
    fs.appendFileSync(outputPath, as3Content);
    fs.appendFileSync(outputPath, '\n</script>\n<script>\n');
    fs.appendFileSync(outputPath, runtimeContent);
    fs.appendFileSync(outputPath, '\n</script>\n');

    const logicScript = `
    <script>
        const editor = document.getElementById('code-editor');
        const consoleOutput = document.getElementById('console-output');
        const testOutput = document.getElementById('test-output');
        
        function logToConsole(msg, type) {
            const line = document.createElement('div');
            line.textContent = '> ' + msg;
            if (type === 'error') line.classList.add('text-red-500');
            else if (type === 'warn') line.classList.add('text-yellow-500');
            consoleOutput.appendChild(line);
            consoleOutput.scrollTop = consoleOutput.scrollHeight;
        }

        function clearConsole() {
            consoleOutput.innerHTML = '';
        }

        function logToTest(msg, isPass) {
            const line = document.createElement('div');
            line.textContent = msg;
            if (isPass === true) line.className = 'text-green-400 font-bold';
            else if (isPass === false) line.className = 'text-red-500 font-bold';
            else line.className = 'text-gray-300';
            testOutput.appendChild(line);
            testOutput.scrollTop = testOutput.scrollHeight;
        }

        const SimpleUnitSource = \`package {
    public class SimpleUnit {
        public static function assert(condition:Boolean, message:String = "Assertion failed"):void {
            if (condition) {
                trace("[PASS] " + message);
            } else {
                trace("[FAIL] " + message);
            }
        }
        
        public static function assertEquals(expected:*, actual:*, message:String = ""):void {
             if (expected == actual) {
                 trace("[PASS] " + message + " (Expected: " + expected + ", Actual: " + actual + ")");
             } else {
                 trace("[FAIL] " + message + " (Expected: " + expected + ", Actual: " + actual + ")");
             }
        }
    }
}\`;

        const defaultCode = \`package {
    /**
     * Ball Class
     */
    public class Ball {
        public var x:Number;
        public var y:Number;
        public var vx:Number;
        public var vy:Number;
        public var radius:Number;

        public function Ball(x:Number, y:Number, radius:Number = 5) {
            this.x = x;
            this.y = y;
            this.radius = radius;
            this.vx = 0;
            this.vy = 0;
        }

        public function update():void {
            this.x += this.vx;
            this.y += this.vy;
        }
    }
}

package {
    /**
     * Paddle Class
     */
    public class Paddle {
        public var x:Number;
        public var y:Number;
        public var width:Number;
        public var height:Number;
        public var score:int;
        public var speed:Number = 5;
        public var movingUp:Boolean = false;
        public var movingDown:Boolean = false;

        public function Paddle(x:Number, y:Number, w:Number = 10, h:Number = 50) {
            this.x = x;
            this.y = y;
            this.width = w;
            this.height = h;
            this.score = 0;
        }

        public function update(gameHeight:Number):void {
             if (movingUp) this.y -= speed;
             if (movingDown) this.y += speed;
             if (this.y < 0) this.y = 0;
             if (this.y + this.height > gameHeight) this.y = gameHeight - this.height;
        }
    }
}

package {
    import Ball;
    import Paddle;

    /**
     * PongGame Class
     */
    public class PongGame {
        public var ball:Ball;
        public var player1:Paddle;
        public var player2:Paddle;
        public var width:Number;
        public var height:Number;

        public function PongGame(w:Number, h:Number) {
            this.width = w;
            this.height = h;
            this.ball = new Ball(w/2, h/2);
            this.player1 = new Paddle(20, h/2 - 25);
            this.player2 = new Paddle(w - 30, h/2 - 25);
            resetBall();
        }

        public function update():void {
            ball.update();
            player1.update(height);
            player2.update(height);

            if (ball.y - ball.radius < 0) {
                ball.y = ball.radius;
                ball.vy *= -1;
            } else if (ball.y + ball.radius > height) {
                ball.y = height - ball.radius;
                ball.vy *= -1;
            }

            checkPaddleCollision(player1);
            checkPaddleCollision(player2);

            if (ball.x < 0) {
                player2.score++;
                trace("Player 2 Scored! " + player1.score + "-" + player2.score);
                resetBall();
            } else if (ball.x > width) {
                player1.score++;
                trace("Player 1 Scored! " + player1.score + "-" + player2.score);
                resetBall();
            }
        }

        private function checkPaddleCollision(p:Paddle):void {
            if (ball.x + ball.radius >= p.x && ball.x - ball.radius <= p.x + p.width &&
                ball.y + ball.radius >= p.y && ball.y - ball.radius <= p.y + p.height) {
                ball.vx *= -1.05;
                if (ball.x < width / 2) ball.x = p.x + p.width + ball.radius;
                else ball.x = p.x - ball.radius;
            }
        }

        public function resetBall():void {
            ball.x = width / 2;
            ball.y = height / 2;
            ball.vx = (Math.random() > 0.5 ? 4 : -4); 
            ball.vy = (Math.random() * 4) - 2;
        }
    }
}

package {
    import PongGame;
    
    /**
     * CanvasRenderer Class
     */
    public class CanvasRenderer {
        public var game:PongGame;
        public var canvas:*;
        public var ctx:*;

        public function CanvasRenderer(game:PongGame) {
            this.game = game;
            var doc:* = window.document;
            var old:* = doc.getElementById('pong-canvas');
            if (old) old.parentNode.removeChild(old);
            
            this.canvas = doc.createElement("canvas");
            this.canvas.id = 'pong-canvas';
            this.canvas.width = game.width;
            this.canvas.height = game.height;
            this.canvas.style.position = "absolute";
            this.canvas.style.top = "50%";
            this.canvas.style.left = "50%";
            this.canvas.style.transform = "translate(-50%, -50%)";
            this.canvas.style.border = "2px solid #333";
            this.canvas.style.background = "black";
            this.canvas.style.zIndex = "100";
            
            doc.body.appendChild(this.canvas);
            this.ctx = this.canvas.getContext("2d");
        }
        
        public function draw():void {
            ctx.clearRect(0, 0, game.width, game.height);
            ctx.fillStyle = "white";
            ctx.beginPath();
            ctx.arc(game.ball.x, game.ball.y, game.ball.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillRect(game.player1.x, game.player1.y, game.player1.width, game.player1.height);
            ctx.fillRect(game.player2.x, game.player2.y, game.player2.width, game.player2.height);
            ctx.font = "30px monospace";
            ctx.textAlign = "center";
            ctx.fillText(game.player1.score, game.width / 4, 50);
            ctx.fillText(game.player2.score, game.width * 3 / 4, 50);
            
            // Draw Center Line (Fix: properly access Canvas methods)
            ctx.beginPath();
            if (ctx.setLineDash) ctx.setLineDash([10, 15]);
            ctx.moveTo(game.width / 2, 0);
            ctx.lineTo(game.width / 2, game.height);
            ctx.strokeStyle = "#333";
            ctx.stroke();
            if (ctx.setLineDash) ctx.setLineDash([]);
        }
    }
}

package {
    import PongGame;
    import CanvasRenderer;
    
    public class Main {
        public var game:PongGame;
        public var renderer:CanvasRenderer;
        
        public function Main():void {
            trace("Initializing Pong...");
            game = new PongGame(800, 600);
            renderer = new CanvasRenderer(game);
            setupInput();
            startLoop();
            trace("Game Started! Use W/S for Player 1, Arrow Keys for Player 2.");
        }
        
        public function startLoop():void {
             var self:Main = this;
             var loop:Function = function():void {
                 self.update();
                 window.requestAnimationFrame(loop);
             };
             window.requestAnimationFrame(loop);
        }
        
        public function update():void {
            game.update();
            renderer.draw();
        }

        public function setupInput():void {
             var self:Main = this;
             window.addEventListener("keydown", function(e:*):void {
                if (e.key == "w") self.game.player1.movingUp = true;
                if (e.key == "s") self.game.player1.movingDown = true;
                if (e.key == "ArrowUp") self.game.player2.movingUp = true;
                if (e.key == "ArrowDown") self.game.player2.movingDown = true;
             });
             window.addEventListener("keyup", function(e:*):void {
                if (e.key == "w") self.game.player1.movingUp = false;
                if (e.key == "s") self.game.player1.movingDown = false;
                if (e.key == "ArrowUp") self.game.player2.movingUp = false;
                if (e.key == "ArrowDown") self.game.player2.movingDown = false;
             });
        }
    }
}

package {
    import SimpleUnit;
    import PongGame;
    import Ball;
    import Paddle;
    
    public class TestRunner {
        public function TestRunner():void {
            trace("Running Pong Tests...");
            testBallMovement();
            testPaddleConstraints();
            testScoring();
            trace("Tests Completed.");
        }
        
        public function testBallMovement():void {
            var b:Ball = new Ball(100, 100);
            b.vx = 5;
            b.vy = 0;
            b.update();
            SimpleUnit.assertEquals(105, b.x, "Ball Moves X");
            SimpleUnit.assertEquals(100, b.y, "Ball Y const");
        }
        
        public function testPaddleConstraints():void {
             var p:Paddle = new Paddle(0, 0);
             p.movingUp = true;
             p.speed = 10;
             p.update(600);
             SimpleUnit.assertEquals(0, p.y, "Paddle Top Clamp");
             p.movingUp = false;
             p.movingDown = true;
             p.y = 595; 
             p.update(600);
             SimpleUnit.assertEquals(550, p.y, "Paddle Bottom Clamp");
        }
        
        public function testScoring():void {
            var g:PongGame = new PongGame(800, 600);
            g.ball.x = -10;
            g.update();
            SimpleUnit.assertEquals(1, g.player2.score, "Player 2 Score Increment");
            g.ball.x = 810;
            g.update();
            SimpleUnit.assertEquals(1, g.player1.score, "Player 1 Score Increment");
        }
    }
}\`;
        
        editor.value = defaultCode;

        function compileAndRun(entryPoint) {
           testOutput.innerHTML = '';
           logToTest("Compiling...", null);
           
           const src = editor.value;
           
           try {
               if (typeof window.AS3JS === 'undefined') throw new Error("AS3JS library not loaded correctly.");
               
               const CompilerClass = window['com.mcleodgaming.as3js.Main'];
               if (!CompilerClass) throw new Error("Compiler class not valid. Check library loading.");
               
               const compilerInstance = new CompilerClass();
               
               // FIX: Split source by package to handle multiple packages in one file
               // Regex finds "package" keyword at start of line or after newline
               const packages = src.split(/(?=^package\\s+|[\\r\\n]+package\\s+)/g)
                                   .map(p => p.trim())
                                   .filter(p => p.length > 0);
               
               console.log("Found packages:", packages.length);
               
               const allPackages = [SimpleUnitSource, ...packages];
               
               const result = compilerInstance.compile({
                   srcPaths: {}, 
                   rawPackages: allPackages,
                   entry: entryPoint, 
                   entryMode: "instance",
                   silent: true,
                   verbose: false
               });
               
               logToTest("Compilation successful.", true);
               
               const iframe = document.getElementById('sandbox');
               iframe.src = 'about:blank';
               
               setTimeout(() => {
                   window.trace = function(msg) {
                       logToConsole(msg, 'info');
                       if (typeof msg === 'string') {
                           if (msg.startsWith('[PASS]')) logToTest(msg, true);
                           else if (msg.startsWith('[FAIL]')) logToTest(msg, false);
                       }
                   };
                   
                   const originalLog = console.log;
                   console.log = function() {
                       logToConsole(Array.from(arguments).join(" "), 'info');
                   };
                   
                   try {
                       eval(result.compiledSource);
                   } catch (e) {
                       logToTest("Runtime Error: " + e.message, false);
                       console.error(e);
                   }
               }, 10);
               
           } catch (e) {
               logToTest("Compiler Error: " + e.message, false);
               console.error(e);
           }
        }
        
        function runCode() { compileAndRun("Main"); }
        function runTests() { compileAndRun("TestRunner"); }
    </script>
</body>
</html>`;

    fs.appendFileSync(outputPath, logicScript);
    console.log(`Generated ${outputPath}`);

} catch (err) {
    console.error('Error generating index.html:', err);
    process.exit(1);
}

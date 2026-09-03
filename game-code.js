// ============================================
// DEVAST.IO MOD MENU - Generic Version
// ============================================

(function() {
    'use strict';

    // ===== CONFIG =====
    const MOD_CONFIG = {
        aimbot: true,
        autoLoot: true,
        speedHack: false,
        healthDisplay: true,
        enemyESP: true,
        aimbotFOV: 150, // pixels
        aimbotSensitivity: 0.5,
        speedMultiplier: 1.5
    };

    // ===== GAME STATE =====
    let gameState = {
        player: null,
        enemies: [],
        items: [],
        canvas: null,
        ctx: null
    };

    // ===== MENU UI =====
    function createMenu() {
        const menu = document.createElement('div');
        menu.id = 'devast-mod-menu';
        menu.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            width: 280px;
            background: rgba(0, 0, 0, 0.9);
            border: 2px solid #00ff00;
            border-radius: 8px;
            padding: 15px;
            font-family: Arial, sans-serif;
            font-size: 12px;
            color: #00ff00;
            z-index: 10000;
            box-shadow: 0 0 10px rgba(0, 255, 0, 0.5);
        `;

        menu.innerHTML = `
            <div style="text-align: center; font-weight: bold; margin-bottom: 10px; font-size: 14px;">
                ⚔️ DEVAST MOD MENU
            </div>
            <div style="border-bottom: 1px solid #00ff00; margin-bottom: 10px;"></div>
            
            <div style="margin: 8px 0;">
                <label>
                    <input type="checkbox" id="aimbot-toggle" ${MOD_CONFIG.aimbot ? 'checked' : ''}>
                    🎯 Aimbot
                </label>
            </div>
            
            <div style="margin: 8px 0;">
                <label>
                    <input type="checkbox" id="autoloot-toggle" ${MOD_CONFIG.autoLoot ? 'checked' : ''}>
                    📦 AutoLoot
                </label>
            </div>
            
            <div style="margin: 8px 0;">
                <label>
                    <input type="checkbox" id="speedhack-toggle" ${MOD_CONFIG.speedHack ? 'checked' : ''}>
                    ⚡ Speed Hack
                </label>
            </div>
            
            <div style="margin: 8px 0;">
                <label>
                    <input type="checkbox" id="health-toggle" ${MOD_CONFIG.healthDisplay ? 'checked' : ''}>
                    ❤️ Health Display
                </label>
            </div>
            
            <div style="margin: 8px 0;">
                <label>
                    <input type="checkbox" id="esp-toggle" ${MOD_CONFIG.enemyESP ? 'checked' : ''}>
                    👁️ Enemy ESP
                </label>
            </div>
            
            <div style="border-top: 1px solid #00ff00; margin: 10px 0; padding-top: 10px;">
                <div style="font-size: 10px; color: #888;">
                    FOV: <input type="number" id="fov-input" value="${MOD_CONFIG.aimbotFOV}" style="width: 50px; background: #111; color: #0f0; border: 1px solid #0f0;">
                </div>
            </div>
            
            <div style="text-align: center; font-size: 10px; color: #666; margin-top: 10px;">
                Status: <span id="mod-status">Ready</span>
            </div>
        `;

        document.body.appendChild(menu);
        attachMenuListeners();
    }

    // ===== MENU LISTENERS =====
    function attachMenuListeners() {
        document.getElementById('aimbot-toggle').addEventListener('change', (e) => {
            MOD_CONFIG.aimbot = e.target.checked;
            updateStatus('Aimbot ' + (e.target.checked ? 'ON' : 'OFF'));
        });

        document.getElementById('autoloot-toggle').addEventListener('change', (e) => {
            MOD_CONFIG.autoLoot = e.target.checked;
            updateStatus('AutoLoot ' + (e.target.checked ? 'ON' : 'OFF'));
        });

        document.getElementById('speedhack-toggle').addEventListener('change', (e) => {
            MOD_CONFIG.speedHack = e.target.checked;
            updateStatus('SpeedHack ' + (e.target.checked ? 'ON' : 'OFF'));
        });

        document.getElementById('health-toggle').addEventListener('change', (e) => {
            MOD_CONFIG.healthDisplay = e.target.checked;
            updateStatus('Health Display ' + (e.target.checked ? 'ON' : 'OFF'));
        });

        document.getElementById('esp-toggle').addEventListener('change', (e) => {
            MOD_CONFIG.enemyESP = e.target.checked;
            updateStatus('ESP ' + (e.target.checked ? 'ON' : 'OFF'));
        });

        document.getElementById('fov-input').addEventListener('change', (e) => {
            MOD_CONFIG.aimbotFOV = parseInt(e.target.value) || 150;
        });
    }

    function updateStatus(msg) {
        const status = document.getElementById('mod-status');
        if (status) {
            status.textContent = msg;
            setTimeout(() => {
                status.textContent = 'Ready';
            }, 2000);
        }
    }

    // ===== AIMBOT LOGIC =====
    function findClosestEnemy() {
        // Devast.io game state'den düşmen araştır
        if (!gameState.player) return null;

        let closest = null;
        let closestDist = MOD_CONFIG.aimbotFOV;

        // Try common game object locations
        const checkObjects = [
            window.game?.players,
            window.game?.enemies,
            window.gameState?.players,
            window.players,
            window.enemies
        ];

        for (let obj of checkObjects) {
            if (Array.isArray(obj)) {
                obj.forEach(enemy => {
                    if (enemy && enemy !== gameState.player && enemy.alive !== false) {
                        const dist = calculateDistance(gameState.player, enemy);
                        if (dist < closestDist) {
                            closestDist = dist;
                            closest = enemy;
                        }
                    }
                });
            }
        }

        return closest;
    }

    function calculateDistance(player, enemy) {
        if (!player || !enemy) return Infinity;
        
        const dx = (enemy.x || enemy.px || 0) - (player.x || player.px || 0);
        const dy = (enemy.y || enemy.py || 0) - (player.y || player.py || 0);
        
        return Math.sqrt(dx * dx + dy * dy);
    }

    function aimAtEnemy(enemy) {
        if (!MOD_CONFIG.aimbot || !enemy || !gameState.player) return;

        // Try to set player rotation/angle to face enemy
        if (gameState.player && enemy) {
            const dx = (enemy.x || enemy.px) - (gameState.player.x || gameState.player.px);
            const dy = (enemy.y || enemy.py) - (gameState.player.y || gameState.player.py);
            
            const angle = Math.atan2(dy, dx);
            
            // Try common angle properties
            gameState.player.angle = angle;
            gameState.player.rotation = angle;
            gameState.player.dir = angle;
        }
    }

    // ===== AUTOLOOT LOGIC =====
    function autoLootNearby() {
        if (!MOD_CONFIG.autoLoot || !gameState.player) return;

        const checkObjects = [
            window.game?.items,
            window.game?.loot,
            window.gameState?.items,
            window.items,
            window.loot
        ];

        for (let obj of checkObjects) {
            if (Array.isArray(obj)) {
                obj.forEach(item => {
                    if (item && calculateDistance(gameState.player, item) < 100) {
                        // Try to trigger pickup
                        if (typeof item.pickup === 'function') {
                            item.pickup();
                        }
                        if (item.collect) item.collect();
                        if (item.take) item.take();
                    }
                });
            }
        }
    }

    // ===== SPEED HACK =====
    function applySpeedHack() {
        if (!MOD_CONFIG.speedHack || !gameState.player) return;

        const multiplier = MOD_CONFIG.speedMultiplier;
        
        if (gameState.player.speed) {
            gameState.player.baseSpeed = gameState.player.baseSpeed || gameState.player.speed;
            gameState.player.speed = gameState.player.baseSpeed * multiplier;
        }
        
        if (gameState.player.velocity) {
            gameState.player.velocity *= multiplier;
        }
    }

    // ===== HEALTH DISPLAY =====
    function drawHealthDisplay() {
        if (!MOD_CONFIG.healthDisplay || !gameState.ctx) return;

        const ctx = gameState.ctx;
        
        // Draw player health
        if (gameState.player) {
            const health = gameState.player.health || 100;
            const maxHealth = gameState.player.maxHealth || 100;
            
            ctx.font = "14px Arial";
            ctx.fillStyle = "#00ff00";
            ctx.fillText(`HP: ${health}/${maxHealth}`, 20, 40);
        }

        // Draw nearby enemies health
        if (MOD_CONFIG.enemyESP) {
            const checkObjects = [
                window.game?.players,
                window.game?.enemies,
                window.gameState?.players,
                window.players,
                window.enemies
            ];

            let yOffset = 80;
            for (let obj of checkObjects) {
                if (Array.isArray(obj)) {
                    obj.slice(0, 5).forEach(enemy => {
                        if (enemy && enemy !== gameState.player) {
                            const dist = calculateDistance(gameState.player, enemy);
                            if (dist < 500) {
                                const health = enemy.health || 100;
                                ctx.fillStyle = dist < 200 ? "#ff0000" : "#ffff00";
                                ctx.fillText(`Enemy: ${health}hp (${Math.round(dist)}m)`, 20, yOffset);
                                yOffset += 20;
                            }
                        }
                    });
                }
            }
        }
    }

    // ===== MAIN GAME LOOP =====
    function gameLoop() {
        // Get game objects
        gameState.player = window.game?.player || 
                          window.gameState?.player || 
                          window.player ||
                          document.querySelector('[data-player]');

        // Get canvas for drawing
        if (!gameState.canvas) {
            gameState.canvas = document.querySelector('canvas');
            if (gameState.canvas) {
                gameState.ctx = gameState.canvas.getContext('2d');
            }
        }

        // Execute mods
        if (MOD_CONFIG.aimbot) {
            const enemy = findClosestEnemy();
            if (enemy) aimAtEnemy(enemy);
        }

        if (MOD_CONFIG.autoLoot) {
            autoLootNearby();
        }

        if (MOD_CONFIG.speedHack) {
            applySpeedHack();
        }

        drawHealthDisplay();

        requestAnimationFrame(gameLoop);
    }

    // ===== INIT =====
    function init() {
        console.log('🎮 Devast.io Mod Menu Loaded!');
        createMenu();
        gameLoop();
    }

    // Start when DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

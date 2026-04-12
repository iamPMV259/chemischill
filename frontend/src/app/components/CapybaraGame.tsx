import { useEffect, useRef, useState } from 'react';
import { Button } from './ui/button';
import { useLanguage } from '../contexts/LanguageContext';

export default function CapybaraGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const { t } = useLanguage();

  useEffect(() => {
    if (!gameStarted || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let capybaraY = 150;
    let capybaraVelocity = 0;
    const gravity = 0.6;
    const jumpPower = -12;
    let obstacles: Array<{ x: number; passed: boolean }> = [];
    let gameSpeed = 5;
    let currentScore = 0;

    const capybaraWidth = 40;
    const capybaraHeight = 40;
    const obstacleWidth = 30;
    const obstacleHeight = 60;

    const handleJump = (e: KeyboardEvent) => {
      if (e.code === 'Space' && capybaraY >= 150) {
        capybaraVelocity = jumpPower;
      }
    };

    window.addEventListener('keydown', handleJump);

    const drawCapybara = () => {
      ctx.fillStyle = '#8B4513';
      ctx.fillRect(50, capybaraY, capybaraWidth, capybaraHeight);

      // Head
      ctx.fillStyle = '#A0522D';
      ctx.beginPath();
      ctx.arc(70, capybaraY + 15, 15, 0, Math.PI * 2);
      ctx.fill();

      // Eyes
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(65, capybaraY + 12, 3, 0, Math.PI * 2);
      ctx.arc(75, capybaraY + 12, 3, 0, Math.PI * 2);
      ctx.fill();

      // Legs
      ctx.fillStyle = '#8B4513';
      ctx.fillRect(55, capybaraY + 35, 8, 15);
      ctx.fillRect(77, capybaraY + 35, 8, 15);
    };

    const drawObstacle = (x: number) => {
      // Flask body
      ctx.fillStyle = '#4A90E2';
      ctx.fillRect(x, 250 - obstacleHeight, obstacleWidth, obstacleHeight - 15);

      // Flask neck
      ctx.fillRect(x + 8, 250 - obstacleHeight - 10, 14, 10);

      // Flask opening
      ctx.fillStyle = '#3A7BC8';
      ctx.fillRect(x + 6, 250 - obstacleHeight - 12, 18, 2);

      // Liquid
      ctx.fillStyle = '#00CED1';
      ctx.globalAlpha = 0.6;
      ctx.fillRect(x + 3, 250 - obstacleHeight + 20, obstacleWidth - 6, obstacleHeight - 35);
      ctx.globalAlpha = 1.0;
    };

    const checkCollision = (obstacleX: number) => {
      const capybaraLeft = 50;
      const capybaraRight = 50 + capybaraWidth;
      const capybaraTop = capybaraY;
      const capybaraBottom = capybaraY + capybaraHeight;

      const obstacleLeft = obstacleX;
      const obstacleRight = obstacleX + obstacleWidth;
      const obstacleTop = 250 - obstacleHeight;
      const obstacleBottom = 250;

      return (
        capybaraRight > obstacleLeft &&
        capybaraLeft < obstacleRight &&
        capybaraBottom > obstacleTop &&
        capybaraTop < obstacleBottom
      );
    };

    const gameLoop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw ground
      ctx.fillStyle = '#D4A574';
      ctx.fillRect(0, 250, canvas.width, 50);

      // Update capybara position
      capybaraVelocity += gravity;
      capybaraY += capybaraVelocity;

      if (capybaraY > 150) {
        capybaraY = 150;
        capybaraVelocity = 0;
      }

      drawCapybara();

      // Spawn obstacles
      if (obstacles.length === 0 || obstacles[obstacles.length - 1].x < canvas.width - 300) {
        obstacles.push({ x: canvas.width, passed: false });
      }

      // Update and draw obstacles
      obstacles = obstacles.filter((obstacle) => {
        obstacle.x -= gameSpeed;

        if (obstacle.x > -obstacleWidth) {
          drawObstacle(obstacle.x);

          if (checkCollision(obstacle.x)) {
            setGameOver(true);
            setGameStarted(false);
            setScore(currentScore);
            return false;
          }

          if (!obstacle.passed && obstacle.x + obstacleWidth < 50) {
            obstacle.passed = true;
            currentScore += 1;
          }

          return true;
        }
        return false;
      });

      // Draw score
      ctx.fillStyle = '#000';
      ctx.font = '20px Arial';
      ctx.fillText(`${t('game.score')}: ${currentScore}`, 10, 30);

      // Increase difficulty
      if (currentScore > 0 && currentScore % 5 === 0) {
        gameSpeed = 5 + Math.floor(currentScore / 5) * 0.5;
      }

      animationId = requestAnimationFrame(gameLoop);
    };

    gameLoop();

    return () => {
      window.removeEventListener('keydown', handleJump);
      cancelAnimationFrame(animationId);
    };
  }, [gameStarted, t]);

  const startGame = () => {
    setGameStarted(true);
    setGameOver(false);
    setScore(0);
  };

  return (
    <div className="bg-white rounded-xl p-8 shadow-lg">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold mb-2">{t('game.title')}</h2>
        <p className="text-gray-600">{t('game.subtitle')}</p>
      </div>

      <div className="relative">
        <canvas
          ref={canvasRef}
          width={800}
          height={300}
          className="border-2 border-gray-300 rounded-lg mx-auto bg-gradient-to-b from-sky-200 to-sky-100"
        />

        {!gameStarted && !gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 rounded-lg">
            <Button
              onClick={startGame}
              size="lg"
              className="bg-white text-blue-700 hover:bg-blue-50"
            >
              {t('game.start')}
            </Button>
            <p className="text-white mt-4">{t('game.pressSpace')}</p>
          </div>
        )}

        {gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 rounded-lg">
            <div className="bg-white p-8 rounded-xl text-center">
              <h3 className="text-2xl font-bold mb-4">{t('game.gameOver')}</h3>
              <p className="text-xl mb-6">
                {t('game.score')}: <span className="font-bold text-blue-600">{score}</span>
              </p>
              <Button onClick={startGame} size="lg">
                {t('game.restart')}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

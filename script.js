window.onload = function () {
  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;

  let lungX = canvas.width / 2 - 40;
  let lungY = canvas.height - 100;
  let speed = 8;
  let health = 100;
  let badBreaths = 0;
  let bonusUsed = 0;
  let tempNeutralFrames = 0;
  const objects = [];

  const images = {
    tree: new Image(),
    o2: new Image(),
    cigarette: new Image(),
    bonus: new Image(),
    lungHappy: new Image(),
    lungNeutral: new Image(),
    lungSick: new Image()
  };

  images.tree.src = "images/tree.png";
  images.o2.src = "images/o2.png";
  images.cigarette.src = "images/cigarette.png";
  images.bonus.src = "images/bonus.png";
  images.lungHappy.src = "images/lung_happy.png";
  images.lungNeutral.src = "images/lung_neutral.png";
  images.lungSick.src = "images/lung_sick.png";

  let isDragging = false;
  let touchOffsetX = 0;

  document.addEventListener("keydown", function (e) {
    if (e.key === "ArrowLeft") lungX -= speed;
    if (e.key === "ArrowRight") lungX += speed;
  });

  canvas.addEventListener("touchstart", function (e) {
    const touch = e.touches[0];
    const touchX = touch.clientX - canvas.getBoundingClientRect().left;
    if (touchX >= lungX && touchX <= lungX + 80) {
      isDragging = true;
      touchOffsetX = touchX - lungX;
    }
  });

  canvas.addEventListener("touchmove", function (e) {
    if (!isDragging) return;
    const touch = e.touches[0];
    const touchX = touch.clientX - canvas.getBoundingClientRect().left;
    lungX = touchX - touchOffsetX;
    if (lungX < 0) lungX = 0;
    if (lungX > canvas.width - 80) lungX = canvas.width - 80;
    e.preventDefault();
  }, { passive: false });

  canvas.addEventListener("touchend", function () {
    isDragging = false;
  });

  function drawLungs() {
    if (tempNeutralFrames > 0) tempNeutralFrames--;
    let lungImage;
    if (badBreaths >= 10 || tempNeutralFrames > 0) {
      lungImage = images.lungNeutral;
    } else if (health > 70) {
      lungImage = images.lungHappy;
    } else if (health > 30) {
      lungImage = images.lungNeutral;
    } else {
      lungImage = images.lungSick;
    }
    if (lungImage.complete && lungImage.naturalHeight !== 0) {
      ctx.drawImage(lungImage, lungX, lungY, 80, 80);
    }
  }

  function drawObjects() {
    for (let obj of objects) {
      const img = images[obj.subtype];
      if (img.complete && img.naturalHeight !== 0) {
        ctx.drawImage(img, obj.x, obj.y, 40, 40);
      }
    }
  }

  function isColliding(obj) {
    return (
      obj.x < lungX + 80 &&
      obj.x + 40 > lungX &&
      obj.y < lungY + 80 &&
      obj.y + 40 > lungY
    );
  }

  function spawnObject() {
    const goodTypes = ["tree", "o2"];
    const badTypes = ["cigarette"];
    let type = "good";
    let subtype = goodTypes[Math.floor(Math.random() * goodTypes.length)];
    if (bonusUsed < 2 && Math.random() < 0.02) {
      type = "bonus";
      subtype = "bonus";
      bonusUsed++;
    } else if (Math.random() < 0.4) {
      type = "bad";
      subtype = badTypes[Math.floor(Math.random() * badTypes.length)];
    }
    const x = Math.random() * (canvas.width - 40);
    const y = -40;
    const speed = 2 + Math.random() * 2;
    objects.push({ x, y, speed, type, subtype });
  }

  function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawLungs();
    drawObjects();
    for (let i = objects.length - 1; i >= 0; i--) {
      let obj = objects[i];
      obj.y += obj.speed;
      if (isColliding(obj)) {
        if (obj.type === "bad") {
          badBreaths++;
          health -= 5;
          tempNeutralFrames = 30;
        } else if (obj.type === "good") {
          health += 2;
          if (health > 100) health = 100;
        } else if (obj.type === "bonus") {
          health += Math.floor(100 / 3);
          if (health > 100) health = 100;
        }
        objects.splice(i, 1);
      } else if (obj.y > canvas.height) {
        objects.splice(i, 1);
      }
    }
    ctx.fillStyle = "black";
    ctx.font = "20px Arial";
    ctx.fillText("Salute: " + health, 10, 30);
    ctx.fillText("Fumo inalato: " + badBreaths + "/20", 10, 60);
    if (badBreaths >= 20) {
      ctx.fillStyle = "red";
      ctx.font = "40px Arial";
      ctx.fillText("GAME OVER", canvas.width / 2 - 120, canvas.height / 2);
      return;
    }
    requestAnimationFrame(gameLoop);
  }

  const checkImagesLoaded = setInterval(() => {
    if (Object.values(images).every(img => img.complete && img.naturalHeight !== 0)) {
      clearInterval(checkImagesLoaded);
      setInterval(spawnObject, 1200);
      gameLoop();
    }
  }, 100);
};

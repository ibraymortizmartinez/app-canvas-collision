const canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

// Obtiene las dimensiones de la pantalla actual
const window_height = window.innerHeight;
const window_width = window.innerWidth;
canvas.height = window_height;
canvas.width = window_width;
canvas.style.background = "#000000";

// Variables para almacenar las coordenadas del mouse
let mouseX = 0;
let mouseY = 0;

// Clase para representar círculos
class Circle {
  constructor(x, radius, color, textColor, text, speed) {
    this.posX = x;
    this.posY = window_height - radius - 5; // Justo antes del margen inferior
    this.radius = radius;
    this.originalColor = color;
    this.color = color;
    this.textColor = textColor;
    this.text = text;
    this.speed = speed;
    this.dx = (Math.random() < 0.5 ? -1 : 1) * this.speed; // Movimiento horizontal aleatorio
    this.dy = -Math.random() * 2 - 1; // Movimiento hacia arriba (negativo) con velocidad aleatoria
    this.isFlashing = false;
    this.flashTimer = 0;
  }

  draw(context) {
    context.beginPath();
    context.strokeStyle = this.color;
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.font = "20px Arial";
    context.fillStyle = this.textColor; // Color del texto
    context.fillText(this.text, this.posX, this.posY);
    context.lineWidth = 2;
    context.arc(this.posX, this.posY, this.radius, 0, Math.PI * 2, false);
    context.stroke();
    context.closePath();
  }

  update(context, circles) {
    this.draw(context);

    // Actualizar la posición X
    this.posX += this.dx;
    if (this.posX + this.radius > window_width || this.posX - this.radius < 0) {
      this.dx = -this.dx;
    }

    // Actualizar la posición Y para moverse hacia arriba
    this.posY += this.dy;
    if (this.posY - this.radius < 0) {
      // Reiniciar el círculo en la parte inferior si llega al borde superior
      this.posY = window_height - this.radius - 5;
      this.posX = Math.random() * (window_width - this.radius * 2) + this.radius;
    }

    // Revisar colisiones con otros círculos
    this.checkCollisions(circles);

    // Controlar el flasheo
    if (this.isFlashing) {
      this.flashTimer--;
      if (this.flashTimer <= 0) {
        this.isFlashing = false;
        this.color = this.originalColor; // Regresar al color original
      }
    }
  }

  checkCollisions(circles) {
    circles.forEach(circle => {
      if (this !== circle) { // No comparar el círculo consigo mismo
        const dx = this.posX - circle.posX;
        const dy = this.posY - circle.posY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Verificar si están colisionando
        if (distance < this.radius + circle.radius) {
          // Flasheo en color azul
          this.color = "#0000FF";
          this.isFlashing = true;
          this.flashTimer = 5;

          circle.color = "#0000FF";
          circle.isFlashing = true;
          circle.flashTimer = 5;

          // Invertir la dirección solo si hay colisión
          const angle = Math.atan2(dy, dx);
          const overlap = this.radius + circle.radius - distance;

          // Separar los círculos para evitar que se “jalen”
          this.posX += Math.cos(angle) * overlap / 2;
          this.posY += Math.sin(angle) * overlap / 2;
          circle.posX -= Math.cos(angle) * overlap / 2;
          circle.posY -= Math.sin(angle) * overlap / 2;

          // Rebotar en dirección opuesta
          [this.dx, circle.dx] = [circle.dx, this.dx];
          [this.dy, circle.dy] = [circle.dy, this.dy];
        }
      }
    });
  }
}

// Crear un array para almacenar N círculos
let circles = [];

// Función para generar círculos aleatorios
function generateCircles(n) {
  for (let i = 0; i < n; i++) {
    let radius = Math.random() * 30 + 20; // Radio entre 20 y 50
    let x = Math.random() * (window_width - radius * 2) + radius;
    let color = `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`; // Color aleatorio del borde
    let textColor = `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`; // Color aleatorio del texto
    let speed = Math.random() * 4 + 1; // Velocidad entre 1 y 5
    let text = `C${i + 1}`; // Etiqueta del círculo
    circles.push(new Circle(x, radius, color, textColor, text, speed));
  }
}

// Función para animar los círculos
function animate() {
  ctx.clearRect(0, 0, window_width, window_height); // Limpiar el canvas
  circles.forEach(circle => {
    circle.update(ctx, circles); // Actualizar cada círculo
  });
  requestAnimationFrame(animate); // Repetir la animación
}

// Función para detectar clics y eliminar círculos
canvas.addEventListener('click', (event) => {
  const rect = canvas.getBoundingClientRect();
  const mouseX = event.clientX - rect.left;
  const mouseY = event.clientY - rect.top;

  for (let i = 0; i < circles.length; i++) {
    const circle = circles[i];
    // Calcular la distancia entre el círculo y el mouse
    const distance = Math.sqrt((mouseX - circle.posX) ** 2 + (mouseY - circle.posY) ** 2);
    
    // Comprobar si el clic ocurrió dentro del círculo
    if (distance < circle.radius) {
      // Eliminar el círculo del array
      circles.splice(i, 1);
      break; // Salir del bucle una vez que se elimina el círculo
    }
  }
});

// Generar N círculos y comenzar la animación
generateCircles(10); // Puedes cambiar el número de círculos aquí
animate();

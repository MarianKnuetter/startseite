// ====================================================
// 1. DYNAMIC TIME WIDGET
// ====================================================
const timeWidget = document.getElementById('time-widget');

function updateTime() {
  const now = new Date();

  const options = {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  };

  timeWidget.textContent = now.toLocaleDateString('de-DE', options);
}

setInterval(updateTime, 1000);
updateTime();

// ====================================================
// 2. THERMOSTAT DIAL CONTROL
// ====================================================
let currentTemp = 21.5;
const minTemp = 16.0;
const maxTemp = 30.0;

const tempVal = document.getElementById('temp-val');
const climateMode = document.getElementById('climate-mode');
const dialFill = document.getElementById('dial-fill');
const dialIndicator = document.getElementById('dial-indicator');
const cardClimate = document.getElementById('card-climate');

const btnDown = document.getElementById('temp-down');
const btnUp = document.getElementById('temp-up');

function updateThermostat() {
  // Update text
  tempVal.textContent = currentTemp.toFixed(1) + '°C';

  // Eco vs Komfort Mode
  if (currentTemp >= 18 && currentTemp <= 22) {
    climateMode.textContent = 'Eco-Modus';
    climateMode.style.color = 'var(--color-accent-blue)';
    climateMode.style.background = 'rgba(0, 242, 254, 0.08)';
    dialFill.style.stroke = 'var(--color-accent-blue)';
  } else if (currentTemp > 22 && currentTemp <= 25) {
    climateMode.textContent = 'Komfort-Modus';
    climateMode.style.color = 'var(--color-accent-orange)';
    climateMode.style.background = 'rgba(245, 158, 11, 0.08)';
    dialFill.style.stroke = 'var(--color-accent-orange)';
  } else {
    climateMode.textContent = 'Boost-Modus';
    climateMode.style.color = 'var(--color-accent-red)';
    climateMode.style.background = 'rgba(239, 68, 68, 0.08)';
    dialFill.style.stroke = 'var(--color-accent-red)';
  }

  // Calculate stroke dashoffset
  // Circumference = 2 * Math.PI * 80 = 502
  // We want to fill between 0 and 270 degrees (dashoffset from 502 to 125)
  const ratio = (currentTemp - minTemp) / (maxTemp - minTemp);
  const strokeOffset = 502 - (ratio * 376); // Max fill arc is 376px
  dialFill.style.strokeDashoffset = strokeOffset;

  // Rotate indicator circle
  // Arc starts at -225 degrees (bottom left) to +45 degrees (bottom right)
  const angle = -225 + (ratio * 270);
  dialIndicator.setAttribute('transform', `rotate(${angle}, 100, 100)`);

  // Add log entry
  addLog(`Heizung Zieltemperatur auf ${currentTemp.toFixed(1)}°C geändert.`);
}

btnDown.addEventListener('click', () => {
  if (currentTemp > minTemp) {
    currentTemp -= 0.5;
    updateThermostat();
  }
});

btnUp.addEventListener('click', () => {
  if (currentTemp < maxTemp) {
    currentTemp += 0.5;
    updateThermostat();
  }
});

// Initialize
updateThermostat();

// ====================================================
// 3. DEVICE SWITCH CONTROLLER
// ====================================================
const switches = document.querySelectorAll('.device-switch');
const powerVal = document.getElementById('power-val');

// Device base power loads in Watts
const deviceLoads = {
  'sw-light-living': 15,
  'sw-light-bed': 15,
  'sw-ac': 220,
  'sw-lock': 5
};

function calculateCurrentPower() {
  let basePower = 110; // Idle standby load

  switches.forEach(sw => {
    if (sw.classList.contains('active')) {
      basePower += deviceLoads[sw.id] || 0;
    }
  });

  // Add some slight random fluctuations (+/- 3 Watts)
  const fluctuation = Math.floor(Math.random() * 7) - 3;
  return Math.max(basePower + fluctuation, 10);
}

function updatePowerDisplay() {
  const currentPower = calculateCurrentPower();
  powerVal.textContent = currentPower + ' W';
  return currentPower;
}

switches.forEach(sw => {
  sw.addEventListener('click', () => {
    sw.classList.toggle('active');
    const isActive = sw.classList.contains('active');

    // Status text update
    const statusLabel = sw.querySelector('.switch-status');
    const deviceName = sw.querySelector('.switch-name').textContent;

    if (sw.id === 'sw-lock') {
      statusLabel.textContent = isActive ? 'VERRIEGELT' : 'ENTRIEGELT';
    } else {
      statusLabel.textContent = isActive ? 'AN' : 'AUS';
    }

    addLog(`${deviceName} wurde ${isActive ? 'eingeschaltet' : 'ausgeschaltet'}.`);
    updatePowerDisplay();
  });
});

// ====================================================
// 4. REALTIME POWER WAVE CHART
// ====================================================
const chartLine = document.getElementById('chart-line');
const chartArea = document.getElementById('chart-area');

// Array of 15 recent power samples
let powerSamples = Array(15).fill(150);

function getChartPath(samples) {
  // SVG grid: 300 width, 100 height.
  // We map samples (ranges 0 to 500W) to Y coordinates (100 to 0).
  const dx = 300 / (samples.length - 1);
  let points = [];

  samples.forEach((val, i) => {
    const x = i * dx;
    // Map 0W to Y=95, 500W to Y=5
    const y = 95 - (val / 500) * 90;
    points.push(`${x},${y}`);
  });

  const lineD = 'M ' + points.join(' L ');
  const areaD = lineD + ` L 300,100 L 0,100 Z`;

  return { lineD, areaD };
}

function tickChart() {
  // Push new power reading and discard oldest
  const currentPower = updatePowerDisplay();
  powerSamples.push(currentPower);
  powerSamples.shift();

  const paths = getChartPath(powerSamples);
  chartLine.setAttribute('d', paths.lineD);
  chartArea.setAttribute('d', paths.areaD);
}

// Tick chart data every 1.5 seconds
setInterval(tickChart, 1500);
tickChart();

// ====================================================
// 5. ACTIVITY LOGS STREAM
// ====================================================
const logsStream = document.getElementById('logs-stream');

function addLog(message) {
  const now = new Date();
  const timeStr = now.toTimeString().split(' ')[0]; // HH:MM:SS

  const logDiv = document.createElement('div');
  logDiv.className = 'log-entry';

  const timeSpan = document.createElement('span');
  timeSpan.className = 'log-time';
  timeSpan.textContent = timeStr;

  const msgSpan = document.createElement('span');
  msgSpan.className = 'log-msg';
  msgSpan.textContent = message;

  logDiv.appendChild(timeSpan);
  logDiv.appendChild(msgSpan);

  // Append and scroll to bottom
  logsStream.appendChild(logDiv);
  logsStream.scrollTop = logsStream.scrollHeight;

  // Cap entries at 20 to avoid memory issues
  while (logsStream.children.length > 20) {
    logsStream.removeChild(logsStream.firstChild);
  }
}

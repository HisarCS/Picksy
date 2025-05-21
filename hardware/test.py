import time
import board
import busio
import pwmio
import socket
import network
import urequests
from analogio import AnalogIn
from adafruit_motor import servo
from i2c_lcd import I2cLcd

# === Hardware setup ===
pwm = pwmio.PWMOut(board.GP0, frequency=50)
strummer = servo.Servo(pwm, min_pulse=1000, max_pulse=2000, actuation_range=180)
mic = AnalogIn(board.GP26)
i2c = busio.I2C(scl=board.GP3, sda=board.GP2)
lcd = I2cLcd(i2c, 0x3F, 2, 16)

# === Network setup ===
UDP_PORT = 5005
DISCOVERY_MSG = b"PICO_DISCOVER"
wlan = network.WLAN(network.STA_IF)
wlan.active(True)
wlan.connect("YOUR_WIFI_SSID", "YOUR_WIFI_PASSWORD")  # <- replace with actual credentials
while not wlan.isconnected():
    time.sleep(1)
print("Connected to Wi-Fi")

# Discover server
s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
s.setsockopt(socket.SOL_SOCKET, socket.SO_BROADCAST, 1)
s.settimeout(5)
s.sendto(DISCOVERY_MSG, ("255.255.255.255", UDP_PORT))
print("Broadcast sent, waiting for reply...")
try:
    data, addr = s.recvfrom(1024)
    server_ip = addr[0]
    print(f"Discovered server at {server_ip}")
except:
    print("No response received.")
    s.close()
    raise SystemExit
s.close()
server_url = f"http://{server_ip}:5000/data"

# === Tunables ===
STRUM_ANGLE = 80
REST_ANGLE  = 0
HOLD_TIME   = 0.12
THRESHOLD   = 33_500
DEBOUNCE_MS = 300
PASS_SCORE  = 60
SLOW_FACTOR = 4

ORIG_PATTERNS = [
    [0.5, 0.5, 0.5, 0.5],
    [0.5, 0.25, 0.25, 0.5, 0.5],
    [0.4, 0.4, 0.8, 0.4, 0.4],
    [0.3, 0.3, 0.3, 0.3, 0.3, 0.3],
    [0.5, 0.25, 0.25, 0.5, 0.25, 0.25, 0.5]
]
LEVEL_PATTERNS = [
    [interval * SLOW_FACTOR for interval in pat]
    for pat in ORIG_PATTERNS
]

# === Helpers ===
def do_strum():
    strummer.angle = STRUM_ANGLE
    time.sleep(HOLD_TIME)
    strummer.angle = REST_ANGLE

def display(line1, line2=None, delay=2):
    lcd.clear()
    if line2:
        lcd.putstr(f"{line1}\n{line2}")
    else:
        lcd.putstr(line1)
    time.sleep(delay)

def play_pattern(pattern):
    for interval in pattern:
        do_strum()
        time.sleep(interval)

def assess_user(pattern):
    go_time = time.monotonic()
    hits = []
    last_hit = go_time - (DEBOUNCE_MS / 1000)
    mic_data = []

    while len(hits) < len(pattern):
        now = time.monotonic()
        val = mic.value
        mic_data.append(val)

        if (val > THRESHOLD) and ((now - last_hit) > (DEBOUNCE_MS / 1000)):
            do_strum()
            hits.append(now)
            last_hit = now

    time.sleep(2)

    actual_intervals = []
    for i, t in enumerate(hits):
        if i == 0:
            actual_intervals.append(t - go_time)
        else:
            actual_intervals.append(t - hits[i - 1])

    interval_scores = []
    for actual, expected in zip(actual_intervals, pattern):
        ratio = 1 - abs(actual - expected) / expected
        interval_scores.append(max(0.0, ratio))

    score = (sum(interval_scores) / len(interval_scores)) * 100
    return score, mic_data

def send_data(level, attempt, mic_data):
    try:
        payload = {
            "level": level,
            "attempt": attempt,
            "mic_data": mic_data
        }
        response = urequests.post(server_url, json=payload)
        print("Data sent to server:", response.text)
        response.close()
    except Exception as e:
        print("Failed to send data:", e)

# === Main loop ===
display("Welcome to", "Rhythm Tutor!", 2)
level = 1

while level <= len(LEVEL_PATTERNS):
    pattern = LEVEL_PATTERNS[level - 1]
    attempt = 1

    while True:
        display(f"Level {level}", "Listen...", 2)
        play_pattern(pattern)

        display("Get Ready...", None, 3)
        display("Go!", None, 1)

        score, mic_data = assess_user(pattern)
        score *= 1.2  # more generous scale

        display(f"Score: {int(score)}%", None, 4)

        send_data(level, attempt, mic_data)

        if score >= PASS_SCORE:
            display("Great job!", "Next level...", 2)
            level += 1
            break
        else:
            display("Try again", "Same level", 2)
            attempt += 1

display("Congrats!", "Rhythm Master!", 5)

while True:
    time.sleep(1)

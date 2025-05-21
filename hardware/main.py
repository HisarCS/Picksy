import time
import board
import busio
import pwmio
from analogio import AnalogIn
from adafruit_motor import servo
from i2c_lcd import I2cLcd

# === Hardware setup ===

# Servo on GP0, 50 Hz
pwm = pwmio.PWMOut(board.GP0, frequency=50)
strummer = servo.Servo(pwm, min_pulse=1000, max_pulse=2000, actuation_range=180)

# Mic on GP26/A0
mic = AnalogIn(board.GP26)

# I²C LCD on GP2 (SDA) / GP3 (SCL)
i2c = busio.I2C(scl=board.GP3, sda=board.GP2)
lcd = I2cLcd(i2c, 0x3F, 2, 16)

# === Tunables ===

STRUM_ANGLE = 80        # servo strum position
REST_ANGLE  = 0         # servo rest position
HOLD_TIME   = 0.12      # how long to hold each strum
THRESHOLD   = 33_500    # mic trigger level
DEBOUNCE_MS = 300       # ms between triggers
PASS_SCORE  = 60        # % required to pass a level (more generous)
SLOW_FACTOR = 4         # slow‐down multiplier for all rhythms

# base beat‐interval patterns (seconds)
ORIG_PATTERNS = [
    [0.5, 0.5, 0.5, 0.5],
    [0.5, 0.25, 0.25, 0.5, 0.5],
    [0.4, 0.4, 0.8, 0.4, 0.4],
    [0.3, 0.3, 0.3, 0.3, 0.3, 0.3],
    [0.5, 0.25, 0.25, 0.5, 0.25, 0.25, 0.5]
]

# apply slowdown so servo can keep up
LEVEL_PATTERNS = [
    [interval * SLOW_FACTOR for interval in pat]
    for pat in ORIG_PATTERNS
]

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
    """Demo: servo strums the pattern at each interval."""
    for interval in pattern:
        do_strum()
        time.sleep(interval)

def assess_user(pattern):
    """
    For each beat in `pattern`, wait for mic > THRESHOLD,
    immediately strum back, record the timestamp, then
    compute score by comparing actual vs expected intervals.
    """
    # mark when we start listening
    go_time = time.monotonic()
    hits = []
    last_hit = go_time - (DEBOUNCE_MS / 1000)

    # collect one hit per expected beat
    while len(hits) < len(pattern):
        now = time.monotonic()
        if (mic.value > THRESHOLD) and ((now - last_hit) > (DEBOUNCE_MS / 1000)):
            do_strum()           # echo user hit
            hits.append(now)     # timestamp
            last_hit = now

    # give a bit extra breathing room
    time.sleep(2)

    # build actual intervals: first relative to go_time, then between hits
    actual_intervals = []
    for i, t in enumerate(hits):
        if i == 0:
            actual_intervals.append(t - go_time)
        else:
            actual_intervals.append(t - hits[i - 1])

    # score each interval: ratio of closeness (1.0 = perfect)
    interval_scores = []
    for actual, expected in zip(actual_intervals, pattern):
        ratio = 1 - abs(actual - expected) / expected
        interval_scores.append(max(0.0, ratio))

    # average and scale to 0–100
    return (sum(interval_scores) / len(interval_scores)) * 100

# === Main flow ===

display("Welcome to", "Rhythm Tutor!", 2)

level = 1
while level <= len(LEVEL_PATTERNS):
    pattern = LEVEL_PATTERNS[level - 1]

    # 1) Demo
    display(f"Level {level}", "Listen...", 2)
    play_pattern(pattern)

    # 2) Prep time
    display("Get Ready...", None, 3)

    # 3) Assessment: user plays, servo echoes
    display("Go!", None, 1)
    score = assess_user(pattern)* 1.2

    # 4) Show score (more generous scale)
    display(f"Score: {int(score)}%", None, 4)

    # 5) Advance or retry
    if score >= PASS_SCORE:
        display("Great job!", "Next level...", 2)
        level += 1
    else:
        display("Try again", "Same level", 2)

# All levels complete
display("Congrats!", "Rhythm Master!", 5)

# idle
while True:
    time.sleep(1)

import RPi.GPIO as GPIO
import time

# --- Data Model ---
class TelemetryItem:
    def __init__(self, id, name, unit, value, editable=True):
        self.id = id
        self.name = name
        self.unit = unit
        self.value = value
        self.editable = editable

    def adjust(self, amount):
        if self.editable:
            self.value += amount
            # Printing the specific change so you can verify it works
            print("VALUE CHANGE >> {0}: {1} {2}".format(self.name, self.value, self.unit))

# --- Dashboard Controller ---
class DashboardController:
    def __init__(self, items):
        self.items = items
        self.page = 1
        self.focus = 1

    def get_selected_item(self):
        # Logic: Page 1 (IDs 7-10), Page 2 (IDs 11-14), etc.
        item_id = 6 + ((self.page - 1) * 4) + self.focus
        return self.items.get(item_id)

    def change_page(self, direction):
        self.page = (self.page + direction - 1) % 4 + 1
        item = self.get_selected_item()
        print("--- PAGE CHANGED: {0} (Focused on ID {1}: {2}) ---".format(self.page, item.id, item.name))

    def change_focus(self, direction):
        self.focus = (self.focus + direction - 1) % 4 + 1
        item = self.get_selected_item()
        print("--- FOCUS MOVED: Position {0} (Target: {1}) ---".format(self.focus, item.name))

# --- Initialize Data ---
data_list = [
    {"id": 7, "name": "TV_g", "unit": "", "value": 11},
    {"id": 8, "name": "TC_TV_map", "unit": "", "value": 68},
    {"id": 9, "name": "Mu", "unit": "", "value": 1.6},
    {"id": 10, "name": "Bypass", "unit": "", "value": 0},
    {"id": 11, "name": "Mode", "unit": "", "value": 0},
    {"id": 12, "name": "Rgdis", "unit": "", "value": 55},
    {"id": 13, "name": "Regagg", "unit": "", "value": 0},
    {"id": 14, "name": "Plim", "unit": "", "value": 80},
    {"id": 15, "name": "Plim_reg", "unit": "", "value": 60},
    {"id": 16, "name": "Tmax", "unit": "", "value": 26},
    {"id": 17, "name": "Tmax_reg", "unit": "", "value": 20},
    {"id": 18, "name": "DRS_ON", "unit": "", "value": 1},
    {"id": 19, "name": "Fans_on", "unit": "", "value": 1},
    {"id": 20, "name": "FR_distr", "unit": "", "value": 1},
    {"id": 21, "name": "Keuze_param1", "unit": "", "value": 0},
    {"id": 22, "name": "Keuze_param2", "unit": "", "value": 0}
]

telemetry = {d['id']: TelemetryItem(d['id'], d['name'], d['unit'], d['value']) for d in data_list}
dash = DashboardController(telemetry)

# --- GPIO Setup ---
LR_PINS = {'A': 21, 'B': 20}
RR_PINS = {'A': 26, 'B': 19}
BTN_PAGE_DN = 5
BTN_PAGE_UP = 12
BTN_FOCUS_DN = 6
BTN_FOCUS_UP = 16

GPIO.setmode(GPIO.BCM)
GPIO.setwarnings(False)

nav_pins = [BTN_PAGE_DN, BTN_PAGE_UP, BTN_FOCUS_DN, BTN_FOCUS_UP]
for pin in nav_pins:
    GPIO.setup(pin, GPIO.IN, pull_up_down=GPIO.PUD_UP)

for pins in [LR_PINS, RR_PINS]:
    GPIO.setup(pins['A'], GPIO.IN, pull_up_down=GPIO.PUD_UP)
    GPIO.setup(pins['B'], GPIO.IN, pull_up_down=GPIO.PUD_UP)

# --- Rotary Encoder Logic ---
def handle_rotary(channel):
    # Determine which encoder was turned
    label = "LR" if channel in [21, 20] else "RR"
    pins = LR_PINS if label == "LR" else RR_PINS
    
    clk = GPIO.input(pins['A'])
    dt = GPIO.input(pins['B'])
    
    # LR moves by 10, RR moves by 1
    step = 10 if label == "LR" else 1
    direction = step if clk != dt else -step
    
    selected = dash.get_selected_item()
    if selected:
        selected.adjust(direction)

# Set up interrupts for both encoders
for p in [LR_PINS['A'], RR_PINS['A']]:
    GPIO.add_event_detect(p, GPIO.FALLING, callback=handle_rotary, bouncetime=20)

# --- Main Loop ---
try:
    print("System Booted. Current Selection: {0}".format(dash.get_selected_item().name))
    
    last_states = {pin: GPIO.HIGH for pin in nav_pins}
    last_press_time = 0 
    COOLDOWN = 0.33 # The 1/3 second break

    while True:
        current_time = time.time()
        
        for pin in nav_pins:
            state = GPIO.input(pin)
            
            # Detect button press (Falling edge)
            if state == GPIO.LOW and last_states[pin] == GPIO.HIGH:
                # Apply the 1/3 second cooldown break
                if (current_time - last_press_time) > COOLDOWN:
                    if pin == BTN_PAGE_DN: dash.change_page(-1)
                    elif pin == BTN_PAGE_UP: dash.change_page(1)
                    elif pin == BTN_FOCUS_DN: dash.change_focus(-1)
                    elif pin == BTN_FOCUS_UP: dash.change_focus(1)
                    
                    last_press_time = current_time
            
            last_states[pin] = state
        
        time.sleep(0.01)

except KeyboardInterrupt:
    GPIO.cleanup()
import RPi.GPIO as GPIO
import time
import json

# --- Data Model ---
class TelemetryItem:
    def __init__(self, id, name, unit, value, editable=True):
        self.id = id
        self.name = name
        self.unit = unit
        self.dataType = "numeric"
        self.value = value
        self.editable = editable

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "unit": self.unit,
            "dataType": self.dataType,
            "value": self.value
        }

    def adjust(self, amount, save_callback):
        if self.editable:
            self.value += amount
            # Printing the update to the terminal
            print("VALUE CHANGE >> {0}: {1} {2}".format(self.name, self.value, self.unit))
            save_callback()

# --- Dashboard Controller ---
class DashboardController:
    def __init__(self, items):
        self.items = items
        self.page = 1
        self.focus = 1
        self.autodrive = False
        self.press_history = []
        self.save_to_json()

    def save_to_json(self):
        output = [self.items[i].to_dict() for i in sorted(self.items.keys())]
        output.append({"autodrive": self.autodrive})
        output.append({"page": self.page})
        output.append({"focus": self.focus})
        
        with open('parameters.json', 'w') as f:
            json.dump(output, f, indent=4)

    def check_autodrive(self):
        now = time.time()
        self.press_history.append(now)
        # Filter for last 5 seconds
        self.press_history = [t for t in self.press_history if now - t <= 5]
        
        if len(self.press_history) >= 3:
            self.autodrive = not self.autodrive
            # Printing update to terminal
            print("!!! AUTODRIVE TOGGLED: {0} !!!".format(self.autodrive))
            self.press_history = []
            self.save_to_json()

    def get_selected_item(self):
        item_id = 6 + ((self.page - 1) * 4) + self.focus
        return self.items.get(item_id)

    def change_page(self, direction):
        self.page = (self.page + direction - 1) % 4 + 1
        item = self.get_selected_item()
        # Printing update to terminal
        print("--- PAGE CHANGED: {0} (Focused on: {1}) ---".format(self.page, item.name))
        self.save_to_json()

    def change_focus(self, direction):
        self.focus = (self.focus + direction - 1) % 4 + 1
        item = self.get_selected_item()
        # Printing update to terminal
        print("--- FOCUS MOVED: Position {0} (Target: {1}) ---".format(self.focus, item.name))
        self.save_to_json()

# --- GPIO Configuration ---
GPIO.setmode(GPIO.BCM)
GPIO.setwarnings(False)

LR_PINS = {'A': 21, 'B': 20}
RR_PINS = {'A': 26, 'B': 19}
BTN_PAGE_DN, BTN_PAGE_UP = 5, 12
BTN_FOCUS_DN, BTN_FOCUS_UP = 6, 16
BTN_AUTODRIVE = 13

# Setup Encoders
for pins in [LR_PINS, RR_PINS]:
    GPIO.setup(pins['A'], GPIO.IN, pull_up_down=GPIO.PUD_UP)
    GPIO.setup(pins['B'], GPIO.IN, pull_up_down=GPIO.PUD_UP)

# Setup Navigation Buttons
nav_pins = [BTN_PAGE_DN, BTN_PAGE_UP, BTN_FOCUS_DN, BTN_FOCUS_UP, BTN_AUTODRIVE]
for pin in nav_pins:
    GPIO.setup(pin, GPIO.IN, pull_up_down=GPIO.PUD_UP)

# --- Initialize Data ---
data_list = [
    {"id": 1, "name": "Core Temp", "unit": "°C", "value": 150.0, "edit": False},
    {"id": 2, "name": "Break Pressure", "unit": "bar", "value": 10.0, "edit": False},
    {"id": 3, "name": "Coolant Flow Rate", "unit": "L/min", "value": 50.0, "edit": False},
    {"id": 4, "name": "Valve Status A1", "unit": "", "value": 1, "edit": False},
    {"id": 5, "name": "Power Output", "unit": "kW", "value": 800.0, "edit": False},
    {"id": 6, "name": "Rotation Speed", "unit": "RPM", "value": 1500, "edit": False},
    {"id": 7, "name": "TV_g", "unit": "", "value": 11, "edit": True},
    {"id": 8, "name": "TC_TV_map", "unit": "", "value": 68, "edit": True},
    {"id": 9, "name": "Mu", "unit": "", "value": 1.6, "edit": True},
    {"id": 10, "name": "Bypass", "unit": "", "value": 0, "edit": True},
    {"id": 11, "name": "Mode", "unit": "", "value": 0, "edit": True},
    {"id": 12, "name": "Rgdis", "unit": "", "value": 55, "edit": True},
    {"id": 13, "name": "Regagg", "unit": "", "value": 0, "edit": True},
    {"id": 14, "name": "Plim", "unit": "", "value": 80, "edit": True},
    {"id": 15, "name": "Plim_reg", "unit": "", "value": 60, "edit": True},
    {"id": 16, "name": "Tmax", "unit": "", "value": 26, "edit": True},
    {"id": 17, "name": "Tmax_reg", "unit": "", "value": 20, "edit": True},
    {"id": 18, "name": "DRS_ON", "unit": "", "value": 1, "edit": True},
    {"id": 19, "name": "Fans_on", "unit": "", "value": 1, "edit": True},
    {"id": 20, "name": "FR_distr", "unit": "", "value": 1, "edit": True},
    {"id": 21, "name": "Keuze_param1", "unit": "", "value": 0, "edit": True},
    {"id": 22, "name": "Keuze_param2", "unit": "", "value": 0, "edit": True}
]

telemetry = {d['id']: TelemetryItem(d['id'], d['name'], d['unit'], d['value'], d['edit']) for d in data_list}
dash = DashboardController(telemetry)

# --- Rotary Logic ---
def handle_rotary(channel):
    label = "LR" if channel in LR_PINS.values() else "RR"
    pins = LR_PINS if label == "LR" else RR_PINS
    
    clk = GPIO.input(pins['A'])
    dt = GPIO.input(pins['B'])
    
    step = 10 if label == "LR" else 1
    direction = step if clk != dt else -step
    
    selected = dash.get_selected_item()
    if selected:
        selected.adjust(direction, dash.save_to_json)

# Add interrupts for encoders
for p in [LR_PINS['A'], RR_PINS['A']]:
    GPIO.add_event_detect(p, GPIO.FALLING, callback=handle_rotary, bouncetime=15)

# --- Main Loop ---
try:
    print("System Ready. Current Selection: {0}".format(dash.get_selected_item().name))
    last_states = {pin: GPIO.HIGH for pin in nav_pins}
    last_press_time = 0
    COOLDOWN = 0.33

    while True:
        current_time = time.time()
        for pin in nav_pins:
            state = GPIO.input(pin)
            if state == GPIO.LOW and last_states[pin] == GPIO.HIGH:
                if (current_time - last_press_time) > COOLDOWN:
                    if pin == BTN_PAGE_DN: dash.change_page(-1)
                    elif pin == BTN_PAGE_UP: dash.change_page(1)
                    elif pin == BTN_FOCUS_DN: dash.change_focus(-1)
                    elif pin == BTN_FOCUS_UP: dash.change_focus(1)
                    elif pin == BTN_AUTODRIVE: dash.check_autodrive()
                    last_press_time = current_time
            last_states[pin] = state
        time.sleep(0.01)

except KeyboardInterrupt:
    GPIO.cleanup()
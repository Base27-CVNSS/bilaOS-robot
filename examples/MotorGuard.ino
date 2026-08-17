/*
 * BilaOS Robot — Motor Guard reference firmware (ESP32)
 * MIT License — educational starting point, not safety-certified firmware.
 *
 * Serial protocol (newline terminated):
 *   ARM <sequence>
 *   DRV <sequence> <left:-100..100> <right:-100..100> <ttl_ms:50..500>
 *   STOP <sequence>
 *   PING <sequence>
 *
 * Replace pin assignments, PWM frequency and polarity for your motor driver.
 * Test with wheels raised and a physical power cut-off within reach.
 */

#include <Arduino.h>

namespace Pins {
constexpr uint8_t LEFT_IN1 = 18;
constexpr uint8_t LEFT_IN2 = 19;
constexpr uint8_t RIGHT_IN1 = 21;
constexpr uint8_t RIGHT_IN2 = 22;
constexpr uint8_t ESTOP = 23;  // Active LOW, use INPUT_PULLUP.
}  // namespace Pins

constexpr uint32_t HARD_WATCHDOG_MS = 650;
constexpr int MAX_COMMAND = 65;  // Begin below full speed.

bool armed = false;
uint32_t lastPacketAt = 0;
uint32_t commandExpiresAt = 0;
uint32_t lastSequence = 0;

void setHalfBridge(uint8_t in1, uint8_t in2, int command) {
  const int bounded = constrain(command, -MAX_COMMAND, MAX_COMMAND);
  const uint8_t duty = map(abs(bounded), 0, 100, 0, 255);

  if (bounded > 0) {
    analogWrite(in1, duty);
    analogWrite(in2, 0);
  } else if (bounded < 0) {
    analogWrite(in1, 0);
    analogWrite(in2, duty);
  } else {
    analogWrite(in1, 0);
    analogWrite(in2, 0);
  }
}

void stopMotors(const char* reason) {
  setHalfBridge(Pins::LEFT_IN1, Pins::LEFT_IN2, 0);
  setHalfBridge(Pins::RIGHT_IN1, Pins::RIGHT_IN2, 0);
  armed = false;
  Serial.printf("STOPPED %s\n", reason);
}

bool acceptSequence(uint32_t sequence) {
  if (sequence <= lastSequence) return false;
  lastSequence = sequence;
  lastPacketAt = millis();
  return true;
}

void handleLine(String line) {
  line.trim();
  if (line.isEmpty()) return;

  char verb[8] = {0};
  unsigned long sequence = 0;
  int left = 0;
  int right = 0;
  unsigned long ttl = 0;
  const int fields = sscanf(line.c_str(), "%7s %lu %d %d %lu", verb,
                            &sequence, &left, &right, &ttl);

  if (fields < 2 || !acceptSequence(sequence)) {
    Serial.println("ERR malformed_or_replayed");
    return;
  }

  if (!strcmp(verb, "STOP")) {
    stopMotors("remote_stop");
    return;
  }

  if (!strcmp(verb, "PING")) {
    Serial.printf("PONG %lu\n", sequence);
    return;
  }

  if (!strcmp(verb, "ARM")) {
    if (digitalRead(Pins::ESTOP) == LOW) {
      stopMotors("physical_estop");
      return;
    }
    armed = true;
    commandExpiresAt = millis() + 250;
    Serial.printf("ARMED %lu\n", sequence);
    return;
  }

  if (!strcmp(verb, "DRV") && fields == 5 && armed) {
    if (ttl < 50 || ttl > 500) {
      stopMotors("invalid_ttl");
      return;
    }
    setHalfBridge(Pins::LEFT_IN1, Pins::LEFT_IN2, left);
    setHalfBridge(Pins::RIGHT_IN1, Pins::RIGHT_IN2, right);
    commandExpiresAt = millis() + ttl;
    Serial.printf("ACK %lu\n", sequence);
    return;
  }

  stopMotors("invalid_state_or_command");
}

void setup() {
  Serial.begin(115200);
  pinMode(Pins::LEFT_IN1, OUTPUT);
  pinMode(Pins::LEFT_IN2, OUTPUT);
  pinMode(Pins::RIGHT_IN1, OUTPUT);
  pinMode(Pins::RIGHT_IN2, OUTPUT);
  pinMode(Pins::ESTOP, INPUT_PULLUP);
  stopMotors("boot");
  Serial.println("READY BilaOS-MotorGuard/1");
}

void loop() {
  if (Serial.available()) {
    handleLine(Serial.readStringUntil('\n'));
  }

  const uint32_t now = millis();
  if (digitalRead(Pins::ESTOP) == LOW) stopMotors("physical_estop");
  if (armed && now > commandExpiresAt) stopMotors("command_ttl");
  if (armed && now - lastPacketAt > HARD_WATCHDOG_MS) stopMotors("watchdog");
  delay(2);
}

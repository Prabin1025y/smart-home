#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <ESP32Servo.h>
#include "DHT.h"
// #include <Arduino.h>
// #include "driver/ledc.h"
#define DHTTYPE DHT11

// WiFi credentials
const char* ssid = "POCO M2";
const char* password = "123456789";

// Backend URL
const char* statusUrl = "http://10.31.178.167:3000/api/status";
const char* tempUrl = "http://10.31.178.167:3000/api/temperature";

// Pin assignments
const int led1Pin = 25;
const int led2Pin = 26;
const int led3Pin = 27;

const int dhtPin = 4;
DHT dht(dhtPin, DHTTYPE);

const int fan1Pin = 22;
const int fan2Pin = 23;

const int fan1_in1 = 18;
const int fan1_in2 = 19;
const int fan2_in3 = 32;
const int fan2_in4 = 33;

const int servoPin = 13;

const float prevTemperature = -300;

Servo gateServo;

void sendTempUpdate(float temperature, float humidity) {
    if(temperature === prevTemperature)
        return; // No change in temperature, skip update

    HTTPClient http;
    String url = String(tempUrl) + "?temp=" + String(temperature) + "&humidity=" + String(humidity);
    http.begin(url);
    int httpCode = http.GET();
    
    if (httpCode > 0) {
      Serial.println("Temperature update sent successfully");
    } else {
      Serial.print("Failed to send temperature update, error: ");
      Serial.println(httpCode);
    }
    http.end();
}

void setup() {
  Serial.begin(115200);
  dht.begin();
  delay(1000);

  gateServo.attach(servoPin);
  gateServo.write(0);  // Initial position (closed)

  // Initialize pins
  pinMode(led1Pin, OUTPUT);
  pinMode(led2Pin, OUTPUT);
  pinMode(led3Pin, OUTPUT);
  pinMode(fan1Pin, OUTPUT);
  pinMode(fan2Pin, OUTPUT);

  // Updated LEDC setup for LEDs
  // ledcAttach(led1Pin, 5000, 8); // LED1 - Pin, Frequency, Resolution
  // ledcAttach(led2Pin, 5000, 8); // LED2
  // ledcAttach(led3Pin, 5000, 8); // LED3

  pinMode(fan1_in1, OUTPUT);
  pinMode(fan1_in2, OUTPUT);
  pinMode(fan2_in3, OUTPUT);
  pinMode(fan2_in4, OUTPUT);

  digitalWrite(fan1_in1, HIGH);
  digitalWrite(fan1_in2, LOW);
  digitalWrite(fan2_in3, HIGH);
  digitalWrite(fan2_in4, LOW);

  // Updated LEDC setup for fans
  ledcAttach(fan1Pin, 5000, 8);  // Fan1 - Pin, Frequency, Resolution
  ledcAttach(fan2Pin, 5000, 8);  // Fan2


  // Connect WiFi
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nConnected!");
  Serial.print("IP Address: ");
  Serial.println(WiFi.localIP());
}

void loop() {

  if (WiFi.status() == WL_CONNECTED) {
    sendTempUpdate(dht.readTemperature(), dht.readHumidity());
  }

  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(statusUrl);
    int httpCode = http.GET();

    if (httpCode > 0) {
      String payload = http.getString();
      // Serial.println("Response:");
      // Serial.println(payload);

      // Allocate JSON document (adjust size if needed)
      StaticJsonDocument<4096> doc;
      DeserializationError error = deserializeJson(doc, payload);

      if (!error) {
        // Parse lights
        JsonArray lights = doc["states"]["lights"].as<JsonArray>();
        for (JsonObject led : lights) {
          const char* id = led["id"];
          bool isOn = led["isOn"];
          // Serial.println(isOn);
          // Serial.println(id);
          // Serial.println();
          // int brightness = led["brightness"] | 255;

          // brightness = constrain(brightness, 0, 255);

          if (strcmp(id, "livingRoom") == 0) {
            digitalWrite(led1Pin, isOn ? HIGH : LOW);
          } else if (strcmp(id, "kitchen") == 0) {
            digitalWrite(led2Pin, isOn ? HIGH : LOW);
          } else if (strcmp(id, "bedroom") == 0) {
            digitalWrite(led3Pin, isOn ? HIGH : LOW);
          }
        }

        // Parse fans
        JsonArray fans = doc["states"]["fans"].as<JsonArray>();
        for (JsonObject fan : fans) {
          const char* id = fan["id"];
          bool isOn = fan["isOn"];
          int speed = fan["speed"] | 255; // default to 0 if not present

          // Clamp speed between 0 and 255
          speed = constrain(speed, 0, 255);

          if (strcmp(id, "livingRoom") == 0) {
            ledcWrite(fan1Pin, isOn ? speed : 0);
          } else if (strcmp(id, "bedroom") == 0) {
            ledcWrite(fan2Pin, isOn ? speed : 0);
          }
        }

        // Parse security - gate
        JsonArray security = doc["states"]["security"].as<JsonArray>();
        for (JsonObject sec : security) {
          const char* id = sec["id"];
          bool isOn = sec["isOn"];

          Serial.println(isOn);
          Serial.println(id);
          if (strcmp(id, "mainGate") == 0) {
            if (isOn) {
              Serial.println("on");
              gateServo.write(90);  // Open position (adjust angle as needed)
            } else {
              Serial.println("Closed");
              gateServo.write(0);   // Closed position
            }
          }
        }

      } else {
        Serial.print("JSON parse error: ");
        Serial.println(error.c_str());
      }

    } else {
      Serial.print("HTTP request failed, error: ");
      Serial.println(httpCode);
    }
    http.end();
  } else {
    Serial.println("WiFi not connected!");
  }

  delay(2000);  // wait 2 seconds before next request
}
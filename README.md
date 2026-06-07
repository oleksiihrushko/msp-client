# msp-client

Node.js клієнт для читання телеметрії з flight controller по протоколу MSP V2 через серійний порт.

Виводить в реальному часі: стан сенсорів, напругу батареї, GPS-координати.

---

## Вимоги

- Node.js 18+
- Flight controller з увімкненим MSP на UART (iNAV, Betaflight)
- Підключення FC до ПК по USB

---

## Встановлення

```bash
git clone https://github.com/oleksiihrushko/msp-client
cd msp-client
npm install
```

---

## Налаштування

Відкрий `index.js` і вкажи свій COM-порт:

```js
const port = new SerialPort({ path: "COM3", baudRate: 115200 });
```

На Linux/macOS порт виглядає як `/dev/ttyUSB0` або `/dev/tty.usbserial-*`.

Знайти потрібний порт можна так:

```bash
# Windows — в диспетчері пристроїв, розділ "Порти (COM і LPT)"
# Linux
ls /dev/ttyUSB*
# macOS
ls /dev/tty.usb*
```

---

## Запуск

```bash
node index.js
```

### Приклад виводу

```
✅ Підключено до FC

📡 STATUS   | cycle: 125 мкс | i2c errors: 0 | profile: 0
            | sensors: gyro, accel, baro, compass, gps

🔋 ANALOG   | 12.4V | 1.23A | 156mAh

🛰️  GPS      | 3D fix | 8 sat | 50.4501, 30.5234 | 112m
```

Опитування FC відбувається кожні **2 секунди**.

---

## Структура проєкту

```
msp-client/
├── index.js      # точка входу, серійний порт, цикл опитування
├── msp.js        # MSP V2 парсер: buildRequest(), parseResponse(), COMMANDS
├── parsers.js    # парсери payload: parseStatus(), parseAnalog(), parseRawGPS()
└── package.json
```

### MSP команди

| Команда    | MSP код | Дані                                      |
|------------|---------|-------------------------------------------|
| `STATUS`   | 101     | cycleTime, i2cErrors, sensors, profile    |
| `ANALOG`   | 110     | voltage (V), current (A), mAhDrawn        |
| `RAW_GPS`  | 106     | fixType, numSat, lat, lon, altitude       |

---

## Залежності

| Пакет        | Версія  | Призначення                  |
|--------------|---------|------------------------------|
| `serialport` | ^13.0.0 | читання даних з UART/USB     |

---

## Зв'язок з electron-gcs

Цей модуль є основою для [electron-gcs](https://github.com/oleksiihrushko/electron-gcs) — десктопного GCS-додатку з графічним інтерфейсом. Логіка `msp.js` і `parsers.js` перевикористовується в Electron-версії без змін.

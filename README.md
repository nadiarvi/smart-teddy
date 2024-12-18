# smart-teddy
CS492 AI Prototyping

# Getting Started
Clone this repository and install all dependencies.
```
git clone https://github.com/nadiarvi/smart-teddy.git
npm i
```

Make sure you are in the `smart-teddy` repository.
```
cd smart-teddy
```

Run the server using the command:
```
npm run dev
```

You're good to go! Run the interactions with bear using the command:
```
node classifier.js
```

# Repository Structure
- Controllers: Handles the background logic for the actions
- Routes: Handles all endpoint routes that are available from the server
- Models: All edge-impulse model for state classification
Firmware: Micropython codes for data collection

# Interact with Bear!
**IDLE**: The bear remains stationary, sitting upright without movement.

**HANDSHAKING**: Hold the bear's left hand and shake it gently up and down.

**CLAPPING**: Grab both of the bear's hands and softly clap them together in front.

**SHAKING**: Gently shake the bear by moving it slightly, about 3 cm is enough for recognition (avoid shaking too hard).

**PETTING**: Lightly tap (not stroking) repeatedly the sensor on the bear’s head with your hand.

# Serial Connection with Bear~
- A serial port can only be accessed by one channel at a time. 
- If you encounter an "access denied" error when running your program, check whether the port is already in use by another program, such as Edge Impulse or VS Code, and disconnect it if necessary.







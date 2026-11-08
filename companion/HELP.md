## Pharos Express

Controls Pharos Express via the **Simple Ethernet API** (UDP, default port 1025).

### Setup in Express

Menu (top left) → **Configure Simple Ethernet API**. Enable the API and set the _UDP port to listen on_.
For feedback, enable _Send feedback data_ and enter the IP of the Companion computer and a UDP port.

### Module configuration

- **Express Control IP / UDP port**: the computer running Express and its listen port.
- **Enable feedback**: polls Express (queries 101/102/105). Set _Local UDP port_ to the feedback port configured in Express.

### Actions

Activate scene, activate scene in space, space off, master intensity, override, activate tag.

### Feedbacks

Scene active, space off, tag active.

### Master intensity and "Change master intensity"

List spaces under **Spaces to monitor** (e.g. `1,2,5-8`, feedback must be on). Their master intensity is polled (query 103) into `$(pharos-express:space_N_intensity)` (0-255) and `$(pharos-express:space_N_intensity_pct)` (%). The **Change master intensity** action raises or lowers a space by a percentage from that value, e.g. +10 / -10 on up/down buttons. Without monitoring, the starting point is the last value this module set.

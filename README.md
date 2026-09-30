# Baton: The $150 Million Relay Race

> **Live Executive Command Suite:**  
> 👉 **[https://sohamsa.github.io/baton/](https://sohamsa.github.io/baton/)**  
> *(Runs 100% in your browser. Zero installation. Zero backend setup required.)*

---

## 🎬 Prologue: The $150 Million Glass Relay Race

Imagine you just invested in or built a brand-new, world-class artificial intelligence datacenter.

You spent **$150 Million** on cutting-edge computing processors, and another **$40 Million** on high-voltage electrical substations, liquid cooling pumps, and backup generators. Outside your building, the utility power meter is spinning at **40 Megawatts**, enough electricity to power a city of 30,000 homes. 

Your monthly electric bill is **$2.1 Million**. Every single hour your facility is turned on, debt service, electricity, cooling water, and engineering staff burn **$114,688 in cash**.

Now, here is the secret that traditional datacenter operators learn the hard way:

> **In modern AI, processors do not work like independent workers in an office cubicle.**  
> If an office worker gets the flu, the rest of the company keeps working.  
> **AI does not work that way.**

Modern AI pretraining is a **32,768-runner baton relay race**, or a **32,768-singer choir singing in four-part harmony**.

All 32,768 processors must calculate their piece of the mathematical puzzle and hand off a fragile glass baton at the **exact same millisecond**. 

If just **ONE single processor** out of 32,768 overheats, drops its baton, stumbles, or pauses to tie its shoelace:

**THE ENTIRE BUILDING FREEZES.**

The other 32,767 runners stand completely frozen on the track. But the lights, the water chillers, the fans, and the utility electric meters **do not pause**. You burn **$114,688 every hour** for a building that is completely idle, waiting for technicians to find the broken runner.

**Baton** is the story of how resilience engineering prevents that freeze, protects your capital, and keeps the choir singing.

---

## 🎭 The 17 Characters: A Datacenter Hardware Drama

Every datacenter failure is a character in an unfolding drama. Traditional monitoring tools panic, blame the wrong culprits, and throw millions of dollars away. Here are the **17 characters** who threaten your $150 Million investment, and how Baton tames them.

---

### Character 1: "The Feverish Athlete" (Gradual Thermal Warning)
* **Who he is:** A marathon runner whose body temperature is steadily climbing like a car engine temperature gauge creeping toward the red zone on the highway.
* **The Drama:** Traditional datacenters ignore him until his engine blows up and he collapses on the track. The sudden crash shatters the glass baton, wiping out an entire hour of unsaved progress.
* **The Baton Fix:** Dynamic thermal slope detection watches the rate of heat rise. It spots the fever 90 seconds early, orders a lightweight emergency save, and swaps the runner for a fresh athlete in under 2 minutes.
* **The Dollar Shield:** Saves **$114,688** per incident by eliminating cluster stall burn.

---

### Character 2: "The Sudden Ghost" (Abrupt Unannounced Failure)
* **Who he is:** The lightbulb that pops with zero warning. No temperature climb, no vibration, no forecast.
* **The Drama:** Traditional operators waste 45 minutes having engineers reboot the machine, read log files, and reconstruct the cluster while the entire building sits idle.
* **The Baton Fix:** Automated fast-path gang restart. Never waste time diagnosing dead silicon during active production. The system immediately evicts the dead machine, recruits a warm standby already pre-loaded with software, and resumes in 120 seconds.
* **The Dollar Shield:** Saves **$57,000** per crash by slashing downtime from 45 minutes to 2 minutes.

---

### Character 3: "The Kitchen Circuit Breaker" (Shared Infrastructure / Power Sag)
* **Who he is:** The master electrical circuit breaker behind the counter in a busy restaurant kitchen.
* **The Drama:** The breaker sags, and 16 fryers dim at the exact same moment. Blind monitoring tools panic and file 16 separate emergency tickets, prompting technicians to mistakenly throw away 16 perfectly healthy $35,000 processors ($560,000 in false scrap).
* **The Baton Fix:** Power-domain topology correlation. The system groups all 16 alarms into a single electrical breaker ticket, telling technicians to inspect the $40 breaker instead of touching healthy chips.
* **The Dollar Shield:** Prevents **$560,000** in false hardware replacements.

---

### Character 4: "The Hard-Working Chef" (Healthy Workload Burst vs. Fire)
* **Who he is:** The head chef cooking at full speed during the Friday night dinner rush.
* **The Drama:** His pans get hot because he is cooking hard. A dumb fire alarm sees the heat, panics, and turns on the ceiling water sprinklers, ruining dinner.
* **The Baton Fix:** Workload-aware AI baselines. The system recognizes that the chip is simply working through a heavy mathematical burst, allowing it to complete safely without interruption.
* **The Dollar Shield:** Saves **$40,000+** in preserved compute progress per avoided false alarm.

---

### Character 5: "The Contract with Missing Pages" (Incomplete Checkpoint Corruption)
* **Who he is:** The legal courier who dropped the last 3 pages of a 100-page contract out the taxi window on the way to the courthouse.
* **The Drama:** Resuming a multi-million-dollar AI training run from an incomplete or corrupted save file causes the AI model to learn corrupted mathematics, invalidating weeks of training.
* **The Baton Fix:** Atomic two-phase verification gates. Cryptographic checksums inspect every piece of the save file across all 32k machines before advancing the resume pointer.
* **The Dollar Shield:** Prevents **$1.5 Million** in catastrophic training rollbacks.

---

### Character 6: "The Missing Choir Singer" (Unsupported Local Recovery)
* **Who he is:** The baritone singer who walked off the stage mid-concert.
* **The Drama:** An operator thinks, *"We have 32,767 other singers, let's keep singing without him!"* But AI models split equations across rigid mathematical dimensions. Dropping one singer causes an instant silent deadlock freeze.
* **The Baton Fix:** Enforces coordinated group restarts that preserve the mathematical harmony rather than attempting dangerous, uncoordinated individual chip dropouts.
* **The Dollar Shield:** Averts **$114,688/hr** silent cluster deadlock freezes.

---

### Character 7: "The Yesterday Weatherman" (Stale Telemetry & Epistemic Abstention)
* **Who he is:** The meteorologist who looks at yesterday's weather radar to decide if you need an evacuation order today.
* **The Drama:** When network traffic delays sensor readings by 10 minutes, naive automation quarantines machines that have already cooled down and are running normally.
* **The Baton Fix:** Epistemic abstention. When sensor readings are expired or incomplete, the system refuses to guess or take destructive actions until fresh vitals arrive.
* **The Dollar Shield:** Eliminates spurious late-night automated quarantines and false technician callouts.

---

### Character 8: "The Overzealous Referee" (Harmful Preventive Shutdown)
* **Who he is:** The whistle-happy referee who stops the game and benches a star player for breathing heavily right as he is about to score the winning goal.
* **The Drama:** A rigid safety rule ("stop if heat touches 70°C") halts the entire facility during a brief 5-second burst, causing far more financial damage than letting the chip finish the play.
* **The Baton Fix:** Dynamic residual tracking evaluates heat relative to workload duration, keeping healthy machines running safely.
* **The Dollar Shield:** Preserves **$40,000+** in computing progress per event.

---

### Character 9: "The Tired Runner" (Silent Straggler Drag)
* **Who he is:** The athlete who doesn't collapse or trigger any alarms, but slowed down by just 8% due to minor silicon fatigue.
* **The Drama:** Because all 32,768 runners must synchronize every mathematical step, every single runner is forced to match the pace of the slowest runner in total silence.
* **The Baton Fix:** Cross-chip latency tracking detects the slow runner outlier in real time, cordoning and draining him at the next scheduled save break without interrupting live training.
* **The Dollar Shield:** Eliminates **$220,000/day ($1M to $3M/month)** in silent stall waste across the facility.

---

### Character 10: "The Revolving Door Patient" (Premature Return / Revolving Door)
* **Who he is:** The hospital patient who feels better after 5 minutes and is discharged without a treadmill stress test, only to collapse in the parking lot.
* **The Drama:** Technicians plug a repaired machine back into live training; it fails 3 minutes later under heavy load, crashing the entire $150M building all over again.
* **The Baton Fix:** Quarantine health gates. Repaired machines must pass a synthetic computational stress test before being certified safe for production training.
* **The Dollar Shield:** Prevents secondary multi-hour cluster crashes.

---

### Character 11: "The Midnight Power Cliff" (PPA Demand Ratchet Surge)
* **Who he is:** The electric utility meter outside your building that violently spikes 16 Megawatts in a single second.
* **The Drama:** Electric utilities enforce strict "demand ratchets": if you spike the grid for just 15 minutes, they bill you at that astronomical peak rate for the next 12 consecutive months.
* **The Baton Fix:** Automated paved ramp pacing gently steps up cluster wattage over 120 seconds, keeping power draw smooth and ratchet-safe.
* **The Dollar Shield:** Saves **$385,000 per year** in avoided electric utility demand penalties.

---

### Character 12: "The Cracked Solder Bead" (Fractured Microbump in MCM Packaging)
* **Who he is:** A microscopic bead of solder, 1/10th the width of a human hair, connecting the processor brain to high-speed memory.
* **The Drama:** Repeated heating and cooling causes the chip to expand and contract, fracturing the solder bead and permanently bricking a $35,000 processor module.
* **The Baton Fix:** Monitors memory transfer retries to catch microbump fatigue early, safely swapping the module before total electrical separation.
* **The Dollar Shield:** Protects **$35,000** processor modules from catastrophic failure.

---

### Character 13: "The Edge-of-the-Oven Cookie" (Wafer Lot Contagion)
* **Who he is:** The batch of cookies baked on the outer edge of the baking tray that got slightly over-crisped.
* **The Drama:** Chips sliced from the outer rim of a silicon disc run hotter. When one dies, its 500 sister chips across the datacenter are ticking time bombs.
* **The Baton Fix:** Digital wafer tracing identifies all sibling chips from the same marginal factory lot and applies protective voltage cushions before they crash.
* **The Dollar Shield:** Prevents **$2.0 Million** in cascading multi-rack outages.

---

### Character 14: "The Framed Innocent" (Innocent Chip on a Dying Board)
* **Who he is:** A healthy $35,000 processor blamed for a crime committed by a $40 voltage regulator behind the wall.
* **The Drama:** A leaking voltage rail triggers error messages on the chip. Technicians yank out the healthy chip and throw it away.
* **The Baton Fix:** Telemetry correlation inspects the underlying circuit board first, replacing the cheap board component and saving the expensive processor.
* **The Dollar Shield:** Prevents **$480,000** in false processor scrap.

---

### Character 15: "The Thermal Shadow" (Rack Cold-Plate Heat Shadow)
* **Who he is:** An air bubble trapped inside the liquid cooling manifold that starves the top server shelf of water.
* **The Drama:** Bottom servers run cool at 55°C, while top servers reach 85°C in silence.
* **The Baton Fix:** Liquid manifold pressure monitoring detects trapped air pockets before chips heat up.
* **The Dollar Shield:** Averts **$4.5 Million** in rack-level thermal burnouts.

---

### Character 16: "The Over-Torqued Wrench" (Cold Plate Mechanical Fracture)
* **Who he is:** The well-meaning technician who tightened the water block bolts too hard with a manual wrench.
* **The Drama:** Excessive mounting pressure micro-cracks the delicate silicon die under thermal expansion.
* **The Baton Fix:** Torque sensor calibration and strain-gauge telemetry alert operators to uneven mounting pressure.
* **The Dollar Shield:** Prevents un-warrantied physical silicon fractures.

---

### Character 17: "The Whispering Voltage Cliff" (Silent Subthreshold Cliff)
* **Who he is:** The invisible electrical dip that occurs when temperatures look completely normal (71°C).
* **The Drama:** High-leakage chips fall off a timing cliff during compute bursts, quietly spitting out incorrect mathematical sums that corrupt the AI model without triggering any alarm.
* **The Baton Fix:** Silicon-context early warning pairs factory birth certificate minimum voltages (Vmin) with live sensor readings to pace computing bursts safely.
* **The Dollar Shield:** Shields against **$500k to $1.5M** in silent weight corruption rollbacks.

---

## 🏛️ The Five Rooms of the Executive Suite

When you open the [live application](https://sohamsa.github.io/baton/), you step into a 5-room executive command center:

```
🌟 Executive Portfolio (#/)
   * 🌐 Global Fleet Console (#/fleet): 131k Chips across VA, TX, OR, Norway
   * 🏗️ Greenfield DC Planner (#/planner): Build-Your-Own Datacenter Wizard
   * ⚡ Live Practice Floor (#/desk): 32,768-Chip Live Crisis Simulator
   * ⚡ Utility Grid & PPA Scorecard (#/grid): Power Contracts, Ratchets & Curtailment
   * 🔧 Boots-on-Ground Dispatch (#/dispatch): Field Operations & Floor Logistics
   * 💡 Executive Q&A Lounge (#/stories): 17 Business Analogies & Owner Answers
```

### 1. 🌟 The Executive Portfolio & Financial Pillars (`#/`)
* **What you see:** The high-level capital health of your datacenter.
* **Key Numbers:** Total hardware value ($150M), cluster stall burn rate ($114,688/hr), work preserved (up to 90%), recovery time (2 minutes).
* **Interactive Feature:** The **Portfolio Scope Selector**. Click between Virginia, Texas, Oregon, Norway, or the aggregated 131k Global Fleet to see all financial metrics adapt in real time.

### 2. 🌐 Global Fleet Command Console (`#/fleet`)
* **What you see:** A unified command deck aggregating **131,072 accelerators** across four hyperscale campuses and four electric grids:
  * 🇺🇸 **Campus Alpha (Virginia / Dominion):** 32k chips · 40 MW · $0.092/kWh · PPA ratchet-safe.
  * 🇺🇸 **Campus Lone Star (Texas / ERCOT):** 65k chips · 80 MW · $0.052/kWh · Earns **$75,000/day** in automated demand response.
  * 🇺🇸 **Campus Cascade (Oregon / BPA Hydro):** 16k chips · 22 MW · $0.041/kWh · 100% clean hydro, zero carbon.
  * 🇳🇴 **Campus Fjord (Norway / Statnett):** 16k chips · 20 MW · €0.048/kWh · Arctic free-cooling with municipal district heat export.
* **Interactive Feature:** Cross-Campus Disaster Recovery & Load-Shift Simulator + Printable 1-Page Global Fleet Board Memo.

### 3. 🏗️ Greenfield Datacenter Planning Wizard (`#/planner`)
* **What you see:** A full capital and hardware planning engine for building a new AI datacenter from scratch.
* **Interactive Sizing:** Choose your scale (4k, 16k, 32k, 65k, 131k chips), electric utility grid, cooling technology (Direct Liquid, Immersion, RDHx, Air), and warm standby ratio.
* **Instant Financial Pro-Forma:** Calculates upfront CapEx itemized by silicon, cooling, switchgear, and shell ($/MW), monthly power bill, and Baton ROI.
* **Printable Feature:** 1-click **Printable Pro-Forma Term Sheet (PDF)** ready for bank debt syndication and investment committees.

### 4. ⚡ Live Practice Floor Simulator (`#/desk`)
* **What you see:** A live 32,768-chip simulator where you can trigger all 17 hardware crises and watch how automated Baton micro-saves protect millions of dollars in compute capital.
* **Interactive Feature:** Side-by-side battle arena comparing traditional datacenter runbooks vs. automated Baton engineering.

### 5. ⚡ Utility Grid & PPA Scorecard (`#/grid`)
* **What you see:** Electric utility contract audit, demand ratchet penalty prevention, and carbon emissions accounting.

### 6. 🔧 Boots-on-the-Ground Dispatch (`#/dispatch`)
* **What you see:** Physical rack floor maps, technician badge workflows, and spare parts bin logistics.

### 7. 💡 Executive Q&A Lounge (`#/stories`)
* **What you see:** All 17 hardware questions answered in plain everyday English with zero semiconductor formulas.

---

## 💼 The Datacenter Owner's Playbook: What You Can Apply Tomorrow

Even if you never write a single line of code, reading this project gives you five high-leverage rules to protect your balance sheet:

| # | Boardroom Takeaway | Why It Matters to Your Balance Sheet | What to Demand from Your Team |
| :--- | :--- | :--- | :--- |
| **1** | **The 2% Warm Standby Rule** | When a chip crashes, waiting 45 minutes for a human technician burns $86,000 in idle cluster time. | Maintain **1% to 2% warm unassigned standby nodes** per network spine with pre-staged software containers. Recovers cluster in 2 minutes. |
| **2** | **PPA Demand Ratchet Safeguards** | Spiking power from 0 to 40 MW in 1 second triggers utility ratchet penalties that inflate your power bill for the next 12 months. | Enforce **automated 120-second paved ramp pacing** on all cluster restarts. Saves ~$385,000/year. |
| **3** | **Power-Domain Topology Mapping** | When a circuit breaker sags, naive tools report 16 dead chips. Technicians throw away $560,000 in healthy silicon. | Demand that cluster monitoring correlates alerts by **underlying electrical circuit and PDU**. Replace the $40 breaker, not the chips. |
| **4** | **Atomic Two-Phase Checkpoint Verification** | Resuming an AI job from a half-written save file silently corrupts model weights, burning weeks of training. | Enforce **cryptographic checksum verification** before advancing the resume pointer. Refuse damaged saves and roll back safely. |
| **5** | **Direct Liquid Cooling with 45°C Water** | Legacy air cooling carries a PUE of 1.40 ($2M+/yr extra power) and risks thermal throttling on 800W+ processors. | Design facilities for **Direct-to-Chip Liquid Cooling (CDU)**. Warm water eliminates mechanical chillers and cuts PUE to 1.14. |

---

## 🛠️ Technical Architecture & Open Source Integrity

For technical directors, systems architects, and infrastructure auditors:

* **Decision Engine (`src/baton`):** Pure Python decision engine implementing topology correlation, epistemic abstention, and fast-path gang restart.
* **Frontend Web Application (`apps/web`):** Built with TypeScript, React, and Vite. Contains zero third-party tracking or bloated dependencies.
* **Offline Standalone Browser Engine (`public/browser-engine.json`):** The entire Python decision engine and all 17 rehearsal traces are pre-compiled into a client-side bundle. The web application runs **100% offline in your browser** with zero network latency.
* **Test Suite:** Comprehensive unit and integration test suite (`pytest`) covering 41 mission-critical scenarios.

### Quick Verification & Local Execution

```bash
# 1. Clone the repository
git clone https://github.com/SohamSa/baton.git
cd baton

# 2. Run backend test suite (Python 3.11+)
python -m venv .venv
source .venv/bin/activate  # Or .venv\Scripts\activate on Windows
pip install -e .
pytest

# 3. Launch the web application
cd apps/web
npm install
npm run dev
```

---

## 📄 License & Attribution

Distributed under the Apache 2.0 License. Designed for hyperscale infrastructure investors, datacenter asset owners, and AI foundation model engineering teams worldwide.

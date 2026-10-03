# Unity 6.6 CLEAN baseline

The Unity project is fixed to **Unity 6.6 (6000.6.4f1)**.
The obsolete Unity Version Control / `com.unity.collab-proxy` package is intentionally removed because it caused Safe Mode compilation errors in Unity 6.6.
Use only the packages declared in `Packages/manifest.json`.

# Unity version

This project is fixed to **Unity 6.6 (6000.6.4f1)**. All new My Lumo work should use this editor version.

# My Lumo — Unity Game Client

Serious 3D life-simulation foundation based on the uploaded reference video. The approved white, fluffy, blue-eyed Lumo remains the exact main character target.

Core systems included: third-person character controller hooks, Sims-like needs, persistent inventory/outfits, natural-language command planning, task queue, idle life AI, world interaction anchors, save/load, and Railway command API bridge.

The existing Railway service remains separate as the online backend. This Unity folder is the real game client.

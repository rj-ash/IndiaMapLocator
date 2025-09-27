# Data Notes (Uttarakhand – Approximate)

The geographic data in `src/data/uttarakhand` is a simplified, approximate educational representation of Uttarakhand districts and selected cities/towns. It should NOT be used for navigation, legal, analytical, or authoritative purposes.

Sources & Method:
- Boundaries stylized & manually approximated (not from an official dataset)
- Coordinates for cities/towns derived from widely available public map references and simplified
- Polygons intentionally simplified to keep bundle small

Attribution:
- Base map tiles (runtime) © OpenStreetMap contributors (ODbL)
- India state boundaries fetched at runtime from geohacker/india (OSM-derived, ODbL): https://github.com/geohacker/india
	- If distributing a bundled copy, retain ODbL attribution in documentation.

Improvement Ideas:
- Replace with official open data (e.g., Natural Earth / OSM extracts) in a future phase
- Increase geometry resolution for closer zoom levels
- Add metadata: population, altitude, alternative names

Version: 0.2.0  
Updated: 2025-09-27

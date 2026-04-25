import sqlite3

db = sqlite3.connect("data/realdb/lvr_data.db")
cursor = db.cursor()

# Get records with both price and area
cursor.execute("""
    SELECT total_price, unit_price_sqm, building_area_sqm, city_code, transaction_type
    FROM lvr_records
    WHERE total_price > 0 AND building_area_sqm > 0
    LIMIT 20
""")
rows = cursor.fetchall()

print("Verifying unit_price unit:")
print("-" * 80)
for r in rows[:10]:
    total_price, unit_price_sqm, bld_area, city, tx_type = r
    if bld_area and float(bld_area) > 0:
        calculated_unit_per_sqm = total_price / float(bld_area)
        calculated_unit_per_ping = total_price / (float(bld_area) * 0.3025)  # 1 sqm ~ 0.3025 ping
        print(f"total={total_price:>12,.0f} | bld_area={bld_area:>10} | unit_price_sqm={unit_price_sqm:>10,.0f}")
        print(f"  -> calculated/unit_per_sqm = {calculated_unit_per_sqm:.0f}")
        print(f"  -> calculated/unit_per_ping = {calculated_unit_per_ping:.0f}")
        print(f"  -> unit_price_sqm matches per_sqm: {abs(calculated_unit_per_sqm - unit_price_sqm) < unit_price_sqm * 0.01}")
        print(f"  -> unit_price_sqm matches per_ping: {abs(calculated_unit_per_ping - unit_price_sqm) < unit_price_sqm * 0.01}")
        print()

# Also check: does unit_price_sqm == total_price when building_area_sqm is 0 or empty?
cursor.execute("""
    SELECT COUNT(*) FROM lvr_records WHERE unit_price_sqm > 0 AND building_area_sqm = 0
""")
print(f"\nRecords with unit_price > 0 but area = 0: {cursor.fetchone()[0]}")

# Transaction types
cursor.execute("SELECT DISTINCT transaction_type FROM lvr_records ORDER BY transaction_type")
types = cursor.fetchall()
print(f"\nTransaction types: {[t[0] for t in types]}")

cursor.execute("SELECT COUNT(DISTINCT city_code) FROM lvr_records")
print(f"Distinct cities: {cursor.fetchone()[0]}")

# Check if district values match Taiwanese city names
cursor.execute("SELECT DISTINCT district FROM lvr_records WHERE city_code = 'a' ORDER BY district")
ds = cursor.fetchall()
print(f"\nTaipei districts: {[d[0] for d in ds[:10]]}...")

db.close()

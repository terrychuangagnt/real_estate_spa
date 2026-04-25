#!/usr/bin/env python3
"""Build SQLite database from MOI (內政部) real estate TXT/CSV files."""

import csv
import sqlite3
import os
import glob

DB_PATH = '/opt/data/home/real_estate_spa/data/realdb/lvr_data.db'
DATA_DIR = '/opt/data/home/real_estate_spa/data/lvr_txt'

# TXT 檔案的 31 欄位名稱 (with correct indices)
TXT_FIELD_NAMES = [
    'district', 'transaction_type', 'address',
    'land_area_sqm', 'urban_zone', 'rural_zone', 'rural_allocation',
    'trade_date', 'trade_bundles', 'transfer_level',
    'total_floors', 'building_type', 'main_use', 'main_material', 'completion_date',
    'building_area_sqm', 'room_count', 'living_count', 'bath_count', 'partition_info',
    'management_org', 'total_price', 'unit_price_sqm', 'parking_type',
    'parking_area_sqm', 'parking_price', 'notes', 'id_no', 'project_name',
    'building_num', 'termination_info'
]

def create_database():
    if os.path.exists(DB_PATH):
        os.remove(DB_PATH)
    
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Create table with all 31 fields
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS lvr_records (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            city_code TEXT,
            district TEXT,
            transaction_type TEXT,
            address TEXT,
            land_area_sqm TEXT,
            urban_zone TEXT,
            rural_zone TEXT,
            rural_allocation TEXT,
            trade_date TEXT,
            trade_bundles TEXT,
            transfer_level TEXT,
            total_floors TEXT,
            building_type TEXT,
            main_use TEXT,
            main_material TEXT,
            completion_date TEXT,
            building_area_sqm TEXT,
            room_count TEXT,
            living_count TEXT,
            bath_count TEXT,
            partition_info TEXT,
            management_org TEXT,
            total_price REAL,
            unit_price_sqm REAL,
            parking_type TEXT,
            parking_area_sqm TEXT,
            parking_price REAL,
            notes TEXT,
            id_no TEXT,
            project_name TEXT,
            building_num TEXT,
            termination_info TEXT,
            source TEXT
        )
    ''')
    conn.commit()
    return conn

def parse_file(filepath, city_code):
    """Parse single TXT file with the correct 31-column layout.
    
    Format:
    - Line 0: Chinese field names (header)
    - Line 1: English field names (second line header)
    - Line 2+: Data rows
    """
    records = []
    
    with open(filepath, 'r', encoding='utf-8-sig') as f:
        lines = f.readlines()
    
    # Skip first 2 lines (headers)
    for i, line in enumerate(lines):
        if i < 2:  # Skip header line 0 and header line 1
            continue
        
        fields = line.strip().split(',')
        if not fields or len(fields) < 10:
            continue
        
        try:
            record = {}
            # Map all 31 fields
            for j, col_name in enumerate(TXT_FIELD_NAMES):
                if j < len(fields):
                    record[col_name] = fields[j].strip()
                else:
                    record[col_name] = ''
            
            # Parse numeric fields
            if record['total_price'] and record['total_price'].replace(',', '').replace('.', '').isdigit():
                record['total_price'] = float(record['total_price'].replace(',', '').replace('.', ''))
            else:
                record['total_price'] = None
            
            if record['unit_price_sqm'] and record['unit_price_sqm'].replace(',', '').replace('.', '').isdigit():
                record['unit_price_sqm'] = float(record['unit_price_sqm'].replace(',', '').replace('.', ''))
            else:
                record['unit_price_sqm'] = None
            
            if record['parking_price'] and record['parking_price'].replace(',', '').replace('.', '').isdigit():
                record['parking_price'] = float(record['parking_price'].replace(',', '').replace('.', ''))
            else:
                record['parking_price'] = None
            
            record['city_code'] = city_code
            record['source'] = os.path.basename(filepath)
            
            records.append(record)
        except (ValueError, IndexError) as e:
            continue
    
    return records

def main():
    print("=" * 60)
    print("MOI Real Estate DB Builder")
    print("=" * 60)
    
    conn = create_database()
    cursor = conn.cursor()
    
    # Process all TXT files
    count = 0
    for txt_file in sorted(glob.glob(os.path.join(DATA_DIR, '*.txt'))):
        city_code = os.path.basename(txt_file)[0]
        records = parse_file(txt_file, city_code)
        
        if records:
            for r in records:
                cursor.execute('''
                    INSERT INTO lvr_records (
                        city_code, district, transaction_type, address,
                        land_area_sqm, urban_zone, rural_zone, rural_allocation,
                        trade_date, trade_bundles, transfer_level, total_floors,
                        building_type, main_use, main_material, completion_date,
                        building_area_sqm, room_count, living_count, bath_count,
                        partition_info, management_org, total_price, unit_price_sqm,
                        parking_type, parking_area_sqm, parking_price,
                        notes, id_no, project_name, building_num, termination_info,
                        source
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    r['city_code'], r['district'], r['transaction_type'], r['address'],
                    r['land_area_sqm'], r['urban_zone'], r['rural_zone'], r['rural_allocation'],
                    r['trade_date'], r['trade_bundles'], r['transfer_level'], r['total_floors'],
                    r['building_type'], r['main_use'], r['main_material'], r['completion_date'],
                    r['building_area_sqm'], r['room_count'], r['living_count'], r['bath_count'],
                    r['partition_info'], r['management_org'], r['total_price'], r['unit_price_sqm'],
                    r['parking_type'], r['parking_area_sqm'], r['parking_price'],
                    r['notes'], r['id_no'], r['project_name'], r['building_num'],
                    r['termination_info'], r['source']
                ))
            count += len(records)
            print(f"✅ Loaded {os.path.basename(txt_file)}: {len(records)} records")
    
    conn.commit()
    
    # Verify
    cursor.execute('SELECT COUNT(*) FROM lvr_records')
    db_count = cursor.fetchone()[0]
    
    cursor.execute('SELECT * FROM lvr_records LIMIT 1')
    sample = cursor.fetchone()
    
    print(f"\n📊 Statistics:")
    print(f"   Total records inserted: {db_count:,}")
    print(f"   Database location: {DB_PATH}")
    
    if sample and len(sample) > 1:
        print(f"\n📋 First record sample:")
        print(f"   District:     {sample[2] if len(sample) > 2 else 'N/A'}")
        print(f"   Transaction:  {sample[3] if len(sample) > 3 else 'N/A'}")
        print(f"   Address:      {sample[4] if len(sample) > 4 else 'N/A'}")
        print(f"   Total Price:  {sample[23] if len(sample) > 23 else 'N/A'}")
        print(f"   Unit Price:   {sample[24] if len(sample) > 24 else 'N/A'}")
    
    # Verify data quality
    cursor.execute('SELECT COUNT(*) FROM lvr_records WHERE address IS NOT NULL AND address != ""')
    with_addr = cursor.fetchone()[0]
    print(f"\n✅ Verification:")
    print(f"   Records with address: {with_addr:,}")
    print(f"   Total: {db_count:,}")
    print(f"   Success rate: {with_addr/db_count*100:.1f}%")
    
    conn.close()
    print(f"\n{'=' * 60}")
    print(f"✅ Database built successfully!")
    print(f"{'=' * 60}")

if __name__ == '__main__':
    main()

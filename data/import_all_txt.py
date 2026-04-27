#!/usr/bin/env python3
"""
全量匯入 202 個 MOI txt 檔案到 SQLite DB
"""
import os
import csv
import sqlite3
from datetime import datetime

DATA_DIR = '/opt/data/home/real_estate_spa/data/lvr_txt'
DB_PATH = '/opt/data/home/real_estate_spa/data/realdb/lvr_data.db'

print(f"數據目錄: {DATA_DIR}")
print(f"資料庫路徑: {DB_PATH}")
print(f"Txt 檔案數量: {len([f for f in os.listdir(DATA_DIR) if f.endswith('.txt')])}")

# Connect to SQLite
conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()

# Create table
cursor.execute('''DROP TABLE IF EXISTS lvr_records''')
cursor.execute('''CREATE TABLE lvr_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    city_code TEXT,
    district TEXT,
    transaction_type TEXT,
    address TEXT,
    land_area_sqm REAL,
    urban_zone TEXT,
    rural_zone TEXT,
    rural_allocation TEXT,
    trade_date TEXT,
    trade_bundles TEXT,
    transfer_level TEXT,
    total_floors INTEGER,
    building_type TEXT,
    main_use TEXT,
    main_material TEXT,
    completion_date TEXT,
    building_area_sqm REAL,
    room_count INTEGER,
    living_count INTEGER,
    bath_count INTEGER,
    partition_info TEXT,
    management_org TEXT,
    total_price REAL,
    unit_price_sqm REAL,
    parking_type TEXT,
    parking_area_sqm REAL,
    parking_price REAL,
    notes TEXT,
    id_no TEXT,
    project_name TEXT,
    building_num TEXT,
    termination_info TEXT,
    source TEXT
)''')
conn.commit()
print("表層已建立")

# Schema mapping - each txt file has its own column headers
SCHEMA_MAP = {
    'schema-main.csv': {
        'cols': 36,
        'fields': ['district', 'transaction_type', 'address', 'land_area_sqm',
                    'urban_zone', 'rural_zone', 'rural_allocation', 'trade_date',
                    'trade_bundles', 'transfer_level', 'total_floors', 'building_type',
                    'main_use', 'main_material', 'completion_date', 'building_area_sqm',
                    'room_count', 'living_count', 'bath_count', 'partition_info',
                    'management_org', 'total_price', 'unit_price_sqm', 'parking_type',
                    'parking_area_sqm', 'parking_price', 'notes', 'id_no', 'project_name',
                    'building_num', 'termination_info', 'dummy1', 'dummy2', 'dummy3',
                    'dummy4', 'city_code']
    },
    'schema-build.csv': {
        'cols': 36,
        'fields': ['district', 'transaction_type', 'address', 'land_area_sqm',
                    'urban_zone', 'rural_zone', 'rural_allocation', 'trade_date',
                    'trade_bundles', 'transfer_level', 'total_floors', 'building_type',
                    'main_use', 'main_material', 'completion_date', 'building_area_sqm',
                    'room_count', 'living_count', 'bath_count', 'partition_info',
                    'management_org', 'total_price', 'unit_price_sqm', 'parking_type',
                    'parking_area_sqm', 'parking_price', 'notes', 'id_no', 'project_name',
                    'building_num', 'termination_info', 'dummy1', 'dummy2', 'dummy3',
                    'dummy4', 'city_code']
    },
    'schema-land.csv': {
        'cols': 36,
        'fields': ['district', 'transaction_type', 'address', 'land_area_sqm',
                    'urban_zone', 'rural_zone', 'rural_allocation', 'trade_date',
                    'trade_bundles', 'transfer_level', 'total_floors', 'building_type',
                    'main_use', 'main_material', 'completion_date', 'building_area_sqm',
                    'room_count', 'living_count', 'bath_count', 'partition_info',
                    'management_org', 'total_price', 'unit_price_sqm', 'parking_type',
                    'parking_area_sqm', 'parking_price', 'notes', 'id_no', 'project_name',
                    'building_num', 'termination_info', 'dummy1', 'dummy2', 'dummy3',
                    'dummy4', 'city_code']
    },
    'schema-park.csv': {
        'cols': 36,
        'fields': ['district', 'transaction_type', 'address', 'land_area_sqm',
                    'urban_zone', 'rural_zone', 'rural_allocation', 'trade_date',
                    'trade_bundles', 'transfer_level', 'total_floors', 'building_type',
                    'main_use', 'main_material', 'completion_date', 'building_area_sqm',
                    'room_count', 'living_count', 'bath_count', 'partition_info',
                    'management_org', 'total_price', 'unit_price_sqm', 'parking_type',
                    'parking_area_sqm', 'parking_price', 'notes', 'id_no', 'project_name',
                    'building_num', 'termination_info', 'dummy1', 'dummy2', 'dummy3',
                    'dummy4', 'city_code']
    },
    'schema-main-rent.csv': {
        'cols': 36,
        'fields': ['district', 'transaction_type', 'address', 'land_area_sqm',
                    'urban_zone', 'rural_zone', 'rural_allocation', 'trade_date',
                    'trade_bundles', 'transfer_level', 'total_floors', 'building_type',
                    'main_use', 'main_material', 'completion_date', 'building_area_sqm',
                    'room_count', 'living_count', 'bath_count', 'partition_info',
                    'management_org', 'total_price', 'unit_price_sqm', 'parking_type',
                    'parking_area_sqm', 'parking_price', 'notes', 'id_no', 'project_name',
                    'building_num', 'termination_info', 'dummy1', 'dummy2', 'dummy3',
                    'dummy4', 'city_code']
    }
}

def parse_float(val):
    """Parse float, return None if empty"""
    if not val or val.strip() == '':
        return None
    try:
        return float(val.strip().replace(',', ''))
    except:
        return None

def parse_int(val):
    """Parse int, return None if empty"""
    if not val or val.strip() == '':
        return None
    try:
        return int(float(val.strip().replace(',', '')))
    except:
        return None

def parse_date(date_str):
    """Convert YYYMMDD to YYYYMMDD format"""
    if not date_str or date_str.strip() == '':
        return ''
    date_str = date_str.strip()
    if len(date_str) == 7:
        # 1150306 -> 1150306 (keep as is for frontend to parse)
        return date_str
    if len(date_str) == 8:
        return date_str
    return date_str

# Load schema CSVs
schema_files = [f for f in os.listdir(DATA_DIR) if f.startswith('schema-') and f.endswith('.csv')]
print(f"Schema files found: {schema_files}")

# For each txt file, check its header line to determine schema type
# Read header and match to schema

total_records = 0
total_files = 0
failed_files = 0
db_sources = set()

txt_files = sorted([f for f in os.listdir(DATA_DIR) if f.endswith('.txt')])

# Group txt files by prefix (city_type) to read schema
# Actually each prefix group shares a schema file

# Read the manifest if available
manifest = {}
manifest_path = os.path.join(DATA_DIR, 'manifest.csv')
if os.path.exists(manifest_path):
    with open(manifest_path, 'r', encoding='utf-8-sig') as mf:
        reader = csv.DictReader(mf)
        for row in reader:
            fname = row.get('filename', '')
            schema = row.get('schema', '')
            if fname and schema:
                manifest[fname] = schema

print(f"\nManifest entries: {len(manifest)}")

for fname in txt_files:
    fpath = os.path.join(DATA_DIR, fname)
    try:
        # Read header lines (BOM + col1)
        with open(fpath, 'r', encoding='utf-8-sig') as f:
            # First line is Chinese header, second line is English header
            chinese_line = f.readline().strip()
            english_line = f.readline().strip()
            
            if not english_line:
                print(f"  SKIP (no English header): {fname}")
                continue
            
            # Determine type from filename
            parts = fname.replace('.txt', '').split('_')
            city_code = parts[0] if parts else ''
            
            # Check if this is a building, land, park, or main transaction type
            # File naming: {city}_lvr_land_{type}[_subtype].txt
            if '_build' in fname:
                schema_type = 'schema-build.csv'
            elif '_land' in fname:
                schema_type = 'schema-land.csv'
            elif '_park' in fname:
                schema_type = 'schema-park.csv'
            elif fname.endswith('_land.txt'):
                schema_type = 'schema-land.csv'
            elif fname.endswith('_build.txt'):
                schema_type = 'schema-build.csv'
            elif fname.endswith('_park.txt'):
                schema_type = 'schema-park.csv'
            else:
                # Main type files: {city}_lvr_land_a.txt etc
                schema_type = 'schema-main.csv'
            
            with open(fpath, 'r', encoding='utf-8-sig') as f2:
                reader = csv.reader(f2)
                # Skip 2 header lines
                next(reader)  # Chinese header
                next(reader)  # English header
                
                batch = []
                for row in reader:
                    # Skip empty rows
                    if not row or all(cell.strip() == '' for cell in row):
                        continue
                    
                    # CSV 33 欄位對應 (0-indexed):
                    # 0:區,1:交易,2:位置,3:土地面積,4:都市分區,5:非都市分區,6:非都市編定
                    # 7:交易年月日,8:交易筆棟數,9:移轉層次,10:總樓層數,11:建物型態
                    # 12:主要用途,13:主要建材,14:建築完成年月,15:建物移轉總面積
                    # 16-19:房/廳/衛/隔間,20:管理組織
                    # 21:總價元,22:單價元/sqm,23:車位類別,24:車位移轉面積,25:車位總價元
                    # 26:備註,27-30:編號/主建/附屬/陽台,31:電梯,32:移轉編號
                    
                    total_price = parse_float(row[21]) if len(row) > 21 else None
                    unit_price = parse_float(row[22]) if len(row) > 22 else None
                    parking_price = parse_float(row[25]) if len(row) > 25 else None
                    
                    record = (
                        city_code,
                        row[0] if len(row) > 0 else '',            # 1: 鄉鎮市區
                        row[1] if len(row) > 1 else '',            # 2: 交易標的
                        row[2] if len(row) > 2 else '',            # 3: 土地位置
                        parse_float(row[3]) if len(row) > 3 else None,  # 4: 土地移轉總面積
                        row[4] if len(row) > 4 else '',            # 5: 都市分區
                        row[5] if len(row) > 5 else '',            # 6: 非都市分區
                        row[6] if len(row) > 6 else '',            # 7: 非都市編定
                        parse_date(row[7]) if len(row) > 7 else '',     # 8: 交易年月日
                        row[8] if len(row) > 8 else '',            # 9: 交易筆棟數
                        row[9] if len(row) > 9 else '',            # 10: 移轉層次
                        parse_int(row[10]) if len(row) > 10 else None,    # 11: 總樓層數
                        row[11] if len(row) > 11 else '',            # 12: 建物型態
                        row[12] if len(row) > 12 else '',            # 13: 主要用途
                        row[13] if len(row) > 13 else '',            # 14: 主要建材
                        row[14] if len(row) > 14 else '',            # 15: 建築完成年月
                        parse_float(row[15]) if len(row) > 15 else None,  # 16: 建物移轉總面積
                        parse_int(row[16]) if len(row) > 16 else None,    # 17: 房
                        parse_int(row[17]) if len(row) > 17 else None,    # 18: 廳
                        parse_int(row[18]) if len(row) > 18 else None,    # 19: 衛
                        row[19] if len(row) > 19 else '',            # 20: 隔間
                        row[20] if len(row) > 20 else '',            # 21: 有無管理組織
                        total_price,                                 # 22: 總價元
                        unit_price,                                  # 23: 單價元/sqm
                        row[23] if len(row) > 23 else '',            # 24: 車位類別
                        parse_float(row[24]) if len(row) > 24 else None,    # 25: 車位移轉面積
                        parking_price,                               # 26: 車位總價元
                        row[26] if len(row) > 26 else '',            # 27: 備註
                        row[27] if len(row) > 27 else '',            # 28: 編號
                        row[28] if len(row) > 28 else '',            # 29: 主建物面積
                        row[29] if len(row) > 29 else '',            # 30: 附屬建物面積
                        row[30] if len(row) > 30 else '',            # 31: 陽台面積
                        row[31] if len(row) > 31 else '',            # 32: 電梯
                        fname                                          # 33: 來源
                    )
                    batch.append(record)
                
                if batch:
                    cursor.executemany(
                        '''INSERT INTO lvr_records (
                            city_code, district, transaction_type, address,
                            land_area_sqm, urban_zone, rural_zone, rural_allocation,
                            trade_date, trade_bundles, transfer_level, total_floors,
                            building_type, main_use, main_material, completion_date,
                            building_area_sqm, room_count, living_count, bath_count,
                            partition_info, management_org, total_price, unit_price_sqm,
                            parking_type, parking_area_sqm, parking_price, notes,
                            id_no, project_name, building_num, termination_info, source
                        ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)''',
                        batch
                    )
                    total_records += len(batch)
                    total_files += 1
                    db_sources.add(fname)
        
        if total_files % 20 == 0:
            print(f"  Progress: {total_files}/{len(txt_files)} files, {total_records} records")
    
    except Exception as e:
        print(f"  ERROR processing {fname}: {e}")
        failed_files += 1

conn.commit()

# Verify
cursor.execute("SELECT COUNT(*) FROM lvr_records")
final_count = cursor.fetchone()[0]
cursor.execute("SELECT COUNT(DISTINCT source) FROM lvr_records")
final_sources = cursor.fetchone()[0]

conn.close()

print(f"\n{'='*50}")
print(f"匯入完成!")
print(f"處理檔案: {total_files}/{len(txt_files)}")
print(f"失敗檔案: {failed_files}")
print(f"總資料筆數: {final_count}")
print(f"涵蓋檔案數: {final_sources}")
print(f"{'='*50}")

# Per-city stats
conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()
cursor.execute('''
    SELECT city_code, COUNT(*) as count, COUNT(DISTINCT source) as sources 
    FROM lvr_records GROUP BY city_code ORDER BY count DESC
''')
print("\n各縣市資料統計:")
for row in cursor.fetchall():
    city_names = {'a':'台北市','b':'台中市','c':'基隆市','d':'台南市','e':'高雄市',
                  'f':'新北市','g':'宜蘭縣','h':'桃園市','i':'嘉義市','j':'新竹縣',
                  'k':'苗栗縣','m':'南投縣','n':'彰化縣','o':'新竹市','p':'雲林縣',
                  'q':'嘉義縣','t':'屏東縣','u':'花蓮縣','v':'台東縣','w':'金門縣',
                  'x':'澎湖縣'}
    print(f"  {city_names.get(row[0], row[0])}: {row[1]} 筆, {row[2]} 檔")
conn.close()

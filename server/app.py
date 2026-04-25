"""
Taiwan Real Estate Price Data Server

Serves real estate data from lvr_landtxt.zip (内政部實價登錄)
as a REST API endpoint with filtering, pagination, and formatting.
"""

import os
import json
import csv
import io
from datetime import datetime
from flask import Flask, jsonify, request, Response

app = Flask(__name__)

# Data directory - all 202 txt files (use project-relative path, NOT /tmp)
DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'data', 'lvr_txt')

# File naming pattern: {city_code}_lvr_land_{type}.txt
# city_code: a=台北, b=台中, c=基隆, ...
# type: a=買賣, b=預售屋, c=租賃
CITY_MAP = {
    'a': '台北市', 'b': '台中市', 'c': '基隆市', 'd': '台南市',
    'e': '高雄市', 'f': '新北市', 'g': '宜蘭縣', 'h': '桃園市',
    'i': '嘉義市', 'j': '新竹縣', 'k': '苗栗縣', 'm': '南投縣',
    'n': '彰化縣', 'o': '新竹市', 'p': '雲林縣', 'q': '嘉義縣',
    't': '屏東縣', 'u': '花蓮縣', 'v': '臺東縣', 'w': '金門縣',
    'x': '澎湖縣'
}

TYPE_MAP = {'a': '買賣', 'b': '預售屋', 'c': '租賃'}

def parse_trade_date(date_str):
    """Convert YYYMMDD format (民國年) to ISO date string"""
    if not date_str or date_str.strip() == '':
        return None
    try:
        year = int(date_str[:3]) + 1911
        month = int(date_str[3:5])
        day = int(date_str[5:7])
        return f"{year}-{month:02d}-{day:02d}"
    except:
        return date_str

def format_traditional_date(date_str):
    """Format as 民國年MM月DD日"""
    if not date_str or date_str.strip() == '':
        return ''
    try:
        year = int(date_str[:3]) + 1911
        month = int(date_str[3:5])
        day = int(date_str[5:7])
        return f"{year}年{month:02d}月{day:02d}日"
    except:
        return date_str

def format_price(price_str):
    """Format price to string with commas and unit"""
    if not price_str or price_str.strip() == '':
        return None
    try:
        price = float(price_str)
        return f"{price:,.0f}"
    except:
        return price_str

def format_unit_price(price_str):
    """Format unit price (per sqm)"""
    if not price_str or price_str.strip() == '':
        return None
    try:
        price = float(price_str)
        if price > 0:
            return f"{price:,.0f}"
        return None
    except:
        return price_str

def parse_record(row):
    """Parse a CSV row into a structured record"""
    try:
        price = float(row[22]) if row[22] and row[22].strip() else None
        unit_price = float(row[23]) if row[23] and row[23].strip() else None
    except:
        price = None
        unit_price = None

    return {
        'district': row[0] or '',           # 鄉鎮市區
        'propertyType': row[1] or '',        # 交易標的
        'address': row[2] or '',             # 土地位置建物門牌
        'landArea': float(row[3]) if row[3] and row[3].strip() else None,  # 土地移轉總面積平方公尺
        'urbanZoning': row[4] or '',         # 都市土地使用分區
        'ruralZoning': row[5] or '',         # 非都市土地使用分區
        'ruralDesignation': row[6] or '',    # 非都市土地使用編定
        'tradeDate': parse_trade_date(row[7]) if row[7] else None,  # 交易年月日 (ISO)
        'tradeDateDisplay': format_traditional_date(row[7]) if row[7] else '',  # 交易日期 (民國)
        'transactionType': row[8] or '',     # 交易筆棟數
        'transferLevel': row[9] or '',       # 移轉層次
        'totalFloors': int(row[10]) if row[10] and row[10].strip() else None,  # 總樓層數
        'buildingType': row[11] or '',       # 建物型態
        'buildingUse': row[12] or '',        # 主要用途
        'buildingMaterial': row[13] or '',   # 主要建材
        'builtYear': row[14] or '',          # 建築完成年月
        'buildingArea': float(row[15]) if row[15] and row[15].strip() else None,  # 建物移轉總面積
        'rooms': int(row[16]) if row[16] and row[16].strip() else None,  # 房
        'halls': int(row[17]) if row[17] and row[17].strip() else None,  # 廳
        'bathrooms': int(row[18]) if row[18] and row[18].strip() else None,  # 衛
        'interior': row[19] or '',           # 現況隔間
        'hasManagement': row[20] or '',      # 有無管理組織
        'totalPrice': price,                 # 總價元
        'totalPriceDisplay': format_price(row[22]) if row[22] else None,
        'unitPrice': unit_price,             # 單價元/平方公尺
        'unitPriceDisplay': format_unit_price(row[23]) if row[23] else None,
        'parkingType': row[24] or '',        # 車位類別
        'parkingArea': float(row[25]) if row[25] and row[25].strip() else None,  # 車位移轉面積
        'parkingPrice': float(row[26]) if row[26] and row[26].strip() else None,  # 車位總價
        'parkingPriceDisplay': format_price(row[26]) if row[26] else None,
        'remarks': row[27] or '',            # 備註
        'recordId': row[28] or '',           # 編號
        'mainBuildingArea': float(row[29]) if row[29] and row[29].strip() else None,  # 主建物面積
        'ancillaryArea': float(row[30]) if row[30] and row[30].strip() else None,    # 附屬建物面積
        'balconyArea': float(row[31]) if row[31] and row[31].strip() else None,     # 陽台面積
        'hasElevator': row[32] or '',        # 電梯
        'transactionNumber': row[33] or '',  # 移轉編號
        'sourceFile': row[34] if len(row) > 34 else '',  # 來源檔案
        'cityCode': row[35] if len(row) > 35 else '',     # 縣市編碼
        'city': row[36] if len(row) > 36 else ''           # 縣市名稱
    }

def load_all_data():
    """Load all data files - returns dict {city_code: [records]}"""
    all_data = {}
    for city_code in CITY_MAP:
        records = []
        for file_type in ['a', 'b', 'c']:
            patterns = [
                f"{city_code}_lvr_land_{file_type}.txt",
                f"{city_code}_lvr_land_{file_type}_land.txt",
                f"{city_code}_lvr_land_{file_type}_build.txt",
                f"{city_code}_lvr_land_{file_type}_park.txt"
            ]
            for filename in patterns:
                filepath = os.path.join(DATA_DIR, filename)
                if not os.path.exists(filepath):
                    continue
                with open(filepath, 'r', encoding='utf-8-sig') as f:
                    reader = csv.reader(f)
                    for idx, row in enumerate(reader):
                        # Row 0 = Chinese header, Row 1 = English header
                        if idx in (0, 1):
                            continue
                        # Skip empty rows
                        if not row or all(cell.strip() == '' for cell in row):
                            continue
                        record = parse_record(row)
                        record['sourceFile'] = filename
                        record['cityCode'] = city_code
                        record['city'] = CITY_MAP.get(city_code, city_code)
                        records.append(record)
        if records:
            all_data[city_code] = records
    return all_data

# Load data on startup
print("Loading data files...")
ALL_DATA = load_all_data()
total_records = sum(len(v) for v in ALL_DATA.values())
print(f"Loaded {total_records} records from {len(ALL_DATA)} cities")

@app.route('/api/data/cities')
def get_cities():
    """Get available cities"""
    cities = []
    for code, name in CITY_MAP.items():
        if code in ALL_DATA:
            cities.append({'code': code, 'name': name, 'count': len(ALL_DATA[code])})
    return jsonify(cities)

@app.route('/api/data/distinct')
def get_distinct_districts():
    """Get distinct districts for a city"""
    city = request.args.get('city')
    if not city:
        return jsonify({'districts': []})
    
    city_code = None
    for code, name in CITY_MAP.items():
        if name == city:
            city_code = code
            break
    
    if not city_code:
        return jsonify({'districts': []})
    
    districts = set()
    for record in ALL_DATA.get(city_code, []):
        if record['district']:
            districts.add(record['district'])
    
    return jsonify({'districts': sorted(list(districts))})

@app.route('/api/data/search')
def search_data():
    """Search real estate data with filters"""
    city = request.args.get('city', '')
    district = request.args.get('district', '')
    property_type = request.args.get('propertyType', '')
    min_price = request.args.get('minPrice', type=int)
    max_price = request.args.get('maxPrice', type=int)
    min_price_unit = request.args.get('minPriceUnit', type=float)
    max_price_unit = request.args.get('maxPriceUnit', type=float)
    min_area = request.args.get('minArea', type=float)
    max_area = request.args.get('maxArea', type=float)
    min_rooms = request.args.get('minRooms', type=int)
    max_rooms = request.args.get('maxRooms', type=int)
    min_halls = request.args.get('minHalls', type=int)
    max_halls = request.args.get('maxHalls', type=int)
    min_bathrooms = request.args.get('minBathrooms', type=int)
    max_bathrooms = request.args.get('maxBathrooms', type=int)
    building_use = request.args.get('buildingUse', '')
    building_material = request.args.get('buildingMaterial', '')
    has_elevator = request.args.get('hasElevator', '')
    page = request.args.get('page', 1, type=int)
    page_size = request.args.get('pageSize', 2, type=int)
    sort_by = request.args.get('sortBy', 'tradeDate')
    sort_order = request.args.get('sortOrder', 'desc')
    
    # Find city code
    city_code = None
    for code, name in CITY_MAP.items():
        if city == name or (city and city.startswith(CITY_MAP.get(code, ''))):
            city_code = code
            break
    
    # Filter records
    filtered = []
    for code, records in ALL_DATA.items():
        if city and city != CITY_MAP.get(code, ''):
            continue
        for record in records:
            # District filter
            if district and record['district'] != district:
                continue
            
            # Property type filter
            if property_type:
                type_map = {'a': '買賣', 'b': '預售屋', 'c': '租賃'}
                if property_type != type_map.get(property_type, ''):
                    continue
                # Match by property type
                if property_type == '買賣' and '買賣' not in record.get('propertyType', ''):
                    continue
                if property_type == '預售屋' and '預售' not in record.get('propertyType', ''):
                    continue
                if property_type == '租賃' and '租賃' not in record.get('propertyType', ''):
                    continue
            
            # Price filter
            if min_price and record['totalPrice'] and record['totalPrice'] < min_price:
                continue
            if max_price and record['totalPrice'] and record['totalPrice'] > max_price:
                continue
            
            # Unit price filter
            if min_price_unit and record['unitPrice'] and record['unitPrice'] < min_price_unit:
                continue
            if max_price_unit and record['unitPrice'] and record['unitPrice'] > max_price_unit:
                continue
            
            # Area filter
            if min_area and record['landArea'] and record['landArea'] < min_area:
                continue
            if max_area and record['landArea'] and record['landArea'] > max_area:
                continue
            
            # Room filter
            if min_rooms and record['rooms'] is not None and record['rooms'] < min_rooms:
                continue
            if max_rooms and record['rooms'] is not None and record['rooms'] > max_rooms:
                continue
            
            # Hall filter
            if min_halls and record['halls'] is not None and record['halls'] < min_halls:
                continue
            if max_halls and record['halls'] is not None and record['halls'] > max_halls:
                continue
            
            # Bathroom filter
            if min_bathrooms and record['bathrooms'] is not None and record['bathrooms'] < min_bathrooms:
                continue
            if max_bathrooms and record['bathrooms'] is not None and record['bathrooms'] > max_bathrooms:
                continue
            
            # Building use filter
            if building_use and record['buildingUse'] != building_use:
                continue
            
            # Building material filter
            if building_material and record['buildingMaterial'] != building_material:
                continue
            
            # Elevator filter
            if has_elevator and record['hasElevator'] != has_elevator:
                continue
            
            filtered.append(record)
    
    # Sort
    sort_fields = {'tradeDate': 'tradeDate', 'totalPrice': 'totalPrice', 'unitPrice': 'unitPrice', 'landArea': 'landArea', 'buildingArea': 'buildingArea'}
    if sort_by in sort_fields:
        key = sort_fields[sort_by]
        filtered.sort(key=lambda r: (r[key] is None, r[key] if r[key] else 0), reverse=(sort_order == 'desc'))
    
    # Paginate
    total = len(filtered)
    start = (page - 1) * page_size
    end = start + page_size
    paginated = filtered[start:end]
    
    return jsonify({
        'data': paginated,
        'total': total,
        'page': page,
        'pageSize': page_size,
        'totalPages': (total + page_size - 1) // page_size
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3001, debug=True)

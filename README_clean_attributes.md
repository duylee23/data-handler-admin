# Script Làm Sạch Attributes Trùng Lặp Trong File COCO

## Mô tả
Script này giúp loại bỏ các thuộc tính (attributes) bị trùng lặp trong file COCO format JSON. Ví dụ, nếu bạn có:

```json
"attributes": [
  {
    "Occlusion": "1"
  },
  {
    "group": "single"
  },
  {
    "group": "single"
  }
]
```

Script sẽ chuyển thành:

```json
"attributes": [
  {
    "Occlusion": "1"
  },
  {
    "group": "single"
  }
]
```

## Cách sử dụng

### Sử dụng cơ bản
```bash
python clean_coco_attributes.py "path/to/your/coco_file.json"
```

Ví dụ với file của bạn:
```bash
python clean_coco_attributes.py "c:\Users\Admin\Documents\Zalo Received Files\20250702171037467_coco_import.json"
```

### Chỉ định file output
```bash
python clean_coco_attributes.py "input_file.json" -o "output_file.json"
```

### Các tham số

- `input_file`: Đường dẫn đến file COCO JSON cần làm sạch (bắt buộc)
- `-o, --output`: Đường dẫn đến file output (tùy chọn). Nếu không chỉ định, file sẽ được lưu với tên `[tên_file_gốc]_cleaned.json`

## Tính năng

1. **Loại bỏ trùng lặp**: Giữ lại chỉ lần xuất hiện đầu tiên của mỗi key trong attributes
2. **Thống kê chi tiết**: Hiển thị số lượng annotations đã được xử lý và số attributes đã loại bỏ
3. **Xử lý lỗi**: Xử lý các trường hợp file không tồn tại hoặc JSON không hợp lệ
4. **Encoding UTF-8**: Hỗ trợ tiếng Việt và các ký tự đặc biệt

## Kết quả
Script sẽ hiển thị thông tin như:

```
Đang đọc file: input_file.json
  Annotation ID 123: 3 -> 2 attributes
  Annotation ID 456: 4 -> 3 attributes
Đang ghi file đã làm sạch: input_file_cleaned.json

=== THỐNG KÊ ===
Tổng số annotations: 100
Số annotations được làm sạch: 25
Tổng attributes trước: 300
Tổng attributes sau: 250
Số attributes đã loại bỏ: 50
File đã được lưu: input_file_cleaned.json
```

## Yêu cầu hệ thống
- Python 3.6 trở lên
- Không cần cài đặt thêm thư viện nào (chỉ sử dụng thư viện chuẩn)

## Lưu ý
- Script sẽ giữ nguyên cấu trúc file COCO gốc
- Chỉ xử lý các attributes bị trùng lặp, không thay đổi nội dung khác
- File gốc sẽ không bị thay đổi, chỉ tạo file mới đã được làm sạch 
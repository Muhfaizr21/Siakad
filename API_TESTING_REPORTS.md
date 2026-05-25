# 📡 API TESTING GUIDE - PDF REPORT GENERATION

## Quick Start

### Prerequisites
- Backend running: `go run main.go`
- Valid JWT token from login
- Postman or similar API testing tool

---

## 1. REFERRAL REPORT GENERATION

### Endpoint
```
POST /api/psychologist/reports/referral/generate
```

### Headers
```
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
```

### Request Body
```json
{
  "start_date": "2026-05-01",
  "end_date": "2026-05-26"
}
```

### Success Response (200 OK)
```json
{
  "status": "success",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Laporan Tindak Lanjut - 01 May 2026 s/d 26 May 2026",
    "type": "Rujukan",
    "size": "245 KB",
    "date": "26/05/2026",
    "status": "Selesai",
    "file_url": "/uploads/reports/referrals/laporan_rujukan_20260526_150405_1234567890.pdf",
    "periode": "01 May 2026 - 26 May 2026"
  }
}
```

### Error Responses

#### 400 Bad Request
```json
{
  "status": "error",
  "message": "Payload tidak valid"
}
```

#### 401 Unauthorized
```json
{
  "status": "error",
  "message": "User tidak valid"
}
```

#### 500 Internal Server Error
```json
{
  "status": "error",
  "message": "Gagal generate laporan rujukan: [error details]"
}
```

### Testing Steps
1. Open Postman
2. Create new POST request
3. URL: `http://localhost:3000/api/psychologist/reports/referral/generate`
4. Add Authorization header with Bearer token
5. Set Body to JSON:
   ```json
   {
     "start_date": "2026-05-01",
     "end_date": "2026-05-26"
   }
   ```
6. Click Send
7. Verify response status is 200
8. Check file_url in response
9. Download PDF from file_url

---

## 2. CLINICAL REPORT GENERATION

### Endpoint
```
POST /api/psychologist/reports/clinical/generate
```

### Headers
```
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
```

### Request Body
```json
{
  "start_date": "2026-05-01",
  "end_date": "2026-05-26"
}
```

### Success Response (200 OK)
```json
{
  "status": "success",
  "data": {
    "id": "660e8400-e29b-41d4-a716-446655440000",
    "title": "Laporan Klinis - 01 May 2026 s/d 26 May 2026",
    "type": "Klinis",
    "size": "312 KB",
    "date": "26/05/2026",
    "status": "Selesai",
    "file_url": "/uploads/reports/clinical/laporan_klinis_20260526_150405_1234567890.pdf",
    "periode": "01 May 2026 - 26 May 2026"
  }
}
```

### Error Responses
Same as referral report (see above)

### Testing Steps
1. Open Postman
2. Create new POST request
3. URL: `http://localhost:3000/api/psychologist/reports/clinical/generate`
4. Add Authorization header with Bearer token
5. Set Body to JSON:
   ```json
   {
     "start_date": "2026-05-01",
     "end_date": "2026-05-26"
   }
   ```
6. Click Send
7. Verify response status is 200
8. Check file_url in response
9. Download PDF from file_url

---

## 3. RETRIEVE GENERATED REPORTS

### Endpoint
```
GET /api/psychologist/reports
```

### Headers
```
Authorization: Bearer <your_jwt_token>
```

### Success Response (200 OK)
```json
{
  "status": "success",
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "Laporan Tindak Lanjut - 01 May 2026 s/d 26 May 2026",
      "type": "Rujukan",
      "size": "245 KB",
      "date": "26/05/2026",
      "status": "Selesai",
      "file_url": "/uploads/reports/referrals/laporan_rujukan_20260526_150405_1234567890.pdf"
    },
    {
      "id": "660e8400-e29b-41d4-a716-446655440000",
      "title": "Laporan Klinis - 01 May 2026 s/d 26 May 2026",
      "type": "Klinis",
      "size": "312 KB",
      "date": "26/05/2026",
      "status": "Selesai",
      "file_url": "/uploads/reports/clinical/laporan_klinis_20260526_150405_1234567890.pdf"
    }
  ]
}
```

---

## 4. DOWNLOAD REPORT PDF

### Endpoint
```
GET /api/psychologist/reports/{id}/download
```

### Headers
```
Authorization: Bearer <your_jwt_token>
```

### Success Response (200 OK)
- Returns PDF file with Content-Disposition: attachment
- Browser will download the file

### Error Responses

#### 404 Not Found
```json
{
  "status": "error",
  "message": "Laporan tidak ditemukan"
}
```

#### 404 File Not Found
```json
{
  "status": "error",
  "message": "File tidak ditemukan di server"
}
```

### Testing Steps
1. Get report ID from GET /api/psychologist/reports
2. Create new GET request
3. URL: `http://localhost:3000/api/psychologist/reports/{id}/download`
4. Add Authorization header with Bearer token
5. Click Send
6. PDF will download automatically

---

## 5. CURL EXAMPLES

### Generate Referral Report
```bash
curl -X POST http://localhost:3000/api/psychologist/reports/referral/generate \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "start_date": "2026-05-01",
    "end_date": "2026-05-26"
  }'
```

### Generate Clinical Report
```bash
curl -X POST http://localhost:3000/api/psychologist/reports/clinical/generate \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "start_date": "2026-05-01",
    "end_date": "2026-05-26"
  }'
```

### Get All Reports
```bash
curl -X GET http://localhost:3000/api/psychologist/reports \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Download Report
```bash
curl -X GET http://localhost:3000/api/psychologist/reports/{id}/download \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -o report.pdf
```

---

## 6. EXPECTED PDF CONTENTS

### Referral Report
- ✅ Header with "LAPORAN TINDAK LANJUT RUJUKAN"
- ✅ Psychologist profile section
- ✅ Statistics cards (Total, Pending, Sent, Received)
- ✅ Distribution by type (Medis/Akademik)
- ✅ Detailed referral table
- ✅ Signature section
- ✅ Page numbers and footer

### Clinical Report
- ✅ Header with "LAPORAN KLINIS KONSELING"
- ✅ Psychologist profile section
- ✅ Statistics cards (Total, Active, Attention, Completed)
- ✅ Mood distribution analysis
- ✅ Detailed session table
- ✅ Important notes section (if flagged cases exist)
- ✅ Signature section
- ✅ Page numbers and footer

---

## 7. TROUBLESHOOTING

### Issue: 401 Unauthorized
**Solution**: 
- Verify JWT token is valid
- Check token hasn't expired
- Ensure Authorization header format is correct: `Bearer <token>`

### Issue: 400 Bad Request
**Solution**:
- Verify date format is correct: `YYYY-MM-DD`
- Check JSON syntax is valid
- Ensure Content-Type header is `application/json`

### Issue: 500 Internal Server Error
**Solution**:
- Check backend logs for detailed error message
- Verify database connection is working
- Ensure uploads directory exists: `uploads/reports/referrals/` and `uploads/reports/clinical/`
- Check disk space is available

### Issue: PDF file not found after generation
**Solution**:
- Verify file_url in response
- Check if file exists in uploads directory
- Verify file permissions are correct
- Check backend logs for file write errors

### Issue: PDF is empty or corrupted
**Solution**:
- Verify there is data in the database for the date range
- Check PDF generation didn't encounter errors
- Try regenerating the report
- Check backend logs for PDF generation errors

---

## 8. PERFORMANCE NOTES

### Report Generation Time
- Referral Report: ~2-5 seconds (depending on data volume)
- Clinical Report: ~2-5 seconds (depending on data volume)

### File Size
- Referral Report: ~200-300 KB (typical)
- Clinical Report: ~250-350 KB (typical)

### Database Queries
- Referral Report: 1 main query + aggregation
- Clinical Report: 1 main query + aggregation

### Optimization Tips
- Use specific date ranges to reduce data volume
- Archive old reports to keep database lean
- Consider implementing report caching for frequently requested periods

---

## 9. INTEGRATION CHECKLIST

- [ ] Backend API endpoints are working
- [ ] JWT authentication is required
- [ ] Reports are saved to database
- [ ] PDF files are generated correctly
- [ ] File URLs are accessible
- [ ] Download functionality works
- [ ] Error handling is proper
- [ ] File permissions are correct
- [ ] Disk space is sufficient
- [ ] Database queries are optimized

---

**Last Updated**: 26 Mei 2026


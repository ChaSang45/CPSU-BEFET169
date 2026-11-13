// middleware ทั่วไป แบบเดียวกับ lab สัปดาห์ 8: Logging, Recovery, CORS
package mw

import (
	"encoding/json"
	"log"
	"net/http"
	"time"
)

func Logging(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		next.ServeHTTP(w, r)
		log.Printf("%s %s ใช้เวลา %v", r.Method, r.URL.Path,
			time.Since(start).Round(time.Millisecond))
	})
}

// Recovery กัน server ล่มทั้งตัวเมื่อ handler ไหน panic
func Recovery(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		defer func() {
			if err := recover(); err != nil {
				log.Printf("panic: %v", err)
				writeError(w, http.StatusInternalServerError, "เซิร์ฟเวอร์มีปัญหา ลองใหม่อีกครั้ง")
			}
		}()
		next.ServeHTTP(w, r)
	})
}

// CORS อนุญาตให้หน้าเว็บ (localhost:3000 หรือ Vercel) เรียก API ข้ามโดเมน
// origin อ่านมาจาก env FRONTEND_ORIGIN ใน main.go
func CORS(origin string, next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", origin)
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return // คำขอถามทาง จบตรงนี้
		}
		next.ServeHTTP(w, r)
	})
}

func writeError(w http.ResponseWriter, status int, message string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(map[string]string{"error": message})
}

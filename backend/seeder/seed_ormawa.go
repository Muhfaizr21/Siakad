package main

import (
	"fmt"
	"siakad-backend/config"
	"siakad-backend/models"
    "github.com/joho/godotenv"
	"golang.org/x/crypto/bcrypt"
)

func main() {
    godotenv.Load(".env")
	config.ConnectDB()

    // Using the email as NIM since the login endpoint matches against the NIM field from the payload.
    loginID := "himafp@bku.ac.id"
    password := "12345678"
    
    hash, _ := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)

    var user models.User
    err := config.DB.Where("email = ?", loginID).First(&user).Error
    if err != nil {
        ormawaID := uint(1)
        user = models.User{
            Email: loginID,
            Password: string(hash),
            Role: "ormawa",
            OrmawaID: &ormawaID,
        }
        config.DB.Create(&user)
        fmt.Println("User created with ID:", user.ID)
    } else {
        user.Password = string(hash)
        config.DB.Save(&user)
        fmt.Println("User updated with ID:", user.ID)
    }

    var mhs models.Mahasiswa
    err = config.DB.Where("nim = ?", loginID).First(&mhs).Error
    if err != nil {
        mhs = models.Mahasiswa{
            PenggunaID: user.ID,
            NIM: loginID,
            Nama: "ADMIN ORGANISASI KEMAHASISWAAN (ORMAWA)",
            StatusAkun: "Aktif",
            ProgramStudiID: 1,
            FakultasID: 1,
        }
        config.DB.Create(&mhs)
        fmt.Println("Mahasiswa created with NIM:", mhs.NIM)
    } else {
        mhs.PenggunaID = user.ID
        mhs.Nama = "ADMIN ORGANISASI KEMAHASISWAAN (ORMAWA)"
        mhs.StatusAkun = "Aktif"
        config.DB.Save(&mhs)
        fmt.Println("Mahasiswa updated with NIM:", mhs.NIM)
    }

    fmt.Println("SUCCESS")
}
